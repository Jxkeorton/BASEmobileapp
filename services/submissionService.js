import { 
    doc, 
    setDoc, 
    serverTimestamp, 
    getDoc,
    addDoc,
    collection,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
const createStorageRef = (path) => ref(FIREBASE_STORAGE, path);
const generateFileName = () => `${Date.now()}.jpg`;
const addSubmissionTimestamp = (data, userId) => ({
    ...data,
    submittedBy: userId,
    submittedAt: serverTimestamp(),
    status: 'pending'
});

// Validation functions
const validateLocationSubmission = (formData) => {
    const required = ['exitName', 'rockDrop', 'coordinates'];
    const missing = required.filter(field => !formData[field]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    return true;
};

const validateDetailSubmission = (formData) => {
    if (!formData.jumpId) {
        throw new Error('Jump ID is required for detail submissions');
    }
    
    return true;
};

// Image upload functions
const uploadSingleSubmissionImage = async (uri, folder) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = generateFileName();
    const storageRef = createStorageRef(`${folder}/${fileName}`);
    
    await uploadBytesResumable(storageRef, blob);
    return getDownloadURL(storageRef);
};

const uploadSubmissionImages = async (imageUris, folder = 'submissions') => {
    if (!imageUris || imageUris.length === 0) return [];
    
    const uploadPromises = imageUris.map(uri => uploadSingleSubmissionImage(uri, folder));
    return Promise.all(uploadPromises);
};

// Document reference creators
const createSubmissionDocRef = () => collection(FIREBASE_DB, 'submits');
const createDetailSubmissionDocRef = (userId) => doc(FIREBASE_DB, 'detailSubmits', userId);

// Data transformation functions
const transformLocationSubmission = (formData, imageUrls, userId) => ({
    exitName: formData.exitName,
    rockDrop: formData.rockDrop,
    total: formData.total,
    anchor: formData.anchor,
    access: formData.access,
    notes: formData.notes,
    coordinates: formData.coordinates,
    cliffAspect: formData.cliffAspect,
    videoLink: formData.videoLink,
    openedBy: formData.openedBy,
    openedDate: formData.openedDate,
    unit: formData.selectedUnit,
    imageURLs: imageUrls,
    ...addSubmissionTimestamp({}, userId)
});

const transformDetailSubmission = (formData, imageUrls, userId) => ({
    rockDrop: formData.rockDrop,
    total: formData.total,
    anchor: formData.anchor,
    access: formData.access,
    notes: formData.notes,
    coordinates: formData.coordinates,
    cliffAspect: formData.cliffAspect,
    videoLink: formData.videoLink,
    openedBy: formData.openedBy,
    openedDate: formData.openedDate,
    jumpId: formData.jumpId,
    imageURLs: imageUrls,
    ...addSubmissionTimestamp({}, userId)
});

// Core submission operations
const performLocationSubmission = async (userId, formData) => {
    validateLocationSubmission(formData);
    
    const imageUrls = await uploadSubmissionImages(formData.images);
    const submissionData = transformLocationSubmission(formData, imageUrls, userId);
    
    const docRef = await addDoc(createSubmissionDocRef(), submissionData);
    
    return {
        id: docRef.id,
        ...submissionData
    };
};

const performDetailSubmission = async (userId, formData) => {
    validateDetailSubmission(formData);
    
    const imageUrls = await uploadSubmissionImages(formData.images, 'details');
    const submissionData = transformDetailSubmission(formData, imageUrls, userId);
    
    // Get or create user's detail submissions document
    const detailsRef = createDetailSubmissionDocRef(userId);
    const detailsSnapshot = await getDoc(detailsRef);
    
    const existingSubmissions = detailsSnapshot.exists() 
        ? detailsSnapshot.data().detailSubmits || []
        : [];
    
    const updatedSubmissions = [...existingSubmissions, submissionData];
    await setDoc(detailsRef, { detailSubmits: updatedSubmissions });
    
    return submissionData;
};

const performGetUserSubmissions = async (userId) => {
    const detailsRef = createDetailSubmissionDocRef(userId);
    const detailsSnapshot = await getDoc(detailsRef);
    
    if (detailsSnapshot.exists()) {
        const data = detailsSnapshot.data();
        return data.detailSubmits || [];
    }
    
    return [];
};

// Exported service functions
export const submitLocation = withErrorHandling(performLocationSubmission);
export const submitDetailUpdate = withErrorHandling(performDetailSubmission);
export const getUserSubmissions = withErrorHandling(performGetUserSubmissions);
export const uploadImages = withErrorHandling(uploadSubmissionImages);

// Utility functions
export const getSubmissionCount = async (userId) => {
    const result = await getUserSubmissions(userId);
    return result.success ? createResult(result.data.length) : result;
};

export const getSubmissionsByStatus = async (userId, status = 'pending') => {
    const result = await getUserSubmissions(userId);
    if (!result.success) return result;
    
    const filteredSubmissions = result.data.filter(submission => submission.status === status);
    return createResult(filteredSubmissions);
};

export const getRecentSubmissions = async (userId, limit = 5) => {
    const result = await getUserSubmissions(userId);
    if (!result.success) return result;
    
    const recentSubmissions = result.data
        .sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0))
        .slice(0, limit);
    
    return createResult(recentSubmissions);
};

