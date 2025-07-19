import { StyleSheet, View, Text, TouchableOpacity, Linking, Platform} from 'react-native'
import React, { useState }from 'react'
import {Callout} from 'react-native-maps';
import { router, useFocusEffect} from 'expo-router';
import Toast from 'react-native-toast-message';
import { useUser } from '../providers/UserProvider'; 

import { useUnitSystem } from '../context/UnitSystemContext';

export default function CustomCallout({info}) {
  const [Saved, setSaved] = useState(false);
  const { isMetric } = useUnitSystem();

  const { isLoggedIn, isProUser, profile, toggleLocationSave } = useUser();

  // Function to handle button press, checking subscription status
  const handleButtonPress = (action) => {
    if (isProUser) {
      if (action === 'save') {
        onSave();
      } else if (action === 'details') {
        onDetailsPress();
      } else if (action === 'openMaps') {
        openMaps();
      }
    } else {
      // Redirect to the SubscriptionScreen if the user is not subscribed
      router.navigate('/SubscriptionsPage');
      Toast.show({
        type: 'info',
        text1: 'Subscribe for this feature !',
        position: 'top',
      });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (isLoggedIn && profile.locationIds) {
        const locationId = parseInt(info.id);
        setSaved(profile.locationIds.includes(locationId));
      }
    }, [isLoggedIn, profile.locationIds, info.id])
  );

  const onSave = async () => {
    if (!isLoggedIn) {
      Toast.show({
        type: 'error',
        text1: 'Please log in to save locations',
        position: 'top',
      });
      return;
    }

    const result = await toggleLocationSave(info.id);
    
    if (result !== null) {
      setSaved(result);
      if (result) {
        Toast.show({
          type: 'success',
          text1: 'Location saved to profile',
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'Location unsaved from profile',
          position: 'top',
        });
      }
    } else {
      Toast.show({
        type: 'error',
        text1: 'Failed to update location',
        position: 'top',
      });
    }
  };

  // function to direct to the locations details page
  const onDetailsPress = () => {
    router.push(`/(tabs)/map/${info.id}`)
  }

  // for directing to maps app button 
 const openMaps = () => {
  const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
  const latLng = `${info.coordinates[0]},${info.coordinates[1]}`;
  const label = 'Custom Label';
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`
  });

  Linking.openURL(url);
}

// Function to convert feet to meters when isMetric is true
const convertToMeters = (value) => {
  return (value ? `${Math.round(parseFloat(value) * 0.3048)} meters` : '?');
};
  
  return (
    <Callout onPress={() => handleButtonPress('details')}>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{info.name.toUpperCase()}</Text>
          <Text style={styles.calloutCoordinates}>
            Rock Drop: {isMetric ? convertToMeters(info.rock_drop_ft) : (info.rock_drop_ft ? `${info.rock_drop_ft} ft` : '?')}
          </Text>
          <Text style={styles.calloutCoordinates}>
            Total: {isMetric ? convertToMeters(info.total_height_ft) : (info.total_height_ft ? `${info.total_height_ft} ft` : '?')}
          </Text>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              onPress={() => handleButtonPress('details')}
              style={styles.calloutButton}
            >
              <Text style={styles.calloutButtonText}>Details</Text>
            </TouchableOpacity>
          )}
        </View>
      </Callout>
  )
}

const styles = StyleSheet.create({
    calloutContainer: {
      width: 200,
      padding: 10,
      borderRadius: 10,
      backgroundColor: 'white',
    },
    calloutTitle: {
      fontWeight: 'bold',
      marginBottom: 5,
    },
    calloutCoordinates: {
      marginBottom: 5,
    },
    calloutButton: {
      marginTop: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
      backgroundColor: 'black',
    },
    savedButton: {
      backgroundColor: 'red', 
    },
    calloutButtonText: {
      color: 'white',
    },
    
  });