import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { appSignOut } from '../../../../store';
import { router } from 'expo-router';

const Settings = () => {

  // Define list items
  const settingsItems = [
    { key: 'contactUs', label: 'Contact Us' },
    { key: 'logout', label: 'Logout' },
    { key: 'deleteAccount', label: 'Delete Account' },
    { key: 'terms', label: 'Terms and Conditions' },
    { key: 'privacypolicy', label: 'Privacy Policy' },
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
      case 'contactUs':
        // Handle 'Contact Us' press
        router.push('/profile/settings/Contact')
        break;
      case 'logout':
        // Handle 'Logout' press
        appSignOut();
        break;
      case 'deleteAccount':
        // Handle 'Delete Account' press
        router.push('/profile/settings/DeleteAccount')
        break;
      case 'privacypolicy':
        // Handle 'policies' press
        router.push('/profile/settings/PrivacyPolicy')
        break;
      case 'terms':
          // Handle 'policies' press
          router.push('/profile/settings/Terms')
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