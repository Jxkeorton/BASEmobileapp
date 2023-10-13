import React from "react";
import { View, StyleSheet, Alert, Text} from "react-native";
import { Button } from "react-native-paper";
import { router } from "expo-router";
import { deleteUserAccount } from "../../../../store";

const DeleteAccount = () => {
    const handleDeleteAccount = async () => {
        const result = await deleteUserAccount();
        if (result.success) {
            // Account has been deleted successfully, you can navigate to another screen or show a success message here.
            router.replace('/(auth)/Register')
        } else {
            // Handle the error here, you can display an error message.
            console.error(result.error);
            Alert.alert('failed to delete account', 'please try again or contact us')
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Are you sure you want to delete your account?</Text>
            <Button title="Delete Account" onPress={handleDeleteAccount} style={styles.button}><Text style={styles.buttonTitle}>Delete Account</Text></Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    button: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#00ABF0',
        alignItems: 'center',
        marginTop: 30,
    },
    buttonTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white',
    },
    text: {
        fontSize: 19,
        alignContent: 'center',
        textAlign: 'center',
    }
});

export default DeleteAccount;