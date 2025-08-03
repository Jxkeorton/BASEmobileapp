import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../../providers/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kyInstance } from '../../../services/open-api/kyClient';
import {
  Text,
  TouchableRipple,
  ActivityIndicator,
} from 'react-native-paper';
import { View, StyleSheet, SafeAreaView, Share, ScrollView } from 'react-native';
import SavedLocationsCard from '../../../components/SavedLocationsCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Get profile data
  const { 
    data: profileResponse, 
    isLoading: profileLoading,
    error: profileError 
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const response = await kyInstance.get('profile').json();
      return response;
    },
    enabled: !!isAuthenticated && !!(user?.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Get saved locations
  const { 
    data: savedLocationsResponse,
    isLoading: locationsLoading,
    error: locationsError 
  } = useQuery({
    queryKey: ['savedLocations', user?.id],
    queryFn: async () => {
      const response = await kyInstance.get('locations/saved').json();
      return response;
    },
    enabled: !!isAuthenticated && !!(user?.id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });

  const savedLocations = savedLocationsResponse.data.saved_locations;

  // Unsave location mutation
  const unsaveLocationMutation = useMutation({
    mutationFn: async (locationId) => {
      const response = await kyInstance.delete('locations/unsave', {
        json: { location_id: locationId }
      }).json();
      return response;
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['savedLocations'] });
        Toast.show({
          type: 'info',
          text1: 'Location unsaved from profile',
          position: 'top',
        });
      }
    },
    onError: (error) => {
      console.error('Unsave location error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error could not delete location',
        position: 'top',
      });
    }
  });

  const onDelete = async (locationId) => {
    try {
      await unsaveLocationMutation.mutateAsync(locationId);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  const myCustomShare = async () => {
    try {
      await Share.share({
        message: 'BASE world map, virtual logbook and more !',
      });
    } catch (error) {
      alert(error.message);
    }
  };

  // Extract profile data
  const profile = profileResponse?.success ? profileResponse.data : {};

  if (profileLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#00ABF0" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (profileError) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Error loading profile</Text>
        <Text style={styles.errorDetails}>{profileError.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.userInfoSection}>
          <View style={{flexDirection: 'row', marginTop: 15}}>
            <View style={styles.avatarPlaceholder}>
              <FontAwesome name="user" size={30} color="#ccc" />
            </View>
            <View style={{marginLeft: 20}}>
              <Text variant="titleLarge" style={[styles.title, {
                marginTop: 15,
                marginBottom: 5,
              }]}>{profile.name || 'No name set'}</Text>
              <Text variant="bodySmall" style={styles.caption}>
                @{profile.username || 'No username'}
              </Text>
            </View>
          </View>

          <View style={styles.userInfoSection} />

          <View style={styles.infoBoxWrapper}>
            <View style={[styles.infoBox, {
              borderRightColor: '#dddddd',
              borderRightWidth: 1
            }]}>
              <Text variant="titleLarge">{profile.jump_number || 0}</Text>
              <Text variant="bodySmall">Total Base Jumps</Text>
            </View>
            <View style={styles.infoBox}>
              <Text variant="titleLarge">{savedLocationsResponse.data.saved_locations.length || 0}</Text>
              <Text variant="bodySmall">Saved Locations</Text>
            </View>
          </View>

          <View style={styles.menuWrapper}>
            <TouchableRipple onPress={() => router.push('/(tabs)/profile/EditProfile')}>
              <View style={styles.menuItem}>
                <Icon name="account-check-outline" color="#777777" size={25}/>
                <Text style={styles.menuItemText}>Edit Profile</Text>
              </View>
            </TouchableRipple>
            <TouchableRipple onPress={myCustomShare}>
              <View style={styles.menuItem}>
                <Icon name="share-outline" color="#777777" size={25}/>
                <Text style={styles.menuItemText}>Tell Your Friends</Text>
              </View>
            </TouchableRipple>
            <TouchableRipple onPress={() => router.push('/(tabs)/profile/SubmitLocation')}>
              <View style={styles.menuItem}>
                <Icon name="map-marker-radius" color="#777777" size={25}/>
                <Text style={styles.menuItemText}>Submit A Location</Text>
              </View>
            </TouchableRipple>
          </View>
        </View>

        {locationsLoading ? (
          <p>Loading</p>
        ): (
          <>
          {locationsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error loading saved locations</Text>
              <Text style={styles.errorDetails}>{locationsError.message}</Text>
            </View>
          ) : (
            <SavedLocationsCard 
              data={savedLocations} 
              onDelete={onDelete}
              isLoading={locationsLoading || unsaveLocationMutation.isPending}
            />
          )}

        </>

        )}

        
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
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
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: 'black',
  },
  infoBoxWrapper: {
    borderBottomColor: '#dddddd',
    borderBottomWidth: 1,
    borderTopColor: '#dddddd',
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 100,
  },
  infoBox: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuWrapper: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'center',
    width: '100%',
  },
  menuItemText: {
    color: '#777777',
    marginLeft: 20,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 26,
  },
});