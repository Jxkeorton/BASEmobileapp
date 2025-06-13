import { 
    doc, 
    setDoc, 
    serverTimestamp, 
    getDoc,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { FIREBASE_DB, FIREBASE_STORAGE } from '../firebaseConfig';

// Result wrapper for consistent return types
const createResult = (data = null, error = null) => ({ data, error, success: !error });

// Higher-order function for error handling
const withErrorHandling = (fn) => async (...args) => {
    try {
        const result = await fn(...args);
        return createResult(result);
    } catch (error) {
        return createResult(null, error);
    }
};

// Pure utility functions
const createLogbookRef = (userId) => doc(FIREBASE_DB, 'logbook', userId);
const createStorageRef = (path) => ref(FIREBASE_STORAGE, path);
const generateJumpId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
const addTimestamp = (data) => ({ ...data, createdAt: serverTimestamp() });

// Image processing functions
const fetchImageAsBlob = async (uri) => {
    const response = await fetch(uri);
    return response.blob();
};

const uploadSingleImage = async (uri, folder) => {
    const blob = await fetchImageAsBlob(uri);
    const fileName = `${Date.now()}.jpg`;
    const storageRef = createStorageRef(`${folder}/${fileName}`);
    
    await uploadBytesResumable(storageRef, blob);
    return getDownloadURL(storageRef);
};

const uploadMultipleImages = async (imageUris, folder = 'logbooks') => {
    if (!imageUris || imageUris.length === 0) return [];
    
    const uploadPromises = imageUris.map(uri => uploadSingleImage(uri, folder));
    return Promise.all(uploadPromises);
};

const deleteImageFromStorage = async (imageUrl) => {
    try {
        const storageRef = createStorageRef(imageUrl);
        await deleteObject(storageRef);
        return true;
    } catch (error) {
        console.warn('Error deleting image:', error);
        return false;
    }
};

const deleteMultipleImages = async (imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) return [];
    
    const deletePromises = imageUrls.map(deleteImageFromStorage);
    return Promise.all(deletePromises);
};

// Logbook data operations
const readLogbookData = async (userId) => {
    const logbookRef = createLogbookRef(userId);
    const logbookSnapshot = await getDoc(logbookRef);
    
    if (logbookSnapshot.exists()) {
        const logbookData = logbookSnapshot.data();
        return logbookData.jumps || [];
    }
    
    return [];
};

const writeLogbookData = async (userId, jumps) => {
    const logbookRef = createLogbookRef(userId);
    await setDoc(logbookRef, { jumps });
    return jumps;
};

// Jump creation and manipulation
const createJumpRecord = (jumpData, imageUrls = []) => ({
    id: generateJumpId(),
    location: jumpData.location,
    exitType: jumpData.exitType,
    delay: jumpData.delay,
    details: jumpData.details,
    date: jumpData.date,
    imageURLs: imageUrls,
    ...addTimestamp({})
});

const addJumpToList = (jumps, newJump) => [...jumps, newJump];

const removeJumpFromList = (jumps, jumpId) => jumps.filter(jump => jump.id !== jumpId);

const findJumpById = (jumps, jumpId) => jumps.find(jump => jump.id === jumpId);

const findJumpIndex = (jumps, jumpId) => jumps.findIndex(jump => jump.id === jumpId);

// Core logbook operations
const performAddJump = async (userId, jumpData) => {
    const imageUrls = await uploadMultipleImages(jumpData.images);
    const newJump = createJumpRecord(jumpData, imageUrls);
    const existingJumps = await readLogbookData(userId);
    const updatedJumps = addJumpToList(existingJumps, newJump);
    
    await writeLogbookData(userId, updatedJumps);
    return newJump;
};

const performDeleteJump = async (userId, jumpId) => {
    const existingJumps = await readLogbookData(userId);
    const jumpToDelete = findJumpById(existingJumps, jumpId);
    
    if (!jumpToDelete) {
        throw new Error('Jump not found');
    }
    
    // Delete associated images
    if (jumpToDelete.imageURLs?.length > 0) {
        await deleteMultipleImages(jumpToDelete.imageURLs);
    }
    
    const updatedJumps = removeJumpFromList(existingJumps, jumpId);
    await writeLogbookData(userId, updatedJumps);
    
    return jumpToDelete;
};

