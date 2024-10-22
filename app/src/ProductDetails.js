import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

const ProductDetail = ({ route }) => {
  const { product } = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  // Download the file from Firebase Storage and save it locally
  const downloadFile = async (fileUrl, fileName) => {
    try {
      if (!fileName) {
        throw new Error('File name is undefined or invalid');
      }
      const directoryPath = `${FileSystem.documentDirectory}documents/`;
      const dirInfo = await FileSystem.getInfoAsync(directoryPath);

      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directoryPath, { intermediates: true });
      }

      const fileUri = `${directoryPath}${fileName}`;
      const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);

      Alert.alert('Download success', `File downloaded to: ${uri}`);
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Download failed', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {product.imageUrl ? (
        <TouchableOpacity onPress={() => handleImagePress(product.imageUrl)}>
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
        </TouchableOpacity>
      ) : (
        <Text>No main image available</Text>
      )}

      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.detailText}>Price: ${product.price / 100}</Text>
      <Text style={styles.detailText}>Seller: {product.sellerName}</Text>
      <Text style={styles.detailText}>Description: {product.description || 'No description available.'}</Text>

      <Text style={styles.detailText}>Category: {product.category || 'Unknown Category'}</Text>
      <Text style={styles.detailText}>Type: {product.type || 'Unknown Type'}</Text>
      <Text style={styles.detailText}>Seller UID: {product.uid}</Text>

      {product.fileUrl && (
        <Text style={styles.detailText}>
          Document: 
          <Text style={styles.link} onPress={() => downloadFile(product.fileUrl)}>
            {product.fileUrl.split('/').pop()}
          </Text>
        </Text>
      )}

      {product.images && product.images.length > 0 ? (
        <View>
          <Text style={styles.subTitle}>Additional Images:</Text>
          {product.images.map((imageUrl, index) => (
            <TouchableOpacity key={index} onPress={() => handleImagePress(imageUrl)}>
              <Image source={{ uri: imageUrl }} style={styles.additionalImage} />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text>No additional images available</Text>
      )}

      <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} />}
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  productImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  additionalImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 10,
    marginVertical: 10,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductDetail;
