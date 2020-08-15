import React from 'react';
import { Spin } from 'antd';

export default class Loading extends React.Component {

    render() {
        return (
            <div className="loading-container" style={{ marginTop: this.props.marginTop }}>
                <Spin size="large" /><br />
                <h3>Loading..</h3>
            </div>
        )
    }

}