import { Button, ActivityIndicator, Checkbox , Text} from 'react-native-paper'
import { useState } from 'react';
import { router } from 'expo-router'
import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, TextInput, Image } from 'react-native';
import { useUser } from '../../providers/UserProvider';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [termsChecked, setTermsChecked] = useState(false);

    const { signUp } = useUser();

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
                value={displayName}
                style={styles.textInput}
                placeholder='Name'
                autoCapitalize='none'
                onChangeText={(text) => setDisplayName(text)}
              ></TextInput>
              <TextInput
                value={username}
                style={styles.textInput}
                placeholder='Username'
                autoCapitalize='none'
                onChangeText={(text) => setUsername(text)}
              ></TextInput>
              <TextInput
                value={email}
                style={styles.textInput}
                placeholder='Email'
                autoCapitalize='none'
                onChangeText={(text) => setEmail(text)}
              ></TextInput>
              <TextInput
                secureTextEntry={true}
                value={password}
                style={styles.textInput}
                placeholder='Password'
                autoCapitalize='none'
                onChangeText={(text) => setPassword(text)}
              ></TextInput>
    
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
    
              {loading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <>
                  <Button
                    title="Register"
                    mode="contained"
                    style={styles.registerButton}
                    onPress={async () => {
                      if (!termsChecked) {
                        Alert.alert('Terms and Conditions', 'You must agree to the Terms and Conditions to register.');
                        return;
                      }
                      setLoading(true);
                      const resp = await signUp(email, password, displayName, username);
                      if (resp?.success) {
                        router.replace("/(tabs)/profile/Profile");
                      } else {
                        console.log(resp.error);
                        const errorCode = resp.error?.code;
                        if (errorCode === 'auth/email-already-in-use') {
                          Alert.alert('Invalid Email', 'Email already exists');
                        } else if (errorCode === 'auth/invalid-display-name') {
                          Alert.alert('Invalid Name', 'Please enter a username');
                        } else if (errorCode === 'auth/invalid-email') {
                          Alert.alert('Invalid Email', 'Please enter a valid email');
                        } else if (errorCode === 'auth/invalid-password') {
                          Alert.alert('Invalid Password', 'Must be at least 6 characters');
                        } else if (errorCode === 'auth/username-taken') {
                          Alert.alert('Username Taken', 'The username you entered is already in use. Please choose a different username.');
                        } else {
                          Alert.alert('Registration Error', 'Please try again.');
                        }
                      }
                      setLoading(false);
                    }}
                  >
                    Register
                  </Button>
    
                  <Button onPress={() => router.replace("/Login")} textColor='#007AFF' style={styles.button}> 
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