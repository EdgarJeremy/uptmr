import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Layout, Menu, Breadcrumb } from 'antd';
import { UserOutlined, LaptopOutlined, NotificationOutlined } from '@ant-design/icons';
import Departments from './Departments';
import Users from './Users';
import Loading from '../../components/Loading';

const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;

export default class Dashboard extends React.Component {

    state = {
        ready: false,
        user: null
    }

    componentDidMount() {
        const { authProvider, history } = this.props;
        authProvider.get().then((user) => {
            this.setState({ user, ready: true });
        }).catch((err) => {
            history.replace('/');
        });
    }

    goTo(subpath) {
        const { path } = this.props.match;
        const { history } = this.props;
        history.replace(`${path}${subpath}`);
    }

    render() {
        const { ready, user } = this.state;
        const { path } = this.props.match;
        const { models } = this.props;
        return (
            ready ? (
                <div>
                    <Layout>
                        <Header className="header">
                            <div className="logo">UPTM&R</div>
                            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']} style={{ textAlign: 'right' }}>
                                <Menu.Item key="1">Logout</Menu.Item>
                            </Menu>
                        </Header>
                        <Content style={{ padding: '0 50px' }}>
                            {/* <Breadcrumb style={{ margin: '16px 0' }}>
                            <Breadcrumb.Item>Home</Breadcrumb.Item>
                            <Breadcrumb.Item>List</Breadcrumb.Item>
                            <Breadcrumb.Item>App</Breadcrumb.Item>
                        </Breadcrumb> */}
                            <Layout className="site-layout-background" style={{ padding: '24px 0' }}>
                                <Sider className="site-layout-background" width={200}>
                                    <Menu
                                        mode="inline"
                                        defaultSelectedKeys={['1']}
                                        defaultOpenKeys={['sub1']}
                                        style={{ height: '100%' }}
                                    >
                                        {user.type === 'Administrator' ? (
                                            <SubMenu key="sub1" icon={<UserOutlined />} title="Menu">
                                                <Menu.Item key="1" onClick={() => this.goTo('/')}>Departemen</Menu.Item>
                                                <Menu.Item key="2" onClick={() => this.goTo('/users')}>Pengguna</Menu.Item>
                                            </SubMenu>
                                        ) : (null)}
                                        {/* <SubMenu key="sub2" icon={<LaptopOutlined />} title="subnav 2">
                                        <Menu.Item key="5">option5</Menu.Item>
                                        <Menu.Item key="6">option6</Menu.Item>
                                        <Menu.Item key="7">option7</Menu.Item>
                                        <Menu.Item key="8">option8</Menu.Item>
                                    </SubMenu>
                                    <SubMenu key="sub3" icon={<NotificationOutlined />} title="subnav 3">
                                        <Menu.Item key="9">option9</Menu.Item>
                                        <Menu.Item key="10">option10</Menu.Item>
                                        <Menu.Item key="11">option11</Menu.Item>
                                        <Menu.Item key="12">option12</Menu.Item>
                                    </SubMenu> */}
                                    </Menu>
                                </Sider>
                                <Content style={{ padding: '0 24px' }}>
                                    {user.type === 'Administrator' ? (
                                        <Switch>
                                            <Route exact path={`${path}/`} render={(p) => <Departments {...p} models={models} />} />
                                            <Route exact path={`${path}/users`} render={(p) => <Users {...p} models={models} />} />
                                        </Switch>
                                    ) : (null)}
                                </Content>
                            </Layout>
                        </Content>
                        <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
                    </Layout>
                </div>
            ) : (
                    <Loading />
                )
        )
    }

}