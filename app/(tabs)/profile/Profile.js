import React, { useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

// firebase imports for fetching user data
import { FIREBASE_AUTH, FIREBASE_DB} from '../../../firebaseConfig';
import { 
  doc, 
  getDoc,
  updateDoc,
  arrayRemove
} from 'firebase/firestore';

// Ui elements
import {
  Avatar,
  Title,
  Caption,
  Text,
  TouchableRipple,
  Button,
} from 'react-native-paper';
import { View, StyleSheet, Alert, SafeAreaView, Share, ScrollView } from 'react-native';
import SavedLocationsCard from '../../../components/SavedLocationsCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const router = useRouter();

const Profile = () => {
  const [ filteredLocations, setFilteredLocations ] = useState([]);

  // this hook ensures new saved locations are fetched on screen focus
  useFocusEffect(
    React.useCallback(() => {
      const getLocations = async () => {
        try {
            // fetching users saved location ID's
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
      Alert.alert('Error','Could not delete location');
    }
  };

  // for app sharing button 
  const myCustomShare = async () => {
    try {
        await Share.share({
            message:
                'BASE world map, virtual logbook and more !',
        });
    } catch (error) {
        alert(error.message);
    }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <View style={styles.userInfoSection}>
        <View style={{flexDirection: 'row', marginTop: 15,}}>
          <Avatar.Image 
          source={require('../../../assets/empty-profile-picture.png')}
          size = {80}
          backgroundColor = {'white'}
          />
          <View style={{marginLeft: 20}}>
            <Title style={[styles.title, {
              marginTop: 15,
              marginBottom: 5,
            }]}>John Doe</Title>
            <Caption style={styles.caption}>@j_doe</Caption>
          </View>
        </View>

        <View style={styles.userInfoSection} />

        <View style={styles.infoBoxWrapper}>
          <View style={[styles.infoBox, {
            borderRightColor: '#dddddd',
            borderRightWidth: 1
          }]}>
            <Title>76</Title>
            <Caption>Total Base Jumps</Caption>
          </View>
          <View style={styles.infoBox}>
            <Button onPress={() => router.replace('/LogBook')}>Logbook</Button>
          </View>
      </View>

      <View style={styles.menuWrapper}>
        <TouchableRipple onPress={() => router.replace('/(tabs)/profile/EditProfile')}>
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
        <TouchableRipple onPress={() => {}}>
          <View style={styles.menuItem}>
            <Icon name="map-marker-radius" color="#777777" size={25}/>
            <Text style={styles.menuItemText}>Submit A Location</Text>
          </View>
        </TouchableRipple>
      </View>
  
      </View>

      <SavedLocationsCard data={filteredLocations} onDelete={onDelete} />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile;


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f6f6f6',
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