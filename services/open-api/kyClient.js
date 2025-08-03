import ky from 'ky';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Ky instance with base configuration
export const kyInstance = ky.create({
    prefixUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    headers: {
        'x-api-key': process.env.EXPO_PUBLIC_API_KEY,
    },
    timeout: 30000,
    retry: {
        limit: 2,
        methods: ['get'],
    },
    hooks: {
        beforeRequest: [
            async (request) => {
                const token = await AsyncStorage.getItem('auth_token');
                
                // Add authorization header if token exists
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`);
                }

                // Only set Content-Type for requests that actually have a JSON body
                const method = request.method.toLowerCase();
                const hasJsonBody = method === 'post' || 
                                   (method === 'put' && request.body) || 
                                   (method === 'patch' && request.body);
                
                if (hasJsonBody && !request.headers.get('Content-Type')) {
                    request.headers.set('Content-Type', 'application/json');
                }

                // For GET and DELETE requests, remove any Content-Type header
                if (method === 'get' || method === 'delete') {
                    request.headers.delete('Content-Type');
                }
            }
        ]
    }
});