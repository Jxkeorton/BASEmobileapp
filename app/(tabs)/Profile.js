import { View, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from 'expo-router';
import { Button } from 'react-native-paper';
import { appSignOut } from '../../store';
import { FIREBASE_AUTH, FIREBASE_DB} from '../../firebaseConfig';
import SavedLocationsCard from '../../components/SavedLocationsCard';
import { 
  doc, 
  getDoc,
  updateDoc,
  arrayRemove
} from 'firebase/firestore';

const Profile = () => {
  const [ filteredLocations, setFilteredLocations ] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const getLocations = async () => {
        try {
            const currentUser = FIREBASE_AUTH.currentUser;
            if (!currentUser) {
            Alert.alert('No authenticated user found');
            return;
            }
            const userId = currentUser.uid;
  
            const userDocRef = doc(FIREBASE_DB, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);
            const userDocData = userDocSnap.data();
            const locationIds = userDocData?.locationIds || [];
            console.log('Location IDs:', locationIds);
  
            // get filtered locations using apiUrl 
  
             // Fetch data from the API
            fetch('https://raw.githubusercontent.com/Jxkeorton/APIs/main/locations.json')
            .then((response) => response.json())
            .then((data) => {
              // Filter locations based on matching IDs
              const filteredData = data.locations.filter((location) =>
                locationIds.includes(location.id)
              );
  
              // Update the state with filtered data
              setFilteredLocations(filteredData);
            })
            .catch((error) => {
              console.error('Error fetching data from API:', error);
            });
        } catch (error) {
          console.error('Error checking if location saved:', error);
        }
      };
  
      getLocations();
    }, [])
  );
  


  // When saved location is deleted/unsaved 
  const onDelete = async (locationId) => {
    
    try {
      
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) {
        Alert.alert('No authenticated user found');
        return;
      }
      const userId = currentUser.uid;
      const userDocRef = doc(FIREBASE_DB, 'users', userId);
      await updateDoc(userDocRef, {
        locationIds: arrayRemove(locationId)
      });
  
      // Update the filteredLocations state by removing the deleted location
      setFilteredLocations(filteredLocations.filter((location) => location.id !== locationId));
    } catch (error) {
      console.error(error);
      Alert.alert('Could not delete location:');
    }
  };

  return (
    <View style={styles.container}>
      <Button onPress={() => appSignOut()} title="LogOut">Logout</Button>

      <SavedLocationsCard data={filteredLocations} onDelete={onDelete} />
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
})