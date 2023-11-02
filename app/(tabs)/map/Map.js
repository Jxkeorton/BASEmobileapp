import { StyleSheet, View, TextInput, TouchableWithoutFeedback, Keyboard, Text, TouchableHighlight} from 'react-native'
import { Switch, Portal, PaperProvider, ActivityIndicator } from 'react-native-paper'
import React, { useState, useEffect } from 'react'
import MapView from 'react-native-map-clustering';
import {Marker} from 'react-native-maps';
import CustomCallout from '../../../components/CustomCallout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons'; 
import ModalContent from '../../../components/ModalContent';

//state 
import { useUnitSystem } from '../../../context/UnitSystemContext';

//async storage
import AsyncStorage from '@react-native-async-storage/async-storage';


// fetching locations & location data 
const fetchData = async () => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/Jxkeorton/APIs/main/worldlocations.json');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    const locations = data.locations;
  
    return locations;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const saveEventToStorage = async (event) => {
  try {
    // Create a new event object with an integer ID
    const eventWithIntegerId = {
      ...event,
      id: parseInt(event.id, 10) // Parse the ID as an integer
    };

    let savedEvents = await AsyncStorage.getItem('savedEvents');
    if (savedEvents) {
      savedEvents = JSON.parse(savedEvents);
    } else {
      savedEvents = [];
    }

    // Add the new event to the list
    savedEvents.push(eventWithIntegerId);

    // Ensure that the list doesn't exceed the maximum limit (10)
    if (savedEvents.length > 10) {
      savedEvents.shift(); // Remove the oldest event
    }

    await AsyncStorage.setItem('savedEvents', JSON.stringify(savedEvents));
    
  } catch (error) {
    console.error('Error saving event to AsyncStorage:', error);
  }
};



