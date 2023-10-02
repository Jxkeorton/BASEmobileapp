import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableHighlight } from 'react-native'
import React, {useState} from 'react'
import { useFocusEffect } from 'expo-router';
import LogbookJumpCard from '../../../components/LogbookJumpCard'
import { FontAwesome } from '@expo/vector-icons'; 
import Ionicons from 'react-native-vector-icons/Ionicons';

// firebase imports for fetching user data
import { FIREBASE_AUTH, FIREBASE_DB} from '../../../firebaseConfig';
import { 
  doc, 
  getDoc,
} from 'firebase/firestore';

//Modal imports 
import { Portal, PaperProvider, Title, Caption } from 'react-native-paper'
import LogbookModal from '../../../components/LogbookModal';

const LogBook = () => {
  const [ name, setName ] = useState('');
  const [ jumpNumber, setJumpNumber ] = useState('');

  //Search 
  const [searchTerm, setSearchTerm] = useState('');

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
            const currentUser = FIREBASE_AUTH.currentUser;
            if (!currentUser) {
            Alert.alert('No authenticated user found');
            return;
            }
            const userId = currentUser.uid;
  
            const userDocRef = doc(FIREBASE_DB, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);
            const userDocData = userDocSnap.data();

            if (userDocData) {
              const { name, jumpNumber } = userDocData;
              if (jumpNumber) {
                setJumpNumber(jumpNumber);
              }
              setName(name);
            } else {
              return
            }
          } catch (error) {
            console.error('Error checking if location saved:', error);
          }
        };
    
        getUserDetails();
      }, [])
    );

  return (
    <PaperProvider>
    <SafeAreaView style={styles.container}>
      <Portal>
        <LogbookModal
          visible={visible}
          onClose={hideModal}
        />
      </Portal>
      <View style={styles.searchBox} >
        <View style={styles.textInputContainer} >
          <TextInput 
            placeholder='Search Jumps'
            placeholderTextColor='#000'
            autoCapitalize='none'
            style={{flex:1, padding:0}}
            onChangeText={text => setSearchTerm(text)}
            value={searchTerm}
          />
          <Ionicons name='ios-search' size={20} color='#000' />
        </View>
      </View>

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

      <View style={styles.userInfoSection} />

      <LogbookJumpCard />

    </SafeAreaView>
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
  },
  infoBox: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputContainer: {
    flexDirection: 'row',
    marginRight: 10,
    marginBottom: 10, 
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  searchBox: {
    position: 'fixed',
    backgroundColor: '#fff',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
    marginTop: 20,
    marginBottom: 20,
  }
});

