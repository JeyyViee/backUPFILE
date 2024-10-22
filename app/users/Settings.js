import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native';
import { firebase } from '../firebaseUserConfig';

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
    marginTop: 10,
    backgroundColor: '#E6E6FA', // light purple background
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#8A2BE2',
    borderRadius: 5,
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: '#800080',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#8A2BE2',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const Setting = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;

    if (!currentUser) {
      setErrorMessage('User is not authenticated');
      setLoading(false);
    } else {
      setEmail(currentUser.email); // Set the current user's email for display
      setLoading(false);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
      alert('User signed out successfully');
    } catch (error) {
      setErrorMessage('Error signing out: ' + error.message);
    }
  };

  const handleResetPassword = async () => {
    if (email.trim() === '') {
      Alert.alert('Invalid input', 'Please enter your email address.');
      return;
    }

    try {
      await firebase.auth().sendPasswordResetEmail(email);
      Alert.alert('Success', 'Password reset email sent successfully!');
    } catch (error) {
      setErrorMessage('Error sending password reset email: ' + error.message);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#00e4d0" style={styles.loader} />;
  }

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.container}>
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : (
          <Text style={styles.welcomeText}>Welcome!</Text>
        )}

        <TextInput
          style={[styles.welcomeText, { color: '#000000' }]} 
          placeholder="Enter your email address"
          value={email}
          onChangeText={setEmail}
          editable={false}
        />

        <TouchableOpacity onPress={handleResetPassword} style={styles.resetButton}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default Setting;
