import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { 
    onAuthStateChange, 
    getCurrentUser,
} from '../services';
import { 
    useSignInMutation, 
    useSignUpMutation, 
    useSignOutMutation,
    useResetPasswordMutation,
    useDeleteAccountMutation 
} from '../hooks/useAuthQuery';
import {
    useUserProfileQuery,
    useUpdateProfileMutation,
    useUploadProfileImageMutation,
    useToggleLocationSaveMutation,
    useJumpNumberMutation,
    userKeys
} from '../hooks/useUserQuery';
import {
    useAddJumpMutation,
    useDeleteJumpMutation,
    useLogbookQuery
} from '../hooks/useLogbookQuery';
import {
    useSubmitLocationMutation,
    useSubmitDetailUpdateMutation
} from '../hooks/useSubmissionQuery';

const DEV_MODE = __DEV__;

const REVENUECAT_API_KEYS = {
    apple: 'appl_oLqVDrPIayWzOFHVqVjutudHSZV',
    google: 'goog_TwvdVGeikOQFmRxsiZkqbWOpChv'
};

const initialState = {
    isLoggedIn: DEV_MODE,
    initialized: false,
    user: DEV_MODE ? { uid: 'dev-user-123', email: 'dev@example.com' } : null,
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
        subscription: false,
    },
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
    const queryClient = useQueryClient();
    
    const userId = state.user?.uid || getCurrentUser()?.uid;
    
    // TanStack Query hooks
    const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfileQuery(userId);
    const { data: logbook, isLoading: logbookLoading } = useLogbookQuery(userId);
    
    // Mutations
    const signInMutation = useSignInMutation();
    const signUpMutation = useSignUpMutation();
    const signOutMutation = useSignOutMutation();
    const resetPasswordMutation = useResetPasswordMutation();
    const deleteAccountMutation = useDeleteAccountMutation();
    
    const updateProfileMutation = useUpdateProfileMutation(userId);
    const uploadImageMutation = useUploadProfileImageMutation(userId);
    const toggleLocationMutation = useToggleLocationSaveMutation(userId);
    const jumpNumberMutation = useJumpNumberMutation(userId);
    
    const addJumpMutation = useAddJumpMutation(userId);
    const deleteJumpMutation = useDeleteJumpMutation(userId);
    
    const submitLocationMutation = useSubmitLocationMutation(userId);
    const submitDetailMutation = useSubmitDetailUpdateMutation(userId);

    // Helper functions
    const updateState = useCallback((updates) => {
        setState(prevState => ({ ...prevState, ...updates }));
    }, []);

    const updateNestedState = useCallback((key, updates) => {
        setState(prevState => ({
            ...prevState,
            [key]: { ...prevState[key], ...updates }
        }));
    }, []);

    // Initialize RevenueCat
    const initializeRevenueCat = useCallback(async () => {
        if (DEV_MODE) return;

        try {
            updateNestedState('loading', { subscription: true });

            Purchases.setLogLevel(LOG_LEVEL.DEBUG);

            if (Platform.OS === 'android') {
                Purchases.configure({ apiKey: REVENUECAT_API_KEYS.google });
            } else {
                Purchases.configure({ apiKey: REVENUECAT_API_KEYS.apple });
            }

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
            updateNestedState('subscription', { isReady: true });
        } finally {
            updateNestedState('loading', { subscription: false });
        }
    }, [updateNestedState]);

    // Auth listener
    useEffect(() => {
        if (DEV_MODE) {
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
                
                await initializeRevenueCat();
            } else {
                updateState({
                    user: null,
                    isLoggedIn: false,
                });
                
                queryClient.removeQueries({ queryKey: userKeys.all });
                queryClient.clear();
            }

            updateState({ initialized: true });
            updateNestedState('loading', { auth: false });
        });

        return unsubscribe;
    }, [initializeRevenueCat, updateState, updateNestedState, queryClient]);

    // Wrapper functions for mutations
    const handleSignIn = useCallback(async (email, password) => {
        if (DEV_MODE) return { success: true };
        
        try {
            const result = await signInMutation.mutateAsync({ email, password });
            return result;
        } catch (error) {
            return { success: false, error };
        }
    }, [signInMutation]);

    const handleSignUp = useCallback(async (email, password, displayName, username) => {
        if (DEV_MODE) return { success: true };
        
        try {
            const result = await signUpMutation.mutateAsync({ email, password, displayName, username });
            return result;
        } catch (error) {
            return { success: false, error };
        }
    }, [signUpMutation]);

    const handleSignOut = useCallback(async () => {
        if (DEV_MODE) {
            queryClient.removeQueries({ queryKey: userKeys.all });
            router.replace("/(auth)/Login");
            return { success: true };
        }
        
        try {
            await signOutMutation.mutateAsync();
            queryClient.removeQueries({ queryKey: userKeys.all });
            router.replace("/(auth)/Login");
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    }, [signOutMutation, queryClient]);

    const handleUpdateProfile = useCallback(async (name, email, jumpNumber) => {
        if (DEV_MODE) {
            router.replace('/(tabs)/profile/Profile');
            return { success: true };
        }
        
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };
        
        try {
            const updates = {};
            if (name?.trim()) updates.name = name.trim();
            if (email?.trim()) updates.email = email.trim();
            if (jumpNumber !== undefined && !isNaN(Number(jumpNumber))) {
                updates.jumpNumber = Number(jumpNumber);
            }

            await updateProfileMutation.mutateAsync(updates);
            router.replace('/(tabs)/profile/Profile');
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    }, [updateProfileMutation]);

    const handleUploadProfileImage = useCallback(async (uri, fileName, onProgress) => {
        if (DEV_MODE) return { success: true, data: { downloadURL: uri } };
        
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        try {
            const result = await uploadImageMutation.mutateAsync({ uri, fileName, onProgress });
            return result;
        } catch (error) {
            return { success: false, error };
        }
    }, [uploadImageMutation]);

    const handleToggleLocationSave = useCallback(async (locationId) => {
        if (DEV_MODE) return true;
        
        const currentUser = getCurrentUser();
        if (!currentUser) return null;

        try {
            const result = await toggleLocationMutation.mutateAsync(locationId);
            return result.success ? result.data.saved : null;
        } catch (error) {
            return null;
        }
    }, [toggleLocationMutation]);

    const handleSubmitJump = useCallback(async (formData) => {
        if (DEV_MODE) return { success: true };
        
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };
        
        try {
            await addJumpMutation.mutateAsync(formData);
            // Also increment jump number
            await jumpNumberMutation.mutateAsync({ action: 'increment' });
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    }, [addJumpMutation, jumpNumberMutation]);

    const handleDeleteJump = useCallback(async (jumpId) => {
        if (DEV_MODE) return { success: true };
        
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };
        
        try {
            await deleteJumpMutation.mutateAsync(jumpId);
            // Also decrement jump number
            await jumpNumberMutation.mutateAsync({ action: 'decrement' });
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    }, [deleteJumpMutation, jumpNumberMutation]);

    const handleGetLoggedJumps = useCallback(async () => {
        if (DEV_MODE) {
            return [
                { id: '1', location: 'Mock Location 1', exitType: 'Building' },
                { id: '2', location: 'Mock Location 2', exitType: 'Antenna' }
            ];
        }
        
        return logbook || [];
    }, [logbook]);

    const handleSubmitLocation = useCallback(async (formData) => {
        if (DEV_MODE) return { success: true };
        
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        try {
            const result = await submitLocationMutation.mutateAsync(formData);
            return result;
        } catch (error) {
            return { success: false, error };
        }
    }, [submitLocationMutation]);

    const handleSubmitDetailUpdate = useCallback(async (formData) => {
        if (DEV_MODE) return { success: true };
        
        const currentUser = getCurrentUser();
        if (!currentUser) return { success: false, error: 'No authenticated user' };

        try {
            const result = await submitDetailMutation.mutateAsync(formData);
            return result;
        } catch (error) {
            return { success: false, error };
        }
    }, [submitDetailMutation]);

    const handleResetPassword = useCallback(async (email) => {
        if (DEV_MODE) return { success: true };
        
        try {
            const result = await resetPasswordMutation.mutateAsync(email);
            return result;
        } catch (error) {
            return { success: false, error };
        }
    }, [resetPasswordMutation]);

    const handleDeleteAccount = useCallback(async () => {
        if (DEV_MODE) return { success: true };
        
        try {
            queryClient.removeQueries({ queryKey: userKeys.all });
            const result = await deleteAccountMutation.mutateAsync();
            return result;
        } catch (error) {
            return { success: false, error };
        }
    }, [deleteAccountMutation, queryClient]);

    // Purchase function
    const handlePurchasePackage = useCallback(async (pack) => {
        if (DEV_MODE) return { success: true };
        
        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);
            updateNestedState('subscription', {
                entitlements: customerInfo.entitlements,
                isPro: customerInfo.entitlements.active["proFeatures"] !== undefined,
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }, [updateNestedState]);

    // Computed values
    const isReady = state.initialized && state.subscription.isReady;
    const isProUser = state.subscription.isPro;
    
    // Loading states from mutations and queries
    const loading = {
        auth: state.loading.auth || signInMutation.isPending || signUpMutation.isPending,
        profile: profileLoading,
        subscription: state.loading.subscription,
        action: updateProfileMutation.isPending || 
                uploadImageMutation.isPending ||
                toggleLocationMutation.isPending ||
                addJumpMutation.isPending ||
                deleteJumpMutation.isPending ||
                submitLocationMutation.isPending ||
                submitDetailMutation.isPending ||
                jumpNumberMutation.isPending,
    };

    const value = {
        // State
        ...state,
        profile: profile || {
            name: '',
            email: '',
            username: '',
            jumpNumber: 0,
            profileImage: '',
            locationIds: [],
        },
        loading,
        isReady,
        isProUser,
        
        // Auth Actions
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        deleteAccount: handleDeleteAccount,
        
        // Profile Actions
        updateProfile: handleUpdateProfile,
        updateProfileDetails: handleUpdateProfile,
        uploadProfileImage: handleUploadProfileImage,
        toggleLocationSave: handleToggleLocationSave,
        
        // Jump Management
        addJumpNumber: () => jumpNumberMutation.mutateAsync({ action: 'increment' }),
        decrementJumpNumber: () => jumpNumberMutation.mutateAsync({ action: 'decrement' }),
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

