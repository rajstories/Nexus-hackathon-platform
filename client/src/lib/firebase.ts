import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  console.error('Missing required Firebase configuration');
}

// Debug logging for Firebase config
console.log('Firebase Config Debug:', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId ? 'Set' : 'Missing',
  appId: firebaseConfig.appId ? 'Set' : 'Missing',
  currentURL: window.location.href,
});

// Validate that projectId matches the authorized domains
if (firebaseConfig.projectId !== 'hackathon-platform-2be53') {
  console.warn('⚠️ Project ID mismatch! Expected: hackathon-platform-2be53, Got:', firebaseConfig.projectId);
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { googleProvider };

// Auth functions
export const createUserAccount = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Account creation successful:', result.user.email);
    return result;
  } catch (error: any) {
    console.error('Account creation error:', error.code, error.message);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Email sign-in successful:', result.user.email);
    return result;
  } catch (error: any) {
    console.error('Email sign-in error:', error.code, error.message);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    // Try popup first, fallback to redirect if it fails
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign-in successful:', result.user.email);
    return result;
  } catch (error: any) {
    console.error('Google popup sign-in failed, trying redirect:', error.code, error.message);
    
    // If popup fails, use redirect instead
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      await signInWithRedirect(auth, googleProvider);
      return null; // Redirect doesn't return immediately
    }
    
    // Provide user-friendly error messages for other errors
    let userMessage = 'Google sign-in failed. ';
    switch (error.code) {
      case 'auth/unauthorized-domain':
        userMessage += 'This domain is not authorized for Google sign-in.';
        break;
      case 'auth/internal-error':
        userMessage += 'Internal error occurred. Please try again.';
        break;
      default:
        userMessage += 'Please try again or contact support.';
    }
    
    const customError = new Error(userMessage);
    customError.name = error.code || 'GoogleSignInError';
    throw customError;
  }
};

// Handle redirect result when user returns from Google sign-in
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('Google redirect sign-in successful:', result.user.email);
      return result;
    }
    return null;
  } catch (error: any) {
    console.error('Google redirect result error:', error.code, error.message);
    throw error;
  }
};

export const logOut = async () => {
  return signOut(auth);
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};