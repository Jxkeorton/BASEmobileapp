import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, TextInput} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { getLoggedJumps } from '../store';
import { getJumpnumber } from '../store';
import { ActivityIndicator } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

const LogbookJumpCard = () => {
    const [jumps, setLoggedJumps ] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    //Search 
    const [searchTerm, setSearchTerm] = useState('');

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
                  Toast.show({
                    type: 'error', // You can customize the type (success, info, error, etc.)
                    text1: 'Could not fetch data',
                    position: 'top',
                  });
                } finally {
                    setIsLoading(false); // Set loading to false once data is fetched
                }
            }
          loadData();
        },[])
    );

    // function to direct to the locations details page
    const onCardPress = (index, jump) => {
      router.push({pathname: `/(tabs)/logbook/${index}`, params: {jumpNumber: jump.jumpNumber}})
    }

    const filteredJumps = jumps.filter((jump) =>
      jump.jumpNumber.toString().includes(searchTerm) ||
      jump.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <ActivityIndicator size='large' style={{ flex: 1 }} />;
      }

return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <View style={styles.searchBox} >
        <View style={styles.textInputContainer} >
          <TextInput 
            placeholder='Search Jumps'
            placeholderTextColor='#000'
            autoCapitalize='none'
            style={{flex:1, padding:0}}
            onChangeText={text => setSearchTerm(text)}
            value={searchTerm}
          />
          <Ionicons name='ios-search' size={20} color='#000' />
        </View>
      </View>

      {filteredJumps.length > 0 ? (
        filteredJumps.map((jump, index) => (
        <TouchableOpacity key={index} style={styles.jumpCard} onPress={() => onCardPress(index, jump)}>
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
      ))
    ) : (
      <View style={styles.emptyMessage}>
        <Text style={styles.emptyMessageText}>
          Add jumps using the + button
        </Text>
        <Text style={[styles.emptyMessageText, {marginTop: 30}]}>
            You can edit the total jump number within your profile/edit profile.
        </Text>
      </View>
    )}
    
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
      searchBox: {
        position: 'fixed',
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
        marginTop: 10,
        marginBottom: 20,
      },
    textInputContainer: {
        flexDirection: 'row',
        marginRight: 10,
        marginBottom: 10, 
    },
    emptyMessage: {
      position: 'fixed',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
    },
    emptyMessageText: {
      fontWeight: 'bold',
      fontSize: 16,
      textAlign: 'center',
    },
  });