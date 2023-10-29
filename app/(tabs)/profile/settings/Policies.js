import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const Settings = () => {

  // Define list items
  const settingsItems = [
    { key: 'terms', label: 'Terms And Conditions' },
    { key: 'privacyPolicy', label: 'Privacy Policy' },
  ];

  // Function to render each item in the FlatList
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handlePress(item.key)}
      style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' }}
    >
      <Text>{item.label}</Text>
    </TouchableOpacity>
  );

  // Function to handle item presses
  const handlePress = (key) => {
    // Implement your logic for handling item presses here
    switch (key) {
      case 'terms':
        // Handle 'terms' press
        router.push('../../../../components/Terms')
        break;
      case 'policies':
        // Handle 'Privacy policy' press
        router.push('../../../../components/PrivacyPolicy')
        break;
      default:
        
        break;
    }
  };

  return (
    <View>
      <FlatList
        data={settingsItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
      />
    </View>
  );
};

export default Settings;