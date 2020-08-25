import React from 'react';
import { Table, Space, Button, Modal, Input, Form, Popconfirm, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Loading from '../../components/Loading';

const { Column } = Table;

export default class Users extends React.Component {

    state = {
        ready: false,
        addPopup: false,
        data: null,
        type: null,
        departments: null
    }

    componentDidMount() {
        this.fetch();
    }

    fetch() {
        const { models } = this.props;
        this.setState({ ready: false });
        models.User.collection({
            attributes: ['id', 'name', 'username', 'type'],
            include: [{
                model: 'Department',
                attributes: ['id', 'name']
            }]
        }).then((data) => {
            models.Department.collection({
                attributes: ['id', 'name']
            }).then((departments) => {
                this.setState({ ready: true, data, departments });
            });
        });
    }

    onAdd() {
        const { models } = this.props;
        this.form.validateFields(['name', 'username', 'password', 'type', 'target_id', 'department_id']).then((values) => {
            values.department_id = values.type === 'Department' ? values.department_id : null;
            values.target_id = values.type === 'UPT' ? values.target_id : null;
            models.User.create(values).then((user) => this.setState({ addPopup: false })).then(() => this.fetch());
        }).catch((err) => { });
    }

    onDelete(r) {
        r.delete().then(() => this.fetch());
    }

    render() {
        const { ready, data, addPopup, departments } = this.state;
        console.log(data);
        return (
            ready ? (
                <div>
                    <h3>Pengguna</h3>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => this.setState({ addPopup: true })}>Tambah</Button><br /><br />
                    <Table dataSource={data.rows}>
                        <Column title="Nama" dataIndex="name" key="name" />
                        <Column title="Username" dataIndex="username" key="username" />
                        <Column title="Tipe" dataIndex="type" key="type" />
                        <Column title="Departemen" render={(r) => r.department?.name} key="department.name" />
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
                        title="Tambah Departemen"
                        visible={addPopup}
                        onOk={this.onAdd.bind(this)}
                        onCancel={() => this.setState({ addPopup: false })}
                    >
                        <Form
                            ref={(form) => this.form = form}
                            name="newUser"
                            layout="vertical"
                        >
                            <Form.Item
                                label="Nama pengguna"
                                name="name"
                                rules={[{ required: true, message: 'Nama harus diisi' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Username"
                                name="username"
                                rules={[{ required: true, message: 'Username harus diisi' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[{ required: true, message: 'Password harus diisi' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Tipe"
                                name="type"
                                rules={[{ required: true, message: 'Tipe harus diisi' }]}
                            >
                                <Select
                                    onChange={(type) => this.setState({ type })}
                                    allowClear
                                >
                                    <Select.Option value="Administrator">Administrator</Select.Option>
                                    <Select.Option value="Department">Departemen</Select.Option>
                                    <Select.Option value="UPT">UPT</Select.Option>
                                </Select>
                            </Form.Item>
                            {this.state.type === 'Department' && (
                                <Form.Item
                                    label="Departemen"
                                    name="department_id"
                                    rules={[{ required: true, message: 'Departemen harus diisi' }]}
                                >
                                    <Select
                                        allowClear
                                    >
                                        {departments.rows.map((d, i) => (
                                            <Select.Option key={i} value={d.id}>{d.name}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}
                            {this.state.type === 'UPT' && (
                                <Form.Item
                                    label="Mengurus Departement"
                                    name="target_id"
                                    rules={[{ required: true, message: 'Mengurus departemen harus diisi' }]}
                                >
                                    <Select
                                        mode="multiple"
                                        allowClear
                                    >
                                        {departments.rows.map((d, i) => (
                                            <Select.Option key={i} value={d.id}>{d.name}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}
                        </Form>
                    </Modal>
                </div>
            ) : <Loading marginTop={100} />
        )
    }

}