// Auth Service
export {
    signIn,
    signUp,
    signOutUser,
    resetPassword,
    deleteAccount,
    onAuthStateChange,
    getCurrentUser,
    isAuthenticated,
    getUserId,
    requireAuth,
    signInAndGetUser,
    signUpAndGetUser
} from './authService';

// User Service  
export {
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    isUsernameTaken,
    uploadProfileImage,
    addUsername,
    toggleLocationSave,
    incrementJumpNumber,
    decrementJumpNumber,
    updateJumpNumber,
    getUserData,
    updateProfileWithValidation,
    createAndSetupUser
} from './userService';

// Logbook Service
export {
    getLogbook,
    addJump,
    deleteJump,
    getJump,
    updateJump,
    uploadImages as uploadLogbookImages,
    deleteImages as deleteLogbookImages,
    getJumpCount,
    getRecentJumps,
    searchJumps,
    addJumpAndGetCount,
    deleteJumpAndGetCount,
    addMultipleJumps,
    getLogbookStats
} from './logbookService';

// Submission Service
export {
    submitLocation,
    submitDetailUpdate,
    getUserSubmissions,
    uploadImages as uploadSubmissionImages,
    getSubmissionCount,
    getSubmissionsByStatus,
    getRecentSubmissions,
    validateSubmissionData,
    submitMultipleLocations,
    getSubmissionStats,
    submitLocationWithValidation,
    submitDetailWithValidation,
    searchSubmissions,
    filterSubmissionsByDateRange
} from './submissionService';

// Composed operations that use multiple services
export const createCompleteUser = async (email, password, displayName, username) => {
    const authResult = await signUpAndGetUser(email, password, displayName);
    if (!authResult.success) return authResult;
    
    const profileResult = await createAndSetupUser(authResult.userId, {
        email,
        name: displayName,
        username
    });
    
    return profileResult.success 
        ? { ...authResult, profile: profileResult.data }
        : profileResult;
};

export const deleteCompleteUser = async () => {
    const userId = getUserId();
    if (!userId) return { success: false, error: new Error('No user logged in') };
    
    // Delete profile first, then auth account
    await deleteUserProfile(userId);
    return deleteAccount();
};

// Utility functions that combine services
export const getUserDashboardData = async (userId) => {
    const [profileResult, logbookResult, submissionsResult] = await Promise.all([
        getUserProfile(userId),
        getLogbook(userId),
        getUserSubmissions(userId)
    ]);
    
    return {
        profile: profileResult.data,
        logbook: logbookResult.data,
        submissions: submissionsResult.data,
        hasErrors: [profileResult, logbookResult, submissionsResult].some(r => !r.success)
    };
};