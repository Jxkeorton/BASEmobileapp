import React, { useState } from "react";
import { useLocalSearchParams, useFocusEffect, Stack} from 'expo-router';
import { getLoggedJumps } from "../../../store";
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ActivityIndicator } from "react-native-paper";
import { Image } from 'expo-image';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { router } from "expo-router";
import { deleteJumpHandler, takeawayJumpNumber } from "../../../store";

const jumpDetails = () => {
    const [jump , setJump] = useState(null)
    const params = useLocalSearchParams();
    const [ images, setImages ] = useState([]);

    const { jumpindex, jumpNumber} = params;

    const [loadingProgress, setLoadingProgress] = useState(0);

    const handleImageLoad = (progressEvent) => {
      const progress = progressEvent.loaded / progressEvent.total;
      setLoadingProgress(progress);
    };

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
                    setImages(reversedJumps[jumpindex].imageURLs)
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
        // You should have access to jump ID or some unique identifier
        // for the jump you want to delete. Replace 'jump.id' with the actual ID.
        const jumpId = jump.id;
    
        // Call the deleteJumpHandler with the jump ID
        await deleteJumpHandler(jumpId);
        await takeawayJumpNumber();
    
        router.back()

      } catch (error) {
        console.error('Error deleting jump:', error);
      }
    };


    if (!jump) {
      return <ActivityIndicator />;
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
                <Title style={styles.title}>{jump.location}</Title>
            </View>
            }

            <View style={styles.mainContainer}>
              <View>
                <Text style={styles.subtitleText}>Exit Type: </Text>
                <Text style={styles.subtitleText}>Delay: </Text>
                <Text style={styles.subtitleText}>Date of Jump: </Text>
                <Text style={styles.subtitleText}>Details: </Text>
              </View>
              <View>
                {jump.exitType && <Text style={styles.text}>{jump.exitType}</Text>}
                {jump.delay && <Text style={styles.text}>{jump.delay} sec</Text>}
                {jump.date && <Text style={styles.text}>{jump.date}</Text>}

                {jump.details && <Paragraph style={styles.text}>{jump.details}</Paragraph>}
              </View>
            </View>

            
          </Card.Content>
        </Card>

        {loadingProgress > 0 && loadingProgress < 1 && (
            <View style={styles.progressBar}>
              <View style={{ width: `${loadingProgress * 100}%`, height: 5, backgroundColor: 'blue', marginBottom: 20 }} />
            </View>
        )}
        
        <View style={styles.imageContainer}>
          {images && images.length > 0 ? (
            images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={{width: 150, height: 150, margin: 8}} onError={() => console.log('Image failed to load')} onProgress={handleImageLoad}/>
            ))
          ) : (
            <Text>No images available</Text>
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
    progressBar: {
      backgroundColor: '#ccc',
      height: 5,
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
      flexWrap: 'wrap',
      flexDirection: 'row',
      marginTop: 10,
      marginBottom: 5,
    },
  });
  
  export default jumpDetails;