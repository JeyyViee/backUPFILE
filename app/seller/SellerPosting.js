import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { firebase } from '../firebaseUserConfig';
import { collection, onSnapshot } from 'firebase/firestore'; // Import onSnapshot for real-time updates
import { format } from 'date-fns'; // To format the date
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth'; // To get the current user
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the three-dotted icon

const SellerPosting = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('Default');
  const [sortBy, setSortBy] = useState('date');
  const user = getAuth().currentUser; // Get the current user
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

  // Setup listener for products from Firestore
// Setup listener for products from Firestore
useEffect(() => {
  const unsubscribe = onSnapshot(collection(firebase.firestore(), 'products_services'), (querySnapshot) => {
    const fetchedProducts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(fetchedProducts);
  }, (error) => {
    console.error('Error fetching products: ', error);
  });

  // Cleanup listener on unmount
  return () => unsubscribe();
}, []);

// Filter products based on the selected category
const filterByCategory = (products) => {
  return products; // No filtering by createdAt
};

// Sort products based on the selected option
const sortProducts = (products) => {
  switch (sortBy) {
    case 'price':
      return products.sort((a, b) => a.price - b.price);
    case 'name':
      return products.sort((a, b) => a.name.localeCompare(b.name));
    case 'type':
      return products.sort((a, b) => a.type.localeCompare(b.type));
    default:
      return products; // No sorting by createdAt
  }
};

// Combine filtering and sorting
const displayedProducts = sortProducts(filterByCategory(products));

 return (
  <View style={styles.container}>
    <Text style={styles.title}>Products/Services</Text>

    {/* Category Selection and Three Dotted Icon */}
    <View style={styles.categoryContainer}>
      <TouchableOpacity onPress={() => setCategory('Recent')} style={styles.categoryText}>
        <Text style={category === 'Recent' ? styles.activeCategory : styles.inactiveCategory}>Recent</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCategory('Default')} style={styles.categoryText}>
        <Text style={category === 'Default' ? styles.activeCategory : styles.inactiveCategory}>Default</Text>
      </TouchableOpacity>

      {/* Three Dotted Icon for Modal */}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconContainer}>
        <Ionicons name="ellipsis-vertical" size={24} color="black" />
      </TouchableOpacity>
    </View>

    {/* Sort By Dropdown */}
    <Picker
      selectedValue={sortBy}
      style={styles.sortPicker}
      onValueChange={(itemValue) => setSortBy(itemValue)}
    >
      <Picker.Item label="Sort by Date" value="date" />
      <Picker.Item label="Sort by Name" value="name" />
      <Picker.Item label="Sort by Type" value="type" />
      <Picker.Item label="Sort by Price" value="price" />
    </Picker>

    {displayedProducts.length === 0 ? (
      <Text>No products/services available.</Text>
    ) : (
      <FlatList
        data={displayedProducts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ProductDetail', { product: item })} // Navigate with product data
            style={styles.productContainer}
          >
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.productImage} // Style for the image
              />
            )}
            <Text style={styles.productText}>Name: {item.name}</Text>
            <Text style={styles.productText}>Price: ${item.price / 100}</Text>
            <Text style={styles.productText}>Seller: {item.sellerName}</Text>
          </TouchableOpacity>
        )}
      />
    )}

{/* Modal for adding/viewing products */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalView}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ServiceProduct');
            setModalVisible(false);
          }}
          style={styles.modalButton}
        >
          <Text style={styles.modalButtonText}>Add New Product/Service</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ServiceProductCreation');
            setModalVisible(false);
          }}
          style={styles.modalButton}
        >
          <Text style={styles.modalButtonText}>View Your Created Products/Services</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
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
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Change to space-between for better alignment
    alignItems: 'center', // Align items center vertically
    marginBottom: 20,
  },
  categoryText: {
    padding: 10,
  },
  activeCategory: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  inactiveCategory: {
    fontWeight: 'bold',
    color: 'black',
  },
  sortPicker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  productContainer: {
    padding: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 10, // Add some space between items
  },
  productText: {
    fontSize: 16,
  },
  productImage: {
    width: '100%', // Image will span the full width of the container
    height: 150,   // Set a fixed height for the image
    resizeMode: 'cover', // Ensure the image is nicely scaled
    marginBottom: 10, // Add space between the image and text
    borderRadius: 8,  // Add some rounding to the image corners
  },
  iconContainer: {
    marginLeft: 10, // Add some space between the category buttons and icon
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'gray',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SellerPosting;
