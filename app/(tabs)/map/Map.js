import { StyleSheet, View, TextInput, TouchableWithoutFeedback, Keyboard, Text, TouchableHighlight} from 'react-native'
import { Switch, Portal, PaperProvider, ActivityIndicator } from 'react-native-paper'
import React, { useState } from 'react'
import MapView from 'react-native-map-clustering';
import {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import CustomCallout from '../../../components/CustomCallout';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons'; 
import ModalContent from '../../../components/ModalContent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUnitSystem } from '../../../context/UnitSystemContext';
import { useLocationsQuery } from '../../../hooks/useLocationsQuery';

const saveEventToStorage = async (event) => {
  try {
    const eventWithIntegerId = {
      ...event,
      id: parseInt(event.id, 10)
    };

    let savedEvents = await AsyncStorage.getItem('savedEvents');
    if (savedEvents) {
      savedEvents = JSON.parse(savedEvents);
    } else {
      savedEvents = [];
    }

    savedEvents.push(eventWithIntegerId);

    if (savedEvents.length > 10) {
      savedEvents.shift();
    }

    await AsyncStorage.setItem('savedEvents', JSON.stringify(savedEvents));
  } catch (error) {
    console.error('Error saving event to AsyncStorage:', error);
  }
};

export default function Map() {
  // Use TanStack Query for locations data
  const { data: eventData = [], isLoading: loadingMap, error } = useLocationsQuery();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [satelliteActive, setSatelliteActive] = useState(false);
  
  // Loading states for UI interactions
  const [satelliteViewLoading, setSatelliteLoading] = useState(false);
  const [filterIconLoading, setFilterIconLoading] = useState(false);

  // Filter modal state 
  const [minRockDrop, setMinRockDrop] = useState('');
  const [maxRockDrop, setMaxRockDrop] = useState('');
  const [unknownRockdrop, setUnknownRockDrop] = useState(false);
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const { isMetric } = useUnitSystem();

  const filterEventsByRockDrop = (event) => {
    const rockdropString = event.details.rockdrop;
  
    if (unknownRockdrop && (rockdropString === '' || rockdropString.includes('?'))) {
      return false;
    }
  
    const numericRockdrop = parseFloat(rockdropString.match(/\d+/));
  
    if (isMetric) {
      const numericRockdropMeters = numericRockdrop * 0.3048;
      if (minRockDrop !== '' && numericRockdropMeters < parseFloat(minRockDrop)) {
        return false;
      }
      if (maxRockDrop !== '' && numericRockdropMeters > parseFloat(maxRockDrop)) {
        return false;
      }
    } else {
      if (minRockDrop !== '' && numericRockdrop < parseFloat(minRockDrop)) {
        return false;
      }
      if (maxRockDrop !== '' && numericRockdrop > parseFloat(maxRockDrop)) {
        return false;
      }
    }
  
    return true;
  };

  // Handle loading and error states
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error loading locations: {error.message}</Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
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
          
          {loadingMap ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ABF0" />
            </View>
          ) : (
            <MapView 
              style={styles.map}
              initialRegion={{
                latitude: 56.25284254305279,
                longitude: -2.653906767865911,
                latitudeDelta: 14.138225243481841,
                longitudeDelta: 14.52603159394414,
              }}
              mapType={satelliteActive ? 'hybrid' : 'standard'}
              clusterColor='black'
              clusterTextColor='white'
              clusteringEnabled={true}
              provider={PROVIDER_GOOGLE}
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
                    pinColor='red'
                    onPress={() => saveEventToStorage(event)}
                  >
                    <CustomCallout info={event} />
                  </Marker>
                ))}
            </MapView>
          )}
          
          <View style={styles.searchBox}>
            <View style={styles.textInputContainer}>
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
                  color="#00ABF0"
                />
              )}
              <Text style={[styles.switchLabel, {paddingLeft: 5}]}>Imperial</Text>
              <Switch
                value={isMetric}
                onValueChange={() => {}} // This should be handled by UnitSystemContext
                color="#00ABF0"
              />
              <Text style={styles.switchLabel}>Metric</Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </PaperProvider>
  );
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

