import { View, StyleSheet, ScrollView, Platform, Linking, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, Stack, useFocusEffect} from 'expo-router';
import React ,{ useState } from 'react';
import MapView, {Marker} from 'react-native-maps';
import { Button, Text, Divider } from 'react-native-paper';

//firebase
import { onSaveToggle } from '../../../store';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

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
  const [isLoggedIn , setIsLoggedIn] = useState(false)
  const { id } = useLocalSearchParams();
  const { isMetric } = useUnitSystem();

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
      return null; // Handle the error and return null
    }
  };
  


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

        setSaved(locationIds.includes(parseInt(id)));
        setIsLoggedIn(currentUser !== null);
      } catch (error) {
        console.error('Error checking if location saved:', error);
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

  }, [id])
  );

  // toggle save when save button pressed 
  const onSave = async () => {
    const updatedSaved = await onSaveToggle(id, isLoggedIn);
    setSaved(updatedSaved);
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
  }

  return (
    <PaperProvider>
    <View style={styles.container}>

        <Portal>
          <SubmitDetailsModal
            visible={visible}
            onClose={hideModal}
            info={location}
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
             >
              {isSaved ? 'Unsave' : 'Save'}
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
          <Text style={styles.openedByText}>{location.openedBy.name.toUpperCase()}</Text>
          <Text style={styles.openedByText}>{location.openedBy.date}</Text>
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
    alignItems: 'flex-start',
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