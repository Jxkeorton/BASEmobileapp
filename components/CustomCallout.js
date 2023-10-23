import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native'
import { doc, getDoc } from 'firebase/firestore';
import React, { useState }from 'react'
import {Callout} from 'react-native-maps';
import { router, useFocusEffect} from 'expo-router';
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig';
import { onSaveToggle } from '../store';

//async storage
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CustomCallout({info}) {
  const [Saved, setSaved] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // checking if user is logged in and if location is saved 
  useFocusEffect(
    React.useCallback(() => {
    const checkLocationSaved = async () => {
      try {
        const currentUser = FIREBASE_AUTH.currentUser;
        if (!currentUser) {
          console.error('No authenticated user found');
          return;
        }
        const userId = currentUser.uid;

        const userDocRef = doc(FIREBASE_DB, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        const userDocData = userDocSnap.data();
        const { locationIds = [] } = userDocData || {};

        setSaved(locationIds.includes(parseInt(info.id)));
        setIsLoggedIn(currentUser !== null);
      } catch (error) {
        console.error('Error checking if location saved:', error);
      }
    };

    checkLocationSaved();

    const saveEventToStorage = async (eventInfo) => {
      try {
        if (eventInfo) {
          // Convert the event object to a JSON string
          const eventJSON = JSON.stringify(eventInfo);

          // Save the event data to AsyncStorage
          await AsyncStorage.setItem('selectedEvent', eventJSON);

          // Optionally, you can display a message or perform any other action after saving.
          console.log('Event saved to AsyncStorage:', eventInfo);
        }
      } catch (error) {
        console.error('Error saving event to AsyncStorage:', error);
      }
    };

    saveEventToStorage();

  }, [info]));

  // toggle save when save button pressed 
  const onSave = async () => {
    const updatedSaved = await onSaveToggle(info.id, isLoggedIn);
    setSaved(updatedSaved);
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
  
  return (
    <Callout>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{info.name.toUpperCase()}</Text>
          <Text style={styles.calloutCoordinates}>
            Rock Drop: {info.details.rockdrop ? `${info.details.rockdrop} ft` : '?' }
          </Text>
          <Text style={styles.calloutCoordinates}>
            Total: {info.details.total ? `${info.details.total} ft` : '?' }
          </Text>
          {isLoggedIn && (
            <TouchableOpacity
              onPress={onSave}
              style={[
                styles.calloutButton,
                Saved ? styles.savedButton : null
              ]}
            >
              <Text style={styles.calloutButtonText}>
                {Saved ? 'Unsave' : 'Save'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onDetailsPress}
            style={styles.calloutButton}
          >
            <Text style={styles.calloutButtonText}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={openMaps}
            style={styles.calloutButton}
          >
            <Text style={styles.calloutButtonText}>Maps pin</Text>
          </TouchableOpacity>
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