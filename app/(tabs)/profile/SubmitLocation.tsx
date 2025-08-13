import { useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, ScrollView, TouchableOpacity } from "react-native";
import { Switch, PaperProvider, ActivityIndicator } from "react-native-paper";
import { router } from "expo-router";
import Toast from 'react-native-toast-message';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useKyClient } from "../../../services/open-api/kyClient";
import { useAuth } from "../../../providers/AuthProvider";
import { paths } from "../../../types/api";

export type SubmitLocationData = NonNullable<paths['/locations/submissions']['post']['requestBody']>['content']['application/json'];

const SubmitLocation = () => {
    const [exitName, setExitName] = useState('');
    const [rockDrop, setRockDrop] = useState('');
    const [total, setTotal] = useState('');
    const [anchor, setAnchor] = useState('');
    const [access, setAccess] = useState('');
    const [notes, setNotes] = useState('');
    const [coordinates, setCoordinates] = useState('');
    const [cliffAspect, setCliffAspect] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const [openedBy, setOpenedBy] = useState('');
    const [openedDate, setOpenedDate] = useState('');
    const [country, setCountry] = useState('');
    const [selectedUnit, setSelectedUnit] = useState<'Meters' | 'Feet'>('Meters');

    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const client = useKyClient();

    // TODO: add user to submissions

    // Submit location mutation
    const submitLocationMutation = useMutation({
        mutationFn: async (locationData: SubmitLocationData) => {
            return client
            .POST('/locations/submissions', {
                body: locationData
            })
            .then((res) => {
                if (res.error) {
                    throw new Error('Failed to submit location');
                }
                return res.data;
            });
        },
        onSuccess: (response) => {
            if (response.success) {
                router.replace('/(tabs)/profile/Profile');
                Toast.show({
                    type: 'success',
                    text1: 'Successfully sent submission',
                    text2: 'Your submission is under review',
                    position: 'top',
                });

                // Clear form
                clearForm();
                
                // Optionally invalidate related queries
                queryClient.invalidateQueries({ queryKey: ['submissions'] });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error trying to send submission',
                    text2: 'Unknown error occurred',
                    position: 'top',
                });
            }
        },
        onError: (error: any) => {
            console.error('Submit location error:', error);
            
            let errorMessage = 'Failed to submit location';
            let errorDetails = '';

            // Handle different types of errors
            if (error.response) {
                if (error.response.status === 400 && error.response.data?.validation) {
                    errorMessage = 'Validation Error';
                    errorDetails = error.response.data.validation.map((err: any) => err.message).join(', ');
                } else if (error.response.status === 429) {
                    errorMessage = 'Submission Limit Reached';
                    errorDetails = error.response.data?.error || 'Too many submissions today';
                } else if (error.response.data?.error) {
                    errorMessage = 'Submission Failed';
                    errorDetails = error.response.data.error;
                }
            }

            Toast.show({
                type: 'error',
                text1: errorMessage,
                text2: errorDetails,
                position: 'top',
            });
        }
    });

    const clearForm = () => {
        setExitName('');
        setRockDrop('');
        setTotal('');
        setAnchor('');
        setAccess('');
        setNotes('');
        setCoordinates('');
        setCliffAspect('');
        setVideoLink('');
        setOpenedBy('');
        setOpenedDate('');
        setCountry('');
    };

    // Parse coordinates string into latitude and longitude
    const parseCoordinates = (coordsString: string) => {
        if (!coordsString) return null;
        
        // Handle various coordinate formats
        const coords = coordsString.replace(/[^\d.,-]/g, '').split(',');
        if (coords.length !== 2) return null;
        
        const lat = coords[0] ? parseFloat(coords[0].trim()) : NaN;
        const lng = coords[1] ? parseFloat(coords[1].trim()) : NaN;
        
        if (isNaN(lat) || isNaN(lng)) return null;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
        
        return { latitude: lat, longitude: lng };
    };

    // Convert height to feet (API expects feet)
    const convertHeight = (value: string, unit: 'Meters' | 'Feet') => {
        const numValue = parseFloat(value);
        return unit === 'Meters' ? Math.round(numValue * 3.28084) : Math.round(numValue);
    };

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            Toast.show({
                type: 'error',
                text1: 'Authentication required',
                text2: 'Please log in to submit a location',
                position: 'top',
            });
            return;
        }

        // Validation
        if (!exitName.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Exit name is required',
                position: 'top',
            });
            return;
        }

        if (!coordinates.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Coordinates are required',
                position: 'top',
            });
            return;
        }

        const parsedCoords = parseCoordinates(coordinates);
        if (!parsedCoords) {
            Toast.show({
                type: 'error',
                text1: 'Invalid coordinates',
                text2: 'Please use format: latitude, longitude (e.g., 60.140582, -2.111822)',
                position: 'top',
            });
            return;
        }

        if (!rockDrop.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Rock drop height is required',
                position: 'top',
            });
            return;
        }

        try {
            // Prepare submission data for the API
            const locationData = {
                submission_type: 'new',
                name: exitName.trim(),
                country: country.trim() || '',
                latitude: parsedCoords.latitude,
                longitude: parsedCoords.longitude,
                rock_drop_ft: convertHeight(rockDrop, selectedUnit),
                // Only include optional fields if they have values
                ...(total && { total_height_ft: convertHeight(total, selectedUnit) }),
                ...(cliffAspect && { cliff_aspect: cliffAspect.trim() }),
                ...(anchor && { anchor_info: anchor.trim() }),
                ...(access && { access_info: access.trim() }),
                ...(notes && { notes: notes.trim() }),
                ...(openedBy && { opened_by_name: openedBy.trim() }),
                ...(openedDate && { opened_date: openedDate.trim() }),
                ...(videoLink && { video_link: videoLink.trim() }),
            } satisfies SubmitLocationData;

            await submitLocationMutation.mutateAsync(locationData);
        } catch (error) {
            // Error handling is done in the mutation's onError callback
        }
    };

    return (
        <PaperProvider>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView>
                    <View style={styles.container}>
                        <KeyboardAvoidingView behavior="padding">
                            <Text style={styles.instructionText}>
                                Fields marked with * must be filled in
                            </Text>
                            
                            <TextInput 
                                value={exitName} 
                                style={styles.textInput} 
                                placeholder='Exit Name *' 
                                autoCapitalize='words' 
                                onChangeText={setExitName}
                            />
                            
                            <TextInput 
                                value={country} 
                                style={styles.textInput} 
                                placeholder='Country' 
                                autoCapitalize='words' 
                                onChangeText={setCountry}
                            />
                            
                            <TextInput 
                                value={coordinates} 
                                style={styles.textInput} 
                                placeholder='Exact Coordinates * (lat, lng)' 
                                autoCapitalize='none' 
                                onChangeText={setCoordinates}
                            />
                            
                            <View style={styles.switchContainer}>
                                <Text style={styles.switchText}>
                                    <Text style={styles.bold}>Unit: </Text>{selectedUnit}
                                </Text>
                                <Switch
                                    value={selectedUnit === 'Feet'}
                                    onValueChange={() =>
                                        setSelectedUnit(selectedUnit === 'Meters' ? 'Feet' : 'Meters')
                                    }
                                />
                            </View>
                            
                            <TextInput 
                                value={rockDrop} 
                                style={styles.textInput} 
                                placeholder={`Rock Drop * (${selectedUnit})`} 
                                keyboardType='numeric'
                                onChangeText={setRockDrop}
                            />
                            
                            <TextInput 
                                value={total} 
                                style={styles.textInput} 
                                placeholder={`Total Height (${selectedUnit})`} 
                                keyboardType='numeric'
                                onChangeText={setTotal}
                            />
                            
                            <TextInput 
                                value={cliffAspect} 
                                style={styles.textInput} 
                                placeholder='Cliff Aspect (N, NE, E, SE, S, SW, W, NW)' 
                                autoCapitalize='characters' 
                                onChangeText={setCliffAspect}
                            />
                            
                            <TextInput 
                                value={anchor} 
                                style={styles.textInput} 
                                placeholder='Anchor Info' 
                                autoCapitalize='sentences' 
                                onChangeText={setAnchor}
                            />
                            
                            <TextInput 
                                value={access} 
                                style={[styles.textInput, styles.multilineInput]} 
                                placeholder='Access Information' 
                                autoCapitalize='sentences' 
                                multiline={true}
                                numberOfLines={3}
                                textAlignVertical="top"
                                onChangeText={setAccess}
                            />
                            
                            <TextInput 
                                value={notes} 
                                style={[styles.textInput, styles.multilineInput]} 
                                placeholder='Additional Notes' 
                                autoCapitalize='sentences' 
                                multiline={true}
                                numberOfLines={3}
                                textAlignVertical="top"
                                onChangeText={setNotes}
                            />
                            
                            <TextInput 
                                value={openedBy} 
                                style={styles.textInput} 
                                placeholder='Opened By' 
                                autoCapitalize='words' 
                                onChangeText={setOpenedBy}
                            />
                            
                            <TextInput 
                                value={openedDate} 
                                style={styles.textInput} 
                                placeholder='Opened Date (YYYY-MM-DD)' 
                                autoCapitalize='none' 
                                onChangeText={setOpenedDate}
                            />
                            
                            <TextInput 
                                value={videoLink} 
                                style={styles.textInput} 
                                placeholder='Video Link (optional)' 
                                autoCapitalize='none' 
                                keyboardType='url'
                                onChangeText={setVideoLink}
                            />

                            <View style={styles.buttonContainer}>
                                {submitLocationMutation.isPending ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color="#00ABF0" />
                                        <Text style={styles.loadingText}>Submitting location...</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity onPress={handleSubmit} style={styles.commandButton}>
                                        <Text style={styles.panelButtonTitle}>Submit Location</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </PaperProvider>
    );
};

export default SubmitLocation;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center',
    },
    instructionText: {
        alignItems: 'center', 
        justifyContent: 'center', 
        marginVertical: 20,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    textInput: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
        borderColor: '#ddd',
    },
    multilineInput: {
        height: 80,
        paddingTop: 10,
    },
    panelButtonTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white',
    },
    commandButton: {
        borderRadius: 10,
        backgroundColor: '#00ABF0',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        width: '100%',
        height: 50,
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    switchText: {
        fontSize: 16,
        marginRight: 20,
    },
    bold: {
        fontWeight: 'bold',
    },
    loadingContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});