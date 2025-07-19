import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

// Your Firebase configuration
// Updated with actual Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyAobKh7Dr7sVFvqLB4PzgncM1ke506XjJo",
  authDomain: "ecommerce-website-36bb8.firebaseapp.com",
  projectId: "ecommerce-website-36bb8",
  storageBucket: "ecommerce-website-36bb8.firebasestorage.app",
  messagingSenderId: "80106454546",
  appId: "1:80106454546:web:44d51c5ee9ff02653362cb",
  measurementId: "G-8P9XRJ8EVJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Configure providers
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

facebookProvider.setCustomParameters({
  display: 'popup'
});

export default app; 