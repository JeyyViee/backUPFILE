import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
import { Ionicons } from '@expo/vector-icons'; 
import { firebase } from "./firebaseUserConfig";

// Importing Components
import Login from "./users/Login";
import Registration from "./users/Registration";
import Dashboard from "./users/Profile"; // Client Dashboard
import Shopping from "./users/Shopping"; 
import SettingsScreen from "./users/Settings"; 
import Message from "./users/Message"; 
import SellerD from './seller/SellerD'; // Seller Dashboard
import SellerPosting from './seller/SellerPosting';
import ServiceProduct from './src/ServiceProduct'; // New Product Adding Screen
import ServiceProductCreation from './src/ServiceProductCreate';
import ProductDetail from './src/ProductDetails';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tab navigator setup for Clients
function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'person';
              break;
            case 'Shopping':
              iconName = 'bag-add';
              break;
            case 'Settings':
              iconName = 'options';
              break;
            case 'Message':
              iconName = 'chatbubbles';
              break;
            default:
              iconName = 'ios-home';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E6E6FA',
        tabBarInactiveTintColor: 'purple',
      })}>
      <Tab.Screen name="Shopping" component={Shopping} />
      <Tab.Screen name="Message" component={Message} />
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}


function ProductPostingStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SellerPosting"
        component={SellerPosting}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ServiceProduct"
        component={ServiceProduct}
        options={{ title: 'Add Product' }}
      />
      <Stack.Screen
        name="ServiceProductCreation" // Add this line
        component={ServiceProductCreation} // Add this line
        options={{ title: 'Your Products' }} // Optional title
      />
      <Stack.Screen name="ProductDetail" component={ProductDetail}/>
    </Stack.Navigator>
  );
}


// SellerTabs for Bottom Tab Navigation
function SellerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Seller Dashboard':
              iconName = 'person';
              break;
            case 'Product Posting':
              iconName = 'bag-add';
              break;
            case 'Settings':
              iconName = 'options';
              break;
            case 'Message':
              iconName = 'chatbubbles';
              break;
            default:
              iconName = 'ios-home';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E6E6FA',
        tabBarInactiveTintColor: 'purple',
      })}
    >
      {/* Each tab now points to its own stack */}
      <Tab.Screen name="Product Posting" component={ProductPostingStack} />
      <Tab.Screen name="Message" component={Message} />
      <Tab.Screen name="Seller Dashboard" component={SellerD} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // Store the role (Client/Seller)

  const onAuthStateChanged = useCallback(async (user) => {
    setUser(user);
    if (user) {
      const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        setUserRole(userDoc.data().role); // Set user role
        
        // Check if email is verified
        if (!user.emailVerified) {
          Alert.alert('Error', 'Please verify your email before logging in.');
          firebase.auth().signOut();
          setUser(null);
          setUserRole(null);
          return;
        }
      } else {
        setUserRole(null);
      }
    }
    if (initializing) setInitializing(false);
  }, [initializing]);

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return () => subscriber();
  }, [onAuthStateChanged]);

  if (initializing) return null;

  // Show login and registration if not logged in
  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Registration" component={Registration} />
      </Stack.Navigator>
    );
  }

  // Redirect based on role
  if (userRole === 'Seller') {
    return <SellerTabs />; // Use SellerStack for seller navigation
  }

  return <ClientTabs />; // Use ClientTabs for client navigation
}

export default () => (
  <NavigationContainer independent={true}>
    <App />
  </NavigationContainer>
);