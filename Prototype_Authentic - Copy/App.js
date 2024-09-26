import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { firebase } from "./firebaseUserConfig";


import Login from "./src/Login";
import Registration from "./src/Registration";
import Dashboard from "./src/Dashboard";
import Shopping from "./src/Shopping"; 
import SettingsScreen from "./src/Settings"; 
import Message from "./src/Message"; 

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tab navigator setup
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = 'person'; // Assuming this is a valid Ionicons name
              break;
            case 'Shopping':
              iconName = 'bag-add'; // Assuming this is a valid Ionicons name
              break;
            case 'Settings':
              iconName = 'options'; // Assuming this is a valid Ionicons name
              break;
            case 'Message':
              iconName = 'chatbubbles'; // Assuming this is a valid Ionicons name
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
      <Tab.Screen name="Shopping" component={Shopping} />
      <Tab.Screen name="Message" component={Message} />
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  const onAuthStateChanged = useCallback((user) => {
    setUser(user);
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

  // Show bottom tab navigation after login
  return <AppTabs />;
}

export default () => (
  <NavigationContainer>
    <App />
  </NavigationContainer>
);


