import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRouter } from 'expo-router';
import { ref, set } from "firebase/database";
import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, Image, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../../configs/FirebaseConfig';
import { Colors } from '../../../constants/Colors';


// Function to generate unique IDs
const generateUniqueId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

export default function SignUp() {
    const navigation = useNavigation();
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [birthDate, setBirthDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [gender, setGender] = useState('');
    const [showGenderModal, setShowGenderModal] = useState(false);
    const [displayText, setDisplayText] = useState("Enter your birthdate");
    const [profilePicture, setProfilePicture] = useState(null);

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, []);

    useEffect(() => {
        const handleBackPress = () => {
          Alert.alert(
            'Logout Required',
            'You must be logged in to access this page.',
            [
              { text: 'OK', onPress: () => router.replace('auth/sign-in') } // Redirect to login
            ]
          );
          return true; // Prevent default back action
        };
    
        BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
        return () => {
          BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
        };
      }, []);

    const onChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setBirthDate(selectedDate);
            setDisplayText(selectedDate.toDateString());
        }
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    const showGenderModalHandler = () => {
        setShowGenderModal(true);
    };

    const selectGender = (selectedGender) => {
        setGender(selectedGender);
        setShowGenderModal(false);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status === 'granted') {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setProfilePicture(result.assets[0].uri);
            }
        } else {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        }
    };

    const OnCreateProfile = () => {
        if (!fullName || !age || !birthDate || !gender) {
            Alert.alert('Notice📌', 'Please enter all your credentials before proceeding.', [{ text: 'OK' }]);
            return;
        }

        const formattedBirthDate = birthDate.toISOString().split('T')[0];
        const uniqueId = generateUniqueId(); // Generate a unique ID
        const user = auth.currentUser; // Get the currently signed-in user

        if (!user) {
            Alert.alert('Error', 'No user is currently signed in. Please sign in and try again.', [{ text: 'OK' }]);
            return;
         }

         const email = user.email; // Get the email of the signed-in user

        set(ref(db, 'users/' + uniqueId), {
            fullName: fullName,
            age: age,
            birthDate: formattedBirthDate,
            gender: gender,
            profilePicture: profilePicture, // Add the profile picture URL
            email: email // Store the user's email in the database
        })
        .then(() => {
            Alert.alert(
                'Success!',
                'Your profile has been created successfully.',
                [{ text: 'OK', onPress: () => router.replace('./../../(tabs)/dashboard') }]
            );
        })
        .catch((error) => {
            Alert.alert(
                'Error',
                'An error occurred while creating your profile. Please try again later.',
                [{ text: 'OK' }]
            );
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: '#000' }} />
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: 25,
                    paddingTop: 50,
                    height: '100%',
                }}
            >
                <TouchableOpacity onPress={pickImage}>
                    <View style={styles.profilePictureContainer}>
                        {profilePicture ? (
                            <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
                        ) : (
                            <FontAwesome6 name="user-circle" size={150} color={Colors.GRAY} />
                        )}
                    </View>
                </TouchableOpacity>
                
                <View>
                    <Text style={{
                        color: Colors.WHITE,
                        fontFamily: "outfit",
                        fontSize: 25,
                        textAlign: "center",
                        marginTop: -25
                    }}>
                        Create your profile now👩🏻‍💼
                    </Text>
                </View>
                {/* Full Name */}
                <View style={{ marginTop: 15 }}>
                    <Ionicons
                        name="person"
                        size={24}
                        color={Colors.GRAY}
                        style={styles.iconfullname}
                    />
                    <TextInput
                        style={[styles.input, { paddingLeft: 45, color: Colors.WHITE }]}
                        onChangeText={(value) => setFullName(value)}
                        placeholder="Enter your full name"
                        placeholderTextColor={Colors.WHITE}
                    />
                </View>

                {/* Age */}
                <View style={{ marginTop: 20 }}>
                    <MaterialCommunityIcons
                        name="face-man-profile"
                        size={24}
                        color={Colors.GRAY}
                        style={styles.iconage}
                    />
                    <TextInput
                        style={[styles.input, { paddingLeft: 45, color: Colors.WHITE }]}
                        onChangeText={(value) => setAge(value)}
                        placeholder="Enter your age"
                        placeholderTextColor={Colors.WHITE}
                        keyboardType="numeric"
                    />
                </View>

                {/* Birthdate */}
                <View style={{ marginTop: 20 }}>
                    <Ionicons
                        name="calendar-number-sharp"
                        size={24}
                        color={Colors.GRAY}
                        style={styles.iconbirthdate}
                    />
                    <TouchableOpacity onPress={showDatepicker}>
                        <TextInput
                            style={[styles.input, { paddingLeft: 45, color: Colors.WHITE }]}
                            placeholderTextColor={Colors.WHITE}
                            value={displayText}
                            editable={false}
                        />
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={birthDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={onChange}
                    />
                )}

                {/* Gender */}
                <View style={{ marginTop: 20 }}>
                    <FontAwesome6
                        name="genderless"
                        size={24}
                        color={Colors.GRAY}
                        style={styles.icongender}
                    />
                    <TouchableOpacity onPress={showGenderModalHandler}>
                        <TextInput
                            style={[styles.input, { paddingLeft: 45, color: Colors.WHITE }]}
                            placeholder="Select your gender"
                            placeholderTextColor={Colors.WHITE}
                            value={gender || 'Select your gender'}
                            editable={false}
                        />
                    </TouchableOpacity>
                </View>

                {/* Create Profile Button */}
                <TouchableOpacity
                    onPress={OnCreateProfile}
                    style={{
                        padding: 20,
                        backgroundColor: Colors.LIGHTBLUE,
                        borderRadius: 15,
                        marginTop: 30,
                    }}
                >
                    <Text
                        style={{
                            color: Colors.WHITE,
                            textAlign: 'center',
                            fontSize: 18,
                        }}
                    >
                        Create Profile
                    </Text>
                </TouchableOpacity>

                {/* Gender Selection Modal */}
                <Modal
                    transparent={true}
                    visible={showGenderModal}
                    onRequestClose={() => setShowGenderModal(false)}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Select Gender</Text>
                            <Pressable
                                style={styles.modalButton}
                                onPress={() => selectGender('Male')}
                            >
                                <Text style={styles.modalButtonText}>Male</Text>
                            </Pressable>
                            <Pressable
                                style={styles.modalButton}
                                onPress={() => selectGender('Female')}
                            >
                                <Text style={styles.modalButtonText}>Female</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowGenderModal(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        padding: 15,
        borderWidth: 1,
        borderRadius: 15,
        borderColor: Colors.GRAY,
        fontFamily: 'outfit',
        fontSize: 15
    },
    iconfullname: {
        position: 'absolute',
        left: 2,
        height: '100%',
        justifyContent: 'center',
        paddingLeft: 10,
        marginTop: 17,
        alignItems: 'center',
    },
    iconage: {
        position: 'absolute',
        left: 5,
        height: '100%',
        justifyContent: 'center',
        paddingLeft: 10,
        marginTop: 17,
        alignItems: 'center',
    },
    iconbirthdate: {
        position: 'absolute',
        left: 5,
        height: '100%',
        justifyContent: 'center',
        paddingLeft: 10,
        marginTop: 17,
        alignItems: 'center',
    },
    icongender: {
        position: 'absolute',
        left: 10,
        height: '100%',
        justifyContent: 'center',
        paddingLeft: 10,
        marginTop: 17,
        alignItems: 'center',
    },
    profilePictureContainer: {
        alignSelf: 'center',
        marginTop: 120,
        marginBottom: 60
    },
    profilePicture: {
        width: 150,
        height: 150,
        borderRadius: 50,
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
        borderBottomColor: '#ddd',
    },
    modalButtonText: {
        fontSize: 16,
        fontFamily: 'outfit'
    },
    cancelButton: {
        borderBottomWidth: 0,
    },
});
