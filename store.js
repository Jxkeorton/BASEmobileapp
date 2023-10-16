import { Store, registerInDevtools} from 'pullstate'
import { 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    updateProfile,
    deleteAccount,
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    serverTimestamp, 
    updateDoc,
    getDoc,
    deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from 'firebase/storage';
import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from './firebaseConfig';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

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

// for the register page 
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

// when user resets password on the forgot password page
export const appResetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(FIREBASE_AUTH, email);
        return { success: true };
    } catch (e) {
        return { error: e };
    }
};

// for edit profile page when user changes profile image 
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

// for edit profile page when user updates details 
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

    if (jumpNumber !== undefined && !isNaN(Number(jumpNumber))) {
        updatedData.jumpNumber = Number(jumpNumber); // Ensure jumpNumber is a number
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

// when the user wants to submit a new location for review on the submit locations page
export const submitLocationsHandler = async ({formData}) => {
    if (!formData.exitName || !formData.rockDrop || !formData.coordinates ) {
        // Display an error message to the user or prevent form submission
        Alert.alert('Please fill out all required fields');
        return;
      }
    
      // Handle form submission here
      try {
        // Upload the image files to Firebase Storage
        const imageURLs = [];
        for (const uri of formData.images) {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(FIREBASE_STORAGE, `submissions/${Date.now()}.jpg`);
            await uploadBytes(storageRef, blob);
            const imageURL = await getDownloadURL(storageRef);
            imageURLs.push(imageURL);
          }
          // without the old images in formdata, upload
        const submissionData = {
            exitName: formData.exitName,
            rockDrop: formData.rockDrop,
            total: formData.total,
            anchor: formData.anchor,
            access: formData.access,
            notes: formData.notes,
            coordinates: formData.coordinates,
            cliffAspect: formData.cliffAspect,
            videoLink: formData.videoLink,
            openedBy: formData.openedBy,
            openedDate: formData.openedDate,
            imageURLs
          };

        const docRef = await addDoc(collection(FIREBASE_DB, 'submits'), submissionData);
        console.log('Document written with ID: ', docRef.id);


      } catch (e) {
        Alert.alert(e.message);
        console.log(e);
      }
};

// add jump to users jumpnumber 
export const addJumpNumber = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      const userDocRef = doc(FIREBASE_DB, 'users', user.uid);
  
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const currentJumpNumber = userData.jumpNumber || 0; // Default to 0 if jumpNumber doesn't exist
  
        // Add 1 to the current jump number
        const newJumpNumber = currentJumpNumber + 1;
  
        // Update the user's jump number in Firestore
        await updateDoc(userDocRef, { jumpNumber: newJumpNumber });
  
        console.log(`Jump number increased to ${newJumpNumber}`);
      }
    } catch (error) {
      console.error('Error adding jump number:', error);
    }
  };

