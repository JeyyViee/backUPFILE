import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const Header = (props) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>
        {props.name}
      </Text>
    </View>
  );
}

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    marginLeft: 15,
    height: 50,
    backgroundColor: '#FFB6C1', // light pink background
    justifyContent: 'center', // centers the text vertically
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000', // black text color (you can adjust if needed)
  },
});
