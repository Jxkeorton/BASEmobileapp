import { 
    Modal, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    TouchableWithoutFeedback, 
    Keyboard,
    Alert
} from 'react-native';
import React, {useState} from 'react';
import * as ImagePicker from 'expo-image-picker';
import { submitJumpHandler } from '../store';
import { ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';


const LogbookModal = ({ visible, onClose, isLoading }) => {
    const [location, setLocation] = useState('');
    const [exitType, setExitType] = useState('');
    const [delay, setDelay] = useState('');
    const [details, setDetails] = useState('');
    const [date, setDate] = useState('');
    const [images, setImage] = useState([]);

    const [Loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    const pickImage = async () => {
      setImageLoading(true);
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 1, // Set the quality to 1 (no compression)
          selectionLimit: 4,
          allowsMultipleSelection: true,
        });
    
        if (!result.canceled) {
          const newImages = [];
          for (const asset of result.assets) {
            // Manipulate the image to save as PNG with the correct file type
            const newImage = await manipulateAsync(asset.uri, [], {
              compress: 0.1,
              format: SaveFormat.PNG,
            });
            newImages.push(newImage.uri);
          }
          setImage((prevImages) => [...prevImages, ...newImages]);
        }
      } catch (e) {
        Alert.alert('Error Uploading Image ' + e.message);
      } finally {
        setImageLoading(false);
      }
    };

    // add state to users logbook document on firebase
    // when form submitted
    const formData ={
        location,
        exitType,
        delay,
        details,
        date,
        images
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // create function within firebase functions file
            // update jumpnumber +1 for user 
          await submitJumpHandler({ formData });
          //hidemodal
          onClose()
          router.replace('/(tabs)/logbook/LogBook')

           // Clear the form fields by resetting state to initial values
            setLocation('');
            setExitType('');
            setDelay('');
            setDetails('');
            setDate('');
            setImage([]);
        } catch (error) {
          Alert.alert('Error', 'An error occurred while submitting the location.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };


      const handleCancel = () => {

        // close modal
        onClose();
        // clear state 
        setLocation('');
        setExitType('');
        setDelay('');
        setDetails('');
        setDate('');
        setImage([]);
      };
   

   
    return (
      <Modal visible={visible} transparent={true}>
          <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
            <ScrollView>

                <Text style={styles.panelTitle}>Log a jump !</Text>
                <Text style={styles.panelSubtitle}>Location</Text>
                <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                autoCorrect={false}
                autoCapitalize="none"
                />

                <Text style={styles.panelSubtitle}>Exit Type</Text>
                <TextInput
                style={styles.input}
                value={exitType}
                onChangeText={setExitType}
                autoCorrect={false}
                autoCapitalize="none"
                />

                <Text style={styles.panelSubtitle}>Delay</Text>
                <TextInput
                style={styles.input}
                keyboardType='numeric'
                value={delay}
                onChangeText={setDelay}
                autoCorrect={false}
                autoCapitalize="none"
                placeholder='in seconds'
                />

                <Text style={styles.panelSubtitle}>Date of jump</Text>
                <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                autoCorrect={false}
                autoCapitalize="none"
                />


                <Text style={styles.panelSubtitle}>Details</Text>
                <TextInput
                style={[styles.input, { height: 100 }]} 
                value={details}
                onChangeText={setDetails}
                autoCorrect={false}
                autoCapitalize="none"
                multiline={true} // Enable multiline mode
                numberOfLines={4}
                />

                <TouchableOpacity style={styles.panelButton} onPress={pickImage}>
                    <Text style={styles.panelButtonTitle}>Add Images</Text>
                </TouchableOpacity>

                {imageLoading ? (
                  <Text style={styles.imageCountText}>Loading images <ActivityIndicator size="small" color="#0000ff" /></Text>
                ) : (
                  <Text style={styles.imageCountText}> {images.length} {images.length === 1 ? 'image' : 'images'} added</Text>
                )}
                

                {isLoading || Loading ? (
                  <ActivityIndicator animating={true} color="#00ABF0" />
                ) : (
                  <>
                    <TouchableOpacity style={styles.panelButton} onPress={handleSubmit}>
                      <Text style={styles.panelButtonTitle}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.panelButton} onPress={handleCancel}>
                    <Text style={styles.panelButtonTitle}>Cancel</Text>
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
    imageCountText: {
        marginTop: 8, 
        fontSize: 16,
        color: 'gray', 
    },
  });
  
  export default LogbookModal;