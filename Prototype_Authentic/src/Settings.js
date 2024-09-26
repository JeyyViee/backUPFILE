import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Settings = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',  // Updated background color for visual appeal
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333', // Updated text color for contrast
    marginVertical: 10, // Added spacing for better appearance
  },
});

export default Settings;
