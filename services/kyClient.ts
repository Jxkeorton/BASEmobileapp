import ky from 'ky';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createClient from 'openapi-fetch';
import { paths } from '../types/api';

let baseUrl = ''
if(process.env.EXPO_PUBLIC_API_BASE_URL !== undefined){
    baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
};

// Create Ky instance with base configuration
export const kyInstance = (timeout: number) => 
    ky.create({
    headers: {
        'x-api-key': process.env.EXPO_PUBLIC_API_KEY,
    },
    timeout: timeout,
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

                const method = request.method.toLowerCase();
                
                // Check if request has a body (for POST, PUT, PATCH, DELETE with body)
                const hasBody = request.body !== null && request.body !== undefined;
                
                // Set Content-Type for requests with JSON body
                if (hasBody && !request.headers.get('Content-Type')) {
                    request.headers.set('Content-Type', 'application/json');
                }
                
                // Only remove Content-Type for GET requests (they never have a body)
                if (method === 'get') {
                    request.headers.delete('Content-Type');
                }
            }
        ]
    }
});

export const useKyClient = () => {
    return createClient<paths>({
        baseUrl,
        fetch: kyInstance(30000),
    })
}