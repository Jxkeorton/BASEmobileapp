import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, TextInput} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

import { useUser } from '../providers/UserProvider';

const LogbookJumpCard = () => {
    const [jumps, setLoggedJumps ] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    //Search 
    const [searchTerm, setSearchTerm] = useState('');

    const { 
        getLoggedJumps, 
        profile, 
        loading 
    } = useUser();

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                try {
                    setIsLoading(true);
                    
                    const jumpno = profile.jumpNumber || 0;
            
                    const jumps = await getLoggedJumps();
    
                    // Reverse the jumps array to show newest first
                    const reversedJumps = jumps.reverse();
            
                    const jumpsWithNumbers = reversedJumps.map((jump, index) => ({
                        ...jump,
                        jumpNumber: jumpno - index,
                    }));
            
                    setLoggedJumps(jumpsWithNumbers);
                  
                } catch (error) {
                    console.error('Error fetching data:', error);
                    Toast.show({
                        type: 'error',
                        text1: 'Could not fetch jumps',
                        text2: 'Please try again',
                        position: 'top',
                    });
                } finally {
                    setIsLoading(false);
                }
            }
            loadData();
        }, [getLoggedJumps, profile.jumpNumber])
    );

    // function to direct to the jump details page
    const onCardPress = (index, jump) => {
        router.navigate({
            pathname: `/(tabs)/logbook/${index}`, 
            params: { jumpNumber: jump.jumpNumber }
        });
    }

    const filteredJumps = jumps.filter((jump) => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        const jumpNumberMatch = jump.jumpNumber?.toString().includes(searchTerm);
        const locationMatch = jump.location?.toLowerCase().includes(searchLower);
        
        return jumpNumberMatch || locationMatch;
    });

    if (isLoading || loading.action) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color="#00ABF0" />
                <Text style={styles.loadingText}>Loading jumps...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
          
            <View style={styles.searchBox}>
                <View style={styles.textInputContainer}>
                    <TextInput 
                        placeholder='Search Jumps'
                        placeholderTextColor='#666'
                        autoCapitalize='none'
                        style={styles.searchInput}
                        onChangeText={text => setSearchTerm(text)}
                        value={searchTerm}
                    />
                    <Ionicons name='ios-search' size={20} color='#666' />
                </View>
            </View>

            {filteredJumps.length > 0 ? (
                filteredJumps.map((jump, index) => (
                    <TouchableOpacity 
                        key={jump.id || index}
                        style={styles.jumpCard} 
                        onPress={() => onCardPress(index, jump)}
                    >
                        {jump.imageURLs && jump.imageURLs.length > 0 ? (
                            <ImageBackground 
                                source={{ uri: jump.imageURLs[0] }} 
                                style={styles.backgroundImage}
                            >
                                <View style={styles.darkOverlay}></View>
                                <View style={styles.jumpCardContent}>
                                    <Text style={styles.contentText}>{jump.jumpNumber}</Text>
                                    <Text style={styles.locationText}>{jump.location}</Text>
                                </View>
                            </ImageBackground>
                        ) : (
                            <View style={[styles.backgroundImage, styles.blackBackground]}>
                                <View style={styles.jumpCardContent}>
                                    <Text style={styles.contentText}>{jump.jumpNumber}</Text>
                                    <Text style={styles.locationTextWhite}>{jump.location}</Text>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                ))
            ) : (
                <View style={styles.emptyMessage}>
                    {searchTerm ? (
                        <Text style={styles.emptyMessageText}>
                            No jumps found matching "{searchTerm}"
                        </Text>
                    ) : (
                        <>
                            <Text style={styles.emptyMessageText}>
                                Add jumps using the + button
                            </Text>
                            <Text style={[styles.emptyMessageText, {marginTop: 30}]}>
                                You can edit the total jump number within your profile/edit profile.
                            </Text>
                        </>
                    )}
                </View>
            )}
            
        </ScrollView>
    );
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
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
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
        flex: 1,
    },
    darkOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    contentText: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    locationText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    locationTextWhite: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 4,
    },
    blackBackground: {
        backgroundColor: 'black',
    },
    searchBox: {
        backgroundColor: '#fff',
        width: '100%',
        alignSelf: 'center',
        borderRadius: 8,
        padding: 12,
        shadowColor: '#ccc',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 20,
    },
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        padding: 0,
        fontSize: 16,
        color: '#333',
    },
    emptyMessage: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        paddingHorizontal: 20,
    },
    emptyMessageText: {
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        lineHeight: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});