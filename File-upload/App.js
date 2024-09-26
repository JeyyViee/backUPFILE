import { StyleSheet, View } from 'react-native';
import UploadMediaFile from './src';

export default function App() {
    return (
        <View style={styles.container}>
            <UploadMediaFile />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});


