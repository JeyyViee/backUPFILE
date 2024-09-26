import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../firebaseUserConfig';
import React, { useState } from 'react';
import * as FileSystem from 'expo-file-system';

const UploadMediaFile = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1], // Cropped aspect ratio for profile picture
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadMedia = async () => {
    if (!image) {
      Alert.alert('Error', 'No image selected');
      return;
    }

    setUploading(true);

    try {
      const { uri } = await FileSystem.getInfoAsync(image);
      const blob = await new Promise((resolve, reject) => {
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

      const filename = image.substring(image.lastIndexOf('/') + 1);
      const ref = firebase.storage().ref().child(filename);

      await ref.put(blob);
      setUploading(false);
      Alert.alert('Photo Uploaded!!!');
      setImage(null);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.clickableText}>Pick an Image</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={uploadMedia}>
          <Text style={[styles.clickableText, styles.uploadText]}>Upload Image</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.imageContainer}>
        {image && <Image source={{ uri: image }} style={styles.profileImage} />}
      </View>
    </SafeAreaView>
  );
};

export default UploadMediaFile;

const styles = StyleSheet.create({
  container: {
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
    color: '#026efd',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  uploadText: {
    marginLeft: 20, // Add spacing between "Pick an Image" and "Upload Image"
  },
  profileImage: {
    width: 100,  // Smaller size for profile picture preview
    height: 100,
    borderRadius: 50,  // Circular profile picture
    marginTop: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
