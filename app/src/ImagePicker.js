import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../firebaseUserConfig';
import React, { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
// function that operates for the image uploaded
const UploadMediaFile = () => {
  const [image, setImage] = useState(null); // Holds image URI (local or Firebase URL)
  const [uploading, setUploading] = useState(false);
  const [loadingProfilePic, setLoadingProfilePic] = useState(true);

  // Fetch profile picture from Firestore on component mount
  useEffect(() => {
    const fetchProfilePic = async () => {
      const userId = firebase.auth().currentUser?.uid;
      if (!userId) { //prompts error if user not authenticated
        console.error("User not authenticated");
        return;
      }
      try {
        const userDoc = await firebase.firestore().collection('users').doc(userId).get();
        if (userDoc.exists && userDoc.data().profilePic) {
          setImage(userDoc.data().profilePic); // Set the profile picture from Firestore
        }
      } catch (error) {
        console.error("Error fetching profile picture: ", error);
      } finally {
        setLoadingProfilePic(false);
      }
    };

    fetchProfilePic();
  }, []);

  // Function to pick image from gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Set the selected image URI
    }
  };

  // Function to upload image to Firebase Storage and update Firestore
  const uploadMedia = async () => {
    if (!image) {
      Alert.alert('Error', 'No image selected');
      return;
    }

    setUploading(true);

    try {
      let blob;

      // Check if the image is already a Firebase URL or a local URI
      if (image.startsWith('http')) {
        // Image is already uploaded, no need to convert to blob
        Alert.alert('Error', 'This image is already uploaded');
        setUploading(false);
        return;
      } else {
        // Image is local, fetch file info and convert to blob
        const { uri } = await FileSystem.getInfoAsync(image);
        blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => {
            resolve(xhr.response);
          };
          xhr.onerror = (e) => {
            reject(new TypeError('Network request failed'));
          };
          xhr.responseType = 'blob';
          xhr.open('GET', uri, true);
          xhr.send(null);
        });
      }

      // Get the current user's ID
      const userId = firebase.auth().currentUser?.uid;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Firebase storage reference with user ID
      const ref = firebase.storage().ref().child(`profilePics/${userId}`);

      // Upload the image blob to Firebase Storage
      await ref.put(blob);

      // Get the download URL of the uploaded image
      const downloadURL = await ref.getDownloadURL();

      // Update Firestore with the new profile picture URL
      await firebase.firestore().collection('users').doc(userId).update({
        profilePic: downloadURL,
      });

      setImage(downloadURL);
      setUploading(false);
      Alert.alert('Success', 'Photo Uploaded!');
    } catch (error) {
      console.error("Upload error: ", error);
      setUploading(false);
      Alert.alert('Upload Failed', 'Something went wrong while uploading the image.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <SafeAreaView style={styles.innerContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.clickableText}>Pick an Image</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={uploadMedia} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator size="small" color="#026efd" />
            ) : (
              <Text style={[styles.clickableText, styles.uploadText]}>Upload Image</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          {loadingProfilePic ? (
            <ActivityIndicator size="large" color="#026efd" />
          ) : image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <Text>No profile picture</Text>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default UploadMediaFile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  clickableText: {
    color: '#8A2BE2',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 30,
  },
  uploadText: {
    marginLeft: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
    marginBottom: 50,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
