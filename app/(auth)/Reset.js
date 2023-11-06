import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, Image } from 'react-native';
import React, {useState} from 'react';
import { Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { appResetPassword } from '../../store';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

const Reset = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

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
                onChangeText={(text) => setEmail(text)}
              ></TextInput>
    
              {loading ? (
                <ActivityIndicator size="small" color="#007AFF" /> // Use blue color for the loading indicator
              ) : (
                <>
                  <Button
                    title="Send reset link"
                    mode="contained"
                    style={styles.sendResetButton} // Add custom styles for the send reset button
                    onPress={async () => {
                      setLoading(true);
                      const resp = await appResetPassword(email);
                      if (resp?.success) {
                        router.replace("/(auth)/Login");
                        Toast.show({
                          type: 'success', // You can customize the type (success, info, error, etc.)
                          text1: 'Reset password email sent',
                          position: 'top',
                        });
                      } else {
                        if (resp.error) { // Check if error object exists
                          console.log("Firebase Error Details:", resp.error); // Log the error details
                          const errorCode = resp.error.code;
                  
                          if (errorCode === 'auth/invalid-email') {
                            Alert.alert('Invalid Email', 'Please enter a valid email address.');
                          } else if (errorCode === 'auth/user-not-found') {
                            Alert.alert('User Not Found', 'User not found');
                          } else {
                            Alert.alert('Error', `Error Code: ${errorCode}`);
                          }
                        } else {
                          console.log("Unknown Error Details:", resp); // Log unknown error details
                          Alert.alert('Error', 'An unknown error occurred');
                        }
                  
                        setLoading(false);
                      }
                    }}
                  >
                    Send Reset Email
                  </Button>
                  <Button textColor='#007AFF' onPress={() => router.replace("/Login")} style={styles.button}>
                    Login/Register
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
        marginVertical: 10, // Increase vertical margin for text input
        height: 40,
        backgroundColor: 'white', // Use white background for text input
        borderRadius: 8, // Increase border radius
        padding: 10,
        marginBottom: 20,
      },
      sendResetButton: {
        backgroundColor: '#007AFF', 
        marginVertical: 10, 
      },
      button: {
        backgroundColor: 'transparent', // Make the background transparent
        borderWidth: 1,
        borderColor: '#007AFF', // Use blue color for button border
        marginVertical: 10, // Add vertical margin
      },
    });
    
    export default Reset;