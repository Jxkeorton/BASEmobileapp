import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useUser } from '../../../../providers/UserProvider';
import { router } from 'expo-router';

const Settings = () => {

  const { signOut } = useUser();

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
    switch (key) {
      case 'contactUs':
        router.navigate('/profile/settings/Contact')
        break;
      case 'logout':
        signOut();
        break;
      case 'deleteAccount':
        router.navigate('/profile/settings/DeleteAccount')
        break;
      case 'privacypolicy':
        router.navigate('/profile/settings/PrivacyPolicy')
        break;
      case 'terms':
          router.navigate('/profile/settings/Terms')
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