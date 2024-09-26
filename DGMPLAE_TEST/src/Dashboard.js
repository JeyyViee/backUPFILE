import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { firebase } from '../config';
import * as ImagePicker from 'expo-image-picker';
import UploadMediaFile from '../src'; // Assuming this is a custom component

const Dashboard = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user data and verify email
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = firebase.auth().currentUser;

      if (!currentUser) {
        setErrorMessage('User is not authenticated');
        return;
      }

      if (!currentUser.emailVerified) {
        setErrorMessage('Please verify your email before accessing the dashboard.');
        try {
          await currentUser.sendEmailVerification();
        } catch (error) {
          setErrorMessage('Error sending verification email: ' + error.message);
        }
        await firebase.auth().signOut();
        return;
      }

      try {
        const snapshot = await firebase.firestore().collection('users')
          .doc(currentUser.uid)
          .get();

        if (snapshot.exists) {
          const userData = snapshot.data();
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setName(userData.firstName || '');
        } else {
          await createUserDocument(currentUser.uid);
        }
      } catch (error) {
        setErrorMessage('Error fetching user data: ' + error.message);
      }
    };

    fetchUserData();
  }, []);

  // Create a user document in Firestore if it doesn't exist
  const createUserDocument = async (uid) => {
    try {
      await firebase.firestore().collection('users').doc(uid).set({
        firstName: '',
        lastName: '',
      });
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  };

  // Update user information (first and last name)
  const handleSaveUserInfo = async () => {
    try {
      const userId = firebase.auth().currentUser.uid;
      await firebase.firestore().collection('users').doc(userId).update({
        firstName,
        lastName,
      });
      alert('User information saved successfully!');
    } catch (error) {
      setErrorMessage('Error saving user information: ' + error.message);
    }
  };

  // Profile pic upload logic
  const handleProfilePicUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const blob = await (await fetch(result.uri)).blob();
      const storageRef = firebase.storage().ref().child(`profilePics/${firebase.auth().currentUser.uid}`);
      await storageRef.put(blob);
      const downloadURL = await storageRef.getDownloadURL();
      setProfilePic(downloadURL);
    }
  };

  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
      alert('User signed out successfully');
    } catch (error) {
      setErrorMessage('Error signing out: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : (
        <Text style={styles.welcomeText}>
          Hello, {name || 'User'}
        </Text>
      )}

      {/* Input fields for first and last name */}
      <TextInput
        style={styles.textInput}
        placeholder="First Name"
        value={firstName}
        onChangeText={(text) => setFirstName(text)}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Last Name"
        value={lastName}
        onChangeText={(text) => setLastName(text)}
      />

      {/* Save button */}
      <TouchableOpacity onPress={handleSaveUserInfo} style={styles.saveButton}>
        <Text style={styles.buttonText}>Save User Information</Text>
      </TouchableOpacity>

      {/* Custom media upload component */}
      <UploadMediaFile />

      {/* Sign out button */}
      <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  textInput: {
    width: '80%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#026efd',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#28a745',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
  },
  imagePreviewText: {
    fontSize: 16,
    color: 'gray',
    marginVertical: 10,
  },
});
