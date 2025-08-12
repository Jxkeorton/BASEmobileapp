import { useState } from 'react';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { kyInstance } from '../services/open-api/kyClient';
import { useAuth } from '../providers/AuthProvider';
import Toast from 'react-native-toast-message';

const SubmitDetailsModal = ({ visible, onClose, location }) => {
  const [newLocationName, setNewLocationName] = useState('');
  const [exitType, setExitType] = useState('');
  const [rockDropHeight, setRockDropHeight] = useState('');
  const [totalHeight, setTotalHeight] = useState('');
  const [cliffAspect, setCliffAspect] = useState('');
  const [anchorInfo, setAnchorInfo] = useState('');
  const [accessInfo, setAccessInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [openedByName, setOpenedByName] = useState('');
  const [openedDate, setOpenedDate] = useState('');

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // TODO: add user to submissions

  // Submit location update mutation
  const submitUpdateMutation = useMutation({
    mutationFn: async (submissionData) => {
      const response = await kyInstance.post('locations/submissions', {
        json: submissionData
      }).json();
      return response;
    },
    onSuccess: (response) => {
      if (response.success) {
        onClose();
        
        Toast.show({
          type: 'success',
          text1: 'Details submitted successfully',
          text2: 'Your submission is under review',
          position: 'top',
        });

        // Clear form
        clearForm();
        
        // Optionally invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['submissions'] });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error submitting details',
          text2: response.error || 'Unknown error occurred',
          position: 'top',
        });
      }
    },
    onError: (error) => {
      console.error('Submit details error:', error);
      
      let errorMessage = 'Failed to submit details';
      let errorDetails = '';

      // Handle different types of errors
      if (error.response) {
        if (error.response.status === 400 && error.response.data?.validation) {
          errorMessage = 'Validation Error';
          errorDetails = error.response.data.validation.map(err => err.message).join(', ');
        } else if (error.response.status === 429) {
          errorMessage = 'Submission Limit Reached';
          errorDetails = error.response.data?.error || 'Too many submissions';
        } else if (error.response.data?.error) {
          errorMessage = 'Submission Failed';
          errorDetails = error.response.data.error;
        }
      }

      Toast.show({
        type: 'error',
        text1: errorMessage,
        text2: errorDetails,
        position: 'top',
      });
    }
  });

  const clearForm = () => {
    setNewLocationName('');
    setExitType('');
    setRockDropHeight('');
    setTotalHeight('');
    setCliffAspect('');
    setAnchorInfo('');
    setAccessInfo('');
    setNotes('');
    setOpenedByName('');
    setOpenedDate('');
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'error',
        text1: 'Authentication required',
        text2: 'Please log in to submit details',
        position: 'top',
      });
      return;
    }

    if (!location?.id) {
      Toast.show({
        type: 'error',
        text1: 'Invalid location',
        text2: 'Cannot submit details for this location',
        position: 'top',
      });
      return;
    }

    // Basic validation
    const hasUpdates = newLocationName || exitType || rockDropHeight || totalHeight || 
                      cliffAspect || anchorInfo || accessInfo || notes || 
                      openedByName || openedDate;

    if (!hasUpdates) {
      Toast.show({
        type: 'error',
        text1: 'No updates provided',
        text2: 'Please fill in at least one field',
        position: 'top',
      });
      return;
    }

    try {
      // Prepare submission data for the API
      const submissionData = {
        submission_type: 'update',
        existing_location_id: location.id,
        name: newLocationName || location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
        // Only include height fields if they're provided and valid
        ...(rockDropHeight && !isNaN(parseInt(rockDropHeight)) && {
          rock_drop_ft: parseInt(rockDropHeight)
        }),
        ...(totalHeight && !isNaN(parseInt(totalHeight)) && {
          total_height_ft: parseInt(totalHeight)
        }),
        // Only include other fields if they're provided
        ...(cliffAspect && { cliff_aspect: cliffAspect }),
        ...(anchorInfo && { anchor_info: anchorInfo }),
        ...(accessInfo && { access_info: accessInfo }),
        ...(notes && { notes: notes }),
        ...(openedByName && { opened_by_name: openedByName }),
        ...(openedDate && { opened_date: openedDate }),
      };

      await submitUpdateMutation.mutateAsync(submissionData);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  const handleCancel = () => {
    onClose();
    
    Toast.show({
      type: 'info',
      text1: 'Submission cancelled',
      position: 'top',
    });

    clearForm();
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

              <Text style={styles.panelSubtitle}>Exit Type / Object Type</Text>
              <TextInput
                style={styles.input}
                value={exitType}
                onChangeText={setExitType}
                placeholder="e.g., Building, Antenna, Span, Earth, Cliff"
                autoCorrect={false}
                autoCapitalize="words"
              />

              <Text style={styles.panelSubtitle}>Rock Drop Height (feet)</Text>
              <TextInput
                style={styles.input}
                value={rockDropHeight}
                onChangeText={setRockDropHeight}
                placeholder="Height in feet"
                keyboardType="numeric"
                autoCorrect={false}
              />

              <Text style={styles.panelSubtitle}>Total Height (feet)</Text>
              <TextInput
                style={styles.input}
                value={totalHeight}
                onChangeText={setTotalHeight}
                placeholder="Total height in feet"
                keyboardType="numeric"
                autoCorrect={false}
              />

              <Text style={styles.panelSubtitle}>Cliff Aspect</Text>
              <TextInput
                style={styles.input}
                value={cliffAspect}
                onChangeText={setCliffAspect}
                placeholder="e.g., N, NE, E, SE, S, SW, W, NW"
                autoCorrect={false}
                autoCapitalize="characters"
              />

              <Text style={styles.panelSubtitle}>Anchor Information</Text>
              <TextInput
                style={styles.input}
                value={anchorInfo}
                onChangeText={setAnchorInfo}
                placeholder="Anchor type and details"
                autoCorrect={false}
                autoCapitalize="sentences"
              />

              <Text style={styles.panelSubtitle}>Access Information</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={accessInfo}
                onChangeText={setAccessInfo}
                placeholder="How to access this location..."
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                autoCorrect={true}
                autoCapitalize="sentences"
              />

              <Text style={styles.panelSubtitle}>Opened By</Text>
              <TextInput
                style={styles.input}
                value={openedByName}
                onChangeText={setOpenedByName}
                placeholder="Person who first jumped this location"
                autoCorrect={false}
                autoCapitalize="words"
              />

              <Text style={styles.panelSubtitle}>Opened Date</Text>
              <TextInput
                style={styles.input}
                value={openedDate}
                onChangeText={setOpenedDate}
                placeholder="Date first jumped (e.g., 2023-05-15)"
                autoCorrect={false}
                autoCapitalize="none"
              />

              <Text style={styles.panelSubtitle}>Additional Notes</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional information about this location..."
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                autoCorrect={true}
                autoCapitalize="sentences"
              />

              {submitUpdateMutation.isPending ? (
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