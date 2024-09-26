import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useState, useEffect, useCallback } from 'react';
import { firebase } from "./config";
import Login from "./src/Login";
import Registration from "./src/Registration";
import Dashboard from "./src/Dashboard";  // Keep only the necessary screens
import Header from "./components/Header";

const Stack = createStackNavigator();

function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle authentication state change
  const onAuthStateChanged = useCallback((user) => {
    setUser(user);
    if (initializing) setInitializing(false);
  }, [initializing]);

  // Subscribe to auth state changes
  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return () => subscriber(); // Cleanup function
  }, [onAuthStateChanged]);

  // Show a loading screen while initializing
  if (initializing) return null;

  // If no user is logged in, show the login/registration stack
  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{
            headerTitle: () => <Header name='DGMPLAE' />,
            headerStyle: {
              height: 50,
              backgroundColor: "#00e4d0",
              shadowColor: '#000',
              elevation: 25
            }
          }}
        />
        <Stack.Screen 
          name="Registration" 
          component={Registration} 
          options={{
            headerTitle: () => <Header name='DGMPLAE' />,
            headerStyle: {
              height: 50,
              backgroundColor: "#00e4d0",
              shadowColor: '#000',
              elevation: 25
            }
          }}
        />
      </Stack.Navigator>
    );
  }

  // After login, navigate to the Dashboard screen
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Dashboard" 
        component={Dashboard} 
        options={{
          headerTitle: () => <Header name='Dashboard' />,
          headerStyle: {
            height: 50,
            backgroundColor: "#00e4d0",
            shadowColor: '#000',
            elevation: 25
          }
        }}
      />
    </Stack.Navigator>
  );
}

export default () => {
  return (
    <NavigationContainer>
      <App />
    </NavigationContainer>
  );
};
