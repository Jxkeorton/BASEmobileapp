import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getLoggedJumps } from '../store';



const LogbookJumpCard = ({jumpNumber}) => {
    const [jumps, setLoggedJumps ] = useState([])
    

    useFocusEffect(
        React.useCallback(() => {
          const getUserLoggedJumps = async () => {
            const jumps = await getLoggedJumps()
            // Reverse the jumps array to map from the end first
            const reversedJumps = [...jumps].reverse();
            const jumpsWithNumbers = reversedJumps.map((jump, index) => ({
                ...jump,
                jumpNumber: jumpNumber - index 
              }));
            setLoggedJumps(jumpsWithNumbers);
          }
        
          getUserLoggedJumps();
        },[])
    );

return (
    <ScrollView contentContainerStyle={styles.container}>
      {jumps.map((jump, index) => (
        <View key={index} style={styles.jumpCard}>
          {jump.imageURLs && jump.imageURLs.length > 0 ? (
            <ImageBackground source={{ uri: jump.imageURLs[0] }} style={styles.backgroundImage}>
              <View style={styles.darkOverlay}></View>
              <View style={styles.jumpCardContent}>
                <Text style={styles.contentText}>{jump.jumpNumber}</Text>
              </View>
            </ImageBackground>
          ) : (
            <View style={[styles.backgroundImage, styles.blackBackground]}>
              <View style={styles.jumpCardContent}>
                <Text style={styles.contentText}>{jump.jumpNumber}</Text>
              </View>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
)
};

export default LogbookJumpCard;

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: 8,
    },
    jumpCard: {
      width: '31%', 
      marginBottom: 16,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: 'white', 
    },
    backgroundImage: {
      width: '100%',
      height: 150, 
      resizeMode: 'cover',
      justifyContent: 'center',
    },
    jumpCardContent: {
      padding: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    darkOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Adjust opacity as needed
      },
    contentText: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
    },
    blackBackground: {
        backgroundColor: 'black',
      },
  });