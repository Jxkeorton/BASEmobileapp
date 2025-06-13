import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    signIn, 
    signUp, 
    signOutUser, 
    resetPassword, 
    deleteCompleteUser,
    createCompleteUser 
} from '../services';

// Query Keys
export const authKeys = {
    all: ['auth'],
    user: () => [...authKeys.all, 'user'],
    profile: (userId) => [...authKeys.all, 'profile', userId],
};

// Auth Mutations
export const useSignInMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ email, password }) => signIn(email, password),
        onSuccess: (data) => {
            queryClient.setQueryData(authKeys.user(), data);
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
    });
};

export const useSignUpMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ email, password, displayName, username }) => 
            createCompleteUser(email, password, displayName, username),
        onSuccess: (data) => {
            queryClient.setQueryData(authKeys.user(), data);
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
    });
};

export const useSignOutMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: signOutUser,
        onSuccess: () => {
            queryClient.clear();
        },
    });
};

export const useResetPasswordMutation = () => {
    return useMutation({
        mutationFn: (email) => resetPassword(email),
    });
};

export const useDeleteAccountMutation = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: deleteCompleteUser,
        onSuccess: () => {
            queryClient.clear();
        },
    });
};