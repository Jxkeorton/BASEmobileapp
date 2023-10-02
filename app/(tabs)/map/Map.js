import { StyleSheet, View, TextInput, TouchableWithoutFeedback, Keyboard, Text, TouchableHighlight} from 'react-native'
import { Switch, Portal, PaperProvider } from 'react-native-paper'
import React, { useState, useEffect } from 'react'
import MapView from 'react-native-map-clustering';
import {Marker} from 'react-native-maps';
import CustomCallout from '../../../components/CustomCallout';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { FontAwesome } from '@expo/vector-icons'; 
import ModalContent from '../../../components/ModalContent';

// fetching locations & location data 
const fetchData = async () => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/Jxkeorton/APIs/main/locations.json');
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


export default function Map() {
  const [eventData, setEventData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [satelliteActive, setSatelliteActive] = useState(false)
  const [cluster, setCluster] = useState(false)

  // filter modal dropdown state 
  const [minRockDrop, setMinRockDrop] = useState('');
  const [maxRockDrop, setMaxRockDrop] = useState('');
  const [unknownRockdrop, setUnknownRockDrop] = useState(false);

  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  useEffect(() => {
    async function fetchDataAndSetState() {
      const locations = await fetchData();
      setEventData(locations);
    }

    fetchDataAndSetState();
  }, []);

  const onRegionChange = (Region) => {
    console.log(Region)
  }

  // when filter by rockdrop is used 
  const filterEventsByRockDrop = (event) => {
    // Extract the numeric part from event.details.rockdrop
    const rockdropString = event.details.rockdrop;

    // Check if the rockdrop value contains a question mark and if unknownRockdrop is false
    if (unknownRockdrop && (rockdropString === '' || rockdropString.includes('?'))) {
      return false;
    }

    const numericRockdrop = parseFloat(rockdropString.match(/\d+/)); // Extract the first numeric value
  
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
          clusteringEnabled={cluster}
        >
        {eventData
          .filter(event => event.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .filter(event => filterEventsByRockDrop(event))
          .map((event, index) => (
              <Marker
              key={index}
              coordinate={{ latitude: event.coordinates[0], longitude: event.coordinates[1] }}
              title={event.name}
              description={event.openedBy.name}
              pinColor='black'
          >
            <CustomCallout info={event} />
          </Marker>
        ))}
        
      </MapView>
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
            onPress={showModal}
            underlayColor="#DDDDDD" 
            style={styles.filterButton}
          >
            <View style={styles.dropdownIcon}>
              <FontAwesome name="filter" size={20} color="#000" />
            </View>
          </TouchableHighlight>
        </View>
        
        <View style={styles.switchContainer}>
          <View style={styles.switchHalf}>
              <Text>Cluster</Text>
              <Switch
                value={cluster}
                onValueChange={() => setCluster(!cluster)}
                color="#00ABF0" // Change the color as desired
              />
          </View>
          <View style={styles.switchHalf}>
              <Text>Satellite</Text>
              <Switch
                value={satelliteActive}
                onValueChange={() => setSatelliteActive(!satelliteActive)}
                color="#00ABF0" // Change the color as desired
              />
          </View>
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
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 10, 
  },
  textInputContainer: {
    flexDirection: 'row',
    marginRight: 10,
    marginBottom: 10, 
  },
   // Divide the switchHalf into two equal halves
   switchHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
})

