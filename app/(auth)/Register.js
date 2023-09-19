import { Text, Button } from 'react-native-paper'
import { useRouter } from 'expo-router'

const Register = () => {
    router = useRouter()

    return (
        <Text>
            Register
            <Button onPress={() => router.replace("/Login")}>Login</Button>
        </Text>
    )
};

export default Register;