import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, Image } from 'react-native';
import {useState} from 'react';
import { Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

const Reset = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // TODO: replace reset password function with new supabase method
    const resetPassword = () => {}

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
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <>
                  <Button
                    title="Send reset link"
                    mode="contained"
                    style={styles.sendResetButton}
                    onPress={async () => {
                      setLoading(true);
                      const resp = await resetPassword(email);
                      if (resp?.success) { 
                        router.replace("/(auth)/Login");
                        Toast.show({
                          type: 'success',
                          text1: 'Reset password email sent',
                          position: 'top',
                        });
                      } else {
                        if (resp.error) {
                          console.log("Firebase Error Details:", resp.error);
                          const errorCode = resp.error.code;
                  
                          if (errorCode === 'auth/invalid-email') {
                            Alert.alert('Invalid Email', 'Please enter a valid email address.');
                          } else if (errorCode === 'auth/user-not-found') {
                            Alert.alert('User Not Found', 'User not found');
                          } else {
                            Alert.alert('Error', `Error Code: ${errorCode}`);
                          }
                        } else {
                          console.log("Unknown Error Details:", resp);
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