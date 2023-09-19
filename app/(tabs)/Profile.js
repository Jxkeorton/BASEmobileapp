import { View, StyleSheet } from 'react-native';
import React from 'react';
import { Button} from 'react-native-paper';
import { appSignOut } from '../../store';

const Profile = () => {
  return (
    <View style={styles.container}>
      <Button onPress={() => appSignOut()} title="LogOut">Logout</Button>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
      marginHorizontal: 20,
      justifyContent: 'center',
      alignItems: 'center',
  }
})