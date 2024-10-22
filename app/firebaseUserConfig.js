    // firebase config key setup

    import firebase from 'firebase/compat/app';
    import 'firebase/compat/auth';
    import 'firebase/compat/firestore';
    import 'firebase/compat/storage';

    // Web's app's Firebase configuration
   const firebaseConfig = {
         apiKey: "AIzaSyAF7mzi1xkn6pjbH3W4oVgh8vNOSoCUTns",
      authDomain: "test-8aedc.firebaseapp.com",
     projectId: "test-8aedc",
     storageBucket: "test-8aedc.appspot.com",
     messagingSenderId: "724685893884",
     appId: "1:724685893884:web:42e851e7473ce48413e779",
     measurementId: "G-P6FRW81XML"
    };

    if (!firebase.apps.length){
        firebase.initializeApp(firebaseConfig);
    }

    export { firebase };

