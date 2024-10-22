import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Modal } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../firebaseUserConfig';

const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

    const loginUser = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in both fields.');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long.');
            return;
        }

         try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                Alert.alert('Error', 'Your email address is not verified. Please verify your email to continue.');
                // Optional: Sign out the user
                await firebase.auth().signOut();
                return;
            }

            setEmail(''); // Clear the email field after successful login
            setPassword(''); // Clear the password field after successful login
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };


    const handleForgotPassword = async () => {
        const trimmedEmail = forgotPasswordEmail.trim();

        if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        try {
            await firebase.auth().sendPasswordResetEmail(trimmedEmail);
            Alert.alert('Success', 'Password reset email sent!');
            setModalVisible(false);
            setForgotPasswordEmail('');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.outerContainer}>
            <View style={styles.container}>
                <Text style={styles.titleText}>
                    DGMPLAE
                </Text>
                <View style={{ marginTop: 40 }}>
                    <TextInput
                        style={styles.textInput}
                        placeholder='Email'
                        onChangeText={(text) => setEmail(text)}
                        autoCapitalize='none'
                        autoCorrect={false}
                        keyboardType='email-address'
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder='Password'
                        onChangeText={(text) => setPassword(text)}
                        autoCapitalize='none'
                        autoCorrect={false}
                        secureTextEntry={true}
                    />
                </View>
                <TouchableOpacity
                    onPress={() => loginUser(email, password)}
                    style={styles.button}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'white' }}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Registration')}
                    style={{ marginTop: 20 }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                        Don't have an account? Register Now!
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={{ marginTop: 20 }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#8A2BE2' }}>
                        Forgot Password?
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Modal for Forgot Password */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Reset Password</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter your email"
                            value={forgotPasswordEmail}
                            onChangeText={setForgotPasswordEmail}
                            autoCapitalize='none'
                            autoCorrect={false}
                            keyboardType='email-address'
                        />
                        <TouchableOpacity
                            onPress={handleForgotPassword}
                            style={styles.modalButton}
                        >
                            <Text style={styles.buttonText}>Send Reset Link</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.modalButton}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Login;


const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#8A2BE2',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: 100,
        backgroundColor: '#E6E6FA',
        width: '100%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 20,
    },
    titleText: {
        fontWeight: 'bold',
        fontSize: 30,
        color: '#8A2BE2',
    },
    textInput: {
        paddingVertical: 10,
        width: 350,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#8A2BE2',
        marginBottom: 15,
        borderRadius: 20,
        paddingHorizontal: 15,
    },
    button: {
        marginTop: 50,
        height: 60,
        width: 250,
        backgroundColor: '#800080',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#E6E6FA',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalInput: {
        paddingVertical: 10,
        width: '100%',
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#8A2BE2',
        marginBottom: 15,
        borderRadius: 20,
        paddingHorizontal: 15,
    },
    modalButton: {
        backgroundColor: '#8A2BE2',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});
