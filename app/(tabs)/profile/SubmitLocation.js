import React, { useState } from "react";
import { View, TextInput,Text, StyleSheet, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, ScrollView, TouchableOpacity } from "react-native";
import { Switch, Portal, Modal, PaperProvider, ActivityIndicator } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import Toast from 'react-native-toast-message';
import { submitLocationsHandler } from "../../../store";

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const SubmitLocation = () => {
    const [exitName, setExitName] = useState('');
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
    const [selectedUnit, setSelectedUnit] = useState('Meters'); // Default to meters


    const [visible, setVisible] = useState(false);
    const [permission, requestPermission] = ImagePicker.useCameraPermissions();

    const [imageLoading, setImageLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const containerStyle = {backgroundColor: 'white', padding: 20};

    const formData = {
      exitName, 
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
      selectedUnit,
    };

    // when form submitted
    const handleSubmit = async () => {
      setLoading(true);
      try {
        await submitLocationsHandler({ formData });
        router.replace('/(tabs)/profile/Profile')
        Toast.show({
          type: 'success', // You can customize the type (success, info, error, etc.)
          text1: 'Successfully sent submission',
          position: 'top',
        });
        // Optionally, you can navigate to another screen or display a success message here.
      } catch (error) {
        Toast.show({
          type: 'error', // You can customize the type (success, info, error, etc.)
          text1: 'Error Trying to send submission',
          position: 'top',
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    // when edit image button clicked in editprofile screen
    // checks/asks for permission before opening the modal to change the image
    const uploadImage = async () => {
        if (permission?.status !== ImagePicker.PermissionStatus.GRANTED) {
            requestPermission();
            showModal();
        } else {
            showModal();
        }
    };

// if choosing new image from camera roll this function opens album 
  const pickImage = async () => {
    setImageLoading(true);
    try {
    let result = await ImagePicker.launchImageLibraryAsync({
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
      hideModal();
      setImage(newImages);
    }
  } catch (e) {
    Toast.show({
      type: 'error', // You can customize the type (success, info, error, etc.)
      text1: 'Error uploading image',
      position: 'top',
    });
  } finally {
    setImageLoading(false);
  }
  };

  // if taking image this function opens the camera 
  const takePhoto = async () => {
    setImageLoading(true);
    try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: false,
    });

    if(!result.canceled) {
      const { uri } = result.assets[0];
      setImage((prevImages) => [...prevImages, uri]); 
      hideModal();
    }
    } catch (e) {
      Toast.show({
        type: 'error', // You can customize the type (success, info, error, etc.)
        text1: 'Error uploading image',
        position: 'top',
      });
    } finally {
      setImageLoading(false);
    }
  };

    const RenderInner = () => (
        <View style={styles.panel}>
          <View style={{alignItems: 'center'}}>
            <Text style={styles.panelTitle}>Upload Photo</Text>
            <Text style={styles.panelSubtitle}>Choose Your Profile Picture</Text>
          </View>
          <TouchableOpacity style={styles.panelButton} onPress={takePhoto}>
            <Text style={styles.panelButtonTitle}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.panelButton} onPress={pickImage}>
            <Text style={styles.panelButtonTitle}>Choose From Library</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.panelButton} onPress={hideModal}>
            <Text style={styles.panelButtonTitle}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );

    return (
        <PaperProvider>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView>
            <View style={styles.container}>
            <Portal>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
                    <RenderInner />
                </Modal>
            </Portal>
                <KeyboardAvoidingView behavior="padding" >
                    <Text style={{alignItems: 'center', justifyContent: 'center' , marginVertical: 20,}}>Fields marked with * must be filled in </Text>
                    <TextInput value={exitName} style={styles.textInput} placeholder='Exit Name *' autoCapitalize='none' onChangeText={(text) => setExitName(text)}></TextInput>
                    <TextInput value={coordinates} style={styles.textInput} placeholder='Exact Coordinates *' autoCapitalize='none' onChangeText={(text) => setCoordinates(text)}></TextInput>
                    <View style={styles.switchContainer}>
                      <Text style={styles.switchText}><Text style={styles.bold}>Unit: </Text>{selectedUnit}</Text>
                      <Switch
                        value={selectedUnit === 'Feet'}
                        onValueChange={() =>
                          setSelectedUnit(selectedUnit === 'Meters' ? 'Feet' : 'Meters')
                        }
                      />
                    </View>
                    <TextInput value={rockDrop} style={styles.textInput} placeholder={`Rock Drop * (${selectedUnit})`} autoCapitalize='none' onChangeText={(text) => setRockDrop(text)}></TextInput>
                    <TextInput value={total} style={styles.textInput} placeholder='Overall Height' autoCapitalize='none' onChangeText={(text) => setTotal(text)}></TextInput>
                    <TextInput value={anchor} style={styles.textInput} placeholder='Anchor Info' autoCapitalize='none' onChangeText={(text) => setAnchor(text)}></TextInput>
                    <TextInput value={access} style={styles.textInput} placeholder='Access' autoCapitalize='none' onChangeText={(text) => setAccess(text)}></TextInput>
                    <TextInput value={notes} style={styles.textInput} placeholder='Notes' autoCapitalize='none' onChangeText={(text) => setNotes(text)}></TextInput>
                    <TextInput value={cliffAspect} style={styles.textInput} placeholder='Cliff Aspect' autoCapitalize='none' onChangeText={(text) => setCliffAspect(text)}></TextInput>
                    <TextInput value={videoLink} style={styles.textInput} placeholder='Video Link' autoCapitalize='none' onChangeText={(text) => setVideoLink(text)}></TextInput>
                    <TextInput value={openedBy} style={styles.textInput} placeholder='Opened By' autoCapitalize='none' onChangeText={(text) => setOpenedBy(text)}></TextInput>
                    <TextInput value={openedDate} style={styles.textInput} placeholder='Opened Date' autoCapitalize='none' onChangeText={(text) => setOpenedDate(text)}></TextInput>
                    

                    <View style={styles.buttonContainer}>

                      <TouchableOpacity onPress={uploadImage} style={styles.borderButton} ><Text style={styles.imageButtonTitle}>Add images</Text></TouchableOpacity>

                      {imageLoading ? (
                        <Text style={styles.imageCountText}>Loading images <ActivityIndicator size="small" color="#0000ff" /></Text>
                      ) : (
                        <></>
                      )}

                      {images.length > 0 ? (
                        <Text>{images.length} {images.length === 1 ? 'image' : 'images'} added</Text>
                      ) : (
                        <></>
                      )}

                      {loading ? (
                        <ActivityIndicator size="small" color="#0000ff" />
                      ) : (
                        <TouchableOpacity onPress={handleSubmit} style={styles.commandButton}><Text style={styles.panelButtonTitle}>Submit</Text></TouchableOpacity>
                      )}
                    </View>
                    
                    
                </KeyboardAvoidingView>
            </View>
            </ScrollView>
        </TouchableWithoutFeedback>
        </PaperProvider>
    )
};

export default SubmitLocation;

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center',
    },
    textInput: {
        marginVertical: 4,
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff',
    },
    panelButtonTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white',
    },
    commandButton: {
        borderRadius: 10,
        backgroundColor: '#00ABF0',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        width: '100%',
        height: 40,
    },
    panelTitle: {
      fontSize: 27,
      height: 35,
    },
    panelSubtitle: {
      fontSize: 14,
      color: 'gray',
      height: 30,
      marginBottom: 10,
    },
    panelButton: {
      borderRadius: 10,
      backgroundColor: '#00ABF0',
      alignItems: 'center',
      marginVertical: 7,
    },
    imageCountText: {
      marginTop: 8, 
      fontSize: 16,
      color: 'gray', 
    },
    buttonContainer: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    borderButton: {
      borderRadius: 10,
      borderWidth: 1,            // Add a border width
      borderColor: 'black',    // Specify the border color
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
      width: '100%',
      height: 40,
      backgroundColor: 'transparent', // Make the background transparent
    },
    imageButtonTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: 'black',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  switchText: {
    fontSize: 16,
    marginRight: 20,
  },
  bold: {
    fontWeight: 'bold',
  }
})