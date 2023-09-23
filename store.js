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
    const router = useRouter()
    
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

export const appSignUp = async (email, password, displayName) => {
    try {
        const resp = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
        await updateProfile(resp.user, {displayName});

        AuthStore.update((store) => {
            store.user = FIREBASE_AUTH.currentUser;
            store.isLoggedIn = true;
        });

        const name = displayName

        const formData = { email, name };
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

registerInDevtools({ AuthStore });