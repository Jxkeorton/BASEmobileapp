import React, { useState } from "react";
import { useLocalSearchParams, useFocusEffect, Stack} from 'expo-router';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { router } from "expo-router";
import Toast from 'react-native-toast-message';

import { useUser } from "../../../providers/UserProvider";

const jumpDetails = () => {
    const [jump , setJump] = useState(null)
    const params = useLocalSearchParams();
    const [ images, setImages ] = useState([]);
    const [imageLoadStates, setImageLoadStates] = useState([]);

    const { jumpindex, jumpNumber} = params;

    const { 
        getLoggedJumps, 
        deleteJump, 
        loading 
    } = useUser();

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                try {
                  const jumps = await getLoggedJumps();

                  // Reverse the jumps array
                  const reversedJumps = jumps.reverse();

                  // Check if jumpindex is a valid index in the reversedJumps array
                  if (jumpindex >= 0 && jumpindex < reversedJumps.length) {
                    // Set the jump with the specified index to the jump state
                    setJump(reversedJumps[jumpindex]);
                    
                    const jumpImages = reversedJumps[jumpindex].imageURLs || [];
                    setImages(jumpImages);
                    setImageLoadStates(Array(jumpImages.length).fill(false));
                  }
                } catch (error) {
                    console.error('Error fetching data:', error);
                    Toast.show({
                      type: 'error',
                      text1: 'Failed to load jump details',
                      position: 'top',
                    });
                }
            }
            loadData();
        }, [jumpindex, getLoggedJumps])
    )

    const handleDeleteJump = async () => {
      if (!jump || !jump.id) {
        Toast.show({
          type: 'error',
          text1: 'Cannot delete jump - invalid jump data',
          position: 'top',
        });
        return;
      }

      try {
        const result = await deleteJump(jump.id);
        
        if (result.success) {
          router.back();

          Toast.show({
            type: 'success', 
            text1: 'Jump deleted successfully',
            position: 'top',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Failed to delete jump',
            text2: result.error,
            position: 'top',
          });
        }
      } catch (error) {
        console.error('Error deleting jump:', error);
        Toast.show({
          type: 'error',
          text1: 'Error deleting jump',
          position: 'top',
        });
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

    if (loading.action) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ABF0" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      );
    }

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
                <Text style={styles.text}>{jump.exitType || 'N/A'}</Text>
                <Text style={styles.text}>{jump.delay ? `${jump.delay} sec` : 'N/A'}</Text>
                <Text style={styles.text}>{jump.date || 'N/A'}</Text>
              </View>
            </View>
            
            <Text style={styles.subtitleText}>Details: </Text>
            <Paragraph style={styles.text}>{jump.details || 'No details provided'}</Paragraph>
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
          disabled={loading.action}
        >
          {loading.action ? 'Deleting...' : 'Delete Jump'}
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  image: {
    width: '48%',
    aspectRatio: 1,
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
    width: '60%',
  },
  subtitleContainer: {
    width: '40%',
    alignItems: 'flex-start',
  },
  noImageText: {
    marginVertical:15,
    fontWeight: 'bold'
  },
  noJumpContainer: {
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  deleteButton: {
    marginTop: 20,
    marginBottom: 10,
  },
});
  
export default jumpDetails;