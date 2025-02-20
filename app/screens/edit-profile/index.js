import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ref as dbRef, get, ref, set } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import mime from 'mime';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, LogBox, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import Toast from 'react-native-toast-message';
import { auth, db, storage } from '../../../configs/FirebaseConfig';
import { Colors } from '../../../constants/Colors';

LogBox.ignoreLogs([
    'Warning: CountryModal: Support for defaultProps will be removed',
]);

// Function to validate email format
export default function EditProfile() {

    const router = useRouter();

    const [profilePicture, setProfilePicture] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userName, setUserName] = useState('');
    const [gender, setGender] = useState('');
    const [showGenderModal, setShowGenderModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [countryCode, setCountryCode] = useState('PH');
    const [callingCode, setCallingCode] = useState('63');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    
    // Animation
    const scaleAnimMale = useRef(new Animated.Value(1)).current;
    const scaleAnimFemale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const fetchProfileData = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const snapshot = await get(ref(db, 'users/' + user.uid));
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        console.log('Fetched data:', data); // Debugging: Check fetched data
    
                        // Ensure data parsing is correct
                        const parsedPhoneNumber = data.phoneNumber || '';
                        const parsedCallingCode = parsedPhoneNumber.split(' ')[0].replace('+', '');
    
                        setFirstName(data.firstName || '');
                        setLastName(data.lastName || '');
                        setUserName(data.userName || '');
                        setPhoneNumber(parsedPhoneNumber);
                        setGender(data.gender || '');
                        setCallingCode(parsedCallingCode);
                        setCountryCode(data.countryCode || 'PH'); // Set countryCode if available
                    } else {
                        console.log('No data available'); // Debugging: No data case
                    }
                } catch (error) {
                    Alert.alert('Error', 'Failed to load profile data. Please try again later.');
                    console.error('Error fetching profile data:', error); // Log error for debugging
                }
            } else {
                Alert.alert('Error', 'No user is currently signed in.');
            }
        };
    
        fetchProfileData();
    }, []);
    

    const onSelect = (country) => {
        setCountryCode(country.cca2);
        setCallingCode(country.callingCode[0]);
    };

    const handleImageProcessing = async () => {
        // Image processing logic
            try {
                setUploading(true);
        
                let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                });
        
                if (result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                
                if (!imageUri) {
                    Alert.alert('Error', 'Image URI is not available.');
                    return;
                }
        
                // Adjust the image URI
                const newImageUri = "file:///" + imageUri.split("file:/").join("");
        
                // Create FormData object
                const formData = new FormData();
                formData.append('image', {
                    uri: newImageUri,
                    type: mime.getType(newImageUri),
                    name: newImageUri.split("/").pop()
                });
        
                // Upload the image
                const user = auth.currentUser;
                if (!user) {
                    throw new Error('User is not authenticated');
                }
        
                const userId = user.uid;
                const fileName = `${Date.now()}.jpeg`;
                const fileRef = storageRef(storage, `profilePictures/${userId}/${fileName}`);
        
                // Create a Blob from the FormData object
                const response = await fetch(newImageUri);
                const blob = await response.blob();
        
                if (!blob) {
                    throw new Error('Blob creation failed');
                }
        
                // Upload to Firebase
                const uploadTask = uploadBytesResumable(fileRef, blob);
        
                uploadTask.on('state_changed',
                    (snapshot) => {
                    // Progress monitoring can be added here if needed
                    },
                    (error) => {
                    console.error('Upload error:', error);
                    Alert.alert('Error', 'Failed to upload image. Please try again.');
                    },
                    async () => {
                    // Get download URL
                    const imageUrl = await getDownloadURL(fileRef);
                    console.log('Image URL:', imageUrl);
        
                    // Save to database
                    const userRef = dbRef(db, `users/${userId}/profilePicture`);
                    await set(userRef, imageUrl);
        
                    setProfilePicture(imageUrl);
                    }
                );
                }
            } catch (error) {
                console.error('Error picking image:', error);
                Alert.alert('Error', 'Failed to pick image. Please try again.');
            } finally {
                setUploading(false);
            }
        };

    const showGenderModalHandler = () => {
        setShowGenderModal(true);
    };

    const selectGender = (selectedGender) => {
        setGender(selectedGender);
        setShowGenderModal(false);
    };

    const OnCreateProfile = () => {
        if (!userName || !gender) {
            Alert.alert('Notice📌', 'Please enter at least a Username and Gender.', [{ text: 'OK' }]);
            return;
        }
        const user = auth.currentUser; // Get the currently signed-in user
    
        if (!user) {
            Alert.alert('Error', 'No user is currently signed in. Please sign in and try again.', [{ text: 'OK' }]);
            return;
        }
    
        const userId = user.uid; // Use the authenticated user's ID
        setLoading(true);
    
        // Fetch the existing profile data
        const userRef = ref(db, 'users/' + userId);
        get(userRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    const currentProfilePicture = userData.profilePicture || ''; // Preserve current profile picture
    
                    // Set the profile data, preserving the current profile picture if a new one is not uploaded
                    const profileData = {
                        email: user.email, // Include the user's email
                        userName,
                        callingCode: callingCode || '',
                        countryCode: countryCode || '',
                        phoneNumber: phoneNumber || '',
                        gender,
                        profilePicture: profilePicture || currentProfilePicture, // Use existing profile picture if not changed
                    };
    
                    set(userRef, profileData)
                        .then(() => {
                            setCallingCode(callingCode);
                            setCountryCode(countryCode);
                            setUserName(userName);
                            setPhoneNumber(phoneNumber);
                            setGender(gender);
    
                            Toast.show({
                                type: 'success',
                                text1: 'Success!',
                                text2: 'Your profile has been updated successfully.✅',
                                position: 'top',
                                visibilityTime: 4000,
                            });
                        })
                        .catch((error) => {
                            Alert.alert(
                                'Error',
                                'An error occurred while updating your profile. Please try again later.',
                                [{ text: 'OK' }]
                            );
                        });
                } else {
                    // If no existing data, save the profile without a picture if it's not uploaded
                    const profileData = {
                        email: user.email, // Include the user's email
                        userName,
                        callingCode: callingCode || '',
                        countryCode: countryCode || '',
                        phoneNumber: phoneNumber || '',
                        gender,
                        profilePicture: profilePicture || '', // Save profile with no picture if not uploaded
                    };
    
                    set(userRef, profileData)
                        .then(() => {
                            setCallingCode(callingCode);
                            setCountryCode(countryCode);
                            setUserName(userName);
                            setPhoneNumber(phoneNumber);
                            setGender(gender);
    
                            Toast.show({
                                type: 'success',
                                text1: 'Success!',
                                text2: 'Your profile has been created successfully.✅',
                                position: 'top',
                                visibilityTime: 4000,
                            });
                        })
                        .catch((error) => {
                            Alert.alert(
                                'Error',
                                'An error occurred while creating your profile. Please try again later.',
                                [{ text: 'OK' }]
                            );
                        });
                }
            })
            .catch((error) => {
                Alert.alert(
                    'Error',
                    'An error occurred while fetching your profile data. Please try again later.',
                    [{ text: 'OK' }]
                );
            })
            .finally(() => {
                setLoading(false); // Ensure loading is stopped in every case
            });
    };
    

    const handleBackPress = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
        router.replace('./../../(tabs)/profile'); // Replace with your actual route
        }
    };

    const animatePressInMale = () => {
        Animated.spring(scaleAnimMale, {
            toValue: 0.95, // Scale down slightly
            friction: 4,
            useNativeDriver: true,
        }).start();
    };

    const animatePressOutMale = () => {
        Animated.spring(scaleAnimMale, {
            toValue: 1, // Scale back to original
            friction: 4,
            useNativeDriver: true,
        }).start();
    };

    const animatePressInFemale = () => {
        Animated.spring(scaleAnimFemale, {
            toValue: 0.95, // Scale down slightly
            friction: 4,
            useNativeDriver: true,
        }).start();
    };

    const animatePressOutFemale = () => {
        Animated.spring(scaleAnimFemale, {
            toValue: 1, // Scale back to original
            friction: 4,
            useNativeDriver: true,
        }).start();
    };

    const handleCancelPress = () => {
        setGender(''); // Reset the gender to default
        setShowGenderModal(false);
    };

    return (
        <View style={{flex: 1, backgroundColor: '#1C2A38'}}>
        <View style={styles.container}>
            <View style={styles.profileSection}>
                <TouchableOpacity onPress={handleBackPress} style={{
                    position: 'absolute',
                    top: -35,
                    left: -20,}}>
                <Ionicons style=
                {{ marginTop: -18 }}
                name="arrow-back"
                size={28}
                color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleImageProcessing}>
                    {profilePicture ? (
                        <Image source={{ uri: profilePicture }} style={styles.profilePic} />
                        ) : (
                    <View style={styles.placeholderWrapper}>
                        <Ionicons
                            name="camera"
                            size={30}
                            color="#000" />
                        </View>
                    )}
            </TouchableOpacity>
        </View>

        <Text style={[styles.title]}>Edit Profile</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text>User Name</Text>
        <View>
        <TextInput style={[styles.input, {color:'#000'}]}
            value={userName}
            onChangeText={setUserName}
            placeholder="Username"/>
        <FontAwesome name="user-circle" size={20} color='#B0B0B0' style={styles.icon2} />
        </View>

        <Text style={{}}>Phone Number (Optional)</Text>
        <View style={styles.phoneContainer}>
            <CountryPicker
                countryCode={countryCode}
                withFilter
                withFlag
                withCallingCode
                withCallingCodeButton
                withAlphaFilter
                onSelect={onSelect}
                theme={{
                    onBackgroundTextColor: '#000',
                    fontFamily: 'outfit', // Change the calling code color to white
                }}
                />
        </View>

        <View>
        <TextInput
            style={[styles.inputPN, {color:'#000'}]}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber} />
        <AntDesign name="caretdown" size={20} color='#B0B0B0' style={styles.iconPhoneN} />
        </View>

                {/* Gender */}
                <Text style={{}}>Gender</Text>
                <View >
                    <TouchableOpacity onPress={showGenderModalHandler}>
                        <TextInput
                            style={[styles.gender]}
                            value={gender || 'Select your gender'}
                            onTouchEnd={showGenderModal}
                            editable={false}
                        />
                        <AntDesign name="caretdown" size={20} color='#B0B0B0' style={styles.icon} />
                        <Fontisto name="genderless" size={20} color='#B0B0B0' style={styles.icon2} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={OnCreateProfile}
                    style={styles.button}>
                        {loading ? (
                        <ActivityIndicator size="small" color={Colors.WHITE} />
                        ) : (
                    <Text style={styles.buttonText}>Save Profile</Text>
                    )}
                </TouchableOpacity>

                {/* Gender Selection Modal */}
                <Modal
                    transparent={true}
                    visible={showGenderModal}
                    onRequestClose={() => setShowGenderModal(false)}
                    >
                    <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Select your Gender</Text>
                            <Pressable
                                style={styles.modalButton}
                                onPressIn={animatePressInMale}
                                onPressOut={animatePressOutMale}
                                onPress={() => selectGender('Male')}
                            >
                            <Animated.Text style={[styles.modalButtonText, { transform: [{ scale: scaleAnimMale }] }]}>Male</Animated.Text>
                            </Pressable>
                            <Pressable
                                style={styles.modalButton}
                                onPressIn={animatePressInFemale}
                                onPressOut={animatePressOutFemale}
                                onPress={() => selectGender('Female')}
                            >
                                <Animated.Text style={[styles.modalButtonText, { transform: [{ scale: scaleAnimFemale }] }]}>Female</Animated.Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.cancelButton]}
                                onPressIn={animatePressInFemale}
                                onPressOut={animatePressOutFemale}
                                onPress={handleCancelPress}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </Pressable>
                            </View>
                        </View>
                    </Modal>
                    </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F5F5F5',
        marginTop: 200,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        height: '100%',
        padding: 50,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        // Elevation for Android
        elevation: 50,
    },
    scrollContainer: {
        paddingBottom: '100%', // adds some padding at the bottom
        flexGrow: 1,
    },
    phoneContainer: {
        width:100,
        bottom: -13,
        padding: 5,
        borderColor: Colors.GRAY,
        zIndex: 1
    },
    inputPN: {
        paddingLeft: 85,
        borderWidth: 1,
        marginTop: -30,
        borderColor: '#1c1c1c',
        fontFamily: 'outfit',
        fontSize: 16,
        borderRadius: 16,
        padding: 10,
        marginVertical: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#1c1c1c',
        fontFamily: 'outfit',
        fontSize: 16,
        borderRadius: 16,
        padding: 10,
        paddingLeft: 45,
        marginVertical:5
    },
    profileSection: {
        alignItems: 'center',
        marginTop: -100,
        
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
        
    },
    placeholderWrapper: {
        width: 120,
        height: 120,
        borderRadius: 70,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 29,
        fontFamily:'roboto-plain',
        textAlign: 'left',
        marginVertical: 10,
    },
    icon: {
        position: 'absolute',
        right: 20,
        top: '50%',
        transform: [{ translateY: -12 }],
    },
    iconPhoneN: {
        position: 'absolute',
        right: 20,
        top: '-9%',
        transform: [{ translateY: -12 }],
    },
    icon2: {
        position: 'absolute',
        alignItems: 'Left',
        left: 15,
        top: '50%',
        transform: [{ translateY: -12 }],
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 20,
        fontFamily: 'outfit-bold'
    },
    modalButton: {
        padding: 15,
        width: '100%',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    modalButtonText: {
        fontSize: 16,
        fontFamily: 'outfit'
    },
    cancelButton: {
        borderBottomWidth: 0,
    },
    birthdate: {
        borderWidth: 1,
        color: '#000',
        fontFamily: 'outfit',
        borderColor: '#1c1c1c',
        borderRadius: 16,
        fontSize: 16,
        padding: 10,
        paddingLeft: 50,
        marginVertical: -10,
    },
    gender: {
        borderWidth: 1,
        color: '#000',
        fontFamily: 'outfit',
        borderColor: '#1c1c1c',
        borderRadius: 16,
        padding: 10,
        fontSize: 16,
        paddingLeft: 50,
        marginVertical: 10,
    },
    button: {
        backgroundColor: '#002B36',
        paddingVertical: 15,
        borderRadius: 20,
        height: 55,
        alignItems: 'center',
        marginTop: 10,
        borderColor: '#E0E0E0',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        // Elevation for Android
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontFamily: 'outfit',
        fontSize: 16,
    },
    dateContainer: {
        marginVertical: 10,
    },
    genderContainer: {
        marginVertical: 10,
    },
});

