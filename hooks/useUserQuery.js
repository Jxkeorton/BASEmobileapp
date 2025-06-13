import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getUserProfile, 
    updateUserProfile, 
    uploadProfileImage,
    toggleLocationSave,
    incrementJumpNumber,
    decrementJumpNumber 
} from '../services';

export const userKeys = {
    all: ['user'],
    profile: (userId) => [...userKeys.all, 'profile', userId],
    savedLocations: (userId) => [...userKeys.all, 'savedLocations', userId],
};

export const useUserProfileQuery = (userId) => {
    return useQuery({
        queryKey: userKeys.profile(userId),
        queryFn: async () => {
            const result = await getUserProfile(userId);
            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to fetch profile');
            }
            return result.data;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useUpdateProfileMutation = (userId) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (updates) => {
            const result = await updateUserProfile(userId, updates);
            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to update profile');
            }
            return result.data;
        },
        onMutate: async (newData) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: userKeys.profile(userId) });
            
            // Snapshot previous value
            const previousProfile = queryClient.getQueryData(userKeys.profile(userId));
            
            // Optimistically update
            queryClient.setQueryData(userKeys.profile(userId), (old) => ({
                ...old,
                ...newData,
            }));
            
            return { previousProfile };
        },
        onError: (err, newData, context) => {
            // Rollback on error
            if (context?.previousProfile) {
                queryClient.setQueryData(userKeys.profile(userId), context.previousProfile);
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: userKeys.profile(userId) });
        },
    });
};

export const useUploadProfileImageMutation = (userId) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ uri, fileName, onProgress }) => {
            const result = await uploadProfileImage(userId, uri, fileName, onProgress);
            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to upload image');
            }
            return result.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(userKeys.profile(userId), (old) => ({
                ...old,
                profileImage: data.downloadURL,
            }));
        },
    });
};

export const useToggleLocationSaveMutation = (userId) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (locationId) => {
            const result = await toggleLocationSave(userId, locationId);
            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to toggle location');
            }
            return result.data;
        },
        onMutate: async (locationId) => {
            await queryClient.cancelQueries({ queryKey: userKeys.profile(userId) });
            
            const previousProfile = queryClient.getQueryData(userKeys.profile(userId));
            const numericId = typeof locationId === 'string' ? parseInt(locationId) : locationId;
            
            queryClient.setQueryData(userKeys.profile(userId), (old) => {
                if (!old) return old;
                const currentIds = old.locationIds || [];
                const isCurrentlySaved = currentIds.includes(numericId);
                
                return {
                    ...old,
                    locationIds: isCurrentlySaved 
                        ? currentIds.filter(id => id !== numericId)
                        : [...currentIds, numericId]
                };
            });
            
            return { previousProfile, locationId: numericId };
        },
        onError: (err, locationId, context) => {
            if (context?.previousProfile) {
                queryClient.setQueryData(userKeys.profile(userId), context.previousProfile);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.profile(userId) });
            queryClient.invalidateQueries({ queryKey: userKeys.savedLocations(userId) });
        },
    });
};

export const useJumpNumberMutation = (userId) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ action, count }) => {
            let result;
            if (action === 'increment') {
                result = await incrementJumpNumber(userId);
            } else if (action === 'decrement') {
                result = await decrementJumpNumber(userId);
            } else {
                result = await updateUserProfile(userId, { jumpNumber: count });
            }
            
            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to update jump number');
            }
            return result.data;
        },
        onMutate: async ({ action, count }) => {
            await queryClient.cancelQueries({ queryKey: userKeys.profile(userId) });
            
            const previousProfile = queryClient.getQueryData(userKeys.profile(userId));
            
            queryClient.setQueryData(userKeys.profile(userId), (old) => {
                if (!old) return old;
                
                let newJumpNumber;
                if (action === 'increment') {
                    newJumpNumber = (old.jumpNumber || 0) + 1;
                } else if (action === 'decrement') {
                    newJumpNumber = Math.max(0, (old.jumpNumber || 0) - 1);
                } else {
                    newJumpNumber = count;
                }
                
                return { ...old, jumpNumber: newJumpNumber };
            });
            
            return { previousProfile };
        },
        onError: (err, variables, context) => {
            if (context?.previousProfile) {
                queryClient.setQueryData(userKeys.profile(userId), context.previousProfile);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.profile(userId) });
        },
    });
};