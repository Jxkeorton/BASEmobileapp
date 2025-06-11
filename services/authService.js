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

// Pure functions for auth operations
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

// Exported auth service functions
export const signIn = withAuthErrorHandling(performSignIn);
export const signUp = withAuthErrorHandling(performSignUp);
export const signOutUser = withAuthErrorHandling(performSignOut);
export const resetPassword = withAuthErrorHandling(performPasswordReset);
export const deleteAccount = withAuthErrorHandling(performAccountDeletion);

// Auth state functions
export const onAuthStateChange = (callback) => onAuthStateChanged(FIREBASE_AUTH, callback);
export const getCurrentUser = () => FIREBASE_AUTH.currentUser;
export const isAuthenticated = () => !!FIREBASE_AUTH.currentUser;

// Utility functions
export const getUserId = () => getCurrentUser()?.uid || null;
export const requireAuth = (fn) => (...args) => {
    if (!isAuthenticated()) {
        return createResult(null, new Error('Authentication required'));
    }
    return fn(...args);
};

// Composed functions
export const signInAndGetUser = async (email, password) => {
    const result = await signIn(email, password);
    return result.success ? { ...result, userId: result.data.uid } : result;
};

export const signUpAndGetUser = async (email, password, displayName) => {
    const result = await signUp(email, password, displayName);
    return result.success ? { ...result, userId: result.data.uid } : result;
};