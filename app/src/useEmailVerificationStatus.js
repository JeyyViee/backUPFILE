import { useEffect } from 'react';
import { firebase } from '../firebaseUserConfig';
import { doc, updateDoc } from 'firebase/firestore';

const useEmailVerificationStatus = () => {
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // Check if the user's email is verified
        if (user.emailVerified) {
          try {
            // Update Firestore with `verification_status: true`
            const userRef = doc(firebase.firestore(), 'users', user.uid);
            await updateDoc(userRef, {
              verification_status: true, // Add or update the field in Firestore
            });

            console.log('User email is verified and Firestore updated');
          } catch (error) {
            console.error('Error updating Firestore with verification status:', error);
          }
        }
      }
    });

    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, []);
};

export default useEmailVerificationStatus;
