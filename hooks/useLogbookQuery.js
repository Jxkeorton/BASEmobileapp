import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLogbook, addJump, deleteJump, getJump, updateJump } from '../services';

export const logbookKeys = {
    all: ['logbook'],
    lists: () => [...logbookKeys.all, 'list'],
    list: (userId) => [...logbookKeys.lists(), userId],
    details: () => [...logbookKeys.all, 'detail'],
    detail: (userId, jumpId) => [...logbookKeys.details(), userId, jumpId],
};

export const useLogbookQuery = (userId) => {
    return useQuery({
        queryKey: logbookKeys.list(userId),
        queryFn: () => getLogbook(userId),
        enabled: !!userId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        select: (data) => data.success ? data.data : [],
    });
};

export const useJumpQuery = (userId, jumpId) => {
    return useQuery({
        queryKey: logbookKeys.detail(userId, jumpId),
        queryFn: () => getJump(userId, jumpId),
        enabled: !!userId && !!jumpId,
        staleTime: 5 * 60 * 1000,
        select: (data) => data.success ? data.data : null,
    });
};

export const useAddJumpMutation = (userId) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (jumpData) => addJump(userId, jumpData),
        onSuccess: (data) => {
            if (data.success) {
                // Add new jump to the list
                queryClient.setQueryData(logbookKeys.list(userId), (old = []) => [
                    ...old,
                    data.data
                ]);
                
                // Invalidate user profile to update jump count
                queryClient.invalidateQueries({ 
                    queryKey: userKeys.profile(userId) 
                });
            }
        },
        onError: (error) => {
            console.error('Failed to add jump:', error);
        },
    });
};

export const useDeleteJumpMutation = (userId) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (jumpId) => deleteJump(userId, jumpId),
        onMutate: async (jumpId) => {
            await queryClient.cancelQueries({ queryKey: logbookKeys.list(userId) });
            
            const previousJumps = queryClient.getQueryData(logbookKeys.list(userId));
            
            queryClient.setQueryData(logbookKeys.list(userId), (old = []) =>
                old.filter(jump => jump.id !== jumpId)
            );
            
            return { previousJumps };
        },
        onError: (err, jumpId, context) => {
            queryClient.setQueryData(logbookKeys.list(userId), context.previousJumps);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ 
                queryKey: userKeys.profile(userId) 
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: logbookKeys.list(userId) });
        },
    });
};