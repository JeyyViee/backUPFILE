    // firebase config key setup
    
    import firebase from 'firebase/compat/app';
    import 'firebase/compat/storage';

    // Web's app's Firebase configuration
     const firebaseConfig = {
        apiKey: "AIzaSyCkZBnidTo1zdFbJMjr-8-PhRXWUpCwb50",
    authDomain: "mediaupload-3afcc.firebaseapp.com",
    projectId: "mediaupload-3afcc",
    storageBucket: "mediaupload-3afcc.appspot.com",
    messagingSenderId: "606817110776",
    appId: "1:606817110776:web:64b7fdee8ab17bb2dd090d",
    measurementId: "G-4560DVE9F4"
    };
    
    if (!firebase.apps.length){
        firebase.initializeApp(firebaseConfig);
    }

    export { firebase };

