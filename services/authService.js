import { 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    updateProfile as updateFirebaseProfile,
    deleteUser,
} from 'firebase/auth';
import { FIREBASE_AUTH } from '../firebaseConfig';

// Add this check at the top of your auth functions
const checkFirebaseAuth = () => {
    if (!FIREBASE_AUTH) {
        throw new Error('Firebase Auth not initialized. Check your firebaseConfig.js');
    }
    return true;
};

// Result wrapper for consistent return types
const createResult = (data = null, error = null) => ({ data, error, success: !error });

// Higher-order function for auth operations with error handling
const withAuthErrorHandling = (fn) => async (...args) => {
    try {
        const result = await fn(...args);
        return createResult(result);
    } catch (error) {
        return createResult(null, error);
    }
};

const performSignIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    return userCredential.user;
};

const performSignUp = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
    await updateFirebaseProfile(userCredential.user, { displayName });
    return userCredential.user;
};

const performSignOut = async () => {
    await signOut(FIREBASE_AUTH);
    return true;
};

const performPasswordReset = async (email) => {
    await sendPasswordResetEmail(FIREBASE_AUTH, email);
    return true;
};

const performAccountDeletion = async () => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (!currentUser) {
        throw new Error('No authenticated user');
    }
    await deleteUser(currentUser);
    return true;
};

// Exported auth service functions - ONLY Firebase Auth operations
export const signIn = withAuthErrorHandling(performSignIn);
export const signUp = withAuthErrorHandling(performSignUp);
export const signOutUser = withAuthErrorHandling(performSignOut);
export const resetPassword = withAuthErrorHandling(performPasswordReset);
export const deleteAccount = withAuthErrorHandling(performAccountDeletion);

// Auth state functions
// Updated onAuthStateChange with error handling
export const onAuthStateChange = (callback) => {
    try {
        checkFirebaseAuth();
        return onAuthStateChanged(FIREBASE_AUTH, (user) => {
            console.log('🔐 Firebase auth state change:', user ? 'authenticated' : 'not authenticated');
            callback(user);
        });
    } catch (error) {
        console.error('❌ Error setting up auth listener:', error);
        // Call callback with null to indicate no user
        callback(null);
        // Return a no-op unsubscribe function
        return () => {};
    }
};
export const getCurrentUser = () => FIREBASE_AUTH.currentUser;
export const isAuthenticated = () => !!FIREBASE_AUTH.currentUser;

// Utility functions for auth state
export const getUserId = () => getCurrentUser()?.uid || null;
export const requireAuth = (fn) => (...args) => {
    if (!isAuthenticated()) {
        return createResult(null, new Error('Authentication required'));
    }
    return fn(...args);
};

// Simple convenience functions
export const signInAndGetUser = async (email, password) => {
    const result = await signIn(email, password);
    return result.success ? { ...result, userId: result.data.uid } : result;
};

export const signUpAndGetUser = async (email, password, displayName) => {
    const result = await signUp(email, password, displayName);
    return result.success ? { ...result, userId: result.data.uid } : result;
};