//takeaway jump to users jumpnumber
export const takeawayJumpNumber = async () => {
    try {
        const user = FIREBASE_AUTH.currentUser;
        const userDocRef = doc(FIREBASE_DB, 'users', user.uid);
    
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          const currentJumpNumber = userData.jumpNumber || 0; // Default to 0 if jumpNumber doesn't exist
    
          if (currentJumpNumber > 0) {
            // Subtract 1 from the current jump number if it's greater than 0
            const newJumpNumber = currentJumpNumber - 1;
    
            // Update the user's jump number in Firestore
            await updateDoc(userDocRef, { jumpNumber: newJumpNumber });
    
            console.log(`Jump number decreased to ${newJumpNumber}`);
          } else {
            console.log("Jump number is already at 0.");
          }
        }
    } catch (error) {
        console.error('Error taking away jump number:', error);
    }
};


    // When logbook jump is added to firebase 
    export const submitJumpHandler = async ({formData}) => {
        //get user from firebase
        const user = FIREBASE_AUTH.currentUser;
        
        //upload images to storage and get download URL
        try {
            // Upload the image files to Firebase Storage
            const imageURLs = [];
            for (const uri of formData.images) {
                const response = await fetch(uri);
                const blob = await response.blob();
                const storageRef = ref(FIREBASE_STORAGE, `logbooks/${Date.now()}.jpg`);
                await uploadBytes(storageRef, blob);
                const imageURL = await getDownloadURL(storageRef);
                imageURLs.push(imageURL);
              }
    
            // Create submission data without images
            const submissionData = {
                location: formData.location,
                exitType: formData.exitType,
                delay: formData.delay,
                details: formData.details,
                date: formData.date,
                imageURLs
            };

            //add formdata and image urls to users logbook document within firebase
                const userId = user.uid;
            
                // Get the user's logbook document reference
                const logbookRef = doc(FIREBASE_DB, 'logbook', userId);
                
                // Check if the logbook document exists
                const logbookSnapshot = await getDoc(logbookRef);

                if (!logbookSnapshot.exists()) {
                // If the logbook document doesn't exist, create it with the user's ID
                await setDoc(logbookRef, { jumps: [] });
                }

                const existingLogbookData = logbookSnapshot.data() || { jumps: [] };
            
                // Add the new jump to the existing jumps array
                existingLogbookData.jumps.push(submissionData);
            
                // Update the logbook document with the new jumps array
                await setDoc(logbookRef, existingLogbookData);
                await addJumpNumber()
            
                console.log('Jump submitted successfully.');

        } catch (e) {
            Alert.alert(e.message);
            console.log(e);
        }; 
    };

    export const getLoggedJumps = async () => {
        try {
          const user = FIREBASE_AUTH.currentUser;
          const userId = user.uid;
      
          const logbookRef = doc(FIREBASE_DB, 'logbook', userId);
          const logbookSnapshot = await getDoc(logbookRef);
      
          if (logbookSnapshot.exists()) {
            const logbookData = logbookSnapshot.data();
            const jumps = logbookData.jumps || [];
      
            // Return the array of submitted jumps
            return jumps;
          } else {
            // If the logbook document doesn't exist, return an empty array
            return [];
          }
        } catch (error) {
          console.error('Error retrieving logged jumps:', error);
          throw error;
        }
      };

      export const getJumpnumber = async () => {
            const currentUser = FIREBASE_AUTH.currentUser;
            if (!currentUser) {
            Alert.alert('No authenticated user found');
            return;
            }
            const userId = currentUser.uid;
  
            const userDocRef = doc(FIREBASE_DB, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);
            const userDocData = userDocSnap.data();

            if (userDocData) {
              const { jumpNumber } = userDocData;
              if (jumpNumber) {
                return jumpNumber
              }
            } else {
              return 
            }
      };

      export const deleteUserAccount = async () => {
        try {
          // Get the current user
          const user = FIREBASE_AUTH.currentUser;
      
          if (user) {
            const userId = user.uid;
      
            // Delete the user's document from the database
            const userDocRef = doc(FIREBASE_DB, 'users', userId);
            await deleteDoc(userDocRef);
      
            // Delete the user's account from Firebase Authentication
            await deleteAccount(user);
      
            return { success: true };
          } else {
            return { error: 'No authenticated user found' };
          }
        } catch (error) {
          return { error: error.message };
        }
      };

      // Function to add a username to the users collection
      export const addUsername = async (username) => {
        const user = FIREBASE_AUTH.currentUser;

        if (!user) {
          // Handle the case where there is no authenticated user
          return { error: 'No authenticated user found' };
        }

        // Check if the username is already taken
        const isTaken = await isUsernameTaken(username);
        if (isTaken) {
          return { error: 'auth/username-taken' };
        }

        // Update the user's document with the new username
        const userDocRef = doc(FIREBASE_DB, 'users', user.uid);

        try {
          await setDoc(userDocRef, { username }, { merge: true });
          return { success: true };
        } catch (error) {
          return { error: error.message };
        }
      };

      

registerInDevtools({ AuthStore });