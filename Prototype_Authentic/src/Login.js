import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../firebaseUserConfig';

const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const loginUser = async (email, password) => { // Use const here
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={{ fontWeight: 'bold', fontSize: 26 }}>
                Login
            </Text>
            <View style={{ marginTop: 40 }}>
                <TextInput
                    style={styles.textInput} // Ensure the correct style reference
                    placeholder='Email'
                    onChangeText={(text) => setEmail(text)} // Set email state
                    autoCapitalize='none'
                    autoCorrect={false}
                    keyboardType='email-address' // Suggest email keyboard
                />
                <TextInput
                    style={styles.textInput} // Ensure the correct style reference
                    placeholder='Password'
                    onChangeText={(text) => setPassword(text)} // Set password state
                    autoCapitalize='none'
                    autoCorrect={false}
                    secureTextEntry={true}
                />
            </View>
            <TouchableOpacity
                onPress={() => loginUser(email, password)}
                style={styles.button}
            >
                <Text style={{ fontWeight: 'bold', fontSize: 22 }}>Login</Text>
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
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: 100,
    },
    textInput: { // Ensure consistent casing
        paddingTop: 20,
        paddingBottom: 10,
        width: 400,
        fontSize: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginBottom: 10,
        textAlign: 'center'
    },
    button: {
        marginTop: 50,
        height: 70,
        width: 250,
        backgroundColor: '#026efd',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    }   
});

