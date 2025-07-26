import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, Image } from 'react-native';
import { useState } from 'react';
import { Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { kyInstance } from '../../services/open-api/kyClient';

const Reset = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const resetPasswordPost = async (email) => {
        try {
            const response = await kyInstance.post('reset-password', {
                json: { email }
            }).json();
            return response;
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: error.message };
        }
    }

    const handlePasswordReset = async () => {
        // Validation
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        
        if (!email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setLoading(true);
        const resp = await resetPasswordPost(email);
        setLoading(false);
        
        if (resp?.success) { 
            router.replace("/(auth)/Login");
            Toast.show({
                type: 'success',
                text1: 'Reset password email sent',
                text2: 'Check your email for the reset link',
                position: 'top',
            });
        } else {
            Alert.alert('Error', resp.error || 'Failed to send reset email');
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <KeyboardAvoidingView behavior='padding'>
                    <View style={styles.imageContainer}> 
                        <Image
                            source={require('../../assets/bitmap.png')}
                            style={styles.image}
                        />
                    </View>
                    <TextInput
                        value={email}
                        style={styles.textInput}
                        placeholder='Email'
                        autoCapitalize='none'
                        keyboardType='email-address'
                        onChangeText={(text) => setEmail(text)}
                    />

                    {loading ? (
                        <ActivityIndicator size="small" color="#007AFF" />
                    ) : (
                        <>
                            <Button
                                mode="contained"
                                style={styles.sendResetButton}
                                onPress={handlePasswordReset}
                            >
                                Send Reset Email
                            </Button>
                            <Button 
                                textColor='#007AFF' 
                                onPress={() => router.replace("/(auth)/Login")} 
                                style={styles.button}
                            >
                                Back to Login
                            </Button>
                        </>
                    )}
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
        height: 40,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    sendResetButton: {
        backgroundColor: '#007AFF', 
        marginVertical: 10, 
    },
    button: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#007AFF',
        marginVertical: 10,
    },
});

export default Reset;