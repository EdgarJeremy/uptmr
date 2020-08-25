import React from 'react';
import { Table, Space, Button, Modal, Input, Form, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Loading from '../../components/Loading';

const { Column } = Table;

export default class Departments extends React.Component {

    state = {
        ready: false,
        addPopup: false,
        data: null
    }

    componentDidMount() {
        this.fetch();
    }

    fetch() {
        const { models } = this.props;
        this.setState({ ready: false });
        models.Department.collection({
            attributes: ['id', 'name']
        }).then((data) => {
            this.setState({ ready: true, data });
        });
    }

    onAdd() {
        const { models } = this.props;
        this.form.validateFields(['name']).then((values) => {
            models.Department.create(values).then((department) => this.setState({ addPopup: false })).then(() => this.fetch());
        }).catch((err) => { });
    }

    onDelete(r) {
        r.delete().then(() => this.fetch());
    }

    render() {
        const { ready, data, addPopup } = this.state;
        return (
            ready ? (
                <div>
                    <h3>Departemen</h3>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => this.setState({ addPopup: true })}>Tambah</Button><br /><br />
                    <Table dataSource={data.rows}>
                        <Column title="Nama" dataIndex="name" key="name" />
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
                            name="newDepartment"
                            layout="vertical"
                        >
                            <Form.Item
                                label="Nama departemen"
                                name="name"
                                rules={[{ required: true, message: 'Nama harus diisi' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            ) : <Loading marginTop={100} />
        )
    }

}