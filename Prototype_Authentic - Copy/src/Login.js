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

    const loginUser = async (email, password) => {
        // Validate input
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
            await firebase.auth().signInWithEmailAndPassword(email, password);
        } catch (error) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                Alert.alert('Error', 'Account cannot be found. \nRegister or fix the inputs.');
            } else {
                Alert.alert('Error', error.message);
            }
        }
    };

    const handleForgotPassword = async () => {
        // Trim whitespace from the email input
        const trimmedEmail = forgotPasswordEmail.trim();

        // Validate email format
        if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        try {
            // Send reset password email directly
            await firebase.auth().sendPasswordResetEmail(trimmedEmail);
            Alert.alert('Success', 'Password reset email sent!');
            setModalVisible(false);
            setForgotPasswordEmail(''); // Clear input
        } catch (error) {
            console.error('Error sending reset password email:', error); // Log the error
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
        backgroundColor: '#8A2BE2', // violet background
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: 100, // This margin will push the content down
        backgroundColor: '#E6E6FA', // light purple background
        width: '100%', // Ensures the container spans the width
        borderTopLeftRadius: 30, // Optional: rounded corners
        borderTopRightRadius: 30, // Optional: rounded corners
        paddingTop: 20, // Optional: adds some padding
    },
    titleText: {
        fontWeight: 'bold',
        fontSize: 30,
        color: '#8A2BE2', // violet color for text
    },
    textInput: {
        paddingVertical: 10,
        width: 350,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#8A2BE2', // violet border color
        marginBottom: 15,
        borderRadius: 20, // to make it look like a bar
        paddingHorizontal: 15,
    },
    button: {
        marginTop: 50,
        height: 60,
        width: 250,
        backgroundColor: '#800080', // purple button
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
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
        borderColor: '#8A2BE2', // violet border color
        marginBottom: 15,
        borderRadius: 20, // to make it look like a bar
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