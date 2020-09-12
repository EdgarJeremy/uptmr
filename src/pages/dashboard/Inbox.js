import React from 'react';
import { Table, Space, Button, Modal, Input, Form, Popconfirm, DatePicker, Tag, Radio } from 'antd';
import moment from 'moment';
import { PlusOutlined } from '@ant-design/icons';
import Loading from '../../components/Loading';

import 'moment/locale/id';

const { Column } = Table;

const host = process.env.REACT_APP_API_HOST;
const port = process.env.REACT_APP_API_PORT;

export default class Inbox extends React.Component {

    state = {
        ready: false,
        addPopup: false,
        data: null,
        files: [],
        urgency: null
    }

    componentDidMount() {
        this.fetch();
    }

    fetch() {
        const { models, user } = this.props;
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

    onApprove(r) {
        r.update({ done: true }).then(() => this.fetch());
    }

    onReject(r) {
        const rejection_note = window.prompt('Masukkan alasan penolakkan');
        if (rejection_note) {
            r.update({ rejection_note }).then(() => this.fetch());
        }
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
                    <h3>Laporan Masuk</h3>
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
                        <Column title="File" key="done" render={(r) => {
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
                </div>
            ) : <Loading marginTop={100} />
        )
    }

}