import React from 'react';
import { Layout, Menu, Card, Form, Input, Button } from 'antd';
import { LoginOutlined, MenuOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

export default class FrontPage extends React.Component {

    onFinish(values) {
        const { authProvider, history } = this.props;
        authProvider.set(values).then((user) => {
            history.replace('/dashboard');
        }).catch((err) => {
            alert('Username/password salah');
        });
    }

    render() {
        return (
            <div>
                <Layout>
                    <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
                        <div className="logo">
                            Sistem Manajemen UPT-M&R
                        </div>
                        <div className="login">
                            <Form
                                layout="inline"
                                name="basic"
                                onFinish={this.onFinish.bind(this)}
                            >
                                <Form.Item
                                    name="username"
                                    rules={[{ required: true, message: 'Isi username' }]}
                                >
                                    <Input size="small" placeholder="Username" />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    rules={[{ required: true, message: 'Isi password' }]}
                                >
                                    <Input.Password size="small" placeholder="Password" />
                                </Form.Item>

                                <Form.Item>
                                    <Button size="small" type="primary" htmlType="submit">
                                        <LoginOutlined />
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                        {/* <Menu className="front-menu" theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
                            <Menu.Item key="1">Login</Menu.Item>
                        </Menu> */}
                    </Header>
                    <Content className="site-layout front-content">
                        <div className="site-layout-background" style={{ padding: 24, minHeight: 380 }}>
                            <div className="logo-image">
                                <img src={require('../logo.png')} />
                                <h2>Politeknik Negeri Manado - Sistem Manajemen UPT M&R</h2>
                            </div>
                            <div className="front-section">
                                <Card title="Apa itu UPT M&R?">
                                    <div className="front-img">
                                        <img src={require('../maintenance.jpg')} />
                                    </div>
                                    <div className="front-desc">
                                        Unit Pelaksaan Teknis (UPT) adalah satuan organisasi yang bersifat mandiri yang melaksanakana tugas teknis dari operasi/atau tugas teknis dari organisasi induknya. Dalam hal ini, UPT M&R adalah organisasi yang melaksanakan tugas Maintenance & Repair (perawatan dan perbaikan) dalam institusi Politeknik Negeri Manado.
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>Copyright 2020 &copy; Politeknik Negeri Manado</Footer>
                </Layout>
            </div>
        )
    }

}