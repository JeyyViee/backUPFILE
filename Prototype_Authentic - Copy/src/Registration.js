import { View, Text, Alert, StyleSheet, Switch } from 'react-native';
import React, { useState } from 'react';
import { firebase } from '../firebaseUserConfig';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';

const Registration = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSeller, setIsSeller] = useState(false); // State to determine if user is a Seller or Client

    const registerUser = async (email, password, confirmPassword) => {
        // Check if all fields are filled
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        try {
            // Register the user with email and password
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Send verification email
            await user.sendEmailVerification({
                handleCodeInApp: true,
                url: 'https://test-8aedc.firebaseapp.com',
            });
            Alert.alert('Success', 'Verification email sent');

            // Log role to check if it's being set
            const role = isSeller ? 'Seller' : 'Client'; // Set role to 'Client' if not Seller
            console.log('User Role:', role);

            // Store the user's details in Firestore (for both clients and sellers)
            await firebase.firestore().collection('users').doc(user.uid).set({
                email,
                role, // Store role as either 'Seller' or 'Client'
                uid: user.uid, // Store UID
            });
            console.log('User data saved in Firestore.');

            // If the user is a seller, store additional data in the sellers collection
            if (isSeller) {
                await firebase.firestore().collection('sellers').doc(user.uid).set({
                    email,
                    uid: user.uid, // Store UID in sellers collection
                    // Add additional seller-specific fields here if necessary
                });
                console.log('Seller data saved in Firestore.');
            }

        } catch (error) {
            // Handle specific errors
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Error', 'This email is already registered. Please use a different email.');
            } else if (error.code === 'permission-denied') {
                Alert.alert('Error', 'You do not have permission to perform this action.');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('Error', 'Invalid email format.')
            }else if (error.code === 'auth/weak-password') {
                Alert.alert('Error', 'Password should be at least 6 characters long.')
            } else {
                console.error('Error registering user:', error.message);
                Alert.alert('Error', error.message);
            }
        }
    };



    return (
        <View style={styles.outerContainer}>
            <View style={styles.container}>
                <Text style={{ fontWeight: 'bold', fontSize: 23 }}>
                    Register Here
                </Text>
                <View style={{ marginTop: 40 }}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Email: example@example.com"
                        onChangeText={(text) => setEmail(text)}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.textInput}
                        placeholder="Password: Must be 6 characters long"
                        onChangeText={(text) => setPassword(text)}
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry={true}
                    />

                    <TextInput
                        style={styles.textInput}
                        placeholder="Confirm Password"
                        onChangeText={(text) => setConfirmPassword(text)} // New input for confirm password
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry={true}
                    />

                    {/* Seller Switch to toggle between Seller and Client */}
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>Click this button if you are a seller:</Text>
                        <Switch
                            value={isSeller}
                            onValueChange={(value) => setIsSeller(value)} // Toggle Seller/Client
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => registerUser(email, password, confirmPassword)}
                    style={styles.button}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'white' }}>Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Registration;


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
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    switchLabel: {
        fontSize: 18,
        marginRight: 10,
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

