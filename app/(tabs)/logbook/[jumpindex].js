import React, { useState } from "react";
import { useLocalSearchParams, useFocusEffect, Stack} from 'expo-router';
import { getLoggedJumps } from "../../../store";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { router } from "expo-router";
import { deleteJumpHandler, takeawayJumpNumber } from "../../../store";
import Toast from 'react-native-toast-message';

const jumpDetails = () => {
    const [jump , setJump] = useState(null)
    const params = useLocalSearchParams();
    const [ images, setImages ] = useState([]);

    
    const [imageLoadStates, setImageLoadStates] = useState([]);

    const { jumpindex, jumpNumber} = params;

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                try {
                  // Fetch the user's logged jumps
                  const jumps = await getLoggedJumps();

                  // Reverse the jumps array
                  const reversedJumps = jumps.reverse();

                  // Check if jumpindex is a valid index in the reversedJumps array
                  if (jumpindex >= 0 && jumpindex < reversedJumps.length) {
                    // Set the jump with the specified index to the jump state
                    setJump(reversedJumps[jumpindex]);
                    setImages(reversedJumps[jumpindex].imageURLs);
                    setImageLoadStates(Array(reversedJumps[jumpindex].imageURLs.length).fill(false));

                  }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
            loadData();
        }, [jumpindex])
    )

    const handleDeleteJump = async () => {
      try {
        const jumpId = jump.id;
    
        // Call the deleteJumpHandler with the jump ID
        await deleteJumpHandler(jumpId);
        await takeawayJumpNumber();

        router.back('Logbook');

        Toast.show({
          type: 'info', 
          text1: 'Jump deleted',
          position: 'top',
        });
        

      } catch (error) {
        console.error('Error deleting jump:', error);
      }
    };

    const handleImageProgress = (index, loaded, total) => {
      // Calculate the progress as a percentage
      const progress = (loaded / total) * 100;
  
      setImageLoadStates((prevStates) => {
        const newState = [...prevStates];
        newState[index] = progress < 100;
        return newState;
      });
    };

    if (!jump) {
      return (
        <View style={styles.noJumpContainer}>
          <Text style={[styles.noImageText, {fontSize: 25} ]}>Cannot Fetch Jump, Try again</Text>
        </View>
      
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Stack.Screen
          options={{
            title: jumpNumber,
          }}
        />

        <Card style={{alignItems: 'center'}}>
          <Card.Content>
            {jump.location && 
            <View>
                <Title style={styles.title}>{jump.location.toUpperCase()}</Title>
            </View>
            }

            <View style={styles.mainContainer}>
              <View style={styles.subtitleContainer}>
                <Text style={styles.subtitleText}>Exit Type: </Text>
                <Text style={styles.subtitleText}>Delay: </Text>
                <Text style={styles.subtitleText}>Date: </Text>
                
              </View>
              <View style={styles.textContainer}>
                {jump.exitType && <Text style={styles.text}>{jump.exitType}</Text>}
                {jump.delay && <Text style={styles.text}>{jump.delay} sec</Text>}
                {jump.date && <Text style={styles.text}>{jump.date}</Text>}
                
              </View>
            </View>
            <Text style={styles.subtitleText}>Details: </Text>
            {jump.details && <Paragraph style={styles.text}>{jump.details}</Paragraph>}

            
          </Card.Content>
        </Card>    
        
        <View style={styles.imageContainer}>
          {images && images.length > 0 ? (
            images.map((image, index) => (
              <View key={index}>
                {imageLoadStates[index] !== false && (
                  <View style={styles.progressBarContainer}>
                    <ActivityIndicator />
                    
                  </View>
                )}
                <Image
                  source={{ uri: image }}
                  style={{ width: 150, height: 150, margin: 8 }}
                  onError={() => console.log('Image failed to load')}
                  onProgress={(event) => {
                    handleImageProgress(index, event.loaded, event.total);
                  }}
                  onLoadEnd={() => {
                    // Mark the image as fully loaded
                    setImageLoadStates((prevStates) => {
                      const newState = [...prevStates];
                      newState[index] = false;
                      return newState;
                    });
                  }}
                />
              </View>
            ))
          ) : (
            <Text style={styles.noImageText}>No images available</Text>
          )}
        </View>
    

        <Button
          style={styles.deleteButton}
          mode="contained"
          buttonColor="red"
          onPress={handleDeleteJump}
        >
          Delete Jump
        </Button>
          
      </ScrollView>
    )
  };
  
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 18,
      marginBottom: 8,
    },
    imageContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start', // You can adjust this as needed
      alignItems: 'flex-start'
    },
    image: {
      width: '48%', // You can set this to any desired width
      aspectRatio: 1, // Maintain aspect ratio (1:1)
      marginBottom: 8,
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
    mainContainer: {
      flexDirection: 'row',
      marginTop: 10,
      marginBottom: 5,
      alignItems: 'flex-start'
    },
    textContainer: {
      width: '60%', // Adjust the width as needed
    },
    subtitleContainer: {
      width: '40%', // Adjust the width as needed
      alignItems: 'flex-start',
    },
    noImageText: {
      marginVertical:15,
      fontWeight: 'bold'
    },
    noJumpContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      margin: 20,
    },
    progressBarContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%', 
      borderRadius: 5, 
      marginBottom: 8, 
    },
  });
  
  export default jumpDetails;