import { View, StyleSheet, ScrollView, TouchableHighlight, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, {useState} from 'react'
import { useFocusEffect } from 'expo-router';
import LogbookJumpCard from '../../../components/LogbookJumpCard'
import { FontAwesome } from '@expo/vector-icons'; 
import { ActivityIndicator } from 'react-native-paper';

//Modal imports 
import { Portal, PaperProvider, Title, Caption } from 'react-native-paper'
import LogbookModal from '../../../components/LogbookModal';
import { getJumpnumber } from '../../../store';

const LogBook = () => {
  const [ jumpNumber, setJumpNumber ] = useState('');
  const [isLoading, setLoading] = useState(true);

  //Modal
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);


   // this hook ensures new saved locations are fetched on screen focus
   useFocusEffect(
    React.useCallback(() => {
      const getUserDetails = async () => {
        try {
            // fetching users saved location ID's
              const jumps = await getJumpnumber()
              setJumpNumber(jumps);
              setLoading(false);
          } catch (error) {
            console.error('Error checking if location saved:', error);
            setLoading(false);
          }
        };
    
        getUserDetails();
      }, [])
    );

  return (
    <PaperProvider>
    <ScrollView style={styles.container}>
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View>
        
      <Portal>
        <LogbookModal
          visible={visible}
          onClose={hideModal}
          isLoading={isLoading}
        />
      </Portal>
      

      <View style={styles.infoBoxWrapper}>
          <View style={[styles.infoBox, {
            borderRightColor: '#dddddd',
            borderRightWidth: 1
          }]}>
            <Title>{jumpNumber ? jumpNumber : '0'}</Title>
            <Caption>Total Base Jumps</Caption>
          </View>
          <View style={styles.infoBox}>
            <TouchableHighlight
              onPress={showModal}
              underlayColor="#DDDDDD" 
              style={styles.filterButton}
            >
                <FontAwesome name="plus" size={30} color="#000" />
            </TouchableHighlight>
          </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size='large' style={{alignItems:'center', justifyContent:'center'}} />
      ) : (
        <LogbookJumpCard jumpNumber={jumpNumber}/>
      )}
    </View>
    </TouchableWithoutFeedback>
    </ScrollView>
    </PaperProvider>
  )
}

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

