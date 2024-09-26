import { Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { firebase } from '../config';

const Dashboard = () => {
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = firebase.auth().currentUser;

            // Check if user is authenticated
            if (!currentUser) {
                console.log('User is not authenticated');
                setErrorMessage('User is not authenticated');
                return;
            }

            // Check if email is verified
            if (!currentUser.emailVerified) {
                console.log('Email is not verified');
                setErrorMessage('Please verify your email before accessing the dashboard.');

                // Send email verification if user exists but email is not verified
                try {
                    await currentUser.sendEmailVerification();
                    console.log('Verification email sent');
                } catch (error) {
                    console.error('Error sending verification email: ', error);
                    setErrorMessage('Error sending verification email: ' + error.message);
                }

                await firebase.auth().signOut();  // Sign out if email is not verified
                return;
            }

            try {
                // Fetch user data from Firestore
                const snapshot = await firebase.firestore().collection('users')
                    .doc(currentUser.uid)
                    .get();

                if (snapshot.exists) {
                    const userData = snapshot.data();
                    setName(userData.firstName || ''); // Accessing the firstName field
                } else {
                    console.log('User document does not exist');
                    setErrorMessage('User document does not exist');
                }
            } catch (error) {
                if (error.code === 'permission-denied') {
                    setErrorMessage('Permission denied: You do not have access to this resource.');
                } else {
                    setErrorMessage('Error fetching user data: ' + error.message);
                }
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleSignOut = async () => {
        try {
            await firebase.auth().signOut();  // Proper sign out
            console.log('User signed out successfully');
        } catch (error) {
            console.error('Error signing out: ', error);
            setErrorMessage('Error signing out: ' + error.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
            ) : (
                <Text style={{ fontSize:20, fontWeight:'bold'}}>
                    Hello, {name}
                </Text>
            )}
            <TouchableOpacity
                onPress={handleSignOut}
                style={styles.button}
            >
                <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
                    Sign Out
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default Dashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: 100,
    },
    button: {
        marginTop: 50,
        height: 70,
        width: 250,
        backgroundColor: '#026efd',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        marginBottom: 20,
    },
});