// Validation utilities
export const validateSubmissionData = (formData, type = 'location') => {
    try {
        if (type === 'location') {
            validateLocationSubmission(formData);
        } else if (type === 'detail') {
            validateDetailSubmission(formData);
        }
        return createResult(true);
    } catch (error) {
        return createResult(false, error);
    }
};

// Batch operations
export const submitMultipleLocations = async (userId, submissions) => {
    const results = [];
    
    for (const submission of submissions) {
        const result = await submitLocation(userId, submission);
        results.push(result);
        
        if (!result.success) {
            break; // Stop on first error
        }
    }
    
    return createResult(results);
};

// Analytics functions
export const getSubmissionStats = async (userId) => {
    const result = await getUserSubmissions(userId);
    if (!result.success) return result;
    
    const submissions = result.data;
    const stats = {
        total: submissions.length,
        pending: submissions.filter(s => s.status === 'pending').length,
        approved: submissions.filter(s => s.status === 'approved').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
        withImages: submissions.filter(s => s.imageURLs?.length > 0).length,
        withoutImages: submissions.filter(s => !s.imageURLs?.length).length,
        averageImagesPerSubmission: submissions.length > 0 
            ? submissions.reduce((acc, s) => acc + (s.imageURLs?.length || 0), 0) / submissions.length 
            : 0
    };
    
    return createResult(stats);
};

// Functional compositions
export const submitLocationWithValidation = async (userId, formData) => {
    const validationResult = validateSubmissionData(formData, 'location');
    if (!validationResult.success) return validationResult;
    
    return submitLocation(userId, formData);
};

export const submitDetailWithValidation = async (userId, formData) => {
    const validationResult = validateSubmissionData(formData, 'detail');
    if (!validationResult.success) return validationResult;
    
    return submitDetailUpdate(userId, formData);
};

// Search and filter functions
export const searchSubmissions = async (userId, searchTerm) => {
    const result = await getUserSubmissions(userId);
    if (!result.success) return result;
    
    const filteredSubmissions = result.data.filter(submission => 
        submission.exitName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.openedBy?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return createResult(filteredSubmissions);
};

export const filterSubmissionsByDateRange = async (userId, startDate, endDate) => {
    const result = await getUserSubmissions(userId);
    if (!result.success) return result;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const filteredSubmissions = result.data.filter(submission => {
        if (!submission.submittedAt?.seconds) return false;
        const submissionDate = new Date(submission.submittedAt.seconds * 1000);
        return submissionDate >= start && submissionDate <= end;
    });
    
    return createResult(filteredSubmissions);
};