import { View, StyleSheet, ScrollView, Platform, Linking, ActivityIndicator} from 'react-native'
import { useLocalSearchParams, Stack} from 'expo-router';
import React ,{ useState, useMemo } from 'react';
import MapView, {Marker} from 'react-native-maps';
import { Button, Text, Divider, IconButton } from 'react-native-paper';

import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import { useAuth } from '../../../providers/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kyInstance } from '../../../services/open-api/kyClient';

//Modal imports 
import { Portal, PaperProvider } from 'react-native-paper'
import SubmitDetailsModal from '../../../components/SubmitDetailsModal';

// unit state 
import { useUnitSystem } from '../../../context/UnitSystemContext';

function Location() {
  const [isCopied, setIsCopied] = useState(false);
  const { id } = useLocalSearchParams();
  const { isMetric } = useUnitSystem();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  //Modal
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  // TanStack Query cache (should be cached from map.js)
  const locationId = parseInt(id);
  const { 
    data: locationsResponse, 
    isLoading: locationsLoading,
    error: locationsError 
  } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      console.log('Fetching locations for location details...');
      const response = await kyInstance.get('locations').json();
      console.log('Locations response:', response);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - same as map.js
    retry: 3,
  });

  // Get user's saved locations
  const { 
    data: savedLocationsResponse,
    isLoading: savedLoading 
  } = useQuery({
    queryKey: ['savedLocations', user?.id || user?.uid],
    queryFn: async () => {
      const response = await kyInstance.get('locations/saved').json();
      return response;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Save location mutation
  const saveLocationMutation = useMutation({
    mutationFn: async (locationId) => {
      const response = await kyInstance.post('locations/save', {
        json: { location_id: locationId }
      }).json();
      return response;
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['savedLocations'] });
        Toast.show({
          type: 'success',
          text1: 'Location saved',
          position: 'top',
        });
      }
    },
    onError: (error) => {
      console.error('Save location error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save location';
      Toast.show({
        type: 'error',
        text1: errorMessage,
        position: 'top',
      });
    }
  });

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
          type: 'success',
          text1: 'Location unsaved',
          position: 'top',
        });
      }
    },
    onError: (error) => {
      console.error('Unsave location error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to unsave location';
      Toast.show({
        type: 'error',
        text1: errorMessage,
        position: 'top',
      });
    }
  });

  // Find the specific location from the cached data
  const location = useMemo(() => {
    
    // Handle different possible response structures
    if (!locationsResponse) {
      console.log('No locations response');
      return null;
    }

    // Check if it has a data property that's an array
    if (locationsResponse.data && Array.isArray(locationsResponse.data)) {
      console.log('Locations response has data array');
      return locationsResponse.data.find(loc => loc.id === locationId);
    }

    return null;
  }, [locationsResponse, locationId]);

  // Check if location is saved
  const isSaved = useMemo(() => {
    if (!savedLocationsResponse?.success || !savedLocationsResponse?.data?.saved_locations) {
      return false;
    }
    return savedLocationsResponse.data.saved_locations.some(
      savedLoc => savedLoc.location?.id === locationId
    );
  }, [savedLocationsResponse, locationId]);

  const copyToClipboard = () => {
    if (!location?.latitude || !location?.longitude) return;
    
    const coordinatesText = `${location.latitude}, ${location.longitude}`;

    Clipboard.setString(coordinatesText);
    setIsCopied(true);
    
    Toast.show({
      type: 'success',
      text1: 'Coordinates Copied',
      position: 'top',
    });
  };

  const onSave = async () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Please log in to save locations',
        position: 'top',
      });
      return;
    }

    try {
      if (isSaved) {
        await unsaveLocationMutation.mutateAsync(locationId);
      } else {
        await saveLocationMutation.mutateAsync(locationId);
      }
    } catch (error) {
      // Error handling is done in the mutation callbacks
    }
  };

  // Open location in maps app
  const openMaps = () => {
    if (!location?.latitude || !location?.longitude) return;
    
    const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${location.latitude},${location.longitude}`;
    const label = location.name || 'Location';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url);
  };

  // Extract numeric part from height strings
  const extractNumericPart = (value) => {
    if (!value) return null;
    
    // If it's already a number, return it as string
    if (typeof value === 'number') {
      return value.toString();
    }
    
    // If it's a string, extract numeric part
    if (typeof value === 'string') {
      const numericPart = value.match(/\d+(\.\d+)?/);
      return numericPart ? numericPart[0] : null;
    }
    
    return null;
  };

  // Convert height values based on unit system
  const convertHeight = (heightStr) => {
    const numericValue = extractNumericPart(heightStr);
    if (!numericValue) return '?';
    
    const feet = parseInt(numericValue);
    if (isMetric) {
      const meters = Math.round(feet * 0.3048);
      return `${meters} m`;
    }
    return `${feet} ft`;
  };

  // Loading state
  if (locationsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ABF0" />
        <Text style={styles.loadingText}>Loading location...</Text>
      </View>
    );
  }

  // Error state
  if (locationsError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Error loading location data</Text>
        <Text style={styles.text}>{locationsError.message}</Text>
      </View>
    );
  }

  // Location not found
  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Location not found</Text>
        <Text style={styles.text}>Location ID: {locationId}</Text>
      </View>
    );
  }

  const isProcessing = saveLocationMutation.isPending || unsaveLocationMutation.isPending;

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Portal>
          <SubmitDetailsModal
            visible={visible}
            onClose={hideModal}
            location={location}
          />
        </Portal>
        
        <Stack.Screen
          options={{
            title: location.name.toUpperCase(),
          }}
        />

        <View style={styles.centeredContainer}>
          <View style={styles.buttonContainer}>
            <Button style={styles.button} mode="contained" onPress={openMaps}>
              Open in maps
            </Button>
            <Button style={styles.button} mode="contained" onPress={showModal}>
              Update
            </Button>
            <Button 
              style={[
                styles.button,
                isSaved ? styles.savedButton : null
              ]}
              mode="contained" 
              onPress={onSave}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : (isSaved ? 'Unsave' : 'Save')}
            </Button>
          </View>
        </View>
          
        <MapView style={styles.map}
          initialRegion={{
            latitude: location.latitude || 0,
            longitude: location.longitude || 0,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          mapType='hybrid'
        >
          <Marker
            coordinate={{ 
              latitude: location.latitude || 0, 
              longitude: location.longitude || 0 
            }}
            title={location.name || 'Unknown Location'}
            description={location.opened_by_name || 'Unknown'}
            pinColor='#00ABF0'
          />
        </MapView>

        <ScrollView>
          <View style={styles.openedByContainer}>
            <Text style={styles.openedByText}>
              {(location.opened_by_name || 'Unknown').replace(/JOSH B/g, 'JOSH BREGMEN').toUpperCase()}
            </Text>
            <Text style={styles.openedByText}>
              {location.opened_date || 'Unknown date'}
            </Text>
          </View>
          <Divider />

          <View style={styles.openedByContainer}>
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesText}>
                {location.latitude || 'N/A'}, {location.longitude || 'N/A'}
              </Text>
            </View>
            <View style={styles.copyIconContainer}>
              <IconButton
                icon="content-copy"
                iconColor={isCopied ? 'black' : 'grey'} 
                size={15}
                onPress={copyToClipboard}
                disabled={!location.latitude || !location.longitude}
              />
            </View>
          </View>
          <Divider />
            
          <View style={styles.mainContainer}>
            <View>
              <Text style={styles.subtitleText}>Rock Drop: </Text>
              <Text style={styles.subtitleText}>Total: </Text>
              <Text style={styles.subtitleText}>Cliff Aspect: </Text>
              <Text style={styles.subtitleText}>Anchor: </Text>
            </View>
            <View>
              <Text style={styles.text}>
                {convertHeight(location.rock_drop_ft)}
              </Text>
              <Text style={styles.text}>
                {convertHeight(location.total_height_ft)}
              </Text>
              <Text style={styles.text}>
                {location.cliff_aspect || '?'}
              </Text>
              <Text style={styles.text}>
                {location.anchor_info || '?'}
              </Text>
            </View>
          </View>
          <Divider />
        
          <View style={styles.mainContainer}>
            <Text style={styles.subtitleText}>Access: </Text>
            <Text style={styles.text}>
              {location.access_info || '?'}
            </Text>
          </View>
          <Divider />  
        
          <Text style={styles.subtitleText}>Notes: </Text>
          <Text style={styles.text}>
            {location.notes || '?'}
          </Text>
        </ScrollView>
      </View>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginBottom: 5,
  },
  centeredContainer: {
    alignItems: 'center', 
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  map: {
    width: '100%',
    height: '40%', 
  },
  text: {
    marginBottom: 10,
    fontSize: 16,
    paddingLeft: 10,
  },
  subtitleText: {
    marginBottom: 10,
    paddingLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    width: '80%',
    marginVertical: 5,
    padding: 5,
    backgroundColor: 'white',
  },
  button: {
    marginHorizontal: 5,
    backgroundColor: '#00ABF0',
  },
  openedByText: {
    fontSize: 11,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  openedByContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedButton: {
    backgroundColor: 'red', 
  },
  coordinatesContainer: {
    flex: 1,
  },
  coordinatesText: {
    fontSize: 11,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  copyIconContainer: {
    marginLeft: 5,
  },
});

export default Location