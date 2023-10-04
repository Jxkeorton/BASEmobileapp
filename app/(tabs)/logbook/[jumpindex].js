import React, { useState } from "react";
import { View, Text } from 'react-native';
import { useLocalSearchParams, useFocusEffect} from 'expo-router';
import { getLoggedJumps } from "../../../store";
import { ActivityIndicator } from "react-native-paper";

const jumpDetails = () => {
    const [jump , setJump] = useState(null)
    const { jumpindex } = useLocalSearchParams();

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
                  }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
            loadData();
        }, [jumpindex])
    )

    return (
        <View>
            {jump ? (
              <Text>{jump.location}</Text>
            ) : (
              <ActivityIndicator />
            )}
        </View>
    )

};

export default jumpDetails;