import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../firebaseUserConfig';

const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
            </View>
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
    }
});
