import { StyleSheet, View, TextInput, TouchableWithoutFeedback, Keyboard, Pressable, Text} from 'react-native'
import { Switch } from 'react-native-paper'
import React, { useState, useEffect } from 'react'
import MapView from 'react-native-map-clustering';
import {Marker} from 'react-native-maps';
import CustomCallout from '../../../components/CustomCallout';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

  const onPress = () => {
    if(cluster) {
      setCluster(false)
    } else {
      setCluster(true)
    }
  }

  const onPressSatellite = () => {
    if(satelliteActive){
      setSatelliteActive(false)
    } else {
      setSatelliteActive(true)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.container} >

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
})

