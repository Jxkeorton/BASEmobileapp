import { View, StyleSheet, ScrollView, TouchableHighlight, TouchableWithoutFeedback, Keyboard } from 'react-native'
import {useState, useEffect} from 'react'
import {  router} from 'expo-router';
import LogbookJumpCard from '../../../components/LogbookJumpCard'
import { FontAwesome } from '@expo/vector-icons'; 
import { ActivityIndicator } from 'react-native-paper';
import { useUser } from '../../../providers/UserProvider';
import { useLogbookQuery } from '../../../hooks/useLogbookQuery';
import { Portal, PaperProvider, Text} from 'react-native-paper'
import LogbookModal from '../../../components/LogbookModal';

const LogBook = () => {
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const { isProUser, profile, loading, user } = useUser();
  
  // Use TanStack Query for logbook data
  const { 
    data: logbookData = [], 
    isLoading: logbookLoading,
    error: logbookError 
  } = useLogbookQuery(user?.uid);

  useEffect(() => {
    if (!isProUser) {
      router.replace('/SubscriptionsPage');
    }
  }, [isProUser]);

  if (loading.profile || logbookLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  if (logbookError) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Error loading logbook: {logbookError.message}</Text>
      </View>
    );
  }

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
                <Text variant='titleLarge'>{profile.jumpNumber || 0}</Text>
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
              jumpNumber={profile.jumpNumber || 0}
              logbookData={logbookData}
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