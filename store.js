import { Store, registerInDevtools} from 'pullstate'
import { 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    serverTimestamp, 
    updateDoc,
    getDoc
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from './firebaseConfig';
import { useRouter } from 'expo-router';

const router = useRouter()


export const AuthStore = new Store({
    isLoggedIn: false,
    initialized: false,
    user: null,
});

const unsub = onAuthStateChanged(FIREBASE_AUTH, (user) => {
    console.log('onAuthStateChanged', user);
    AuthStore.update((store) => {
        store.user = user;
        store.isLoggedIn = user ? true : false;
        store.initialized = true;
    });
});

export const appSignIn = async (email, password) => {
    try {
        const resp = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
        AuthStore.update((store) => {
            store.user = resp.user;
            store.isLoggedIn = resp.user ? true : false;
        });
        return {user: FIREBASE_AUTH.currentUser};
    } catch (e) {
        return {error: e};
    }
};

export const appSignOut = async () => {
    
    try {
        await signOut(FIREBASE_AUTH);
        AuthStore.update((store) => {
            store.user = null;
            store.isLoggedIn = false;
        });
        return {user: null};
    } catch (e) {
        return {error: e};
    } finally { 
        router.replace("/(auth)/Login");
    }
};

// Function to check if a username already exists
const isUsernameTaken = async (username) => {
    try {
        // Query the 'users' collection to check if a document with the given username exists
        const docRef = doc(FIREBASE_DB, 'users', username);
        const docSnapshot = await getDoc(docRef);

        // If the document exists, the username is taken
        return docSnapshot.exists();
    } catch (error) {
        console.error('Error checking username:', error);
        throw error;
    }
};

export const appSignUp = async (email, password, displayName, username) => {
    try {
         // Check if the username is already taken
         const usernameTaken = await isUsernameTaken(username);

         if (usernameTaken) {
             return { error: 'auth/username-taken' };
         }

        const resp = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
        await updateProfile(resp.user, {displayName});

        AuthStore.update((store) => {
            store.user = FIREBASE_AUTH.currentUser;
            store.isLoggedIn = true;
        });

        const name = displayName

        const formData = { email, name, username };
        formData.timestamp = serverTimestamp();

        await setDoc(doc(FIREBASE_DB, 'users', resp.user.uid), formData);

        return {user: FIREBASE_AUTH.currentUser};
    } catch (e) {
        return {error: e};
    }
};

export const appResetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(FIREBASE_AUTH, email);
        return { success: true };
    } catch (e) {
        return { error: e };
    }
};

export const uploadImageToProfile = async (uri, name, onProgress) => {

    const fetchResponse = await fetch(uri);
    const profilePicBlob = await fetchResponse.blob();
    
    const imageRef = ref(FIREBASE_STORAGE, `images/${name}`);

    const uploadTask = uploadBytesResumable(imageRef, profilePicBlob);

    return new Promise((resolve, reject) => {
    uploadTask.on('state_changed', 
    (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress && onProgress( progress );
    }, 
    (error) => {
        // Handle unsuccessful uploads
        reject(error);
    }, 
    async () => {
     const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

     // Get the current user
     const user = FIREBASE_AUTH.currentUser;
     if (user) {
       const userDocRef = doc(FIREBASE_DB, 'users', user.uid);

       // Check if the 'profileImage' field exists in the user's document
       const userDocSnapshot = await getDoc(userDocRef);
       if (userDocSnapshot.exists()) {
         // 'profileImage' field exists, update it
         await updateDoc(userDocRef, {
           profileImage: downloadURL,
         });
       } else {
         // 'profileImage' field does not exist, create it
         await setDoc(userDocRef, {
           profileImage: downloadURL,
         });
       }
     }

     resolve({
        downloadURL,
        metadata : uploadTask.snapshot.metadata
     });
    }
    );
    });
};

export const updateProfileDetails = async ( name, email, jumpNumber) => {
    const user = FIREBASE_AUTH.currentUser;
    const userDocRef = doc(FIREBASE_DB, 'users', user.uid);
    
    // Prepare the updated data
    const updatedData = {};

    if (typeof name === 'string' && name.trim() !== '') {
        updatedData.name = name;
    }

    if (typeof email === 'string' && email.trim() !== '') {
        updatedData.email = email;
      }

    if (jumpNumber) {
        updatedData.jumpNumber = jumpNumber;
    }

    // Update the user document with the new data
    try {
        await setDoc(userDocRef, updatedData, { merge: true });
        return true; // Successful update
    } catch (error) {
        console.error('Error updating profile details:', error);
        throw error;
    } finally {
        router.replace('/(tabs)/profile/Profile')
    }
};

registerInDevtools({ AuthStore });