import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import {Callout} from 'react-native-maps';
import { router } from 'expo-router';

const onSaveToggle = async () => {
    return
}

const onGoogleMapsPress = async () => {
    return
}

const isLoggedIn = true;

const saved = false;

export default function CustomCallout({info}) {
  const onDetailsPress = () => {
    router.push(`/home/map/${info.id}`)
  }
  
  return (
    <Callout>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{info.name.toUpperCase()}</Text>
          <Text style={styles.calloutCoordinates}>
            {info.coordinates[0]}, {info.coordinates[1]}
          </Text>
          {isLoggedIn && (
            <TouchableOpacity
              onPress={onSaveToggle}
              style={[
                styles.calloutButton,
              ]}
            >
              <Text style={styles.calloutButtonText}>
                Save
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onDetailsPress}
            style={styles.calloutButton}
          >
            <Text style={styles.calloutButtonText}>Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onGoogleMapsPress}
            style={styles.calloutButton}
          >
            <Text style={styles.calloutButtonText}>Google pin</Text>
          </TouchableOpacity>
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
      backgroundColor: '#00ABF0',
      borderColor: 'black',
    },
    calloutButtonText: {
      color: 'black',
    },
    
  });