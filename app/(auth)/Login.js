import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Image, Alert, TextInput } from 'react-native';
import React, {useState} from 'react';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useAuth } from '../../providers/AuthProvider';
import { kyInstance } from '../../services/open-api/kyClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { updateUser } = useAuth();

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // Direct API call using Ky
            const response = await kyInstance.post('auth/signin', {
                json: { email, password }
            }).json();

            if (response.success) {
                // Store token and user data
                await AsyncStorage.setItem('auth_token', response.data.session.access_token);
                await AsyncStorage.setItem('refresh_token', response.data.session.refresh_token);
                
                // Update auth context
                updateUser(response.data.user);
                
                // Navigate to main app
                router.replace("/(tabs)/map");
            } else {
                Alert.alert('Login Error', response.error || 'Invalid email or password. Please try again.');
            }
        } catch (error) {
            console.error('Sign in error:', error);
            
            // Handle different error types
            if (error.response?.status === 401) {
                Alert.alert('Login Error', 'Invalid email or password. Please try again.');
            } else if (error.response?.status === 400) {
                Alert.alert('Invalid Input', 'Please check your email and password format.');
            } else {
                Alert.alert('Network Error', 'Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.imageContainer}> 
                    <Image
                        source={require('../../assets/bitmap.png')}
                        style={styles.image}
                    />
                </View>
                <KeyboardAvoidingView behavior='padding'>
                    <TextInput
                        value={email}
                        style={styles.textInput}
                        placeholder='Email'
                        autoCapitalize='none'
                        keyboardType='email-address'
                        onChangeText={(text) => setEmail(text.trim())}
                    />
                    <TextInput
                        secureTextEntry={true}
                        value={password}
                        style={styles.textInput}
                        placeholder='Password'
                        autoCapitalize='none'
                        onChangeText={(text) => setPassword(text)}
                    />

                    {loading ? (
                        <ActivityIndicator size="small" color="#007AFF" /> 
                    ) : (
                        <>
                            <Button
                                title="Login"
                                mode="contained"
                                style={styles.loginButton} 
                                onPress={handleSignIn}
                            >
                                Login
                            </Button>
                            <Button 
                                textColor='#007AFF' 
                                title="Register" 
                                onPress={() => router.replace("Register")} 
                                style={styles.button}
                            >
                                Sign Up here!
                            </Button>
                            <Button 
                                textColor='#007AFF' 
                                title="Forgot Password" 
                                onPress={() => router.replace("Reset")} 
                                style={styles.button}
                            >
                                Forgot Password
                            </Button>
                        </>
                    )}
                    <Button
                        textColor='#007AFF'
                        style={styles.privacyPolicyLink}
                        onPress={() => {
                            router.navigate('/AuthPrivacyPolicy');
                        }}
                    >
                        Privacy Policy
                    </Button>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black', 
        padding: 20, 
    },
    imageContainer: {
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 20,
    },
    image: {
        width: 200,
        height: 200,
    },
    textInput: {
        marginVertical: 10, 
        height: 50,
        backgroundColor: 'white', 
        borderRadius: 8, 
        padding: 10,
    },
    loginButton: {
        backgroundColor: '#007AFF', 
        marginVertical: 10, 
    },
    button: {
        backgroundColor: 'transparent', 
        borderWidth: 1,
        borderColor: '#007AFF', 
        marginVertical: 10, 
    },
    privacyPolicyLink: {
        textAlign: 'center',
        color: '#00ABF0',
        textDecorationLine: 'underline',
        marginTop: 20,
    },
});

export default Login;