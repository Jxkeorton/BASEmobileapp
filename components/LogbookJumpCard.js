import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, TextInput} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { useUser } from '../providers/UserProvider';
import { useLogbookQuery } from '../hooks/useLogbookQuery';

const LogbookJumpCard = ({ jumpNumber }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useUser();
    
    // Use TanStack Query for logbook data
    const { 
        data: jumps = [], 
        isLoading,
        error 
    } = useLogbookQuery(user?.uid);

    // Memoized processed jumps data
    const processedJumps = useMemo(() => {
        if (!jumps.length) return [];
        
        // Reverse to show newest first and add jump numbers
        const reversedJumps = [...jumps].reverse();
        return reversedJumps.map((jump, index) => ({
            ...jump,
            jumpNumber: jumpNumber - index,
        }));
    }, [jumps, jumpNumber]);

    // Filtered jumps based on search term
    const filteredJumps = useMemo(() => {
        if (!searchTerm) return processedJumps;
        
        const searchLower = searchTerm.toLowerCase();
        return processedJumps.filter((jump) => {
            const jumpNumberMatch = jump.jumpNumber?.toString().includes(searchTerm);
            const locationMatch = jump.location?.toLowerCase().includes(searchLower);
            return jumpNumberMatch || locationMatch;
        });
    }, [processedJumps, searchTerm]);

    const onCardPress = (index, jump) => {
        router.navigate({
            pathname: `/(tabs)/logbook/${index}`, 
            params: { jumpNumber: jump.jumpNumber }
        });
    };

    if (error) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Error loading jumps: {error.message}</Text>
            </View>
        );
    }

    if (isLoading) {
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