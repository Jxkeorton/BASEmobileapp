import React, { useState } from "react";
import { useLocalSearchParams, useFocusEffect, Stack } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { router } from "expo-router";
import Toast from 'react-native-toast-message';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kyInstance } from "../../../services/open-api/kyClient";

import { useAuth } from "../../../providers/AuthProvider";

const jumpDetails = () => {
    const [jump, setJump] = useState(null);
    const params = useLocalSearchParams();

    const { jumpindex, jumpNumber } = params;
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // TanStack Query
    const { 
        data: logbookResponse, 
        isLoading: loadingJumps, 
        error: jumpsError 
    } = useQuery({
        queryKey: ['logbook', user?.id],
        queryFn: async () => {
            const response = await kyInstance.get('logbook').json();
            return response;
        },
        enabled: !!user?.id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 3,
    });

    // Delete jump mutation
    const deleteJumpMutation = useMutation({
        mutationFn: async (jumpId) => {
            const response = await kyInstance.delete(`logbook/${jumpId}`).json();
            return response;
        },
        onSuccess: (response) => {
            if (response.success) {
                // Invalidate and refetch logbook queries
                queryClient.invalidateQueries({ queryKey: ['logbook'] });
                
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
                    text2: response.error,
                    position: 'top',
                });
            }
        },
        onError: (error) => {
            console.error('Error deleting jump:', error);
            Toast.show({
                type: 'error',
                text1: 'Error deleting jump',
                text2: error.message,
                position: 'top',
            });
        }
    });

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                try {
                    if (logbookResponse?.success && logbookResponse?.data?.entries) {
                        const jumps = logbookResponse.data.entries;

                        // Reverse the jumps array to match the original ordering
                        const reversedJumps = [...jumps].reverse();

                        // Check if jumpindex is a valid index in the reversedJumps array
                        if (jumpindex >= 0 && jumpindex < reversedJumps.length) {
                            // Set the jump with the specified index to the jump state
                            const selectedJump = reversedJumps[jumpindex];
                            setJump(selectedJump);
                        }
                    }
                } catch (error) {
                    console.error('Error processing jump data:', error);
                    Toast.show({
                        type: 'error',
                        text1: 'Failed to load jump details',
                        position: 'top',
                    });
                }
            };

            if (logbookResponse) {
                loadData();
            }
        }, [jumpindex, logbookResponse])
    );

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
            await deleteJumpMutation.mutateAsync(jump.id);
        } catch (error) {
            // Error handling is done in the mutation's onError callback
        }
    };

    // Loading state
    if (loadingJumps || deleteJumpMutation.isPending) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00ABF0" />
                <Text style={styles.loadingText}>
                    {deleteJumpMutation.isPending ? 'Processing...' : 'Loading jump details...'}
                </Text>
            </View>
        );
    }

    // Error state
    if (jumpsError) {
        return (
            <View style={styles.noJumpContainer}>
                <Text style={[styles.noImageText, { fontSize: 25 }]}>
                    Error loading jump data. Please try again.
                </Text>
            </View>
        );
    }

    // No jump found state
    if (!jump) {
        return (
            <View style={styles.noJumpContainer}>
                <Text style={[styles.noImageText, { fontSize: 25 }]}>
                    Cannot fetch jump details. Please try again.
                </Text>
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

            <Card style={{ alignItems: 'center' }}>
                <Card.Content>
                    {/* Updated field mapping for new API structure */}
                    {jump.location_name &&
                        <View>
                            <Title style={styles.title}>{jump.location_name.toUpperCase()}</Title>
                        </View>
                    }

                    <View style={styles.mainContainer}>
                        <View style={styles.subtitleContainer}>
                            <Text style={styles.subtitleText}>Exit Type: </Text>
                            <Text style={styles.subtitleText}>Delay: </Text>
                            <Text style={styles.subtitleText}>Date: </Text>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.text}>{jump.exit_type || 'N/A'}</Text>
                            <Text style={styles.text}>
                                {jump.delay_seconds ? `${jump.delay_seconds} sec` : 'N/A'}
                            </Text>
                            <Text style={styles.text}>{jump.jump_date || 'N/A'}</Text>
                        </View>
                    </View>

                    <Text style={styles.subtitleText}>Details: </Text>
                    <Paragraph style={styles.text}>
                        {jump.details || 'No details provided'}
                    </Paragraph>
                </Card.Content>
            </Card>

            <Button
                style={styles.deleteButton}
                mode="contained"
                buttonColor="red"
                onPress={handleDeleteJump}
                disabled={deleteJumpMutation.isPending}
            >
                {deleteJumpMutation.isPending ? 'Deleting...' : 'Delete Jump'}
            </Button>
        </ScrollView>
    );
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
    noJumpContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 20,
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