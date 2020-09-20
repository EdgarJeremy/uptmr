import React from 'react';
import { Table, Space, Button, Modal, Input, Form, Popconfirm, DatePicker, Tag, Radio } from 'antd';
import moment from 'moment';
import { PlusOutlined } from '@ant-design/icons';
import Loading from '../../components/Loading';

import 'moment/locale/id';

const { Column } = Table;

export default class Rejected extends React.Component {

    state = {
        ready: false,
        addPopup: false,
        data: null,
        files: [],
        urgency: null
    }

    componentDidMount() {
        const { models, updateCount } = this.props;
        models.Report.$http('reports/update_read_rejected', 'GET').then(() => updateCount && updateCount());
        this.fetch();
    }

    fetch() {
        const { models, user } = this.props;
        this.setState({ ready: false });
        models.Report.collection({
            attributes: ['id', 'description', 'urgency', 'room', 'since', 'done', 'rejection_note', 'created_at'],
            where: {
                rejection_note: {
                    $ne: null
                },
                department_id: user.department_id,
                done: false
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
                    <h3>Laporan Ditolak</h3>
                    <Table dataSource={data.rows}>
                        <Column title="Tanggal Kerusakan" key="since" render={(r) => moment(r.since).format('Do MMMM YYYY')} />
                        <Column title="Tanggal Kirim" key="created_at" render={(r) => moment(r.created_at).format('Do MMMM YYYY, h:mm:ss a')} />
                        <Column title="Bobot SAW" key="urgency" dataIndex="urgency" />
                        <Column title="Deskripsi" dataIndex="description" key="description" />
                        <Column title="Ruang" dataIndex="room" key="room" />
                        <Column title="Pemohon" key="user.name" render={(r) => r.user.name} />
                        <Column title="Catatan Penolakan" key="rejection_note" dataIndex="rejection_note" />
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
                </div>
            ) : <Loading marginTop={100} />
        )
    }

}