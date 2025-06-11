import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { router } from 'expo-router';

import {
    // Auth functions
    onAuthStateChange,
    signIn,
    signOutUser,
    resetPassword,
    deleteAccount,
    getCurrentUser,
    
    // Composed functions from services/index.js
    createCompleteUser,
    deleteCompleteUser,
    
    // User functions
    getUserProfile,
    updateUserProfile,
    uploadProfileImage,
    toggleLocationSave,
    incrementJumpNumber,
    decrementJumpNumber,
    
    // Logbook functions
    addJump,
    getLogbook,
    deleteJump,
    
    // Submission functions
    submitLocation,
    submitDetailUpdate
} from '../services';

const DEV_MODE = __DEV__;

const REVENUECAT_API_KEYS = {
    apple: 'appl_oLqVDrPIayWzOFHVqVjutudHSZV',
    google: 'goog_TwvdVGeikOQFmRxsiZkqbWOpChv'
};

// Simplified initial state
const initialState = {
    isLoggedIn: false,
    initialized: false,
    user: null,
    profile: {
        name: '',
        email: '',
        username: '',
        jumpNumber: 0,
        profileImage: '',
        locationIds: [],
    },
    subscription: {
        isPro: DEV_MODE,
        packages: [],
        entitlements: null,
        isReady: false,
    },
    loading: {
        auth: false,
        profile: false,
        subscription: false,
        action: false,
    },
    errors: {
        auth: null,
        profile: null,
        subscription: null,
        action: null,
    }
};

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [state, setState] = useState(initialState);

    // Pure helper functions
    const updateState = useCallback((updates) => {
        setState(prevState => ({ ...prevState, ...updates }));
    }, []);

    const updateNestedState = useCallback((key, updates) => {
        setState(prevState => ({
            ...prevState,
            [key]: { ...prevState[key], ...updates }
        }));
    }, []);

    // Load user profile
    const loadUserProfile = useCallback(async (userId) => {
        updateNestedState('loading', { profile: true });
        updateNestedState('errors', { profile: null });
        
        const result = await getUserProfile(userId);
        
        if (result.success) {
            updateNestedState('profile', {
                name: result.data?.name || '',
                email: result.data?.email || '',
                username: result.data?.username || '',
                jumpNumber: result.data?.jumpNumber || 0,
                profileImage: result.data?.profileImage || '',
                locationIds: result.data?.locationIds || [],
            });
        } else {
            updateNestedState('errors', { profile: result.error.message });
        }
        
        updateNestedState('loading', { profile: false });
    }, [updateNestedState]);

    // Initialize RevenueCat
    const initializeRevenueCat = useCallback(async () => {
        if (DEV_MODE) {
            updateNestedState('subscription', {
                isReady: true,
                isPro: true,
                packages: [
                    { product: { identifier: 'monthly', priceString: '$4.99' }},
                    { product: { identifier: 'yearly', priceString: '$39.99' }}
                ]
            });
            return;
        }

        try {
            updateNestedState('loading', { subscription: true });

            if (Platform.OS === 'android') {
                Purchases.configure({ apiKey: REVENUECAT_API_KEYS.google });
            } else {
                Purchases.configure({ apiKey: REVENUECAT_API_KEYS.apple });
            }

            Purchases.setLogLevel(LOG_LEVEL.DEBUG);

            Purchases.addCustomerInfoUpdateListener((customerInfo) => {
                updateNestedState('subscription', {
                    entitlements: customerInfo.entitlements,
                    isPro: customerInfo.entitlements.active["proFeatures"] !== undefined,
                });
            });

            const [offerings, customerInfo] = await Promise.all([
                Purchases.getOfferings(),
                Purchases.getCustomerInfo()
            ]);

            updateNestedState('subscription', {
                packages: offerings.current?.availablePackages || [],
                entitlements: customerInfo.entitlements,
                isPro: customerInfo.entitlements.active["proFeatures"] !== undefined,
                isReady: true,
            });

        } catch (error) {
            console.error('RevenueCat initialization error:', error);
            updateNestedState('errors', { subscription: error.message });
            updateNestedState('subscription', { isReady: true });
        } finally {
            updateNestedState('loading', { subscription: false });
        }
    }, [updateNestedState]);

    // Auth listener
    useEffect(() => {
        const unsubscribe = onAuthStateChange(async (firebaseUser) => {
            updateNestedState('loading', { auth: true });

            if (firebaseUser) {
                updateState({
                    user: firebaseUser,
                    isLoggedIn: true,
                });
                
                await Promise.all([
                    loadUserProfile(firebaseUser.uid),
                    initializeRevenueCat()
                ]);
            } else {
                updateState({
                    user: null,
                    isLoggedIn: false,
                    profile: initialState.profile,
                    subscription: { ...initialState.subscription, isReady: DEV_MODE },
                });
            }

            updateState({ initialized: true });
            updateNestedState('loading', { auth: false });
        });

        return unsubscribe;
    }, [loadUserProfile, initializeRevenueCat, updateState, updateNestedState]);

    // Auth actions
    const handleSignIn = useCallback(async (email, password) => {
        updateNestedState('loading', { auth: true });
        updateNestedState('errors', { auth: null });
        
        const result = await signIn(email, password);
        
        if (!result.success) {
            updateNestedState('errors', { auth: result.error.message });
        }
        
        updateNestedState('loading', { auth: false });
        return result;
    }, [updateNestedState]);

    const handleSignUp = useCallback(async (email, password, displayName, username) => {
        updateNestedState('loading', { auth: true });
        updateNestedState('errors', { auth: null });

        const result = await createCompleteUser(email, password, displayName, username);
        
        if (!result.success) {
            updateNestedState('errors', { auth: result.error.message });
        }
        
        updateNestedState('loading', { auth: false });
        return result;
    }, [updateNestedState]);

    const handleSignOut = useCallback(async () => {
        const result = await signOutUser();
        if (result.success) {
            router.replace("/(auth)/Login");
        }
        return result;
    }, []);

    // Profile actions
    const handleUpdateProfile = useCallback(async (name, email, jumpNumber) => {
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        updateNestedState('loading', { action: true });
        
        // Prepare updates object
        const updates = {};
        if (name && name.trim()) updates.name = name.trim();
        if (email && email.trim()) updates.email = email.trim();
        if (jumpNumber !== undefined && jumpNumber !== null && !isNaN(Number(jumpNumber))) {
            updates.jumpNumber = Number(jumpNumber);
        }

        const result = await updateUserProfile(currentUser.uid, updates);
        
        if (result.success) {
            updateNestedState('profile', updates);
            router.replace('/(tabs)/profile/Profile');
        } else {
            updateNestedState('errors', { action: result.error.message });
        }
        
        updateNestedState('loading', { action: false });
        return result;
    }, [updateNestedState]);

    const handleUploadProfileImage = useCallback(async (uri, fileName, onProgress) => {
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        updateNestedState('loading', { action: true });
        
        const result = await uploadProfileImage(currentUser.uid, uri, fileName, onProgress);
        
        if (result.success) {
            updateNestedState('profile', { profileImage: result.data.downloadURL });
        } else {
            updateNestedState('errors', { action: result.error.message });
        }
        
        updateNestedState('loading', { action: false });
        return result;
    }, [updateNestedState]);

    const handleToggleLocationSave = useCallback(async (locationId) => {
        const currentUser = getCurrentUser();
        if (!currentUser) return null;

        const result = await toggleLocationSave(currentUser.uid, locationId);
        
        if (result.success) {
            const { saved, locationId: numericId } = result.data;
            const currentIds = state.profile.locationIds;
            
            updateNestedState('profile', {
                locationIds: saved 
                    ? [...currentIds, numericId]
                    : currentIds.filter(id => id !== numericId)
            });
            
            return saved;
        }
        
        return null;
    }, [state.profile.locationIds, updateNestedState]);

    // Jump management
    const handleAddJumpNumber = useCallback(async () => {
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        const result = await incrementJumpNumber(currentUser.uid);
        
        if (result.success) {
            updateNestedState('profile', { jumpNumber: result.data });
        }
        
        return result;
    }, [updateNestedState]);

    const handleDecrementJumpNumber = useCallback(async () => {
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        const result = await decrementJumpNumber(currentUser.uid);
        
        if (result.success) {
            updateNestedState('profile', { jumpNumber: result.data });
        }
        
        return result;
    }, [updateNestedState]);

    const handleSubmitJump = useCallback(async (formData) => {
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        updateNestedState('loading', { action: true });
        
        const result = await addJump(currentUser.uid, formData);
        
        if (result.success) {
            await handleAddJumpNumber();
        } else {
            updateNestedState('errors', { action: result.error.message });
        }
        
        updateNestedState('loading', { action: false });
        return result;
    }, [handleAddJumpNumber, updateNestedState]);

    const handleDeleteJump = useCallback(async (jumpId) => {
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        updateNestedState('loading', { action: true });
        
        const result = await deleteJump(currentUser.uid, jumpId);
        
        if (result.success) {
            await handleDecrementJumpNumber();
        } else {
            updateNestedState('errors', { action: result.error.message });
        }
        
        updateNestedState('loading', { action: false });
        return result;
    }, [handleDecrementJumpNumber, updateNestedState]);

    const handleGetLoggedJumps = useCallback(async () => {
        const currentUser = getCurrentUser();
        if (!currentUser) return [];

        const result = await getLogbook(currentUser.uid);
        return result.success ? result.data : [];
    }, []);

    // Submission actions
    const handleSubmitLocation = useCallback(async (formData) => {
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        updateNestedState('loading', { action: true });
        
        const result = await submitLocation(currentUser.uid, formData);
        
        if (!result.success) {
            updateNestedState('errors', { action: result.error.message });
        }
        
        updateNestedState('loading', { action: false });
        return result;
    }, [updateNestedState]);

    const handleSubmitDetailUpdate = useCallback(async (formData) => {
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        updateNestedState('loading', { action: true });
        
        const result = await submitDetailUpdate(currentUser.uid, formData);
        
        if (!result.success) {
            updateNestedState('errors', { action: result.error.message });
        }
        
        updateNestedState('loading', { action: false });
        return result;
    }, [updateNestedState]);

    // Subscription actions
    const handlePurchasePackage = useCallback(async (pack) => {
        if (DEV_MODE) {
            updateNestedState('subscription', { isPro: true });
            return { success: true };
        }

        updateNestedState('loading', { action: true });
        
        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);
            
            updateNestedState('subscription', {
                entitlements: customerInfo.entitlements,
                isPro: customerInfo.entitlements.active["proFeatures"] !== undefined,
            });

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            updateNestedState('loading', { action: false });
        }
    }, [updateNestedState]);

    // Computed values
    const isReady = state.initialized && state.subscription.isReady;
    const isProUser = state.subscription.isPro;

    const value = {
        // State
        ...state,
        isReady,
        isProUser,
        
        // Auth Actions
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        resetPassword,
        deleteAccount: deleteCompleteUser,
        
        // Profile Actions
        updateProfile: handleUpdateProfile,
        updateProfileDetails: handleUpdateProfile,
        uploadProfileImage: handleUploadProfileImage,
        toggleLocationSave: handleToggleLocationSave,
        
        // Jump Management
        addJumpNumber: handleAddJumpNumber,
        decrementJumpNumber: handleDecrementJumpNumber,
        submitJump: handleSubmitJump,
        deleteJump: handleDeleteJump,
        getLoggedJumps: handleGetLoggedJumps,
        
        // Submission Actions
        submitLocation: handleSubmitLocation,
        submitDetailUpdate: handleSubmitDetailUpdate,
        
        // Subscription Actions
        purchasePackage: handlePurchasePackage,
        
        // Legacy compatibility
        user: {
            ...state.user,
            pro: state.subscription.isPro,
        },
        packages: state.subscription.packages,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};