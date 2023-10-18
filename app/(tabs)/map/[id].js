import { View, StyleSheet, ScrollView, Platform, Linking, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, Stack, useFocusEffect} from 'expo-router';
import React ,{ useState } from 'react';
import MapView, {Marker} from 'react-native-maps';
import { Button, Text, Divider } from 'react-native-paper';

//firebase
import { onSaveToggle } from '../../../store';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';


function Location() {
  const [location , setLocation] = useState(null)
  const [isSaved , setSaved] = useState(false)
  const [isLoggedIn , setIsLoggedIn] = useState(false)
  const { id } = useLocalSearchParams();


  useFocusEffect(
    React.useCallback(() => {
    // Define the API URL
    const apiUrl = 'https://raw.githubusercontent.com/Jxkeorton/APIs/main/locations.json';

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

    const fetchData = async () => {
      // Fetch data from the API
      fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        // Parse the location ID to an integer
        const parsedLocationId = parseInt(id);

        // Find the location with the matching ID
        const location = data.locations.find((loc) => loc.id === parsedLocationId);

        // Set the location in the state
        setLocation(location);
      })
      .catch((error) => {
        console.error('Error fetching location data:', error);
      });
    }
    
    fetchData();

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
    <View style={styles.container}>
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
                {location.details.rockdrop ? 
                  <Text style={styles.text}>{location.details.rockdrop}ft</Text>
                : 
                  <Text style={styles.text}>?</Text> 
                } 

                {location.details.total ? 
                  <Text style={styles.text}>{location.details.total}ft</Text>
                : 
                  <Text style={styles.text}> ? </Text> 
                }

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
    marginRight: 20,
  },
  openedByContainer: {
    alignItems: 'center',
    marginVertical: 5,
    flexDirection: 'row',
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