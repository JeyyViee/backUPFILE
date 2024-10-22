import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { firebase } from '../firebaseUserConfig';
import UploadMediaFile from '../src/ImagePicker';
import useEmailVerificationStatus from '../src/useEmailVerificationStatus'; // Import the custom hook

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#8A2BE2',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#E6E6FA',
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
  saveButton: {
    backgroundColor: '#8A2BE2',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    marginBottom: 40,
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

const Dashboard = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Call the custom hook to track email verification status and update Firestore
  useEmailVerificationStatus();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      const currentUser = firebase.auth().currentUser;

      if (!currentUser) {
        setErrorMessage('User is not authenticated');
        setLoading(false);
        return;
      }

      if (!currentUser.emailVerified) {
        setErrorMessage('Your email is not verified. A verification email has been sent. Please verify your email.');
        try {
          await currentUser.sendEmailVerification();
        } catch (error) {
          setErrorMessage('Error sending verification email: ' + error.message);
        }
        await firebase.auth().signOut();
        setLoading(false);
        return;
      }

      try {
        const snapshot = await firebase.firestore().collection('users').doc(currentUser.uid).get();
        if (snapshot.exists) {
          const userData = snapshot.data();
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setName(userData.firstName || '');
          setProfilePic(userData.profilePic || null);
        } else {
          await createUserDocument(currentUser.uid);
        }
      } catch (error) {
        setErrorMessage('Error fetching user data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const createUserDocument = async (uid) => {
    try {
      await firebase.firestore().collection('users').doc(uid).set({
        firstName: '',
        lastName: '',
        profilePic: null,
      });
    } catch (error) {
      setErrorMessage('Error creating user document: ' + error.message);
    }
  };

  const handleSaveUserInfo = async () => {
    if (!validateName(firstName) || !validateName(lastName)) {
      Alert.alert('Invalid input', 'First and last names are too long, contain only letters, and have no spaces.');
      return;
    }

    if (firstName.trim() === '' || lastName.trim() === '') {
      Alert.alert('Invalid input', 'First and last names cannot be empty.');
      return;
    }

    try {
      const userId = firebase.auth().currentUser.uid;
      await firebase.firestore().collection('users').doc(userId).update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      alert('User information saved successfully!');
    } catch (error) {
      setErrorMessage('Error saving user information: ' + error.message);
    }
  };

  const validateName = (text) => {

    if (text.trim() === '') {
      return true;
    }
  
    return /^(?!.* {2})[a-zA-Z ]{1,10}$/.test(text);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#00e4d0" style={styles.loader} />;
  }

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : (
            <>
              <Text style={styles.welcomeText}>
                Hello, {firstName && lastName ? `${firstName} ${lastName}` : 'Welcome!'}
              </Text>
            </>
          )}
          <UploadMediaFile />
          <TextInput
            style={styles.textInput}
            placeholder="First Name"
            value={firstName}
            onChangeText={(text) => setFirstName(validateName(text) ? text : firstName)}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Last Name"
            value={lastName}
            onChangeText={(text) => setLastName(validateName(text) ? text : lastName)}
          />

          <TouchableOpacity onPress={handleSaveUserInfo} style={styles.saveButton}>
            <Text style={styles.buttonText}>Save User Information</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Dashboard;

