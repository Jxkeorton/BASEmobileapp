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
import { submitDetailsHandler } from '../store';
import { ActivityIndicator } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const SubmitDetailsModal = ({ onClose , info, visible }) => {
    
    const [rockDrop, setRockDrop] = useState('');
    const [total, setTotal] = useState('');
    const [anchor, setAnchor] = useState('');
    const [access, setAccess] = useState('');
    const [notes, setNotes] = useState('');
    const [coordinates, setCoordinates] = useState('');
    const [cliffAspect, setCliffAspect] = useState('');
    const [videoLink, setVideoLink] = useState('');
    const [openedBy, setOpenedBy] = useState('');
    const [openedDate, setOpenedDate] = useState('');
    const [images, setImage] = useState([]);

    const [Loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    const pickImage = async () => {
      setImageLoading(true);
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 1,
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
          setImage(newImages);
        }
      } catch (e) {
        Toast.show({
          type: 'error', // You can customize the type (success, info, error, etc.)
          text1: 'Error uplaoding image',
          position: 'top',
        });
      } finally {
        setImageLoading(false);
      }
    };

    // add state to users logbook document on firebase
    // when form submitted
    const formData ={
        rockDrop,
        total,
        anchor,
        access,
        notes,
        coordinates,
        cliffAspect,
        videoLink,
        openedBy,
        openedDate,
        images,
        jumpId: info ? info.id : null
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // create function within firebase functions file
            // update jumpnumber +1 for user 
          await submitDetailsHandler({ formData });
          //hidemodal
          onClose()

          Toast.show({
            type: 'success', // You can customize the type (success, info, error, etc.)
            text1: 'New details submitted',
            position: 'top',
          });
           // Clear the form fields by resetting state to initial values
            setRockDrop('');
            setTotal('');
            setAnchor('');
            setAccess('');
            setNotes('');
            setCoordinates('');
            setCliffAspect('');
            setVideoLink('');
            setOpenedBy('');
            setOpenedDate('');
            setImage([]);
        } catch (error) {
          Toast.show({
            type: 'error', // You can customize the type (success, info, error, etc.)
            text1: 'Error trying to submit details',
            position: 'top',
          });
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      const handleCancel = () => {

        // close modal
        onClose();
        // clear state 
            setRockDrop('');
            setTotal('');
            setAnchor('');
            setAccess('');
            setNotes('');
            setCoordinates('');
            setCliffAspect('');
            setVideoLink('');
            setOpenedBy('');
            setOpenedDate('');
            setImage([]);

            Toast.show({
              type: 'info', // You can customize the type (success, info, error, etc.)
              text1: 'Cancelled location details update',
              position: 'top',
            });
      };

   

   
    return (
      <Modal visible={visible} transparent={true} style={{marginTop: 20}}>
          <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
            <ScrollView>

                {info ? (
                    <>
                <Text style={styles.panelTitle}>Submit new details</Text>
                
                <Text style={{fontWeight: 'bold'}}>Location</Text>
                <Text style={{marginBottom: 10}}>{info.name}</Text>
                <Text style={styles.panelSubtitle}>Rock Drop</Text>
              <TextInput
                style={styles.input}
                value={rockDrop}
                onChangeText={setRockDrop}
                autoCorrect={false}
                autoCapitalize="none"
                placeholder={info.details.rockdrop}
              />

              <Text style={styles.panelSubtitle}>Total</Text>
              <TextInput
                style={styles.input}
                value={total}
                onChangeText={setTotal}
                autoCorrect={false}
                autoCapitalize="none"
                placeholder={info.details.total}
              />

              <Text style={styles.panelSubtitle}>Anchor</Text>
              <TextInput
                style={styles.input}
                value={anchor}
                onChangeText={setAnchor}
                autoCorrect={false}
                autoCapitalize="none"
                placeholder={info.details.anchor}
              />

              <Text style={styles.panelSubtitle}>Access</Text>
              <TextInput
                style={styles.input}
                value={access}
                onChangeText={setAccess}
                autoCorrect={false}
                autoCapitalize="none"
              />

              <Text style={styles.panelSubtitle}>Notes</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                value={notes}
                onChangeText={setNotes}
                autoCorrect={false}
                autoCapitalize="none"
                multiline={true}
                numberOfLines={4}
              />

              <Text style={styles.panelSubtitle}>Coordinates</Text>
              <TextInput
                style={styles.input}
                value={coordinates}
                onChangeText={setCoordinates}
                autoCorrect={false}
                autoCapitalize="none"
                placeholder='Lat, Lng'
              />

              <Text style={styles.panelSubtitle}>Cliff Aspect</Text>
              <TextInput
                style={styles.input}
                value={cliffAspect}
                onChangeText={setCliffAspect}
                autoCorrect={false}
                autoCapitalize="none"
                placeholder={info.details.cliffAspect}
              />

              <Text style={styles.panelSubtitle}>Video Link</Text>
              <TextInput
                style={styles.input}
                value={videoLink}
                onChangeText={setVideoLink}
                autoCorrect={false}
                autoCapitalize="none"
              />

              <Text style={styles.panelSubtitle}>Opened By</Text>
              <TextInput
                style={styles.input}
                value={openedBy}
                onChangeText={setOpenedBy}
                autoCorrect={false}
                autoCapitalize="none"
              />

              <Text style={styles.panelSubtitle}>Opened Date</Text>
              <TextInput
                style={styles.input}
                value={openedDate}
                onChangeText={setOpenedDate}
                autoCorrect={false}
                autoCapitalize="none"
              />

                <TouchableOpacity style={styles.borderButton} onPress={pickImage}>
                    <Text style={styles.imageButtonTitle}>Add Images</Text>
                </TouchableOpacity>

                {imageLoading ? (
                  <Text style={styles.imageCountText}>Loading images <ActivityIndicator size="small" color="#0000ff" /></Text>
                ) : (
                  <Text style={styles.imageCountText}> {images.length} {images.length === 1 ? 'image' : 'images'} added</Text>
                )}
                

                { Loading ? (
                  <ActivityIndicator animating={true} color="#00ABF0" />
                ) : (
                  <>
                    <TouchableOpacity style={styles.panelButton} onPress={handleSubmit}>
                      <Text style={styles.panelButtonTitle}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.panelButtonTitle}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )} 
                </>
                ) : (
                    <Text>Location not loaded correctly</Text>
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
      marginTop: 20
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
  cancelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#A52A2A',
    alignItems: 'center',
    marginVertical: 7,
  },
  });
  
  export default SubmitDetailsModal;