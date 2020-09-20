import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Layout, Menu, Avatar, Divider, Typography, Tag, Button, Modal, Badge } from 'antd';
import { UserOutlined, PartitionOutlined, MenuOutlined, InboxOutlined, ContainerOutlined, InfoCircleOutlined, CloseSquareOutlined, LogoutOutlined, AlertOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import Departments from './Departments';
import Users from './Users';
import Loading from '../../components/Loading';
import Report from './Report';
import Done from './Done';
import Inbox from './Inbox';
import Rejected from './Rejected';
import Archive from './Archive';
import Letters from './Letters';

const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;

export default class Dashboard extends React.Component {

    state = {
        ready: false,
        user: null,
        telegram_code_popup: false,
        counts: {
            inbox: null,
            done: null,
            rejected: null
        }
    }

    componentDidMount() {
        const { authProvider, history } = this.props;
        authProvider.get().then((user) => {
            this.setState({ user, ready: true }, () => {
                if (user.type === 'UPT') {
                    this.fetchInboxCount();
                }
                this.fetchDoneCount();
                this.fetchRejectedCount();
            });
        }).catch((err) => {
            history.replace('/');
        });
    }

    goTo(subpath) {
        const { path } = this.props.match;
        const { history } = this.props;
        history.replace(`${path}${subpath}`);
    }

    onLogout() {
        const { authProvider, history } = this.props;
        authProvider.remove().then(() => {
            history.replace('/login');
        });
    }

    fetchInboxCount() {
        const { user } = this.state;
        const { models } = this.props;
        models.Report.collection({
            // attributes: ['id'],
            where: {
                rejection_note: null,
                department_id: {
                    $in: user.target_id
                },
                done: false,
                read: false
            },
        }).then((data) => {
            const { counts } = this.state;
            counts.inbox = data.count;
            this.setState({ counts });
        });
    }

    fetchRejectedCount() {
        const { user } = this.state;
        const { models } = this.props;
        models.Report.collection({
            // attributes: ['id'],
            where: {
                rejection_note: {
                    $ne: null
                },
                department_id: user.department_id,
                done: false,
                read: false
            },
        }).then((data) => {
            const { counts } = this.state;
            counts.rejected = data.count;
            this.setState({ counts });
        });
    }

    fetchDoneCount() {
        const { user } = this.state;
        const { models } = this.props;
        models.Report.collection({
            // attributes: ['id'],
            where: {
                department_id: user.department_id,
                done: true,
                read: false
            },
        }).then((data) => {
            const { counts } = this.state;
            counts.done = data.count;
            this.setState({ counts });
        });
    }

    render() {
        const { ready, user, telegram_code_popup, counts } = this.state;
        const { path } = this.props.match;
        const { models } = this.props;
        let currentPage = window.location.hash.split('/');
        currentPage = currentPage[currentPage.length - 1];
        return (
            ready ? (
                <div>
                    <Layout>
                        <Header className="header">
                            <div className="logo">Sistem Manajemen UPTM&R</div>
                            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']} style={{ textAlign: 'right' }}>
                                <Menu.Item icon={<LogoutOutlined />} key="1" onClick={this.onLogout.bind(this)}>Logout</Menu.Item>
                            </Menu>
                        </Header>
                        <Content style={{ padding: '0 50px' }}>
                            <Layout className="site-layout-background dashboard-layout" style={{ padding: '24px 0' }}>
                                <Sider className="site-layout-background side-nav" width={300}>
                                    <Menu
                                        mode="inline"
                                        defaultSelectedKeys={['1']}
                                        defaultOpenKeys={['sub1']}
                                        style={{ height: '100%' }}
                                    >
                                        <div className="user-info">
                                            <Avatar size={70} icon={<UserOutlined />} />
                                            <Typography.Title level={4}>{user.name}</Typography.Title>
                                            <Tag icon={<InfoCircleOutlined />} color="gold">{user.type === 'Department' ? 'Departemen' : user.type}</Tag>
                                            {user.type === 'Department' && <Tag icon={<PartitionOutlined />} color="green">{user.department.name}</Tag>}
                                            <div style={{ marginTop: 10, marginBottom: 10, display: 'block' }} />
                                            {user.type == 'Administrator' ? null : (user.telegram_chat_id ? (
                                                <Button icon={<CheckCircleOutlined />} style={{ backgroundColor: '#2ecc71', border: 'none' }} type="primary">Notifikasi Aktif</Button>
                                            ) : (
                                                    <Button type="primary" icon={<AlertOutlined />} onClick={() => this.setState({ telegram_code_popup: true })}>Aktifkan Notifikasi</Button>
                                                ))}
                                            <Divider />
                                        </div>
                                        {user.type === 'Administrator' ? (
                                            <SubMenu icon={<MenuOutlined />} key="sub1" title="Menu">
                                                <Menu.Item icon={<PartitionOutlined />} key="1" onClick={() => this.goTo('/')} active={currentPage === ''}>Departemen</Menu.Item>
                                                <Menu.Item icon={<UserOutlined />} key="2" onClick={() => this.goTo('/users')} active={currentPage === 'users'}>Pengguna</Menu.Item>
                                            </SubMenu>
                                        ) : (
                                                user.type === 'Department' ? (
                                                    <SubMenu icon={<MenuOutlined />} key="sub1" title="Menu">
                                                        <Menu.Item icon={<PartitionOutlined />} key="1" onClick={() => this.goTo('/')} active={currentPage === ''}>Pengaduan Dikirim</Menu.Item>
                                                        <Menu.Item icon={<UserOutlined />} key="2" onClick={() => this.goTo('/done')} active={currentPage === 'done'}>
                                                            Pengaduan Selesai{' '}<Badge count={counts.done} />
                                                        </Menu.Item>
                                                        <Menu.Item icon={<CloseSquareOutlined />} key="3" onClick={() => this.goTo('/rejected')} active={currentPage === 'rejected'}>
                                                            Laporan Ditolak{' '}<Badge count={counts.rejected} />
                                                        </Menu.Item>
                                                    </SubMenu>
                                                ) : (
                                                        <SubMenu icon={<MenuOutlined />} key="sub1" title="Menu">
                                                            <Menu.Item icon={<InboxOutlined />} key="1" onClick={() => this.goTo('/')} active={currentPage === ''}>
                                                                Pengaduan Masuk{' '}<Badge count={counts.inbox} />
                                                            </Menu.Item>
                                                            <Menu.Item icon={<ContainerOutlined />} key="2" onClick={() => this.goTo('/archive')} active={currentPage === 'archive'}>Arsip</Menu.Item>
                                                            <Menu.Item icon={<FileTextOutlined />} key="3" onClick={() => this.goTo('/letters')} active={currentPage === 'letters'}>Surat</Menu.Item>
                                                        </SubMenu>
                                                    )
                                            )}
                                    </Menu>
                                </Sider>
                                <Content className="dashboard-content">
                                    {user.type === 'Administrator' ? (
                                        <Switch>
                                            <Route exact path={`${path}/`} render={(p) => <Departments {...p} models={models} user={user} />} />
                                            <Route exact path={`${path}/users`} render={(p) => <Users {...p} models={models} user={user} />} />
                                        </Switch>
                                    ) : (
                                            user.type === 'Department' ? (
                                                <Switch>
                                                    <Route exact path={`${path}/`} render={(p) => <Report {...p} models={models} user={user} />} />
                                                    <Route exact path={`${path}/done`} render={(p) => <Done updateCount={this.fetchDoneCount.bind(this)} {...p} models={models} user={user} />} />
                                                    <Route exact path={`${path}/rejected`} render={(p) => <Rejected updateCount={this.fetchRejectedCount.bind(this)} {...p} models={models} user={user} />} />
                                                </Switch>
                                            ) : (
                                                    <Switch>
                                                        <Route exact path={`${path}/`} render={(p) => <Inbox {...p} updateCount={this.fetchInboxCount.bind(this)} models={models} user={user} />} />
                                                        <Route exact path={`${path}/archive`} render={(p) => <Archive {...p} models={models} user={user} />} />
                                                        <Route exact path={`${path}/letters`} render={(p) => <Letters {...p} models={models} user={user} />} />
                                                    </Switch>
                                                )
                                        )}
                                </Content>
                            </Layout>
                        </Content>
                        <Footer style={{ textAlign: 'center' }}>Copyright &copy;{new Date().getFullYear()}</Footer>
                        <Modal
                            width={300}
                            title="Notifikasi Telegram"
                            visible={telegram_code_popup}
                            onCancel={() => this.setState({ telegram_code_popup: false })}
                            onOk={() => window.location.reload()}
                            okText="Selesai"
                            cancelText="Batal">
                            <p>Kirim kode dibawah ini ke <code>UptmrBot</code> di telegram untuk mulai mengaktifkan fitur notifikasi</p>
                            <p id="tele_code">{user.telegram_code}</p>
                        </Modal>
                    </Layout>
                </div>
            ) : (
                    <Loading />
                )
        )
    }

}
