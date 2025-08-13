
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ListRenderItem } from 'react-native';
import { useAuth } from '../../../../providers/AuthProvider';
import { router } from 'expo-router';

type SettingsItemKey = 'contactUs' | 'logout' | 'deleteAccount' | 'terms' | 'privacypolicy';

interface SettingsItem {
  key: SettingsItemKey;
  label: string;
}

const settingsItems: SettingsItem[] = [
  { key: 'contactUs', label: 'Contact Us' },
  { key: 'logout', label: 'Logout' },
  { key: 'deleteAccount', label: 'Delete Account' },
  { key: 'terms', label: 'Terms and Conditions' },
  { key: 'privacypolicy', label: 'Privacy Policy' },
];

const Settings: React.FC = () => {
  const { signOut } = useAuth();

  // Function to handle item presses
  const handlePress = (key: SettingsItemKey) => {
    switch (key) {
      case 'contactUs':
        router.navigate('/profile/settings/Contact');
        break;
      case 'logout':
        signOut();
        router.replace('/(auth)/Login');
        break;
      case 'deleteAccount':
        router.navigate('/profile/settings/DeleteAccount');
        break;
      case 'privacypolicy':
        router.navigate('/profile/settings/PrivacyPolicy');
        break;
      case 'terms':
        router.navigate('/profile/settings/Terms');
        break;
      default:
        break;
    }
  };

  // Function to render each item in the FlatList
  const renderItem: ListRenderItem<SettingsItem> = ({ item }) => (
    <TouchableOpacity
      onPress={() => handlePress(item.key)}
      style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' }}
    >
      <Text>{item.label}</Text>
    </TouchableOpacity>
  );

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