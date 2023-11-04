// ModalContent.js
import React, { useState } from 'react';
import { Modal, Text, View, TextInput, TouchableOpacity, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard, Switch } from 'react-native';
import Toast from 'react-native-toast-message';
const ModalContent = ({ visible, onClose, onApplyFilter, minRockDrop, maxRockDrop }) => {
  const [tempMinRockDrop, setTempMinRockDrop] = useState(minRockDrop);
  const [tempMaxRockDrop, setTempMaxRockDrop] = useState(maxRockDrop);
  const [tempUnknownRockdrop, setTempUnknownRockDrop] = useState(false);

  const clearFilter = () => {
    setTempMinRockDrop('');
    setTempMaxRockDrop('');
    setTempUnknownRockDrop(false);

    Toast.show({
      type: 'info', // You can customize the type (success, info, error, etc.)
      text1: 'Filter cleared',
      position: 'top',
    });
  };

  const applyFilter = () => {
    if (tempMinRockDrop !== '' && tempMaxRockDrop !== '' && parseFloat(tempMinRockDrop) > parseFloat(tempMaxRockDrop)) {
      // Display an error message or handle the validation error as you prefer
      alert('Min Rock Drop cannot be greater than Max Rock Drop');
    } else {
      onClose();
      onApplyFilter(tempMinRockDrop, tempMaxRockDrop, tempUnknownRockdrop);
      Toast.show({
        type: 'success', // You can customize the type (success, info, error, etc.)
        text1: 'Filter applied',
        position: 'top',
      });
    }
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent={true}>
        <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
            <ScrollView>
        <Text style={styles.panelTitle}>Filter Pins</Text>
        <Text style={styles.panelSubtitle}>Min Rock Drop: </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={tempMinRockDrop}
          onChangeText={setTempMinRockDrop}
          autoCorrect={false}
          autoCapitalize="none"
        />

        <Text style={styles.panelSubtitle}>Max Rock Drop: </Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={tempMaxRockDrop}
          onChangeText={setTempMaxRockDrop}
          autoCorrect={false}
          autoCapitalize="none"
        />

        <Text style={styles.panelSubtitle}>Remove Unknown Rockdrops </Text>
        <Switch
            value={tempUnknownRockdrop}
            onValueChange={() => setTempUnknownRockDrop(!tempUnknownRockdrop)}
            color="#00ABF0" // Change the color as desired
        />

        <View style={styles.modalFooter}>
          <TouchableOpacity onPress={clearFilter} style={styles.borderButton}>
            <Text style={styles.imageButtonTitle}>Clear Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={applyFilter} style={styles.panelButton}>
            <Text style={styles.panelButtonTitle}>Apply Filter</Text>
          </TouchableOpacity>
          </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // modal styles 
  panelTitle: {
    fontSize: 27,
    height: 35,
    marginBottom: 10,
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: 200,
  },
  modalFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  panelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#00ABF0',
    alignItems: 'center',
    marginVertical: 7,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  borderButton: {
    padding:13,
    borderRadius: 10,
    borderWidth: 1,            // Add a border width
    borderColor: 'black',    // Specify the border color
    alignItems: 'center',
    marginVertical: 7,
    backgroundColor: 'transparent', // Make the background transparent
  },
  imageButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
},
});

export default ModalContent;
