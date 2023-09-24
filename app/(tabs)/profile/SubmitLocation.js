import React, { useState } from "react";
import { View, TextInput,Text, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, ScrollView } from "react-native";
import { Button, Portal, Modal, PaperProvider } from "react-native-paper";
import * as ImagePicker from 'expo-image-picker';

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
    const [image, setImage] = useState('');

    const [visible, setVisible] = useState(false);
    const [permission, requestPermission] = ImagePicker.useCameraPermissions();

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const containerStyle = {backgroundColor: 'white', padding: 20};

    const handleSubmit = () => {
        if (!exitName || !rockDrop || !coordinates ) {
          // Display an error message to the user or prevent form submission
          Alert.alert('Please fill out all required fields');
          return;
        }
      
        // Handle form submission here
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
    try {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      setImage(uri)
      hideModal();
    }
  } catch (e) {
    Alert.alert("Error Uploading Image " + e.message);
  }
  };

  // if taking image this function opens the camera 
  const takePhoto = async () => {
    try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1
    });

    if(!result.canceled) {
      const { uri } = result.assets[0];
      setImage(uri)
      hideModal();
    }
    } catch (e) {
      Alert.alert("Error Uploading Image " + e.message);
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
                    <TextInput value={rockDrop} style={styles.textInput} placeholder='Rock Drop *' autoCapitalize='none' onChangeText={(text) => setRockDrop(text)}></TextInput>
                    <TextInput value={total} style={styles.textInput} placeholder='Overall Height' autoCapitalize='none' onChangeText={(text) => setTotal(text)}></TextInput>
                    <TextInput value={anchor} style={styles.textInput} placeholder='Anchor Info' autoCapitalize='none' onChangeText={(text) => setAnchor(text)}></TextInput>
                    <TextInput value={access} style={styles.textInput} placeholder='Access' autoCapitalize='none' onChangeText={(text) => setAccess(text)}></TextInput>
                    <TextInput value={notes} style={styles.textInput} placeholder='Notes' autoCapitalize='none' onChangeText={(text) => setNotes(text)}></TextInput>
                    <TextInput value={coordinates} style={styles.textInput} placeholder='Exact Coordinates *' autoCapitalize='none' onChangeText={(text) => setCoordinates(text)}></TextInput>
                    <TextInput value={cliffAspect} style={styles.textInput} placeholder='Cliff Aspect' autoCapitalize='none' onChangeText={(text) => setCliffAspect(text)}></TextInput>
                    <TextInput value={videoLink} style={styles.textInput} placeholder='Video Link' autoCapitalize='none' onChangeText={(text) => setVideoLink(text)}></TextInput>
                    <TextInput value={openedBy} style={styles.textInput} placeholder='Opened By' autoCapitalize='none' onChangeText={(text) => setOpenedBy(text)}></TextInput>
                    <TextInput value={openedDate} style={styles.textInput} placeholder='Opened Date' autoCapitalize='none' onChangeText={(text) => setOpenedDate(text)}></TextInput>
                    <Button onPress={uploadImage} style={styles.commandButton}><Text style={styles.panelButtonTitle}>Add Images</Text></Button>

                    <Button onPress={handleSubmit} style={styles.commandButton}><Text style={styles.panelButtonTitle}>Submit</Text></Button>
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
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#00ABF0',
        alignItems: 'center',
        marginTop: 10,
    },
})