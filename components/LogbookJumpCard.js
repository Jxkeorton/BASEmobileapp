import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { getLoggedJumps } from '../store';
import { getJumpnumber } from '../store';
import { ActivityIndicator } from 'react-native-paper';

const LogbookJumpCard = () => {
    const [jumps, setLoggedJumps ] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                try {
                  // Fetch the jump number
                  const jumpno = await getJumpnumber();
          
                  // Fetch the user's logged jumps
                  const jumps = await getLoggedJumps();

                   // Reverse the jumps array
                  const reversedJumps = jumps.reverse();
          
                   // Create an array of promises to fetch jump numbers for each jump
                    const jumpNumberPromises = reversedJumps.map(async (jump, index) => {
                        const jumpNumber = jumpno - index;
                        return jumpNumber;
                    });
            
                    // Use Promise.all to resolve all jumpNumberPromises
                    const resolvedJumpNumbers = await Promise.all(jumpNumberPromises);
            
                    // Assign jump numbers to jumps
                    const jumpsWithNumbers = jumps.map((jump, index) => ({
                        ...jump,
                        jumpNumber: resolvedJumpNumbers[index],
                    }));
            
                    setLoggedJumps(jumpsWithNumbers);
                  
                } catch (error) {
                  console.error('Error fetching data:', error);
                } finally {
                    setIsLoading(false); // Set loading to false once data is fetched
                }
            }
          loadData();
        },[])
    );

    // function to direct to the locations details page
    const onCardPress = (index) => {
      router.push(`/(tabs)/logbook/${index}`)
    }

    if (isLoading) {
        return <ActivityIndicator size='large' style={{ flex: 1 }} />;
      }

return (
    <ScrollView contentContainerStyle={styles.container}>
      {jumps.map((jump, index) => (
        <TouchableOpacity key={index} style={styles.jumpCard} onPress={() => onCardPress(index)}>
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
                <Text>{jump.location}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
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