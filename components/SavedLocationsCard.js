import React from 'react';
import { Button, Card, Text as Text2 } from 'react-native-paper';
import { View, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useUser } from '../providers/UserProvider';

// unit state 
import { useUnitSystem } from '../context/UnitSystemContext';

const SavedLocationsCard = ({ data, onDelete }) => {

  const { isMetric } = useUnitSystem();

  const { isProUser } = useUser();

  // function to direct to the locations details page
   const onDetailsPress = (itemId) => {
    if (isProUser) {
      router.navigate(`/(tabs)/map/${itemId}`)
    } else {
      router.navigate('/SubscriptionsPage')
    }
   };

    // Function to convert feet to meters when isMetric is true
    const convertToMeters = (value) => {
      return (value ? `${Math.round(parseFloat(value) * 0.3048)} meters` : '?');
    };

    // Check if data is empty
    if (data.length === 0) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>No Saved Locations</Text>
          <View style={{ justifyContent: 'center'}}>
            <Text>Visit the Map to save locations</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Saved Locations</Text>
        {data.map((item) => (
          <View key={item.id} style={styles.card}>
            <Card>
              <Card.Content>
                <Text2 variant='titleLarge'>{item.name}</Text2>
                <Text style={styles.calloutCoordinates}>
                  Rock Drop: {isMetric ? convertToMeters(item.details.rockdrop) : (item.details.rockdrop ? `${item.details.rockdrop} ft` : '?')}
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button
                  style={styles.buttonOutlined}
                  textColor="black"
                  onPress={() => onDetailsPress(item.id)}
                >
                  Details
                </Button>
                <Button style={styles.button} onPress={() => onDelete(item.id)}>
                  Unsave
                </Button>
              </Card.Actions>
            </Card>
          </View>
        ))}
        
      </View>
    );
};

export default SavedLocationsCard;

const styles = StyleSheet.create({
    container: {
      marginVertical: 10,
      padding: 10,
      backgroundColor: '#f4f4f4',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    card: {
      marginVertical: 10,
      marginLeft: 5,
      width: '98%',
      backgroundColor: '#f4f4f4'
    },
    button: {
        backgroundColor: '#00ABF0'
    },
    buttonOutlined: {
        buttonColor: 'black',
    },
    calloutCoordinates: {
      marginBottom: 5,
    },
  });