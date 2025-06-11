import React, { useState, useEffect} from 'react';
import { useFocusEffect, router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useUser } from '../../../providers/UserProvider'; 
// UI elements
import {
  Avatar,
  Title,
  Caption,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import { View, StyleSheet, Alert, SafeAreaView, Share, ScrollView } from 'react-native';
import SavedLocationsCard from '../../../components/SavedLocationsCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
  const [ filteredLocations, setFilteredLocations ] = useState([]);

  const { profile, loading, toggleLocationSave } = useUser();

  useFocusEffect(
    React.useCallback(() => {
      const getLocations = async () => {
        try {
          const locationIds = profile.locationIds || [];

          // get filtered locations using apiUrl 
          fetch('https://raw.githubusercontent.com/Jxkeorton/APIs/main/worldlocations.json')
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
            Toast.show({
              type: 'error',
              text1: 'Error fetching saved locations',
              position: 'top',
            });
          });

        } catch (error) {
          Toast.show({
            type: 'error',
            text1: 'Error fetching saved locations',
            position: 'top',
          });
        }
      };

      if (profile.locationIds) {
        getLocations();
      }
    }, [profile.locationIds]) 
  );
  
  useEffect(() => {
    const saveFilteredLocationsToAsyncStorage = async () => {
      try {
        await AsyncStorage.setItem('filteredLocations', JSON.stringify(filteredLocations));
       
      } catch (error) {
        console.error('Error saving filtered locations to AsyncStorage:', error);
      }
    };

    saveFilteredLocationsToAsyncStorage();
  }, [filteredLocations]);

  const onDelete = async (locationId) => {
    try {
      const result = await toggleLocationSave(locationId);
      
      if (result === false) {  // Location was unsaved
        setFilteredLocations(filteredLocations.filter((location) => location.id !== locationId));
        
        Toast.show({
          type: 'info',
          text1: 'Location unsaved from profile',
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error could not delete location',
          position: 'top',
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error could not delete location',
        position: 'top',
      });
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

  if (loading.profile) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <View style={styles.userInfoSection}>
        <View style={{flexDirection: 'row', marginTop: 15,}}>
          <Avatar.Image 
          source={profile.profileImage 
            ? {uri: profile.profileImage }
            : require('../../../assets/empty-profile-picture.png')
          }
          size = {80}
          backgroundColor = {'white'}
          />
          <View style={{marginLeft: 20}}>
            <Text variant="titleLarge" style={[styles.title, {
              marginTop: 15,
              marginBottom: 5,
            }]}>{profile.name || 'No name set'}</Text>
            <Text variant="bodySmall" style={styles.caption}>@{profile.username || 'No username'}</Text>
          </View>
        </View>

        <View style={styles.userInfoSection} />

        <View style={styles.infoBoxWrapper}>
          <View style={[styles.infoBox, {
            borderRightColor: '#dddddd',
            borderRightWidth: 1
          }]}>
            <Text variant="titleLarge" >{profile.jumpNumber || 0}</Text>
            <Text variant="bodySmall">Total Base Jumps</Text>
          </View>
          <View style={styles.infoBox}>

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