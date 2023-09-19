import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import React, {useState} from 'react';
import { Button, TextInput } from 'react-native-paper';
import { appResetPassword } from '../../store';
import { useRouter } from 'expo-router';

const Reset = () => {
    const [email, setEmail] = useState('');

    const router = useRouter();

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <KeyboardAvoidingView behavior='padding'>
                    <TextInput value={email} style={styles.textInput} placeholder='Email' autoCapitalize='none' onChangeText={(text) => setEmail(text)}></TextInput>

                    <Button title="Send reset link" 
                        onPress={async () => {
                            const resp = await appResetPassword(email);
                            if (resp?.user) {
                                router.replace("/(auth)/Login");
                            } else {
                                console.log(resp.error);
                                const errorCode = resp.error?.code;
                                    if (errorCode === 'auth/invalid-email' ) {
                                        Alert.alert('Invalid Email', 'Please enter a valid email address.');
                                    } else if (errorCode === 'auth/user-not-found') {
                                        Alert.alert('Invalid Email','User not found')
                                    } else {
                                        Alert.alert('Reset Password Error', 'Please try again.');
                                    }
                            }
                        }} >Send Reset Email</Button> 
                    <Button onPress={() => router.replace("/Login")}>Login/Register</Button>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    )
};

export default Reset;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center',
    },
    textInput: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
    }
})