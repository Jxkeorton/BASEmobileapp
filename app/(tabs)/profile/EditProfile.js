import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  StyleSheet,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Modal, Portal, PaperProvider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToProfile } from '../../../store';


const EditProfile = () => {
  const [visible, setVisible] = useState(false);
  const [image, setImage] = useState('https://api.adorable.io/avatars/80/abott@adorable.png');
  const [permission, requestPermission] = ImagePicker.useCameraPermissions();


  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {backgroundColor: 'white', padding: 20};


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
      const fileName = uri.split('/').pop();
      const uploadResp = await uploadImageToProfile(
        uri,
        fileName
      );
      console.log(uploadResp);
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
      const fileName = uri.split('/').pop();
      const uploadResp = await uploadImageToProfile(
        uri,
        fileName
      );
      console.log(uploadResp);
      hideModal();
    }
    } catch (e) {
      Alert.alert("Error Uploading Image " + e.message);
    }
  };

  // when edit image button clicked in editprofile screen
  // checks/asks for permission before opening the modal to change the image
  const editProfileImage = async () => {
    if (permission?.status !== ImagePicker.PermissionStatus.GRANTED) {
      requestPermission();
      showModal();
    } else {
      showModal();
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
        <View style={styles.container}>
          <Portal>
            <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
              <RenderInner />
            </Modal>
          </Portal>
            <View style={{ margin: 20}}>
                <View style={{ alignItems: 'center' }}>
                    <TouchableOpacity onPress={editProfileImage} >
                        <View style={{ 
                            height: 100,
                            width: 100,
                            borderRadius: 15,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <ImageBackground
                                source={{
                                    uri: image,
                                }}
                                style={ {height: 100, width: 100}}
                                imageStyle={{borderRadius: 15}}
                            >
                              <View style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignContent: 'center',
                              }} >
                                <Icon name='camera' size={35} color='#fff' style={{
                                        opacity: 0.7,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: '#fff',
                                        borderRadius: 10,
                                    }}
                                />
                            </View>  
                            </ImageBackground>
                        </View>
                    </TouchableOpacity>
                    <Text style={{marginTop: 10, fontSize: 18, fontWeight: 'bold'}}>
                        John Doe
                    </Text>
                </View>

                <View style={styles.action}>
                    <FontAwesome name="user-o" size={20} />
                    <TextInput
                        placeholder="First Name"
                        placeholderTextColor="#666666"
                        autoCorrect={false}
                        style={[
                        styles.textInput
                        ]}
                    />
                    </View>
                    <View style={styles.action}>
                    <FontAwesome name="user-o" size={20} />
                    <TextInput
                        placeholder="Last Name"
                        placeholderTextColor="#666666"
                        autoCorrect={false}
                        style={[
                        styles.textInput
                        ]}
                    />
                </View>
                <View style={styles.action}>
                  <FontAwesome name="envelope-o" size={20} />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="#666666"
                    keyboardType="email-address"
                    autoCorrect={false}
                    style={[
                      styles.textInput,
                    ]}
                  />
                </View>
                <TouchableOpacity style={styles.commandButton} onPress={() => {}}>
                  <Text style={styles.panelButtonTitle}>Submit</Text>
                </TouchableOpacity>
            </View>

        </View>
        </PaperProvider>
    )
};

export default EditProfile;

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    commandButton: {
      padding: 15,
      borderRadius: 10,
      backgroundColor: '#00ABF0',
      alignItems: 'center',
      marginTop: 10,
    },
    panel: {
      padding: 20,
      backgroundColor: '#FFFFFF',
      paddingTop: 20,
    },
    header: {
      backgroundColor: '#FFFFFF',
      shadowColor: '#333333',
      shadowOffset: {width: -1, height: -3},
      shadowRadius: 2,
      shadowOpacity: 0.4,
      paddingTop: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    panelHeader: {
      alignItems: 'center',
    },
    panelHandle: {
      width: 40,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#00000040',
      marginBottom: 10,
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
    action: {
      flexDirection: 'row',
      marginTop: 10,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#f2f2f2',
      paddingBottom: 5,
    },
    actionError: {
      flexDirection: 'row',
      marginTop: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#FF0000',
      paddingBottom: 5,
    },
    textInput: {
      flex: 1,
      marginTop: Platform.OS === 'ios' ? 0 : -12,
      paddingLeft: 10,
      color: '#05375a',
    },
  });