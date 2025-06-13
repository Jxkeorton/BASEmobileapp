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

// DEV_MODE mock user data
const DEV_USER = {
    uid: 'dev-user-123',
    email: 'dev@example.com',
    displayName: 'Dev User',
};

const DEV_PROFILE = {
    name: 'Dev User',
    email: 'dev@example.com',
    username: 'devuser',
    jumpNumber: 50,
    profileImage: '',
    locationIds: [1, 2, 3],
};

const REVENUECAT_API_KEYS = {
    apple: 'appl_oLqVDrPIayWzOFHVqVjutudHSZV',
    google: 'goog_TwvdVGeikOQFmRxsiZkqbWOpChv'
};

// Simplified initial state
const initialState = {
    isLoggedIn: DEV_MODE,
    initialized: false,
    user: DEV_MODE ? DEV_USER : null,
    profile: DEV_MODE ? DEV_PROFILE : {
        name: '',
        email: '',
        username: '',
        jumpNumber: 0,
        profileImage: '',
        locationIds: [],
    },
    subscription: {
        isPro: DEV_MODE,
        packages: DEV_MODE ? [
            { product: { identifier: 'monthly', priceString: '$4.99' }},
            { product: { identifier: 'yearly', priceString: '$39.99' }}
        ] : [],
        entitlements: null,
        isReady: DEV_MODE,
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
        if (DEV_MODE) {
            console.log('DEV_MODE: Skipping profile load, using mock data');
            return;
        }

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
            console.log('DEV_MODE: Skipping RevenueCat initialization, using mock data');
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
        if (DEV_MODE) {
            console.log('DEV_MODE: Bypassing Firebase auth, setting up dev state');
            updateState({ initialized: true });
            return;
        }

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
                    subscription: { ...initialState.subscription, isReady: false },
                });
            }

            updateState({ initialized: true });
            updateNestedState('loading', { auth: false });
        });

        return unsubscribe;
    }, [loadUserProfile, initializeRevenueCat, updateState, updateNestedState]);

    // Auth actions
    const handleSignIn = useCallback(async (email, password) => {
        if (DEV_MODE) {
            console.log('DEV_MODE: Mock sign in successful');
            return { success: true };
        }

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
        if (DEV_MODE) {
            console.log('DEV_MODE: Mock sign up successful');
            return { success: true };
        }

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
        if (DEV_MODE) {
            console.log('DEV_MODE: Mock sign out');
            router.replace("/(auth)/Login");
            return { success: true };
        }

        const result = await signOutUser();
        if (result.success) {
            router.replace("/(auth)/Login");
        }
        return result;
    }, []);

    // Profile actions with DEV mode handling
    const handleUpdateProfile = useCallback(async (name, email, jumpNumber) => {
        if (DEV_MODE) {
            console.log('DEV_MODE: Mock profile update');
            const updates = {};
            if (name && name.trim()) updates.name = name.trim();
            if (email && email.trim()) updates.email = email.trim();
            if (jumpNumber !== undefined && jumpNumber !== null && !isNaN(Number(jumpNumber))) {
                updates.jumpNumber = Number(jumpNumber);
            }
            updateNestedState('profile', updates);
            router.replace('/(tabs)/profile/Profile');
            return { success: true };
        }

        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        updateNestedState('loading', { action: true });
        
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
        if (DEV_MODE) {
            console.log('DEV_MODE: Mock image upload');
            updateNestedState('profile', { profileImage: uri });
            return { success: true, data: { downloadURL: uri } };
        }

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
        if (DEV_MODE) {
            console.log('DEV_MODE: Mock location toggle');
            const currentIds = state.profile.locationIds;
            const numericId = typeof locationId === 'string' ? parseInt(locationId) : locationId;
            const isCurrentlySaved = currentIds.includes(numericId);
            
            updateNestedState('profile', {
                locationIds: isCurrentlySaved 
                    ? currentIds.filter(id => id !== numericId)
                    : [...currentIds, numericId]
            });
            
            return !isCurrentlySaved;
        }

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

    // Jump management with DEV mode
    const handleAddJumpNumber = useCallback(async () => {
        if (DEV_MODE) {
            console.log('DEV_MODE: Mock increment jump number');
            const newCount = (state.profile.jumpNumber || 0) + 1;
            updateNestedState('profile', { jumpNumber: newCount });
            return { success: true, data: newCount };
        }

        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        const result = await incrementJumpNumber(currentUser.uid);
        
        if (result.success) {
            updateNestedState('profile', { jumpNumber: result.data });
        }
        
        return result;
    }, [state.profile.jumpNumber, updateNestedState]);

    const handleDecrementJumpNumber = useCallback(async () => {
        if (DEV_MODE) {
            console.log('DEV_MODE: Mock decrement jump number');
            const newCount = Math.max(0, (state.profile.jumpNumber || 0) - 1);
            updateNestedState('profile', { jumpNumber: newCount });
            return { success: true, data: newCount };
        }

        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        const result = await decrementJumpNumber(currentUser.uid);
        
        if (result.success) {
            updateNestedState('profile', { jumpNumber: result.data });
        }
        
        return result;
    }, [state.profile.jumpNumber, updateNestedState]);

    const handleSubmitJump = useCallback(async (formData) => {
        if (DEV_MODE) {
            console.log('DEV_MODE: Mock submit jump');
            await handleAddJumpNumber();
            return { success: true, data: { id: Date.now().toString(), ...formData } };
        }

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
        if (DEV_MODE) {
            console.log('DEV_MODE: Mock delete jump');
            await handleDecrementJumpNumber();
            return { success: true };
        }

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
        if (DEV_MODE) {
            console.log('DEV_MODE: Returning mock jumps');
            return [
                {
                    id: '1',
                    location: 'Mock Location 1',
                    exitType: 'Building',
                    delay: '3',
                    details: 'Mock jump details',
                    date: '2024-01-01',
                    imageURLs: []
                },
                {
                    id: '2',
                    location: 'Mock Location 2',
                    exitType: 'Antenna',
                    delay: '5',
                    details: 'Another mock jump',
                    date: '2024-01-02',
                    imageURLs: []
                }
            ];
        }

        const currentUser = getCurrentUser();
        if (!currentUser) return [];

        const result = await getLogbook(currentUser.uid);
        return result.success ? result.data : [];
    }, []);

    // Submission actions with DEV mode
    const handleSubmitLocation = useCallback(async (formData) => {
        if (DEV_MODE) {
            console.log('DEV_MODE: Mock location submission');
            return { success: true };
        }

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
        if (DEV_MODE) {
            console.log('DEV_MODE: Mock detail update submission');
            return { success: true };
        }

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
            console.log('DEV_MODE: Mock purchase successful');
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