import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { kyInstance } from '../../services/open-api/kyClient';

const EmailConfirmation = () => {
  const [isResending, setIsResending] = useState(false);

  const resendConfirmation = async () => {
    setIsResending(true);
    try {
      // Call resend endpoint (you'll need to create this)
      await kyInstance.post('resend-confirmation').json();
      Alert.alert('Email Sent', 'Confirmation email has been resent. Please check your inbox.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend confirmation email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check Your Email</Text>
      <Text style={styles.message}>
        We've sent you a confirmation email. Please click the link in the email to activate your account.
      </Text>
      
      <Button 
        mode="contained" 
        onPress={resendConfirmation}
        loading={isResending}
        style={styles.button}
      >
        Resend Confirmation Email
      </Button>
      
      <Button 
        mode="text" 
        onPress={() => router.replace("/(auth)/Login")}
        style={styles.button}
      >
        Back to Login
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    marginVertical: 10,
  },
});

export default EmailConfirmation;