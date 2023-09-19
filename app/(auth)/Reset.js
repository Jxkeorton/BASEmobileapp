import { Text, Button} from 'react-native-paper'
import { router } from 'expo-router';
import { useRouter } from 'expo-router';

const Reset = () => {
    const router = useRouter();

    return (
        <Text>
            Reset
            <Button onPress={() => router.replace("/Login")}>Login</Button>
        </Text>
    )
};

export default Reset;