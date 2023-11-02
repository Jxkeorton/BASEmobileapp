import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, Image } from 'react-native';
import React, {useState} from 'react';
import { Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { appResetPassword } from '../../store';
import { useRouter } from 'expo-router';

const Reset = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

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
                      if (resp?.user) {
                        router.replace("/(auth)/Login");
                      } else {
                        console.log(resp.error);
                        const errorCode = resp.error?.code;
                        if (errorCode === 'auth/invalid-email') {
                          Alert.alert('Invalid Email', 'Please enter a valid email address.');
                        } else if (errorCode === 'auth/user-not-found') {
                          Alert.alert('Invalid Email', 'User not found');
                        } else {
                          Alert.alert('Reset Password Error', 'Please try again.');
                        }
                      }
                      setLoading(false);
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