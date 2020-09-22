import React from 'react';
import { PDFViewer, Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import Loading from './Loading';

const styles = StyleSheet.create({
    header: {
        textAlign: 'center',
        fontSize: 20,
        padding: 40,
        // borderBottomWidth: 1,
        // borderBottomColor: '#333333'
    },
    content: {
        paddingLeft: 40,
        paddingRight: 40,
        fontSize: 15
    },
    info: {
        padding: 20
    },
    infoItem: {
        marginBottom: 5
    },
    infoValue: {
        marginLeft: 16
    },
})

export default class PreviewPDF extends React.Component {

    state = {
        ready: false,
        report: null
    }

    componentDidMount() {
        const { id, models } = this.props;
        models.Report.single(id).then((report) => {
            this.setState({ report, ready: true });
        });
    }

    render() {
        const { ready, report } = this.state;
        const questions = [
            { name: 'breakage', q: 'Seperti apa kerusakan yang terjadi?' },
            { name: 'availability', q: 'Bagaimana ketersediaan spare-part atau tempat perbaikan?' },
            { name: 'warranty', q: 'Adakah garansi pada alat yang rusak?' },
            { name: 'usability', q: 'Seberapa sering ruangan yang terdampak digunakan?' }
        ];
        const answers = [{
            '0.3': 'Kerusakan Fisik Eksternal',
            '0.5': 'Kerusakan Sistem',
            '0.9': 'Rusak Total'
        }, {
            '0.1': 'Mudah ditemukan',
            '0.4': 'Sulit ditemukan',
            '0.8': 'Tidak ada'
        }, {
            '1': 'Tidak ada',
            '0.5': 'Garansi tidak full',
            '0.1': 'Garansi full'
        }, {
            '0.1': 'Seminggu sekali',
            '0.6': 'Seminggu 2-3 kali',
            '0.8': 'Seminggu 5 kali',
            '1': 'Setiap hari'
        }];
        return ready ? (
            <PDFViewer width="100%" height="800">
                <Document>
                    <Page size="A4">
                        <View style={styles.header}>
                            <Text>Usulan Perbaikan/Perawatan {report.department.name}</Text>
                        </View>
                        <View style={styles.content}>
                            <View>
                                <Text>Jurusan {report.department.name} dengan ini mengusulkan tindakan perbaikan/perawatan kepada UPT M&R terkait masalah yang terjadi dengan detail seperti berikut :</Text>
                            </View>
                            <View style={styles.info}>
                                <View style={styles.infoItem}>
                                    <Text>1. Deskripsi :</Text>
                                    <Text style={styles.infoValue}>{report.description}</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text>2. Ruangan :</Text>
                                    <Text style={styles.infoValue}>{report.room}</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text>3. Sejak Tanggal :</Text>
                                    <Text style={styles.infoValue}>{report.since}</Text>
                                </View>
                            </View>
                            <View>
                                <Text>Dan dengan hasil kuisioner yang diisi :</Text>
                            </View>
                            <View style={styles.info}>
                                {questions.map((q, i) => (
                                    <View key={i} style={styles.infoItem}>
                                        <Text>{i + 1}. {q.q}</Text>
                                        <Text style={styles.infoValue}>
                                            {answers[i][report.questionnaire[q.name]]} ({report.questionnaire[q.name]})
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            <View style={{ textAlign: 'center' }}>
                                <Text>Dengan Bobot SAW (Simple Additive Weighting)</Text>
                                <Text style={{ fontSize: 30, color: '#3498db', marginTop: 15 }}>{parseFloat(report.urgency).toPrecision(5)}</Text>
                            </View>
                        </View>
                    </Page>
                    <Page size="A4">
                        <View style={{ padding: 40 }}>
                            <Text style={{ marginBottom: 10 }}>Lampiran foto bukti usulan {report.department.name}</Text>
                            {report.files.map((f, i) => (
                                <Image key={i} src={{ uri: f.data }} />
                            ))}
                        </View>
                    </Page>
                </Document>
            </PDFViewer>
        ) : (
                <Loading marginTop={0} />
            )
    }

}