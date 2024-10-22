import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { firebase } from '../firebaseUserConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const styles = StyleSheet.create({
   container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E6E6FA',
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },
  input: {
    height: 'auto',
    minHeight: 50,
    maxHeight: 100,
    maxWidth: 270,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: 'white',
    flexGrow: 1,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 25,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
    marginBottom: 10,
  },
  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 20,
    maxWidth: '75%',
    alignSelf: 'flex-start',
  },
  ownMessage: {
    backgroundColor: '#A77BEF',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#e1e1e1',
    alignSelf: 'flex-start',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333',
  },
  userListContainer: {
    marginBottom: 20,
  },
  userItem: {
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#8A2BE2',
    marginRight: 10,
  },
  userText: {
    color: 'white',
  },
  selectedUserItem: {
    backgroundColor: '#00796b',
  },
});

const Message = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // Track selected user for messaging
  const [userEmail, setUserEmail] = useState('');
  const [currentUserId, setCurrentUserId] = useState(''); // Store current user's ID

  // Fetch user data and handle email verification via Firebase Auth
  useEffect(() => {
    const fetchUsers = async () => {
      const currentUser = firebase.auth().currentUser;

      if (!currentUser) {
        setErrorMessage('User is not authenticated');
        setLoading(false);
      } else if (!currentUser.emailVerified) {
        setErrorMessage('Your email is not verified. Please verify your email.');
        setLoading(false);
      } else {
        setUserEmail(currentUser.email);
        setCurrentUserId(currentUser.uid);

        // Fetch all registered users from Firestore
        const userQuery = query(collection(firebase.firestore(), 'users'));

        const unsubscribeUsers = onSnapshot(
          userQuery,
          (snapshot) => {
            const usersData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Filter out the current user
            const verifiedUsers = usersData.filter(
              (userData) => userData.id !== currentUser.uid
            );

            if (verifiedUsers.length > 0) {
              setUsers(verifiedUsers);
              setErrorMessage('');
            } else {
              setErrorMessage('No other verified users found.');
            }

            setLoading(false);
          },
          (error) => {
            console.log('Error fetching users:', error);
            setErrorMessage('Failed to fetch users');
            setLoading(false);
          }
        );

        return () => {
          unsubscribeUsers();
        };
      }
    };

    fetchUsers();
  }, []);

  // Fetch messages for selected user
  useEffect(() => {
    if (selectedUser) {
      const q = query(
        collection(firebase.firestore(), 'chats'),
        where('participants', 'array-contains', currentUserId), // Retrieve messages involving the current user
        orderBy('createdAt', 'asc')
      );

      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const messagesData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (msg) =>
              (msg.senderId === currentUserId &&
                msg.recipientId === selectedUser.id) ||
              (msg.senderId === selectedUser.id &&
                msg.recipientId === currentUserId)
          ); // Filter messages only between current user and selected user
        setMessages(messagesData);
      });

      return () => {
        unsubscribeMessages(); // Unsubscribe when selected user changes or component unmounts
      };
    } else {
      // Clear messages if no user is selected
      setMessages([]);
    }
  }, [selectedUser, currentUserId]);

  // Handle message send
  const sendMessage = async () => {
    if (newMessage.trim() === '') {
      setErrorMessage('Please enter a message');
      return;
    }

    if (!selectedUser) {
      setErrorMessage('Please select a user to send a message');
      return;
    }

    try {
      await addDoc(collection(firebase.firestore(), 'chats'), {
        text: newMessage,
        createdAt: serverTimestamp(),
        senderId: currentUserId,
        recipientId: selectedUser.id, // Store recipient's ID
        participants: [currentUserId, selectedUser.id], // Store both participants' IDs for filtering
      });
      setNewMessage(''); // Clear input field
    } catch (error) {
      setErrorMessage('Error sending message: ' + error.message);
    }
  };

  // Handle loading state before rendering
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00e4d0" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : (
        <>
          <Text style={styles.welcomeText}>Chat Screen</Text>

          {/* Display list of users to select who to chat with */}
          <View style={styles.userListContainer}>
            <Text>Select a user to chat:</Text>
            <FlatList
              data={users} // Display only verified users
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedUser(item)}
                  style={[
                    styles.userItem,
                    item === selectedUser && styles.selectedUserItem,
                  ]}
                >
                  <Text style={styles.userText}>{item.email}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>

          <View style={styles.messageContainer}>
            <FlatList
              data={messages} // Display messages only between current user and selected user
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.message,
                    item.senderId === currentUserId
                      ? styles.ownMessage
                      : styles.otherMessage,
                  ]}
                >
                  <Text>{item.text}</Text>
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TextInput
              style={[styles.input, { flexGrow: 1, maxHeight: 100 }]} // Allow the input to grow
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline={true} // Enable multiline
              numberOfLines={3} // Optional: show up to 3 lines initially
            />

          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.buttonText}>Send</Text>
          </TouchableOpacity>
        </View>

        </>
      )}
    </SafeAreaView>
  );
};

export default Message;
