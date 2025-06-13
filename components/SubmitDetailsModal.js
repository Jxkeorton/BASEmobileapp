import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useUser } from '../providers/UserProvider'; // NEW
import Toast from 'react-native-toast-message';

const SubmitDetailsModal = ({ visible, onClose, location }) => {
  const [newLocationName, setNewLocationName] = useState('');
  const [exitType, setExitType] = useState('');
  const [height, setHeight] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [details, setDetails] = useState('');

  const { submitDetailUpdate, loading } = useUser();

  const handleSubmit = async () => {
    try {
      const formData = {
        locationId: location?.id,
        originalLocationName: location?.name,
        newLocationName: newLocationName || location?.name,
        exitType,
        height,
        coordinates,
        details,
      };

      const result = await submitDetailUpdate(formData); // NEW

      if (result.success) {
        onClose();
        
        Toast.show({
          type: 'success',
          text1: 'Details submitted successfully',
          text2: 'Your submission is under review',
          position: 'top',
        });

        // Clear form
        setNewLocationName('');
        setExitType('');
        setHeight('');
        setCoordinates('');
        setDetails('');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error submitting details',
          text2: result.error,
          position: 'top',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error submitting details',
        position: 'top',
      });
      console.error('Submit details error:', error);
    }
  };

  const handleCancel = () => {
    onClose();
    
    Toast.show({
      type: 'info',
      text1: 'Submission cancelled',
      position: 'top',
    });

    // Clear form
    setNewLocationName('');
    setExitType('');
    setHeight('');
    setCoordinates('');
    setDetails('');
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.panelTitle}>Submit Details</Text>
              <Text style={styles.subtitle}>
                Help improve the database by submitting additional details for{' '}
                <Text style={styles.locationName}>{location?.name}</Text>
              </Text>

              <Text style={styles.panelSubtitle}>Location Name (if different)</Text>
              <TextInput
                style={styles.input}
                value={newLocationName}
                onChangeText={setNewLocationName}
                placeholder={location?.name}
                autoCorrect={false}
                autoCapitalize="words"
              />

              <Text style={styles.panelSubtitle}>Exit Type</Text>
              <TextInput
                style={styles.input}
                value={exitType}
                onChangeText={setExitType}
                placeholder="e.g., Building, Antenna, Span, Earth"
                autoCorrect={false}
                autoCapitalize="words"
              />

              <Text style={styles.panelSubtitle}>Height</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="Height in feet or meters"
                keyboardType="numeric"
                autoCorrect={false}
              />

              <Text style={styles.panelSubtitle}>Coordinates</Text>
              <TextInput
                style={styles.input}
                value={coordinates}
                onChangeText={setCoordinates}
                placeholder="Lat, Long (e.g., 40.7128, -74.0060)"
                autoCorrect={false}
                autoCapitalize="none"
              />

              <Text style={styles.panelSubtitle}>Additional Details</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                value={details}
                onChangeText={setDetails}
                placeholder="Any additional information about this location..."
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                autoCorrect={true}
                autoCapitalize="sentences"
              />

              {loading.action ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator animating={true} color="#00ABF0" size="large" />
                  <Text style={styles.loadingText}>Submitting details...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit Details</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  locationName: {
    fontWeight: 'bold',
    color: '#00ABF0',
  },
  panelSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  submitButton: {
    backgroundColor: '#00ABF0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#A52A2A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default SubmitDetailsModal;