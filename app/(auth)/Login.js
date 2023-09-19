import { View, StyleSheet, Button, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import React, {useState} from 'react';
import { ActivityIndicator, TextInput } from 'react-native-paper';
import { appSignIn } from '../../store';
import { useRouter } from 'expo-router';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
            <KeyboardAvoidingView behavior='padding' >
                <TextInput value={email} style={styles.textInput} placeholder='Email' autoCapitalize='none' onChangeText={(text) => setEmail(text)}></TextInput>
                <TextInput secureTextEntry={true} value={password} style={styles.textInput} placeholder='Password' autoCapitalize='none' onChangeText={(text) => setPassword(text)}></TextInput>
                
                {loading ? <ActivityIndicator size="large" color="#0000ff" /> 
                : 
                <>
                    <Button title="Login" 
                        onPress={async () => {
                            const resp = await appSignIn(email, password);
                            if (resp?.user) {
                                router.replace("/(tabs)/map");
                            } else {
                                console.log(resp.error);
                                const errorCode = resp.error?.code;
                                    if (errorCode === 'auth/invalid-email' ) {
                                        Alert.alert('Invalid Email', 'Please enter a valid email address.');
                                    } else if (errorCode === 'auth/user-not-found') {
                                        Alert.alert('Invalid Email','User not found')
                                    } else if (errorCode === 'auth/wrong-password'){
                                        Alert.alert('Password Error', 'Wrong password. Please try again.');
                                    } else {
                                        Alert.alert('Login Error', 'Invalid email or password. Please try again.');
                                    }
                            }
                        }} />   
                    <Button title="Register" onPress={() => router.replace("Register")} />
                    <Button title="Forgot Password" onPress={() => router.replace("Reset")} />
                </>
                }
            </KeyboardAvoidingView>
        </View>
        </TouchableWithoutFeedback>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center',
    },
    input: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
    }
})