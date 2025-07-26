import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

/**
 * Initialize deep link handling
 * Call this in your root layout's useEffect
 */
export const initializeDeepLinks = () => {
  const subscription = Linking.addEventListener('url', handleDeepLink);

  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink({ url });
    }
  });

  return () => subscription?.remove();
};

/**
 * Main deep link handler - routes to appropriate handlers
 */
const handleDeepLink = ({ url }) => {
  console.log('📱 Deep link received:', url);
  
  try {
    const parsed = Linking.parse(url);
    console.log('🔍 Parsed deep link:', parsed);
    
    if (parsed.path === '/auth/ResetPasswordConfirm' || parsed.path === '/auth/ResetPasswordConfirm') {
      handlePasswordResetRedirect(url, parsed);
    }
    else if (parsed.path === '/auth/EmailConfirmation' || url.includes('/auth/EmailConfirmation')) {
      handleEmailConfirmationRedirect(url, parsed);
    }
    else {
      console.log('⚠️ Unhandled deep link:', url);
    }
  } catch (error) {
    console.error('❌ Error parsing deep link:', error);
  }
};

/**
 * Handles password reset deep links
 */
const handlePasswordResetRedirect = (url, parsed) => {
  console.log('🔑 Handling password reset deep link');
  
  const { access_token, refresh_token } = parsed.queryParams || {};
  
  if (access_token && refresh_token) {
    console.log('✅ Valid password reset tokens found');
    router.push({
      pathname: '/(auth)/ResetPasswordConfirm',
      params: { access_token, refresh_token }
    });
  } else {
    console.log('❌ Missing password reset tokens');
    Toast.show({
      type: 'error',
      text1: 'Invalid Reset Link',
      text2: 'The password reset link is invalid or expired.',
      position: 'top',
    });
  }
};

/**
 * Handles email confirmation deep links
 */
const handleEmailConfirmationRedirect = (url, parsed) => {
  console.log('📧 Handling email confirmation deep link');
  
  const { token, type } = parsed.queryParams || {};
  
  if (token) {
    console.log('✅ Valid confirmation token found');
    router.push({
      pathname: '/(auth)/confirm-email',
      params: { 
        token: token,
        type: type || 'signup' 
      }
    });
  } else {
    console.log('❌ Missing confirmation token');
    Toast.show({
      type: 'error',
      text1: 'Invalid Confirmation Link',
      text2: 'The email confirmation link is invalid or expired.',
      position: 'top',
    });
  }
};