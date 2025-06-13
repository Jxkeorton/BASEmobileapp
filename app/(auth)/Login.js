import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Image, Alert, TextInput } from 'react-native';
import React, {useState} from 'react';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useUser } from '../../providers/UserProvider';
import { router } from 'expo-router';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn } = useUser();

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

          {loading ? (
            <ActivityIndicator size="small" color="#007AFF" /> 
          ) : (
            <>
              <Button
                title="Login"
                mode="contained"
                style={styles.loginButton} 
                onPress={async () => {
                  setLoading(true);
                  const resp = await signIn(email, password);
                  if (resp?.success) { 
                    router.replace("/(tabs)/map");
                  } else {
                    console.log("Sign in error", resp.error);
                    const errorCode = resp.error?.code;
                    if (errorCode === 'auth/invalid-email') {
                      Alert.alert('Invalid Email', 'Please enter a valid email address.');
                    } else if (errorCode === 'auth/user-not-found') {
                      Alert.alert('Invalid Email', 'User not found');
                    } else if (errorCode === 'auth/wrong-password') {
                      Alert.alert('Password Error', 'Wrong password. Please try again.');
                    } else {
                      Alert.alert('Login Error', 'Invalid email or password. Please try again.');
                    }
                  }
                  setLoading(false);
                }}
              >
                Login
              </Button>
              <Button textColor='#007AFF' title="Register" onPress={() => router.replace("Register")} style={styles.button}>
                Sign Up here!
              </Button>
              <Button textColor='#007AFF' title="Forgot Password" onPress={() => router.replace("Reset")} style={styles.button}>
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