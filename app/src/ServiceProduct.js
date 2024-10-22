import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ScrollView, Modal, FlatList, Button } from 'react-native';
import { firebase } from '../firebaseUserConfig';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker'; // changes from import DocumentPicker from 'react-native-document-picker';
import * as FileSystem from 'expo-file-system';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';
import { Video } from 'expo-av'; // Make sure you have installed expo-av
import { Audio } from 'expo-av';


const ServiceProduct = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageUris, setImageUris] = useState([]); // For multi-image showcase
  const [uploading, setUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [type, setType] = useState('product');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [terms, setTerms] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // Store selected file
  const [fileName, setFileName] = useState(''); // Store file name for preview
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [videoName, setVideoName] = useState(''); // Store video name for preview
  const [selectedMusic, setSelectedMusic] = useState([]); // For the new music category
  const [selectedMusicFiles, setSelectedMusicFiles] = useState([]);
  const [musicName, setMusicName] = useState(''); // Store music name for preview
  const [selectedImages, setSelectedImages] = useState([]); // For images
  const [selectedOthers, setSelectedOthers] = useState([]); // For others  
  const [selectedDocuments, setSelectedDocuments] = useState([]); // To store selected docs
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]); // To hold all selected files
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const [previewCategory, setPreviewCategory] = useState('');
  const [sound, setSound] = useState(null);
  


  const user = getAuth().currentUser;
  const MAX_IMAGES = 5;

  // Fetch the user's first and last name
  const fetchUserDetails = async (uid) => {
    try {
      const userDoc = await getDoc(doc(firebase.firestore(), 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
        setSellerName(fullName || 'Anonymous');
      } else {
        console.log('User document does not exist');
        setSellerName('Anonymous');
      }
    } catch (error) {
      console.error('Error fetching user details: ', error);
      setSellerName('Anonymous');
    }
  };

  if (user) {
      fetchUserDetails(user.uid);
    }

  useEffect(() => {
    return () => {
    };
  }, [user]);

  

  // For banner-style image
  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access the media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // Banner aspect ratio
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };


  // Multi-image picker for image showcase
  const handlePickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission to access the media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

   if (!result.canceled && result.assets && result.assets.length > 0) {
    if (result.assets.length <= MAX_IMAGES) {
      const selectedImages = result.assets.map(asset => asset.uri);
      setImageUris(selectedImages);
    } else {
      Alert.alert(`You can only select up to ${MAX_IMAGES} images.`);
    }
  } else {
    console.log('Image picking was canceled or no images were selected.');
  }
  };

  const handleDocumentPick = async () => {
    // Limit the number of selected documents to 3
    if (selectedDocuments.length >= 3) {
      Alert.alert('You can only select up to 3 documents.');
      return;
    }

    try {
      // Use Expo's Document Picker to select a document
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/*', // Allow all document types
        multiple: false, // Only allow one document at a time
      });

      console.log('Document Picker Result:', result);

      // If the user cancels the picker, exit
      if (result.canceled) {
        console.log('Document picking was canceled.');
        return;
      }

      // Process the selected document
      const document = result.assets[0]; // Get the first asset (since multiple is false)

      // Check if the document exists on the file system
      const fileInfo = await FileSystem.getInfoAsync(document.uri);
      if (!fileInfo.exists) {
        Alert.alert('The selected file does not exist.');
        return;
      }

      // Add the document to the state
      setSelectedDocuments((prevDocuments) => [
        ...prevDocuments,
        {
          uri: document.uri,
          name: document.name,
          mimeType: document.mimeType,
          size: fileInfo.size, // Get file size info
        },
      ]);

    } catch (error) {
      // Catch and display any errors
      console.error('Error picking document:', error);
      Alert.alert('Error picking document. Please try again.');
    }
  };

  const handleFilePick = async () => {
    // Limit the number of selected files to 3
    if (selectedFiles.length >= 3) {
      Alert.alert('You can only select up to 3 files.');
      return;
    }

    try {
      // Use Expo's Document Picker to select a file
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types
        multiple: false, // Only allow one file at a time
      });

      console.log('Document Picker Result:', result);

      // If the user cancels the picker, exit
      if (result.canceled) {
        console.log('File picking was canceled.');
        return;
      }

      // Process the selected file
      const file = result.assets[0]; // Get the first asset (since multiple is false)

      // Check if the file exists on the file system
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      if (!fileInfo.exists) {
        Alert.alert('The selected file does not exist.');
        return;
      }

      // Add the file to the state
      setSelectedFiles((prevFiles) => [
        ...prevFiles,
        {
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType,
          size: fileInfo.size, // Get file size info
        },
      ]);

    } catch (error) {
      // Catch and display any errors
      console.error('Error picking file:', error);
      Alert.alert('Error picking file. Please try again.');
    }
  };

  // Upload both single banner image and multiple showcase images
  const uploadImagesToStorage = async () => {
    const storage = getStorage();
    setUploading(true);
    const uploadedUrls = [];

    for (let i = 0; i < imageUris.length; i++) {
      try {
        const response = await fetch(imageUris[i]);
        const blob = await response.blob();

        const imageRef = ref(storage, `products_services/multiple/${Date.now()}_image${i}.jpg`);
        const uploadResult = await uploadBytes(imageRef, blob);

        const downloadUrl = await getDownloadURL(uploadResult.ref);
        uploadedUrls.push(downloadUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    setUploading(false);
    return uploadedUrls;
  };

  // Function to handle music picking
  const handleMusicPick = async () => {
    // Limit the number of selected music files to 3
    if (selectedMusic.length >= 3) {
      Alert.alert('You can only select up to 3 music files.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*', // Allow only audio file types
        multiple: false, // Only allow one document at a time
      });

      if (result.canceled) {
        console.log('Music picking was canceled.');
        return;
      }

      const music = result.assets[0]; // Get the first asset

      // Check if the music file exists on the file system
      const fileInfo = await FileSystem.getInfoAsync(music.uri);
      if (!fileInfo.exists) {
        Alert.alert('The selected music file does not exist.');
        return;
      }

      // Add the music file to the state
      setSelectedMusic((prevMusic) => [
        ...prevMusic,
        {
          uri: music.uri,
          name: music.name,
          mimeType: music.mimeType,
          size: fileInfo.size, // Get file size info
        },
      ]);

    } catch (error) {
      console.error('Error picking music file:', error);
      Alert.alert('Error picking music file. Please try again.');
    }
  };

  // Function to handle video picking
  const handleVideoPick = async () => {
    // Limit the number of selected video files to 3
    if (selectedVideos.length >= 3) {
      Alert.alert('You can only select up to 3 video files.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*', // Allow only video file types
        multiple: false, // Only allow one document at a time
      });

      if (result.canceled) {
        console.log('Video picking was canceled.');
        return;
      }

      const video = result.assets[0]; // Get the first asset

      // Check if the video file exists on the file system
      const fileInfo = await FileSystem.getInfoAsync(video.uri);
      if (!fileInfo.exists) {
        Alert.alert('The selected video file does not exist.');
        return;
      }

      // Add the video file to the state
      setSelectedVideos((prevVideos) => [
        ...prevVideos,
        {
          uri: video.uri,
          name: video.name,
          mimeType: video.mimeType,
          size: fileInfo.size, // Get file size info
        },
      ]);
    } catch (error) {
      console.error('Error picking video file:', error);
      Alert.alert('Error picking video file. Please try again.');
    }
  };

  const uploadBannerImageToStorage = async () => {
    if (!imageUri) return null;

    try {
      setImageUploading(true);
      const storage = getStorage(); // Ensure storage is initialized correctly
      const imageRef = ref(storage, `services_products/${Date.now()}_${user.uid}.jpg`);
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload image
      const uploadResult = await uploadBytes(imageRef, blob);

      // Get download URL after upload
      return await getDownloadURL(uploadResult.ref);
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setImageUploading(false);
    }
  };

    // Show the preview for a category
  const showPreview = (category) => {
    setPreviewCategory(category);
    setPreviewVisible(true);
  };

  const uploadDocumentsToFirebase = async () => {
    try {
      const uploadPromises = selectedDocuments.map(async (doc) => {
        const response = await fetch(doc.uri);
        const blob = await response.blob();

        // Assuming you're uploading to Firebase Storage
        const storageRef = firebase.storage().ref().child(`documents/${doc.name}`);
        await storageRef.put(blob);

        // Get the download URL after the upload
        const url = await storageRef.getDownloadURL();
        console.log(`Uploaded ${doc.name} successfully.`);
        return url; // Return the URL of the uploaded document
      });

      const documentUrls = await Promise.all(uploadPromises);
      Alert.alert('All documents uploaded successfully!');
      return documentUrls; // Return the array of document URLs
    } catch (error) {
      console.error('Error uploading documents:', error);
      Alert.alert('Error uploading documents. Please try again.');
      return []; // Return an empty array in case of an error
    }
  };

  // Function to upload music files to Firebase
  const uploadMusicToFirebase = async () => {
    try {
      // Create an array of promises for each selected music file
      const uploadPromises = selectedMusic.map(async (selectedMusic) => {
        console.log('Starting upload for:', selectedMusic.name);

        // Fetch the music file as a blob
        const response = await fetch(selectedMusic.uri);
        if (!response.ok) {
          console.error('Failed to fetch music file:', selectedMusic.name, response);
          throw new Error('Failed to fetch music file');
        }
        
        const blob = await response.blob();
        console.log('Blob created for:', selectedMusic.name);

        // Create a unique storage path for the music file in Firebase
        const storageRef = firebase.storage().ref().child(`music/${selectedMusic.name}`);

        // Upload the music file to Firebase Storage
        const uploadTask = await storageRef.put(blob);
        console.log('Upload finished for:', selectedMusic.name);

        // Get the download URL
        const musicUrl = await uploadTask.ref.getDownloadURL();
        console.log('Music URL retrieved for:', selectedMusic.name, musicUrl);

        // Return the URL of the uploaded music file
        return musicUrl;
      });

      // Wait for all uploads to complete and gather the URLs
      const musicUrls = await Promise.all(uploadPromises);
      return musicUrls; // Return the array of music URLs
    } catch (error) {
      console.error('Error uploading music:', error);
      Alert.alert('Error uploading music. Please try again.'); // Alert on error
      return []; // Return an empty array in case of failure
    }
  };

  // Function to upload video files to Firebase
  const uploadVideoToFirebase = async () => {
    try {
      // Create an array of promises for each selected video file
      const uploadPromises = selectedVideos.map(async (selectedVideo) => {
        console.log('Starting upload for:', selectedVideo.name);

        // Fetch the video file as a blob
        const response = await fetch(selectedVideo.uri);
        const blob = await response.blob();
        console.log('Blob created for:', selectedVideo.name);

        // Create a unique storage path for the video file in Firebase
        const storageRef = firebase.storage().ref().child(`videos/${selectedVideo.name}`);

        // Upload the video file to Firebase Storage
        const uploadTask = await storageRef.put(blob);
        console.log('Upload finished for:', selectedVideo.name);

        // Get the download URL
        const videoUrl = await uploadTask.ref.getDownloadURL();
        console.log('Video URL retrieved for:', selectedVideo.name, videoUrl);

        // Return the URL of the uploaded video file
        return videoUrl;
      });

      // Wait for all uploads to complete and gather the URLs
      const videoUrls = await Promise.all(uploadPromises);
      Alert.alert('All video files uploaded successfully!'); // Alert on successful upload
      return videoUrls; // Return the array of video URLs
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error uploading video. Please try again.'); // Alert on error
      return []; // Return an empty array in case of failure
    }
  };

  const uploadFilesToFirebase = async () => {
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const response = await fetch(file.uri);
        const blob = await response.blob();

        // Upload to Firebase Storage
        const storageRef = firebase.storage().ref().child(`files/${file.name}`);
        await storageRef.put(blob);

        // Get the download URL after the upload
        const url = await storageRef.getDownloadURL();
        console.log(`Uploaded ${file.name} successfully.`);
        return url; // Return the URL of the uploaded file
      });

      const fileUrls = await Promise.all(uploadPromises);
      Alert.alert('All files uploaded successfully!');
      return fileUrls; // Return the array of file URLs
    } catch (error) {
      console.error('Error uploading files:', error);
      Alert.alert('Error uploading files. Please try again.');
      return []; // Return an empty array in case of an error
    }
  };

const showAllPreviews = () => {
  setPreviewVisible(true); // Show the preview modal
  setPreviewCategory('all'); // You can also use a custom category if needed
};



const clearAllFiles = async () => {
  // Stop and unload sound if it is playing
  if (sound) {
    await sound.stopAsync(); // Stop playback
    await sound.unloadAsync(); // Unload the sound
    setSound(null); // Clear the sound instance
  }

  // Clear all selected files
  setSelectedFiles([]);
  setSelectedVideos([]);
  setSelectedMusic([]);
  setSelectedDocuments([]);
  setImageUris([]);
};

const clearFiles = async () => {
  // Stop and unload sound if it is playing
  if (sound) {
    await sound.stopAsync(); // Stop playback
    await sound.unloadAsync(); // Unload the sound
    setSound(null); // Clear the sound instance
  }

  // Check which category is active and clear the corresponding state
  if (previewCategory === 'file') {
    setSelectedFile([]); // Clear selected file
    setFileName('');       // Clear file name
  } else if (previewCategory === 'video') {
    setSelectedVideos([]); // Clear selected videos array
    // Optionally clear other related state variables if needed
  } else if (previewCategory === 'music') {
    setSelectedMusic([]); // Clear the selected music array
    setMusicName(''); // Clear music name if applicable
  } else if (previewCategory === 'images') {
    setImageUris([]); // Clear images array
  } 


  // Close the modal after clearing the selections
  setPreviewVisible(false);
};


  // Function to remove a selected music file
  const removeMusic = (index) => {
    setSelectedMusic((prevMusicFiles) =>
      prevMusicFiles.filter((_, i) => i !== index)
    );
  };

  // Function to remove a selected document file
  const removeDocument = (index) => {
    setSelectedDocuments((prevDocuments) =>
      prevDocuments.filter((_, i) => i !== index)
    );
  };

  // Function to remove a selected video file
  const removeVideo = (index) => {
    setSelectedVideos((prevVideos) =>
      prevVideos.filter((_, i) => i !== index)
    );
  };

  // Function to remove a selected file
  const removeFile = (index) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, i) => i !== index)
    );
  };

  const playSound = async (uri) => {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, isLooping: true } // Autoplay and loop
    );
    setSound(sound);

    // Cleanup function to unload the sound when component unmounts
    return () => {
      sound.unloadAsync(); 
    };
  };



  const handleAddProduct = async () => {
    if (!name || !price || !description || !category) {
      Alert.alert('Please fill all required fields!');
      return;
    }

    setUploading(true); // Set uploading state to true when the process starts

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      Alert.alert('Please enter a valid price!');
      setUploading(false); // Ensure loading is stopped if there's an error
      return;
    }

    const formattedPrice = Math.round(parsedPrice * 100);

    const imageUrl = await uploadBannerImageToStorage(); // Upload banner image
    if (!imageUrl) {
      Alert.alert('Failed to upload image. Please try again.');
      setUploading(false); // Ensure loading is stopped if there's an error
      return;
    }

    const uploadedImageUrls = await uploadImagesToStorage(); // Upload multiple images

    let documentUrls = [];
    if (category === 'file') {
      documentUrls = await uploadDocumentsToFirebase(); // Upload documents and get URLs
      if (documentUrls.length === 0) {
        Alert.alert('Failed to upload documents. Please try again.');
        setUploading(false); // Ensure loading is stopped if there's an error
        return;
      }
    }

    let musicUrls = []; // Allow multiple music uploads
    if (category === 'music') {
      musicUrls = await uploadMusicToFirebase(); // Upload music and get URLs
      if (musicUrls.length === 0) {
        Alert.alert('Failed to upload music. Please try again.');
        setUploading(false); // Ensure loading is stopped if there's an error
        return;
      }
    }

    let videoUrls = []; // Allow multiple video uploads
    if (category === 'video') {
      videoUrls = await uploadVideoToFirebase(); // Upload videos and get URLs
      if (videoUrls.length === 0) {
        Alert.alert('Failed to upload videos. Please try again.');
        setUploading(false); // Ensure loading is stopped if there's an error
        return;
      }
    }

  let fileUrls = []; // Initialize fileUrls variable
  if (category === 'others') { // Ensure this matches your new category
    fileUrls = await uploadFilesToFirebase(); // Get URLs of uploaded files
    if (fileUrls.length === 0) {
      Alert.alert('Failed to upload documents. Please try again.');
      setUploading(false); // Ensure loading is stopped if there's an error
      return;
    }
  }

    try {
      const localTimestamp = Date.now(); // Generate local timestamp for immediate use

      const docRef = await addDoc(collection(firebase.firestore(), 'products_services'), {
        name,
        price: formattedPrice,
        uid: user.uid,
        sellerName,
        imageUrl, // Banner image URL
        images: uploadedImageUrls, // Multiple showcase images URLs
        documents: documentUrls, // Document URLs collected from uploadDocumentsToFirebase
        musics: musicUrls, // Music URLs
        videos: videoUrls, // Include the video URLs here
        files: fileUrls, // Document URLs collected from uploadFilesToFirebase
        description,
        type,
        category,
        terms: type === 'service' ? terms : null,
      });

      console.log('Document written with ID:', docRef.id);
      Alert.alert('Product/Service added successfully!');
      navigation.navigate('SellerPosting');
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Failed to add product. Please try again.');
    } finally {
      setUploading(false); // Stop the loader
    }
  };



return (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.container}>
      <Text style={styles.title}>Add New Product/Service</Text>

      {/* Name and Price Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Product/Service Name (max 100 chars)"
        value={name}
        onChangeText={(text) => {
          if (text.length <= 100) setName(text);
          else Alert.alert('Name must be 100 characters or less!');
        }}
        maxLength={100}
      />

      <TextInput
        style={styles.input}
        placeholder="Price (in dollars)"
        value={price}
        keyboardType="numeric"
        onChangeText={(text) => {
          const numericValue = text.replace(/[^0-9.]/g, '');
          const parts = numericValue.split('.');
          if (parts.length > 2) {
            return;
          }

          if (parts.length === 2 && parts[1].length > 2) {
            return;
          }

          setPrice(numericValue); // Set the price without formatting
        }}
      />

      {/* Type and Description Inputs */}
      <Picker selectedValue={type} onValueChange={setType} style={styles.picker}>
        <Picker.Item label="Product" value="product" />
        <Picker.Item label="Service" value="service" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Description (max 2000 characters)"
        value={description}
        onChangeText={setDescription}
        maxLength={2000}
        multiline
      />

      {type === 'service' && (
        <TextInput
          style={styles.input}
          placeholder="Terms of Service (max 2000 characters)"
          value={terms}
          onChangeText={setTerms}
          maxLength={2000}
          multiline
        />
      )}

      {/* Banner Image Picker */}
      <TouchableOpacity onPress={handleImagePick} style={styles.imageButton}>
        <Text style={styles.imageButtonText}>Pick Banner Image</Text>
      </TouchableOpacity>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200 }} />
      )}

      {/* Category Picker */}
      <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
        <Picker.Item label="Select Category" value="" />
        <Picker.Item label="Images" value="images" />
        <Picker.Item label="File" value="file" />
        <Picker.Item label="Video" value="video" />
        <Picker.Item label="Music" value="music" />
        <Picker.Item label="Others" value="others" />
      </Picker>

      {/* Conditional Uploaders based on Category */}
      {category === 'images' && (
        <>
          <Text style={styles.sectionTitle}>Upload Multiple Images</Text>
          <TouchableOpacity style={styles.imageButton} onPress={handlePickImages}>
            <Text style={styles.imageButtonText}>Pick Images (Max 5)</Text>
          </TouchableOpacity>

          <View style={styles.imagePreviewContainer}>
            {imageUris.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.imagePreview} />
            ))}
          </View>
        </>
      )}


    {category === 'file' && (
      <View style={{ flex: 1, padding: 10 }}>
        <Text style={{ marginTop: 10 }}>Upload a Document</Text>
        
        <TouchableOpacity 
          onPress={handleDocumentPick} 
          style={{ padding: 10, backgroundColor: '#ddd', borderRadius: 5 }}>
          <Text>Pick a Document</Text>
        </TouchableOpacity>

        <ScrollView>
          {selectedDocuments.length > 0 ? (
            selectedDocuments.map((item, index) => (
              <View key={index} style={{ marginTop: 10 }}>
                {item.name ? (
                  <>
                    <Text>Name: {item.name}</Text>
                    <Text>Size: {item.size ? `${item.size} bytes` : 'Size unavailable'}</Text>
                    <Button title="Remove" onPress={() => removeDocument(index)} />
                  </>
                ) : null}
              </View>
            ))
          ) : (
            <Text>No document selected</Text>
          )}
        </ScrollView>
      </View>
    )}

    {category === 'video' && (
      <View style={{ flex: 1, padding: 10 }}>
        <Text style={{ marginTop: 10 }}>Upload a Video File</Text>
        
        <TouchableOpacity 
          onPress={handleVideoPick} 
          style={{ padding: 10, backgroundColor: '#ddd', borderRadius: 5 }}>
          <Text>Pick a Video File</Text>
        </TouchableOpacity>

        <ScrollView>
          {selectedVideos.length > 0 ? (
            selectedVideos.map((item, index) => (
              <View key={index} style={{ marginTop: 10 }}>
                {item.name ? (
                  <>
                    <Text>Name: {item.name}</Text>
                    <Text>Size: {item.size ? `${item.size} bytes` : 'Size unavailable'}</Text>
                    <Button title="Remove" onPress={() => removeVideo(index)} />
                  </>
                ) : null}
              </View>
            ))
          ) : (
            <Text>No videos selected</Text>
          )}
        </ScrollView>
      </View>
    )}

    {category === 'music' && (
      <View style={{ flex: 1, padding: 10 }}>
        <Text style={{ marginTop: 10 }}>Upload a Music File</Text>
        
        <TouchableOpacity 
          onPress={handleMusicPick} 
          style={{ padding: 10, backgroundColor: '#ddd', borderRadius: 5 }}>
          <Text>Pick a Music File</Text>
        </TouchableOpacity>

        <ScrollView>
          {selectedMusic.length > 0 ? (
            selectedMusic.map((item, index) => (
              <View key={index} style={{ marginTop: 10 }}>
                {item.name ? (
                  <>
                    <Text>Name: {item.name}</Text>
                    <Text>Size: {item.size ? `${item.size} bytes` : 'Size unavailable'}</Text>
                    <Button title="Remove" onPress={() => removeMusic(index)} />
                  </>
                ) : null}
              </View>
            ))
          ) : (
            <Text>No music selected</Text>
          )}
        </ScrollView>
      </View>
    )}

  {category === 'others' && ( // Changed from 'file' to 'others'
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={{ marginTop: 10 }}>Upload Any File</Text>
      
      <TouchableOpacity 
        onPress={handleFilePick} // Ensure this function is set to handle any file type
        style={{ padding: 10, backgroundColor: '#ddd', borderRadius: 5 }}>
        <Text>Pick a File</Text>
      </TouchableOpacity>

      <ScrollView>
        {selectedFiles.length > 0 ? (
          selectedFiles.map((item, index) => (
            <View key={index} style={{ marginTop: 10 }}>
              {item.name ? (
                <>
                  <Text>Name: {item.name}</Text>
                  <Text>Size: {item.size ? `${item.size} bytes` : 'Size unavailable'}</Text>
                  <Button title="Remove" onPress={() => removeFile(index)} />
                </>
              ) : null}
            </View>
          ))
        ) : (
          <Text>No file selected</Text>
        )}
      </ScrollView>
    </View>
  )}


      {/* Unified Preview Button */}
      <TouchableOpacity onPress={showAllPreviews}>
        <Text style={styles.previewButtonText}>Preview All</Text>
      </TouchableOpacity>

      {isPreviewVisible && (
        <Modal
          visible={isPreviewVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setPreviewVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={{ color: '#000' }}>Preview All Files</Text>

              {/* Document Preview */}
              {selectedDocuments.length > 0 && (
                <ScrollView>
                  <Text style={styles.previewSectionHeader}>Documents:</Text>
                  {selectedDocuments.map((document, index) => (
                    <View key={index} style={{ marginBottom: 10 }}>
                      <Text>Name: {document.name}</Text>
                      <Text>Size: {document.size} bytes</Text>
                      <Text>Type: {document.mimeType}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* File Preview */}
              {selectedFiles.length > 0 && (
                <ScrollView>
                  <Text style={styles.previewSectionHeader}>Files:</Text>
                  {selectedFiles.map((file, index) => (
                    <View key={index} style={{ marginBottom: 10 }}>
                      <Text>Name: {file.name}</Text>
                      <Text>Size: {file.size} bytes</Text>
                      <Text>Type: {file.mimeType}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Video Preview */}
              {selectedVideos.length > 0 && (
                <ScrollView horizontal>
                  <Text style={styles.previewSectionHeader}>Videos:</Text>
                  {selectedVideos.map((video, index) => (
                    <View key={index} style={{ marginRight: 10 }}>
                      <Text>Name: {video.name}</Text>
                      <Video
                        source={{ uri: video.uri }}
                        style={styles.previewVideo}
                        resizeMode="contain"
                        shouldPlay={true}
                        isLooping={true}
                      />
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Music Preview */}
              {selectedMusic.length > 0 && (
                <ScrollView horizontal>
                  <Text style={styles.previewSectionHeader}>Music:</Text>
                  {selectedMusic.map((music, index) => (
                    <View key={index} style={{ marginRight: 10 }}>
                      <Text>Name: {music.name}</Text>
                      <TouchableOpacity onPress={() => playSound(music.uri)}>
                        <Text>Play</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Image Preview */}
              {imageUris.length > 0 && (
                <ScrollView horizontal>
                  <Text style={styles.previewSectionHeader}>Images:</Text>
                  {imageUris.map((uri, index) => (
                    <Image
                      key={index}
                      source={{ uri }}
                      style={styles.previewImage}
                    />
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity style={styles.clearButton} onPress={clearAllFiles}>
                <Text>Clear All</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={() => setPreviewVisible(false)}>
                <Text>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}




      {/* Save Product/Service */}
      {uploading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={handleAddProduct}>
          <Text style={styles.saveButtonText}>Save Product/Service</Text>
        </TouchableOpacity>
      )}
    </View>
  </ScrollView>
);

};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor:'#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
    filePreviewText: {
    fontSize: 16,
    marginVertical: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    marginBottom: 16,
  },
  imageButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  imageButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
   previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  removeButton: {
    color: 'red',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 10,
    marginRight: 10,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  thumbnail: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)' // semi-transparent background to dim the underlying content
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff', // Opaque background for the modal content
    borderRadius: 10,
  },
  clearButton: {
    marginTop: 20,
  },
  closeButton: {
    marginTop: 10,
  },
  previewButtonText: {
    color: '#007BFF', // Change to your preferred color
    fontSize: 16,     // Adjust the font size
    fontWeight: 'bold', // Make text bold if needed
    textAlign: 'center', // Center the text
    paddingVertical: 10, // Add vertical padding
  },
  previewImage: {
    width: 100,  // Adjust width as needed
    height: 100, // Adjust height as needed
    marginRight: 10, // Adds spacing between images
    borderRadius: 10, // Optional: add rounded corners
  },
  previewVideo: {
    width: 200, // Set a width appropriate for your design
    height: 150, // Set a height appropriate for your design
  },
  previewSectionHeader: {
  fontSize: 18,
  fontWeight: 'bold',
  marginVertical: 10,
},

});

export default ServiceProduct