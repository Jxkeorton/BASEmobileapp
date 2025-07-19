import ky from 'ky';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Ky instance with base configuration
export const kyInstance = ky.create({
    prefixUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
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
            for (const [key, value] of request.headers.entries()) {
                console.log(`    ${key}: ${value}`);
            }
            if (token) {
                request.headers.set('Authorization', `Bearer ${token}`);
            }
        }
    ]
    }
});


