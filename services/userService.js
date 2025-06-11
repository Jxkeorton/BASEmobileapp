import { 
    doc, 
    setDoc, 
    serverTimestamp, 
    updateDoc,
    getDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FIREBASE_DB, FIREBASE_STORAGE } from '../firebaseConfig';

// Result wrapper for consistent return types
const createResult = (data = null, error = null) => ({ data, error, success: !error });

// Higher-order function for database operations with error handling
const withDbErrorHandling = (fn) => async (...args) => {
    try {
        const result = await fn(...args);
        return createResult(result);
    } catch (error) {
        return createResult(null, error);
    }
};

// Pure helper functions
const createUserDocRef = (userId) => doc(FIREBASE_DB, 'users', userId);
const addTimestamp = (data) => ({ ...data, timestamp: serverTimestamp() });
const parseLocationId = (locationId) => typeof locationId === 'string' ? parseInt(locationId) : locationId;

// Core database operations
const writeUserProfile = async (userId, userData) => {
    const userDocRef = createUserDocRef(userId);
    const profileData = addTimestamp(userData);
    await setDoc(userDocRef, profileData);
    return profileData;
};

const readUserProfile = async (userId) => {
    const userDocRef = createUserDocRef(userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
        throw new Error('Profile not found');
    }
    
    return userDocSnap.data();
};

const updateUserProfileData = async (userId, updates) => {
    const userDocRef = createUserDocRef(userId);
    const updateData = addTimestamp(updates);
    await updateDoc(userDocRef, updateData);
    return updateData;
};

const removeUserProfile = async (userId) => {
    const userDocRef = createUserDocRef(userId);
    await deleteDoc(userDocRef);
    return true;
};

const checkUsernameExists = async (username) => {
    const userDocRef = doc(FIREBASE_DB, 'users', username);
    const userDocSnap = await getDoc(userDocRef);
    return userDocSnap.exists();
};

// Image upload operations
const uploadImageToStorage = async (imageUri, fileName, onProgress = null) => {
    const fetchResponse = await fetch(imageUri);
    const blob = await fetchResponse.blob();
    
    const imageRef = ref(FIREBASE_STORAGE, `images/${fileName}`);
    const uploadTask = uploadBytesResumable(imageRef, blob);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress?.(progress);
            }, 
            reject, 
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({
                        downloadURL,
                        metadata: uploadTask.snapshot.metadata
                    });
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
};

// Location ID operations
const updateLocationIds = async (userId, locationId, operation) => {
    const userDocRef = createUserDocRef(userId);
    const numericId = parseLocationId(locationId);
    
    const updateOperation = operation === 'add' 
        ? { locationIds: arrayUnion(numericId) }
        : { locationIds: arrayRemove(numericId) };
    
    await updateDoc(userDocRef, updateOperation);
    return operation === 'add';
};

const getLocationIds = async (userId) => {
    const profile = await readUserProfile(userId);
    return profile.locationIds || [];
};

// Jump number operations
const updateJumpCount = async (userId, newCount) => {
    await updateUserProfileData(userId, { jumpNumber: newCount });
    return newCount;
};

const incrementJumpCount = async (userId) => {
    const profile = await readUserProfile(userId);
    const currentCount = profile.jumpNumber || 0;
    return updateJumpCount(userId, currentCount + 1);
};

const decrementJumpCount = async (userId) => {
    const profile = await readUserProfile(userId);
    const currentCount = profile.jumpNumber || 0;
    const newCount = Math.max(0, currentCount - 1);
    return updateJumpCount(userId, newCount);
};

// Exported service functions with error handling
export const createUserProfile = withDbErrorHandling(writeUserProfile);
export const getUserProfile = withDbErrorHandling(readUserProfile);
export const updateUserProfile = withDbErrorHandling(updateUserProfileData);
export const deleteUserProfile = withDbErrorHandling(removeUserProfile);
export const isUsernameTaken = withDbErrorHandling(checkUsernameExists);

export const uploadProfileImage = withDbErrorHandling(async (userId, imageUri, fileName, onProgress) => {
    const uploadResult = await uploadImageToStorage(imageUri, fileName, onProgress);
    await updateUserProfileData(userId, { profileImage: uploadResult.downloadURL });
    return uploadResult;
});

export const addUsername = withDbErrorHandling(async (userId, username) => {
    const isTaken = await checkUsernameExists(username);
    if (isTaken) {
        throw new Error('Username already taken');
    }
    return updateUserProfileData(userId, { username });
});

export const toggleLocationSave = withDbErrorHandling(async (userId, locationId) => {
    const locationIds = await getLocationIds(userId);
    const numericId = parseLocationId(locationId);
    const isCurrentlySaved = locationIds.includes(numericId);
    
    const operation = isCurrentlySaved ? 'remove' : 'add';
    const saved = await updateLocationIds(userId, locationId, operation);
    
    return { saved, locationId: numericId };
});

export const incrementJumpNumber = withDbErrorHandling(incrementJumpCount);
export const decrementJumpNumber = withDbErrorHandling(decrementJumpCount);
export const updateJumpNumber = withDbErrorHandling(updateJumpCount);

// Utility functions
export const getUserData = async (userId, fields = []) => {
    const result = await getUserProfile(userId);
    if (!result.success) return result;
    
    if (fields.length === 0) return result;
    
    const filteredData = fields.reduce((acc, field) => {
        if (result.data[field] !== undefined) {
            acc[field] = result.data[field];
        }
        return acc;
    }, {});
    
    return createResult(filteredData);
};

// Composed operations
export const updateProfileWithValidation = withDbErrorHandling(async (userId, updates) => {
    const validUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            acc[key] = value;
        }
        return acc;
    }, {});
    
    if (Object.keys(validUpdates).length === 0) {
        throw new Error('No valid updates provided');
    }
    
    return updateUserProfileData(userId, validUpdates);
});

// Functional pipelines
export const createAndSetupUser = async (userId, userData) => {
    const createResult = await createUserProfile(userId, userData);
    if (!createResult.success) return createResult;
    
    // Initialize default values if needed
    const defaults = {
        jumpNumber: 0,
        locationIds: [],
        ...userData
    };
    
    return updateUserProfile(userId, defaults);
};