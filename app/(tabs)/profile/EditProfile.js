import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { PaperProvider, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kyInstance } from '../../../services/open-api/kyClient';
import { useAuth } from '../../../providers/AuthProvider';
import Toast from 'react-native-toast-message';

const EditProfile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jumpNumber, setJumpNumber] = useState('');
  const [username, setUsername] = useState('');

  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Get profile data
  const { 
    data: profileResponse, 
    isLoading: profileLoading,
    error: profileError 
  } = useQuery({
    queryKey: ['profile', user?.uid],
    queryFn: async () => {
      console.log('Fetching profile data for edit...');
      const response = await kyInstance.get('profile').json();
      console.log('Profile response:', response);
      return response;
    },
    enabled: !!isAuthenticated && !!(user?.uid),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const response = await kyInstance.patch('profile', {
        json: profileData
      }).json();
      return response;
    },
    onSuccess: (response) => {
      if (response.success) {
        // Invalidate and refetch profile queries
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        
        Toast.show({
          type: 'success',
          text1: 'Profile updated successfully',
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to update profile',
          text2: response.error || 'Unknown error occurred',
          position: 'top',
        });
      }
    },
    onError: (error) => {
      console.error('Update profile error:', error);
      
      let errorMessage = 'Failed to update profile';
      let errorDetails = '';

      // Handle different types of errors
      if (error.response) {
        if (error.response.status === 400 && error.response.data?.validation) {
          errorMessage = 'Validation Error';
          errorDetails = error.response.data.validation.map(err => err.message).join(', ');
        } else if (error.response.data?.error) {
          errorMessage = 'Update Failed';
          errorDetails = error.response.data.error;
        }
      }

      Toast.show({
        type: 'error',
        text1: errorMessage,
        text2: errorDetails,
        position: 'top',
      });
    }
  });

  // Load profile data when component focuses
  useFocusEffect(
    React.useCallback(() => {
      if (profileResponse?.success && profileResponse?.data) {
        const profile = profileResponse.data;
        setName(profile.name || '');
        setEmail(profile.email || '');
        setUsername(profile.username || '');
        setJumpNumber(profile.jump_number?.toString() || '0');
      }
    }, [profileResponse])
  );

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Authentication required',
        text2: 'Please log in to update profile',
        position: 'top',
      });
      return;
    }

    // Basic validation
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Name is required',
        position: 'top',
      });
      return;
    }

    if (jumpNumber && isNaN(parseInt(jumpNumber))) {
      Toast.show({
        type: 'error',
        text1: 'Jump number must be a valid number',
        position: 'top',
      });
      return;
    }

    try {
      // Prepare update data (only include fields that have values)
      const updateData = {};
      
      if (name.trim() !== profileResponse?.data?.name) {
        updateData.name = name.trim();
      }
      
      if (username.trim() !== profileResponse?.data?.username) {
        updateData.username = username.trim();
      }
      
      const jumpNum = parseInt(jumpNumber) || 0;
      if (jumpNum !== profileResponse?.data?.jump_number) {
        updateData.jump_number = jumpNum;
      }

      // Only submit if there are actual changes
      if (Object.keys(updateData).length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No changes to save',
          position: 'top',
        });
        return;
      }

      await updateProfileMutation.mutateAsync(updateData);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  // Loading state
  if (profileLoading) {
    return (
      <PaperProvider>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#00ABF0" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </PaperProvider>
    );
  }

  // Error state
  if (profileError) {
    return (
      <PaperProvider>
        <View style={[styles.container, styles.loadingContainer]}>
          <Text style={styles.errorText}>Error loading profile</Text>
          <Text style={styles.errorDetails}>{profileError.message}</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={{ margin: 20}}>
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <View style={styles.profilePlaceholder}>
              <FontAwesome name="user" size={40} color="#ccc" />
            </View>
            <Text style={styles.profileName}>
              {name || 'No name set'}
            </Text>
          </View>

          <View style={styles.action}>
            <FontAwesome name="user-o" size={20} />
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#666666"
              autoCorrect={false}
              value={name}
              style={styles.textInput}
              onChangeText={setName}
            />
          </View>

          <View style={styles.action}>
            <FontAwesome name="envelope-o" size={20} />
            <TextInput
              placeholder="Email (read-only)"
              placeholderTextColor="#666666"
              keyboardType="email-address"
              autoCorrect={false}
              value={email}
              style={[styles.textInput, styles.readOnlyInput]}
              editable={false}
            />
          </View>

          <View style={styles.action}>
            <FontAwesome name="at" size={20} />
            <TextInput
              placeholder="Username"
              placeholderTextColor="#666666"
              autoCorrect={false}
              autoCapitalize="none"
              value={username}
              style={styles.textInput}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.action}>
            <FontAwesome name="plane" size={20} />
            <TextInput
              placeholder="Total BASE jumps"
              placeholderTextColor="#666666"
              autoCorrect={false}
              value={jumpNumber}
              style={styles.textInput}
              keyboardType="numeric"
              onChangeText={setJumpNumber}
            />
          </View>

          {updateProfileMutation.isPending ? (
            <View style={styles.loadingButtonContainer}>
              <ActivityIndicator size="large" color="#00ABF0" />
              <Text style={styles.loadingText}>Updating profile...</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.commandButton} 
              onPress={handleSubmit}
            >
              <Text style={styles.panelButtonTitle}>Update Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </PaperProvider>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  profilePlaceholder: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  profileName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  commandButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#00ABF0',
    alignItems: 'center',
    marginTop: 20,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  action: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 10,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 0 : -12,
    paddingLeft: 15,
    color: '#05375a',
    fontSize: 16,
  },
  readOnlyInput: {
    color: '#999',
  },
  loadingButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});