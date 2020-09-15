import React from 'react';
import { Button, Modal, Steps, Radio } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import SAW from '../utils/SAW';

export default class Questionnaire extends React.Component {

    state = {
        popup: false,
        current: 0,
        urgency: null,
        data: {
            breakage: null,
            availability: null,
            warranty: null,
            usability: null
        }
    }

    next() {
        const { current } = this.state;
        this.setState({ current: current + 1 });
    }

    prev() {
        const { current } = this.state;
        this.setState({ current: current - 1 });
    }

    onChangeData(criteria, val) {
        const { data } = this.state;
        data[criteria] = val;
        this.setState({ data });
    }

    async onDone() {
        const { data } = this.state;
        const { models } = this.props;
        const saw = new SAW(models, data.breakage, data.availability, data.warranty, data.usability);
        const urgency = await saw.calculate();
        const payload = {
            urgency,
            questionnaire: data
        }
        this.setState({ popup: false, urgency });
        this.props.onChange && this.props.onChange(payload);
    }

    render() {
        const { popup, current, data, urgency } = this.state;
        const qs = [
            <div className="questionnaire-item">
                <h3>Seperti apa kerusakan yang terjadi?</h3>
                <Radio.Group value={data.breakage} onChange={(e) => this.onChangeData('breakage', e.target.value)}>
                    <Radio value={0.3} className="questionnaire-option">Kerusakan Fisik Eksternal</Radio>
                    <Radio value={0.5} className="questionnaire-option">Kerusakan Sistem</Radio>
                    <Radio value={0.9} className="questionnaire-option">Rusak Total</Radio>
                </Radio.Group>
            </div>,
            <div className="questionnaire-item">
                <h3>Bagaimana ketersediaan <i>spare-part</i> atau tempat perbaikan?</h3>
                <Radio.Group value={data.availability} onChange={(e) => this.onChangeData('availability', e.target.value)}>
                    <Radio value={0.1} className="questionnaire-option">Mudah ditemukan</Radio>
                    <Radio value={0.4} className="questionnaire-option">Sulit ditemukan</Radio>
                    <Radio value={0.8} className="questionnaire-option">Tidak ada</Radio>
                </Radio.Group>
            </div>,
            <div className="questionnaire-item">
                <h3>Adakah garansi pada alat yang rusak?</h3>
                <Radio.Group value={data.warranty} onChange={(e) => this.onChangeData('warranty', e.target.value)}>
                    <Radio value={1} className="questionnaire-option">Tidak ada</Radio>
                    <Radio value={0.5} className="questionnaire-option">Garansi tidak full</Radio>
                    <Radio value={0.1} className="questionnaire-option">Garansi full</Radio>
                </Radio.Group>
            </div>,
            <div className="questionnaire-item">
                <h3>Seberapa sering ruangan yang terdampak digunakan?</h3>
                <Radio.Group value={data.usability} onChange={(e) => this.onChangeData('usability', e.target.value)}>
                    <Radio value={0.1} className="questionnaire-option">Seminggu sekali</Radio>
                    <Radio value={0.6} className="questionnaire-option">Seminggu 2-3 kali</Radio>
                    <Radio value={0.8} className="questionnaire-option">Seminggu 5 kali</Radio>
                    <Radio value={1} className="questionnaire-option">Setiap hari</Radio>
                </Radio.Group>
            </div>
        ]
        return (
            <div>
                <Button type="primary" icon={<FormOutlined />} onClick={() => this.setState({ popup: true })}>{urgency ? `Bobot : ${urgency}` : 'Isi Kuisioner'}</Button>
                <Modal
                    width={1000}
                    title="Isi Kuisioner"
                    visible={popup}
                    okText={current !== 3 ? 'Lanjut' : 'Selesai'}
                    cancelText="Sebelumnya"
                    onCancel={() => this.setState({ popup: false })}
                    onOk={current !== 3 ? this.next.bind(this) : this.onDone.bind(this)}
                    cancelButtonProps={{ onClick: () => this.prev(), disabled: current === 0 }}>
                    <Steps current={current}>
                        <Steps.Step title="Kerusakan" />
                        <Steps.Step title="Ketersediaan" />
                        <Steps.Step title="Garansi" />
                        <Steps.Step title="Kegunaan" />
                    </Steps>
                    <div className="questionnaire-items">
                        {qs[current]}
                    </div>
                </Modal>
            </div>
        )
    }

}