import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitLocation, submitDetailUpdate } from '../services';

export const submissionKeys = {
    all: ['submissions'],
    byUser: (userId) => [...submissionKeys.all, userId],
};

export const useSubmitLocationMutation = (userId) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (formData) => submitLocation(userId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ 
                queryKey: submissionKeys.byUser(userId) 
            });
        },
    });
};

export const useSubmitDetailUpdateMutation = (userId) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (formData) => submitDetailUpdate(userId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ 
                queryKey: submissionKeys.byUser(userId) 
            });
        },
    });
};