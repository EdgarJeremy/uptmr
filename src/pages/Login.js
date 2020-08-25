import React from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import Loading from '../components/Loading';

export default class Login extends React.Component {

    state = {
        ready: false
    }

    componentDidMount() {
        const { authProvider, history } = this.props;
        authProvider.get().then((user) => {
            history.replace('/dashboard');
        }).catch(() => {
            this.setState({ ready: true });
        });
    }

    onFinish(values) {
        const { authProvider, history } = this.props;
        authProvider.set(values).then((user) => {
            history.replace('/dashboard');
        }).catch((err) => {
            alert('Username/password salah');
        });
    }

    render() {
        const { ready } = this.state;
        return (
            ready ? (
                <div className="login-container">
                    <h1>UPTM&R</h1>
                    <Form
                        layout="vertical"
                        name="basic"
                        onFinish={this.onFinish.bind(this)}
                    >
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[{ required: true, message: 'Isi username' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Isi password' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit
        </Button>
                        </Form.Item>
                    </Form>
                </div>
            ) : <Loading />
        )
    }
}