import { Button, TextInput } from 'react-native-paper'
import { useState } from 'react';
import { useRouter } from 'expo-router'
import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import { appSignUp } from '../../store';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');

    const router = useRouter()

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                    <TextInput value={displayName} style={styles.textInput} placeholder='Name' autoCapitalize='none' onChangeText={(text) => setDisplayName(text)}></TextInput>
                    <TextInput value={email} style={styles.textInput} placeholder='Email' autoCapitalize='none' onChangeText={(text) => setEmail(text)}></TextInput>
                    <TextInput secureTextEntry={true} value={password} style={styles.textInput} placeholder='Password' autoCapitalize='none' onChangeText={(text) => setPassword(text)}></TextInput>

                    <Button title="Register" 
                        onPress={async () => {
                            const resp = await appSignUp(email, password, displayName);
                            if (resp?.user) {
                                router.replace("/(tabs)/Profile");
                            } else {
                                console.log(resp.error);
                                const errorCode = resp.error?.code;
                                    if (errorCode === 'auth/email-already-in-use' ) {
                                        Alert.alert('Invalid Email', 'Email already exists');
                                    } else if (errorCode === 'auth/invalid-display-name') {
                                        Alert.alert('Invalid Name','Please enter a username')
                                    } else if (errorCode === 'auth/invalid-email'){
                                        Alert.alert('Invalid Email', 'Please enter a valid email');
                                    } else if (errorCode === 'auth/invalid-password'){
                                        Alert.alert('Invalid Password', 'Must be atleast 6 characters');
                                    } else {
                                        Alert.alert('Registration Error', 'Please try again.');
                                    }
                            }
                        }}>Register</Button>
                    
                    <Button onPress={() => router.replace("/Login")}>Already have an account ?</Button>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
        
    )
};

export default Register;

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