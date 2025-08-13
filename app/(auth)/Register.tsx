import { Button, ActivityIndicator, Checkbox, Text } from 'react-native-paper'
import { useState } from 'react';
import { router } from 'expo-router'
import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, TextInput, Image } from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { useKyClient } from '../../services/kyClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setDisplayName] = useState('');
    const [termsChecked, setTermsChecked] = useState(false);
    const client = useKyClient();

    const { updateUser } = useAuth();

    const signUpMutation = useMutation({
        mutationFn: async ({ email, password, name }: { email: string; password: string; name: string }) => {
            return client.POST('/signup', {
                    body: { email, password, name }
            });
        },
        onSuccess: async (response) => {
            if (response.response.status === 200) {

                const res = response.response
                // Check if email confirmation is required
                if (!res.headers.) {
                    Alert.alert(
                        'Check Your Email', 
                        response.data.message || 'Please check your email and click the confirmation link to activate your account.',
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
                } else {
                    // Auto-login if session exists (no confirmation required)
                    await AsyncStorage.setItem('auth_token', response.data.session.access_token);
                    await AsyncStorage.setItem('refresh_token', response.data.session.refresh_token);
                    updateUser(response.data.user);
                    router.replace("/(tabs)/map");
                }
            } 
        },
        onError: (error) => {
            if (error.response?.status === 400) {
                error.response.json().then(errorData => {
                    if (errorData.details) {
                        // Handle Zod validation errors
                        const validationErrors = errorData.details;
                        let errorMessage = 'Please check your input:\n';
                        validationErrors.forEach(err => {
                            errorMessage += `• ${err.message}\n`;
                        });
                        Alert.alert('Invalid Input', errorMessage);
                    } else {
                        Alert.alert('Registration Error', errorData.error || 'Please check your input and try again.');
                    }
                }).catch(() => {
                    Alert.alert('Registration Error', 'Please check your input and try again.');
                });
            } else if (error.response?.status === 409) {
                Alert.alert('Registration Error', 'Email already exists. Please use a different email or try logging in.');
            } else if (error.response?.status === 403) {
                Alert.alert('API Error', 'Invalid API key. Please contact support.');
            } else {
                Alert.alert('Network Error', 'Please check your connection and try again.');
            }
        }
    });

    const handleSignUp = async () => {
        // Validation
        if (!email || !password || !name) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (!termsChecked) {
            Alert.alert('Terms and Conditions', 'You must agree to the Terms and Conditions to register.');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return;
        }

        // Basic password validation
        if (password.length < 6) {
            Alert.alert('Invalid Password', 'Password must be at least 6 characters');
            return;
        }

        // Note: Username will need to be set later via profile update
        signUpMutation.mutate({ email, password, name: name });
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <KeyboardAvoidingView behavior="padding">
            <View style={styles.imageContainer}> 
                <Image
                    source={require('../../assets/bitmap.png')}
                    style={styles.image}
                />
            </View>
              <TextInput
                value={name}
                style={styles.textInput}
                placeholder='Name'
                autoCapitalize='words'
                onChangeText={(text) => setDisplayName(text.trim())}
              />
              <TextInput
                value={email}
                style={styles.textInput}
                placeholder='Email'
                autoCapitalize='none'
                keyboardType='email-address'
                onChangeText={(text) => setEmail(text.trim().toLowerCase())}
              />
              <TextInput
                secureTextEntry={true}
                value={password}
                style={styles.textInput}
                placeholder='Password'
                autoCapitalize='none'
                onChangeText={(text) => setPassword(text)}
              />
    
              <View style={styles.checkboxContainer}>
                <View style={styles.checkbox}>
                  <Checkbox
                    status={termsChecked ? 'checked' : 'unchecked'}
                    onPress={() => setTermsChecked(!termsChecked)}
                    color="white"
                  />
                </View>
                <Button textColor='black' onPress={() => router.navigate('/AuthTerms')}>
                 <Text style={styles.packageText}>I agree to the Terms and Conditions</Text> 
                </Button>
              </View>
    
              {signUpMutation.isPending ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <>
                  <Button
                    mode="contained"
                    style={styles.registerButton}
                    onPress={handleSignUp}
                  >
                    Register
                  </Button>
    
                  <Button 
                    onPress={() => router.replace("/(auth)/Login")} 
                    textColor='#007AFF' 
                    style={styles.button}
                  > 
                    Already have an account?
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
        width: 100,
        height: 100,
    },
    textInput: {
        marginVertical: 10,
        height: 50,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
    },
    registerButton: {
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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkbox: {
        borderColor: 'white', 
        borderWidth: 2,
        borderRadius: 4, 
        padding: 1,
        marginRight: 10, 
    },
    packageText: {
        fontSize: 14,
        marginBottom: 5,
        color: 'white',
        fontWeight: 'bold',
        textShadowColor: 'black',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 2,
    },
});
    
export default Register;