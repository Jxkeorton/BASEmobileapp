import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Image, Alert, TextInput } from 'react-native';
import {useState} from 'react';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useAuth } from '../../providers/AuthProvider';
import { kyInstance } from '../../services/open-api/kyClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { updateUser } = useAuth();

    const signInMutation = useMutation({
        mutationFn: async ({ email, password }) => {
            return kyInstance.post('signin', {
                json: { email, password }
            }).json();
        },
        onSuccess: async (response) => {
            if (response.success) {
                // Store token and user data using simple storage
                await AsyncStorage.setItem('auth_token', response.data.session.access_token);
                await AsyncStorage.setItem('refresh_token', response.data.session.refresh_token);
                
                // Update auth context
                updateUser(response.data.user);
                
                // Navigate to main app
                router.replace("/(tabs)/map");
            } else {
                Alert.alert('Login Error', response.error || 'Invalid email or password. Please try again.');
            }
        },
        onError: async (error) => {
            console.error('Sign in error:', error);
            
            try {
                const errorData = await error.response.json();
                console.error('Sign in error data:', errorData);
                
                // Handle different error types
                if (errorData.emailUnconfirmed === true) {
                    Alert.alert(
                        'Check Your Email', 
                        errorData.error || 'Please check your email and click the confirmation link to activate your account.',
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    router.replace({
                                        pathname: "/(auth)/EmailConfirmation",
                                        params: { email: email }
                                    });
                                }
                            }
                        ]
                    );
                    return; // Important: return here to prevent other error handling
                }
                
                // Handle other error types
                if (error.response?.status === 401) {
                    Alert.alert('Login Error', 'Invalid email or password. Please try again.');
                } else if (error.response?.status === 400) {
                    Alert.alert('Invalid Input', 'Please check your email and password format.');
                } else {
                    Alert.alert('Network Error', 'Please check your connection and try again.');
                }
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
                Alert.alert('Network Error', 'Please check your connection and try again.');
            }
        }
    });

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        signInMutation.mutate({ email, password });
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