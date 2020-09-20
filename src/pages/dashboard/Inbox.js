import React from 'react';
import { Table, Space, Button, Modal, Input, Form, Popconfirm, DatePicker, Tag, Radio, Select } from 'antd';
import moment from 'moment';
import { PlusOutlined } from '@ant-design/icons';
import Loading from '../../components/Loading';

import 'moment/locale/id';
import Questionnaire from '../../components/Questionnaire';

const { Column } = Table;

const host = process.env.REACT_APP_API_HOST;
const port = process.env.REACT_APP_API_PORT;

export default class Inbox extends React.Component {

    state = {
        ready: false,
        addPopup: false,
        data: null,
        report_file: null,
        files: [],
        urgency: null,
        questionnairePopup: false,
        departments: null
    }

    componentDidMount() {
        const { models, updateCount } = this.props;
        models.Report.$http('reports/update_read_inbox', 'GET').then(() => updateCount && updateCount());
        this.fetch();
    }

    fetch() {
        const { models, user, onCount } = this.props;
        this.setState({ ready: false });
        models.Report.collection({
            attributes: ['id', 'description', 'urgency', 'room', 'since', 'done', 'created_at'],
            where: {
                rejection_note: null,
                department_id: {
                    $in: user.target_id
                },
                done: false
            },
            include: [{
                model: 'User',
                attributes: ['id', 'name']
            }, {
                model: 'Department',
                attributes: ['id', 'name']
            }, {
                model: 'File',
                attributes: ['id']
            }],
            order: [['urgency', 'desc'], ['created_at', 'asc']]
        }).then((data) => {
            this.setState({ data });
            return models.Department.collection({
                attributes: ['id', 'name']
            })
        }).then((departments) => {
            this.setState({ ready: true, departments });
        });
    }

    onApprove(r) {
        r.update({ done: true, read: false }).then(() => this.fetch()).then(() => this.props.updateCount());
    }

    onReject(r) {
        const rejection_note = window.prompt('Masukkan alasan penolakkan');
        if (rejection_note) {
            r.update({ rejection_note, read: false }).then(() => this.fetch()).then(() => this.props.updateCount());
        }
    }

    onAdd() {
        const { files, report_file } = this.state;
        const { models } = this.props;
        this.form.validateFields(['description', 'since', 'room', 'files', 'urgency', 'department_id', 'qs']).then((values) => {
            delete values.files;
            delete values.report_file;
            values.files = files;
            values.report_file = report_file;
            values.questionnaire = values.qs.questionnaire;
            values.urgency = values.qs.urgency;
            delete values.qs;
            models.Report.create(values).then((report) => this.setState({ addPopup: false })).then(() => this.fetch());
        }).catch((err) => { });
    }

    async onChangeFile(e) {
        const { files } = e.target;
        const list = [];
        for (let i = 0; i < files.length; i++) {
            list.push(await this.getBase64(files[i]));
        }
        this.setState({ files: list });
    }

    getBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            }
            reader.onerror = () => {
                reject(reader.error);
            }
            reader.readAsDataURL(file);
        });
    }

    async onChangeReport(e) {
        const { files } = e.target;
        const report_file = await this.getBase64(files[0]);
        this.setState({ report_file });
    }

    render() {
        const { ready, data, addPopup, departments } = this.state;
        const { models } = this.props;
        return (
            ready ? (
                <div>
                    <h3>Pengaduan Masuk</h3>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => this.setState({ addPopup: true })}>Tambah</Button><br /><br />
                    <Table dataSource={data.rows}>
                        <Column title="Tanggal Kerusakan" key="since" render={(r) => moment(r.since).format('Do MMMM YYYY')} />
                        <Column title="Tanggal Kirim" key="created_at" render={(r) => moment(r.created_at).format('Do MMMM YYYY, h:mm:ss a')} />
                        <Column title="Bobot SAW" key="urgency" dataIndex="urgency" />
                        <Column title="Deskripsi" dataIndex="description" key="description" />
                        <Column title="Ruang" dataIndex="room" key="room" />
                        <Column title="Pemohon" key="user.name" render={(r) => r.user.name} />
                        <Column title="Departemen" key="department.name" render={(r) => r.department.name} />
                        <Column title="PDF Laporan" key="report_file" render={(r) => (
                            <a target="_blank" href={host + ':' + port + '/report_file/' + r.id}>PDF</a>
                        )} />
                        <Column title="Foto" key="done" render={(r) => {
                            return (
                                <ul style={{ listStyleType: 'none' }}>
                                    {r.files.map((f, i) => (
                                        <li key={i}><a target="_blank" href={host + ':' + port + '/file/' + f.id}>#{i + 1}</a></li>
                                    ))}
                                </ul>
                            )
                        }} />
                        <Column
                            title="Action"
                            key="action"
                            render={(text, record) => (
                                <Space size="middle">
                                    <Popconfirm placement="top" title="Setujui item ini?" okText="Ya" cancelText="Tidak" onConfirm={() => this.onApprove(record)}>
                                        <a>Setujui</a>
                                    </Popconfirm>
                                    <Popconfirm placement="top" title="Tolak item ini?" okText="Ya" cancelText="Tidak" onConfirm={() => this.onReject(record)}>
                                        <a>Tolak</a>
                                    </Popconfirm>
                                </Space>
                            )}
                        />
                    </Table>
                    <Modal
                        title="Buat Pengaduan"
                        visible={addPopup}
                        onOk={this.onAdd.bind(this)}
                        onCancel={() => this.setState({ addPopup: false })}
                    >
                        <Form
                            ref={(form) => this.form = form}
                            name="newReport"
                            layout="vertical"
                        >
                            <Form.Item
                                label="Deskripsi"
                                name="description"
                                rules={[{ required: true, message: 'Deskripsi harus diisi' }]}
                            >
                                <Input.TextArea rows={5} />
                            </Form.Item>
                            <Form.Item
                                label="Ruangan"
                                name="room"
                                rules={[{ required: true, message: 'Ruangan harus diisi' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Tanggal Kerusakan"
                                name="since"
                                rules={[{ required: true, message: 'Tanggal kerusakan harus diisi ' }]}
                            >
                                <DatePicker />
                            </Form.Item>
                            <Form.Item
                                label="Foto Bukti Kerusakan"
                                name="files"
                                rules={[{ required: true, message: 'Foto bukti harus diisi' }]}>
                                <input type="file" multiple onChange={this.onChangeFile.bind(this)} accept="image/png,image/jpg,image/jpeg" />
                            </Form.Item>
                            <Form.Item
                                label="PDF Laporan"
                                name="report_file"
                                rules={[{ required: true, message: 'PDF harus diisi' }]}>
                                <input type="file" multiple onChange={this.onChangeReport.bind(this)} accept="application/pdf" />
                            </Form.Item>
                            <Form.Item
                                label="Departemen"
                                name="department_id"
                                rules={[{ required: true, message: 'Departemen harus diisi' }]}
                            >
                                <Select>
                                    {departments.rows.map((d, i) => (
                                        <Select.Option value={d.id} key={i}>{d.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Kuisioner"
                                name="qs"
                                rules={[{ required: true, message: 'Kuisioner harus diisi' }]}>
                                <Questionnaire models={models} />
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            ) : <Loading marginTop={100} />
        )
    }

}