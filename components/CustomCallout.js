import { StyleSheet, View, Text, TouchableOpacity, Linking, Platform} from 'react-native'
import {Callout} from 'react-native-maps';
import { router} from 'expo-router';
import { useUnitSystem } from '../context/UnitSystemContext';

export default function CustomCallout({info}) {
  const { isMetric } = useUnitSystem();

  // function to direct to the locations details page
  const onDetailsPress = () => {
    router.push(`/(tabs)/map/${info.id}`)
  }

  // Function to convert feet to meters when isMetric is true
  const convertToMeters = (value) => {
    return (value ? `${Math.round(parseFloat(value) * 0.3048)} meters` : '?');
  };
  
  return (
    <Callout onPress={() => onDetailsPress('details')}>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{info.name.toUpperCase()}</Text>
          <Text style={styles.calloutCoordinates}>
            Rock Drop: {isMetric ? convertToMeters(info.rock_drop_ft) : (info.rock_drop_ft ? `${info.rock_drop_ft} ft` : '?')}
          </Text>
          <Text style={styles.calloutCoordinates}>
            Total: {isMetric ? convertToMeters(info.total_height_ft) : (info.total_height_ft ? `${info.total_height_ft} ft` : '?')}
          </Text>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              onPress={() => onDetailsPress('details')}
              style={styles.calloutButton}
            >
              <Text style={styles.calloutButtonText}>Details</Text>
            </TouchableOpacity>
          )}
        </View>
      </Callout>
  )
}

const styles = StyleSheet.create({
    calloutContainer: {
      width: 200,
      padding: 10,
      borderRadius: 10,
      backgroundColor: 'white',
    },
    calloutTitle: {
      fontWeight: 'bold',
      marginBottom: 5,
    },
    calloutCoordinates: {
      marginBottom: 5,
    },
    calloutButton: {
      marginTop: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
      backgroundColor: 'black',
    },
    savedButton: {
      backgroundColor: 'red', 
    },
    calloutButtonText: {
      color: 'white',
    },
    
  });