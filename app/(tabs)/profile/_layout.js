import { Stack, useRouter } from "expo-router";
import { Button } from "react-native-paper";
import Icon from 'react-native-vector-icons/FontAwesome';


const router = useRouter()

export default () => {
    return (
    <Stack screenOptions={{
        headerStyle: {
          backgroundColor: 'black',
        },
        headerTintColor: '#fff',
        headerBackTitle: 'Back',
      }} >
        <Stack.Screen
            name="Profile"
            options={{
                headerRight: () => (
                    <Button 
                        mode='contained-tonal' 
                        buttonColor="white" 
                        onPress={() => router.push('/profile/settings')} 
                        title="Settings" >
                            <Icon name="cog" size={20} color="#000" />
                    </Button>
                ),
                headerTitle: "",
            }}
        />
        <Stack.Screen
            name="EditProfile"
            options={{
                title: "Edit Profile",
                headerLeft: () => (
                    <Button
                      mode="contained-tonal"
                      buttonColor="white"
                      onPress={() => router.push('/profile/Profile')}
                    >
                      Cancel
                    </Button>
                ),
            }}
        />
        <Stack.Screen
            name="SubmitLocation"
            options={{
                title: "Submit A New Exit",
                headerLeft: () => (
                    <Button
                      mode="contained-tonal"
                      buttonColor="white"
                      onPress={() => router.push('/profile/Profile')}
                    >
                      Cancel
                    </Button>
                ),
            }}
        />
        <Stack.Screen
            name="settings"
            options={{
                title: "Settings",
                headerShown: false,
            }}
            

        >
            
        </Stack.Screen>
    </Stack>
    )
};