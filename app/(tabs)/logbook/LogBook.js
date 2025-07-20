import { View, StyleSheet, ScrollView, TouchableHighlight, TouchableWithoutFeedback, Keyboard } from 'react-native'
import {useState} from 'react'
import LogbookJumpCard from '../../../components/LogbookJumpCard'
import { FontAwesome } from '@expo/vector-icons'; 
import { ActivityIndicator } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { kyInstance } from '../../../services/open-api/kyClient';
import { Portal, PaperProvider, Text} from 'react-native-paper'
import LogbookModal from '../../../components/LogbookModal';

import { useAuth } from '../../../providers/AuthProvider';

const LogBook = () => {
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const { user, loading } = useAuth();

  console.log('user object', {user: user.id})

  // TanStack Query - profile data for jump number
  const { 
    data: profileResponse, 
    isLoading: profileLoading,
    error: profileError 
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      console.log('Profile query running')
      const response = await kyInstance.get('profile').json();
      return response;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  if (profileLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Error loading profile: {profileError.message}</Text>
      </View>
    );
  }

  // Extract data from API responses
  const profile = profileResponse?.success ? profileResponse.data : {};

  return (
    <PaperProvider>
      <ScrollView style={styles.container}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View>
            <Portal>
              <LogbookModal
                visible={visible}
                onClose={hideModal}
                isLoading={loading.action} 
              />
            </Portal>

            <View style={styles.infoBoxWrapper}>
              <View style={[styles.infoBox, {
                borderRightColor: '#dddddd',
                borderRightWidth: 1
              }]}>
                <Text variant='titleLarge'>{profile.jump_number || 0}</Text>
                <Text variant="bodySmall">Total Base Jumps</Text>
              </View>
              <View style={styles.infoBox}>
                <TouchableHighlight
                  onPress={showModal}
                  underlayColor="#DDDDDD" 
                  style={styles.filterButton}
                  disabled={loading.action}
                >
                  <FontAwesome name="plus" size={30} color={loading.action ? "#ccc" : "#000"} />
                </TouchableHighlight>
              </View>
            </View>

            <LogbookJumpCard 
              jumpNumber={profile.jump_number || 0}
            />
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </PaperProvider>
  );
};

export default LogBook;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  infoBoxWrapper: {
    borderBottomColor: '#dddddd',
    borderBottomWidth: 1,
    borderTopColor: '#dddddd',
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 100,
    marginTop: 20,
  },
  infoBox: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
});