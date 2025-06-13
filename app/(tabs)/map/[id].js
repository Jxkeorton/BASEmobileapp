import { View, StyleSheet, ScrollView, Platform, Linking, ActivityIndicator, Alert} from 'react-native'
import { useLocalSearchParams, Stack, useFocusEffect} from 'expo-router';
import React ,{ useState } from 'react';
import MapView, {Marker} from 'react-native-maps';
import { Button, Text, Divider, IconButton } from 'react-native-paper';

import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import { useUser } from '../../../providers/UserProvider';

// async storage 
import AsyncStorage from '@react-native-async-storage/async-storage';

//Modal imports 
import { Portal, PaperProvider } from 'react-native-paper'
import SubmitDetailsModal from '../../../components/SubmitDetailsModal';

// unit state 
import { useUnitSystem } from '../../../context/UnitSystemContext';


function Location() {
  const [location , setLocation] = useState(null)
  const [isSaved , setSaved] = useState(false)
  const [isCopied, setIsCopied] = useState(false);
  const { id } = useLocalSearchParams();
  const { isMetric } = useUnitSystem();

  const { 
    isLoggedIn, 
    profile, 
    toggleLocationSave, 
    loading 
  } = useUser();

   //Modal
   const [visible, setVisible] = useState(false);
   const showModal = () => setVisible(true);
   const hideModal = () => setVisible(false);

   const getEventFromStorage = async (eventId) => {
    try {
      // Retrieve 'filteredLocations' and 'savedItems' from AsyncStorage
     
      const savedItems = await AsyncStorage.getItem('savedEvents');
      const filteredLocations = await AsyncStorage.getItem('filteredLocations');
  
      // Parse the retrieved data
      
      const parsedSavedItems = JSON.parse(savedItems) || [];
      const parsedFilteredLocations = JSON.parse(filteredLocations) || [];
  
      // Search for the event with the matching ID in both arrays
      const matchingEvent = parsedFilteredLocations.find((event) => event.id === eventId)
        || parsedSavedItems.find((event) => event.id === eventId);
  
      return matchingEvent;
    } catch (error) {
      console.error('Error retrieving event from AsyncStorage:', error);
      Toast.show({
        type: 'error', // You can customize the type (success, info, error, etc.)
        text1: 'Failed to get location, Try again',
        position: 'top',
      });
      return null; 
    }
  };

  const copyToClipboard = () => {
    const coordinates = location.coordinates;
    const coordinatesText = `${coordinates[0]}, ${coordinates[1]}`;

    Clipboard.setString(coordinatesText);
    setIsCopied(true);
    
    // Show a toast notification to inform the user
    Toast.show({
      type: 'success', // You can customize the type (success, info, error, etc.)
      text1: 'Coordinates Copied',
      position: 'top',
    });
  };

  useFocusEffect(
    React.useCallback(() => {

    const checkLocationSaved = () => {
      if (isLoggedIn && profile.locationIds) {
        setSaved(profile.locationIds.includes(parseInt(id)));
      } else {
        setSaved(false);
      }
    };

    checkLocationSaved();

    const fetchEvent = async () => {
      const event = await getEventFromStorage(parseInt(id));
      
      if (event) {
        setLocation(event);
      } else {
        console.log('Event not found in AsyncStorage');
      }
    };

    fetchEvent();

  }, [id, isLoggedIn, profile.locationIds])
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

    const savedState = await toggleLocationSave(id);
    
    if (savedState !== null) {
      setSaved(savedState);
      
      Toast.show({
        type: 'success',
        text1: savedState ? 'Location saved' : 'Location unsaved',
        position: 'top',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Failed to save location',
        position: 'top',
      });
    }
  };

  // for directing to maps app button 
  const openMaps = () => {
    const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${location.coordinates[0]},${location.coordinates[1]}`;
    const label = 'Custom Label';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url);
  };

  // Define a function to extract the numeric part from a string
  const extractNumericPart = (value) => {
    const numericPart = value.match(/\d+(\.\d+)?/); // Use a regular expression to extract numeric part
    return numericPart ? numericPart[0] : null;
  };

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
        
      {location ? (
        <React.Fragment>
          <Stack.Screen
            options={{
              title: location.name.toUpperCase(),
            }}
          />

        <View style={styles.centeredContainer}>

          <View style={styles.buttonContainer}>
            <Button style={styles.button} mode="contained" onPress={openMaps}>Open in maps</Button>
            <Button style={styles.button} mode="contained" onPress={showModal}>Update</Button>
            <Button 
              style={[
                styles.button,
                isSaved ? styles.savedButton : null
              ]}
              mode="contained" 
              onPress={onSave}
              disabled={loading.action}
             >
              {loading.action ? 'Saving...' : (isSaved ? 'Unsave' : 'Save')}
            </Button>
          </View>
        </View>
          
        <MapView style={styles.map}
        initialRegion={{
          latitude: location.coordinates[0],
          longitude: location.coordinates[1],
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        mapType='hybrid'
        
      >
        <Marker
              coordinate={{ latitude: location.coordinates[0], longitude: location.coordinates[1] }}
              title={location.name}
              description={location.openedBy.name}
              pinColor='#00ABF0'
          />
        </MapView>
        <ScrollView>

        <View style={styles.openedByContainer}>
          <Text style={styles.openedByText}>
            {location.openedBy.name.replace(/JOSH B/g, 'JOSH BREGMEN').toUpperCase()}
          </Text>
          <Text style={styles.openedByText}>{location.openedBy.date}</Text>
        </View>
        <Divider />

        <View style={styles.openedByContainer}>
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            {location.coordinates[0]}, {location.coordinates[1]}
          </Text>
        </View>
        <View style={styles.copyIconContainer}>
          <IconButton
            icon="content-copy"
            color={isCopied ? 'black' : 'grey'} 
            size={15}
            onPress={copyToClipboard}
          />
        </View>
       </View>
        <Divider />
          
            <View style={styles.mainContainer}>
              <View>
                <Text style={styles.subtitleText}>Rock Drop: </Text>
                <Text style={styles.subtitleText}>Total: </Text>
                <Text style={styles.subtitleText}>cliffAspect: </Text>
                <Text style={styles.subtitleText}>Anchor: </Text>
              </View>
              <View>
              {location.details.rockdrop ? (
                <Text style={styles.text}>
                  {isMetric
                    ? `${Math.round(extractNumericPart(location.details.rockdrop) * 0.3048)} m`
                    : `${Math.round(extractNumericPart(location.details.rockdrop))} ft`}
                </Text>
              ) : (
                <Text style={styles.text}> ? </Text>
              )}

              {location.details.total ? (
                <Text style={styles.text}>
                  {isMetric
                    ? `${Math.round(extractNumericPart(location.details.total) * 0.3048)} m`
                    : `${Math.round(extractNumericPart(location.details.total))} ft`}
                </Text>
              ) : (
                <Text style={styles.text}> ? </Text>
              )}

                {location.details.cliffAspect ? 
                  <Text style={styles.text}>{location.details.cliffAspect}</Text>
                : 
                  <Text style={styles.text}> ? </Text> 
                }
                
                {location.details.anchor ? 
                  <Text style={styles.text}>{location.details.anchor}</Text>
                : 
                  <Text style={styles.text}> ? </Text> 
                }
              </View>
            </View>
          <Divider />
        
        
          <View style={styles.mainContainer}>
            <Text style={styles.subtitleText}>Access: </Text>
            {location.details.access ? 
              <Text style={styles.text}>{location.details.access}</Text>
            : 
              <Text style={styles.text}> ? </Text> 
            }
          </View>
       <Divider/>  
        
        
          <Text style={styles.subtitleText}>Notes: </Text>
          {location.details.notes ? 
            <Text style={styles.text}>{location.details.notes}</Text>
          : 
            <Text style={styles.text}> ? </Text> 
          }
        
        </ScrollView>
        </React.Fragment>
      ) : (
        <ActivityIndicator style={styles.loadingIndicator} size="large" color="#00ABF0" />
      )}
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
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedButton: {
    backgroundColor: 'red', 
  },
});

export default Location