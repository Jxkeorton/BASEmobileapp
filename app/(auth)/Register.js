import { Button, ActivityIndicator, Checkbox } from 'react-native-paper'
import { useState } from 'react';
import { useRouter } from 'expo-router'
import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, TextInput } from 'react-native';
import { appSignUp } from '../../store';
import TermsAndConditionsScreen from '../../components/Terms';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [termsChecked, setTermsChecked] = useState(false);


    const router = useRouter()

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <KeyboardAvoidingView behavior="padding" >
                    <TextInput value={displayName} style={styles.textInput} placeholder='Name' autoCapitalize='none' onChangeText={(text) => setDisplayName(text)}></TextInput>
                    <TextInput value={username} style={styles.textInput} placeholder='Username' autoCapitalize='none' onChangeText={(text) => setUsername(text)}></TextInput>
                    <TextInput value={email} style={styles.textInput} placeholder='Email' autoCapitalize='none' onChangeText={(text) => setEmail(text)}></TextInput>
                    <TextInput secureTextEntry={true} value={password} style={styles.textInput} placeholder='Password' autoCapitalize='none' onChangeText={(text) => setPassword(text)}></TextInput>

                    <View style={styles.checkboxContainer}>
                        <Checkbox
                            status={termsChecked ? 'checked' : 'unchecked'}
                            onPress={() => setTermsChecked(!termsChecked)}
                        />
                        <Text>
                            I agree to the <Button textColor='black' onPress={() => router.push('/components/Terms.js')}>Terms and Conditions</Button>
                        </Text>
                    </View>
            
                    {loading ? (<ActivityIndicator size="small" color="#0000ff" /> 
                    ) : (
                    <>
                    <Button 
                        title="Register" 
                        mode="contained"
                        buttonColor='black'
                        onPress={async () => {
                            if (!termsChecked) {
                                Alert.alert('Terms and Conditions', 'You must agree to the Terms and Conditions to register.');
                                return;
                              }
                            setLoading(true);
                            const resp = await appSignUp(email, password, displayName, username);
                            if (resp?.user) {
                                router.replace("/(tabs)/profile/Profile");
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
                                    } else if (errorCode === 'auth/username-taken') {
                                        Alert.alert('Username Taken', 'The username you entered is already in use. Please choose a different username.');
                                    }
                                    else {
                                        Alert.alert('Registration Error', 'Please try again.');
                                    }
                            }
                            setLoading(false);
                        }}>Register</Button>
                    
                    <Button textColor='black' onPress={() => router.replace("/Login")}>Already have an account ?</Button>
                    </>
                    )}

                    {/* Privacy Policy Link */}
                    <Button 
                        textColor='black' 
                        style={styles.privacyPolicyLink}
                        onPress={() => {
                        router.push('/components/PrivacyPolicy.js');
                        }}
                    >
                        Privacy Policy
                    </Button>

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
    textInput: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
    },
    text: {
        textAlign: 'center',
        marginTop: 10,
        color: '#888'
    },
    privacyPolicyLink: {
        textAlign: 'center',
        color: '#00ABF0',
        textDecorationLine: 'underline', 
        marginTop: 20, 
    }
})