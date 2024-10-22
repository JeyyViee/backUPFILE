import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { firebase } from '../firebaseUserConfig';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ServiceProductCreation = () => {
  const [userProducts, setUserProducts] = useState([]);
  const user = getAuth().currentUser;

  // Fetch user's products/services from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firebase.firestore(), 'products_services'), 
      (querySnapshot) => {
        const fetchedProducts = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(product => product.uid === user.uid); // Filter for current user's products

        setUserProducts(fetchedProducts);
      },
      (error) => {
        console.error('Error fetching products: ', error);
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

  // Function to delete a product by its ID
  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(firebase.firestore(), 'products_services', productId)); // Delete the product from Firestore
      Alert.alert('Success', 'Product/Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting product: ', error);
      Alert.alert('Error', 'There was a problem deleting the product/service.');
    }
  };

  // Confirm deletion before proceeding
  const confirmDelete = (productId) => {
    Alert.alert(
      'Delete Product/Service',
      'Are you sure you want to delete this product/service?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteProduct(productId) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Created Products/Services</Text>
      {userProducts.length === 0 ? (
        <Text>You have not created any products/services yet.</Text>
      ) : (
        <FlatList
          data={userProducts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.productContainer}>
              <Text style={styles.productText}>Name: {item.name}</Text>
              <Text style={styles.productText}>Price: ${(item.price / 100).toFixed(2)}</Text>
              {/* Delete button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDelete(item.id)} // Confirm deletion
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  productContainer: {
    padding: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    // Ensuring items stack vertically
    flexDirection: 'column',
    alignItems: 'flex-start', // Align text to the left
  },
  productText: {
    fontSize: 16,
    marginBottom: 5, // Add some spacing between each text item
  },
  deleteButton: {
    backgroundColor: '#FF6347', // Red background for delete button
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start', // Make the delete button align to the left
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ServiceProductCreation;
