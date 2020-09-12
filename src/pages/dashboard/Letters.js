import React from 'react';
import { Table, Space, Button, Modal, Input, Form, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Loading from '../../components/Loading';

const { Column } = Table;
const host = process.env.REACT_APP_API_HOST;
const port = process.env.REACT_APP_API_PORT;

export default class Letters extends React.Component {

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
        models.Letter.collection({
            attributes: ['id', 'name']
        }).then((data) => {
            this.setState({ ready: true, data });
        });
    }

    onAdd() {
        const { data } = this.state;
        const { models } = this.props;
        this.form.validateFields(['name']).then((values) => {
            delete values.data;
            values.data = data;
            models.Letter.create(values).then((letter) => this.setState({ addPopup: false })).then(() => this.fetch());
        }).catch((err) => { });
    }

    onDelete(r) {
        r.delete().then(() => this.fetch());
    }

    onFileChange(e) {
        const { files } = e.target;
        const reader = new FileReader();
        reader.onload = () => {
            console.log(reader.result);
            this.setState({ data: reader.result });
        }
        reader.readAsDataURL(files[0]);
    }

    render() {
        const { ready, data, addPopup } = this.state;
        const { user } = this.props;
        return (
            ready ? (
                <div>
                    <h3>Surat</h3>
                    {user.letter_admin && <div>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => this.setState({ addPopup: true })}>Tambah</Button>
                        <br /><br />
                    </div>}
                    <Table dataSource={data.rows}>
                        <Column title="Nama" dataIndex="name" key="name" />
                        <Column title="File Surat" key="data" render={(r) => (
                            <a target="_blank" href={host + ':' + port + '/letter_file/' + r.id}>download</a>
                        )} />
                        {user.letter_admin && (
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
                        )}
                    </Table>
                    <Modal
                        title="Tambah Departemen"
                        visible={addPopup}
                        onOk={this.onAdd.bind(this)}
                        onCancel={() => this.setState({ addPopup: false })}
                    >
                        <Form
                            ref={(form) => this.form = form}
                            name="newLetter"
                            layout="vertical"
                        >
                            <Form.Item
                                label="Nama surat"
                                name="name"
                                rules={[{ required: true, message: 'Nama surat harus diisi' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="File"
                                name="data"
                                rules={[{ required: true, message: 'File harus diisi' }]}
                            >
                                <Input type="file" accept="application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={this.onFileChange.bind(this)} />
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>
            ) : <Loading marginTop={100} />
        )
    }

}