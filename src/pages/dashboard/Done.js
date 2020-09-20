import React from 'react';
import { Table, Space, Button, Modal, Input, Form, Popconfirm, DatePicker, Tag, Radio, Avatar } from 'antd';
import moment from 'moment';
import { PlusOutlined } from '@ant-design/icons';
import Loading from '../../components/Loading';

import 'moment/locale/id';

const { Column } = Table;

export default class Done extends React.Component {

    state = {
        ready: false,
        addPopup: false,
        data: null,
        files: [],
        urgency: null
    }

    componentDidMount() {
        const { models, updateCount } = this.props;
        models.Report.$http('reports/update_read_done', 'GET').then(() => updateCount && updateCount());
        console.log(models.Report.$http);
        this.fetch();
    }

    fetch() {
        const { models, user } = this.props;
        this.setState({ ready: false });
        models.Report.collection({
            attributes: ['id', 'description', 'urgency', 'room', 'since', 'done', 'created_at'],
            where: {
                department_id: user.department_id,
                done: true
            },
            include: [{
                model: 'User',
                attributes: ['id', 'name']
            }, {
                model: 'Department',
                attributes: ['id', 'name']
            }],
            order: [['created_at', 'desc']]
        }).then((data) => {
            this.setState({ ready: true, data });
        });
    }

    onAdd() {
        const { files } = this.state;
        const { models } = this.props;
        this.form.validateFields(['description', 'since', 'room', 'files', 'urgency']).then((values) => {
            delete values.files;
            values.files = files;
            models.Report.create(values).then((report) => this.setState({ addPopup: false })).then(() => this.fetch());
        }).catch((err) => { });
    }

    onDelete(r) {
        r.delete().then(() => this.fetch());
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

    render() {
        const { ready, data, addPopup } = this.state;
        return (
            ready ? (
                <div>
                    <h3>Laporan Selesai</h3>
                    <Table dataSource={data.rows}>
                        <Column title="Tanggal Kerusakan" key="since" render={(r) => moment(r.since).format('Do MMMM YYYY')} />
                        <Column title="Tanggal Kirim" key="created_at" render={(r) => moment(r.created_at).format('Do MMMM YYYY, h:mm:ss a')} />
                        <Column title="Bobot SAW" key="urgency" dataIndex="urgency" />
                        <Column title="Deskripsi" dataIndex="description" key="description" />
                        <Column title="Ruang" dataIndex="room" key="room" />
                        <Column title="Pemohon" key="user.name" render={(r) => r.user.name} />
                        <Column title="Status" key="done" render={(r) => r.done ? <Tag color="green">Selesai</Tag> : <Tag color="blue">Dalam Proses</Tag>} />
                        <Column
                            title="Action"
                            key="action"
                            render={(text, record) => (
                                <Space size="middle">
                                    <Popconfirm placement="top" title="Hapus item ini?" okText="Ya" cancelText="Tidak" onConfirm={() => this.onDelete(record)}>
                                        <a>Delete</a>
                                    </Popconfirm>
                                </Space>
                            )}
                        />
                    </Table>
                    <Modal
                        title="Buat Laporan"
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
                                label="Prioritas"
                                name="urgency"
                                rules={[{ required: true, message: 'Prioritas harus diisi' }]}>
                                <Radio.Group buttonStyle="solid">
                                    <Radio.Button value={1}>1-2 Kali Rusak</Radio.Button>
                                    <Radio.Button value={2}>4-5 Kali Rusak</Radio.Button>
                                    <Radio.Button value={3}>Diatas 5 Kali Rusak</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            ) : <Loading marginTop={100} />
        )
    }

}