const performGetJump = async (userId, jumpId) => {
    const jumps = await readLogbookData(userId);
    const jump = findJumpById(jumps, jumpId);
    
    if (!jump) {
        throw new Error('Jump not found');
    }
    
    return jump;
};

const performUpdateJump = async (userId, jumpId, updates) => {
    const existingJumps = await readLogbookData(userId);
    const jumpIndex = findJumpIndex(existingJumps, jumpId);
    
    if (jumpIndex === -1) {
        throw new Error('Jump not found');
    }
    
    const updatedJump = {
        ...existingJumps[jumpIndex],
        ...updates,
        updatedAt: serverTimestamp()
    };
    
    const updatedJumps = [...existingJumps];
    updatedJumps[jumpIndex] = updatedJump;
    
    await writeLogbookData(userId, updatedJumps);
    return updatedJump;
};

// Exported service functions
export const getLogbook = withErrorHandling(readLogbookData);
export const addJump = withErrorHandling(performAddJump);
export const deleteJump = withErrorHandling(performDeleteJump);
export const getJump = withErrorHandling(performGetJump);
export const updateJump = withErrorHandling(performUpdateJump);
export const uploadImages = withErrorHandling(uploadMultipleImages);
export const deleteImages = withErrorHandling(deleteMultipleImages);

// Utility functions
export const getJumpCount = async (userId) => {
    const result = await getLogbook(userId);
    return result.success ? createResult(result.data.length) : result;
};

export const getRecentJumps = async (userId, limit = 5) => {
    const result = await getLogbook(userId);
    if (!result.success) return result;
    
    const recentJumps = result.data
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    
    return createResult(recentJumps);
};

export const searchJumps = async (userId, searchTerm) => {
    const result = await getLogbook(userId);
    if (!result.success) return result;
    
    const filteredJumps = result.data.filter(jump => 
        jump.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jump.exitType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jump.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return createResult(filteredJumps);
};

// Functional compositions
export const addJumpAndGetCount = async (userId, jumpData) => {
    const addResult = await addJump(userId, jumpData);
    if (!addResult.success) return addResult;
    
    const countResult = await getJumpCount(userId);
    return createResult({
        jump: addResult.data,
        totalJumps: countResult.data
    });
};

export const deleteJumpAndGetCount = async (userId, jumpId) => {
    const deleteResult = await deleteJump(userId, jumpId);
    if (!deleteResult.success) return deleteResult;
    
    const countResult = await getJumpCount(userId);
    return createResult({
        deletedJump: deleteResult.data,
        totalJumps: countResult.data
    });
};

// Batch operations
export const addMultipleJumps = async (userId, jumpDataArray) => {
    const results = [];
    
    for (const jumpData of jumpDataArray) {
        const result = await addJump(userId, jumpData);
        results.push(result);
        
        if (!result.success) {
            break; // Stop on first error
        }
    }
    
    return createResult(results);
};

// Statistics functions
export const getLogbookStats = async (userId) => {
    const result = await getLogbook(userId);
    if (!result.success) return result;
    
    const jumps = result.data;
    const stats = {
        totalJumps: jumps.length,
        exitTypes: [...new Set(jumps.map(j => j.exitType).filter(Boolean))],
        locations: [...new Set(jumps.map(j => j.location).filter(Boolean))],
        averageDelay: jumps.length > 0 
            ? jumps.reduce((acc, j) => acc + (parseInt(j.delay) || 0), 0) / jumps.length 
            : 0,
        firstJump: jumps.length > 0 
            ? jumps.sort((a, b) => new Date(a.date) - new Date(b.date))[0] 
            : null,
        latestJump: jumps.length > 0 
            ? jumps.sort((a, b) => new Date(b.date) - new Date(a.date))[0] 
            : null
    };
    
    return createResult(stats);
};