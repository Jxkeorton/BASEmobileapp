// ModalContent.js
import React, { useState } from 'react';
import { Modal, Text, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const ModalContent = ({ visible, onClose, onApplyFilter, minRockDrop, maxRockDrop, setMinRockDrop, setMaxRockDrop }) => {
  const [tempMinRockDrop, setTempMinRockDrop] = useState(minRockDrop);
  const [tempMaxRockDrop, setTempMaxRockDrop] = useState(maxRockDrop);

  const clearFilter = () => {
    setTempMinRockDrop('');
    setTempMaxRockDrop('');
  };

  const applyFilter = () => {
    onClose();
    onApplyFilter(tempMinRockDrop, tempMaxRockDrop);
  };

  return (
    <Modal visible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
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

        <View style={styles.modalFooter}>
          <TouchableOpacity onPress={clearFilter} style={styles.panelButton}>
            <Text style={styles.panelButtonTitle}>Clear Filter</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={applyFilter} style={styles.panelButton}>
            <Text style={styles.panelButtonTitle}>Apply Filter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
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
  }
});

export default ModalContent;