export default function Map() {
  const [eventData, setEventData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [satelliteActive, setSatelliteActive] = useState(false)

  // loading states
  const [satelliteViewLoading, setSatelliteLoading] = useState(false);
  const [filterIconLoading, setFilterIconLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState(true);


  // filter modal dropdown state 
  const [minRockDrop, setMinRockDrop] = useState('');
  const [maxRockDrop, setMaxRockDrop] = useState('');
  const [unknownRockdrop, setUnknownRockDrop] = useState(false);

  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  //unit state
  const { isMetric, toggleUnitSystem } = useUnitSystem();

  useEffect(() => {
    async function fetchDataAndSetState() {
      const locations = await fetchData();
      setEventData(locations);
      setLoadingMap(false); 
    }

    fetchDataAndSetState();
  }, []);

  useEffect(() => {
    console.log('isMetric has changed:', isMetric);
  }, [isMetric]);

  const filterEventsByRockDrop = (event) => {
    // Extract the numeric part from event.details.rockdrop
    const rockdropString = event.details.rockdrop;
  
    // Check if the rockdrop value contains a question mark and if unknownRockdrop is false
    if (unknownRockdrop && (rockdropString === '' || rockdropString.includes('?'))) {
      return false;
    }
  
    // Extract the numeric part of rockdropString using a regular expression
    const numericRockdrop = parseFloat(rockdropString.match(/\d+/));
  
    // If isMetric is true, convert to meters
    if (isMetric) {
      const numericRockdropMeters = numericRockdrop * 0.3048; // Convert to meters
      // Check if either minRockDrop or maxRockDrop is not an empty string
      if (minRockDrop !== '') {
        // Check if numericRockdropMeters is greater than or equal to the minimum
        if (numericRockdropMeters < parseFloat(minRockDrop)) {
          return false;
        }
      }
  
      if (maxRockDrop !== '') {
        // Check if numericRockdropMeters is less than or equal to the maximum
        if (numericRockdropMeters > parseFloat(maxRockDrop)) {
          return false;
        }
      }
    } else {
      // Check if either minRockDrop or maxRockDrop is not an empty string
      if (minRockDrop !== '') {
        // Check if numericRockdrop is greater than or equal to the minimum
        if (numericRockdrop < parseFloat(minRockDrop)) {
          return false;
        }
      }
  
      if (maxRockDrop !== '') {
        // Check if numericRockdrop is less than or equal to the maximum
        if (numericRockdrop > parseFloat(maxRockDrop)) {
          return false;
        }
      }
    }
  
    // If both minRockDrop and maxRockDrop are null or pass the checks, return true (no filtering)
    return true;
  };

  return (
    <PaperProvider>
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={styles.container} >
      <Portal>
        <ModalContent
          visible={visible}
          onClose={hideModal}
          onApplyFilter={(min, max, unknown) => {
            setMinRockDrop(min);
            setMaxRockDrop(max);
            setUnknownRockDrop(unknown);
          }}
          minRockDrop={minRockDrop}
          maxRockDrop={maxRockDrop}
        />
      </Portal>
      {loadingMap ? ( // Conditional rendering for loading state
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ABF0" />
            </View>
          ) : (
      <MapView style={styles.map}
          initialRegion={{
              latitude: 56.25284254305279,
              longitude: -2.653906767865911,
              latitudeDelta: 14.138225243481841,
              longitudeDelta: 14.52603159394414,
          }}
          mapType={satelliteActive ? 'hybrid' : 'standard'}
          clusterColor='#00ABF0'
          clusterTextColor='black'
          clusteringEnabled={true}
        >
        {eventData
          .filter((event) =>
            event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.country.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .filter(event => filterEventsByRockDrop(event))
          .map((event, index) => (
              <Marker
              key={index}
              coordinate={{ latitude: event.coordinates[0], longitude: event.coordinates[1] }}
              title={event.name || 'Unknown Name'}
              description={event.openedBy && event.openedBy.name ? event.openedBy.name : ''}
              pinColor='black'
              onPress={() => saveEventToStorage(event)}
          >
            <CustomCallout info={event} />
          </Marker>
        ))}
        
      </MapView>
          )}
      <View style={styles.searchBox} >
        <View style={styles.textInputContainer} >
          <TextInput 
            placeholder='Search here'
            placeholderTextColor='#000'
            autoCapitalize='none'
            style={{flex:1, padding:0}}
            onChangeText={text => setSearchTerm(text)}
            value={searchTerm}
          />
          <Ionicons name='ios-search' size={20} color='#000' />
          <TouchableHighlight
            onPress={async () => {
              setFilterIconLoading(true);

              // Perform your filter icon action here, such as showing a modal.
              showModal();

              setFilterIconLoading(false);
            }}
            underlayColor="#DDDDDD"
            style={styles.filterButton}
          >
            <View style={styles.dropdownIcon}>
              {filterIconLoading ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : (
                <FontAwesome name="filter" size={20} color="#000" />
              )}
            </View>
          </TouchableHighlight>
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Satellite</Text>
          {satelliteViewLoading ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : (
            <Switch
              value={satelliteActive}
              onValueChange={() => {
                setSatelliteLoading(true);
                setTimeout(() => {
                  setSatelliteActive(!satelliteActive);
                  setSatelliteLoading(false);
                }, 100);
              }}
              color="#00ABF0" // Change the color as desired
            />
          )}
          <Text style={[styles.switchLabel, {paddingLeft: 5}]}>Imperial</Text>
          {/* Switch for changing between Imperial and Metric units */}
          <Switch
            value={isMetric}
            onValueChange={toggleUnitSystem}
            color="#00ABF0" // Change the color as desired
          />
          <Text style={styles.switchLabel}>Metric</Text>

        </View>
      </View>
      </View>
    </TouchableWithoutFeedback>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bubble: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 0.5,
    padding: 15,
    width: 150,
  },
  name: {
    fontSize: 16,
    marginBottom: 5,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#007a87',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -0.5,
  },
  arrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#fff',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -32,
  },
  searchBox: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
    marginTop: 50,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
    backgroundColor: 'black',
  },
  text: {
    color: 'white',
  },
  buttonSatellite: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'black',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginTop: 10,
  },
  switchLabel: {
    marginHorizontal: 5,
    color: 'black',
  },
  textInputContainer: {
    flexDirection: 'row',
    marginRight: 10,
    marginBottom: 10, 
  },
  // modal styles 
  dropdownIcon: {
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
    marginBottom: 10,
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: 200,
  },
  modalFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  panelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#00ABF0',
    alignItems: 'center',
    marginVertical: 7,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  filterButton: {
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

