import FontAwesome from '@expo/vector-icons/FontAwesome';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { get, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Alert, Image, LogBox, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import { auth, db } from '../../../configs/FirebaseConfig';
import { Colors } from '../../../constants/Colors';

LogBox.ignoreLogs([
    'Warning: CountryModal: Support for defaultProps will be removed', // Ignore specific warning
]);

// Function to validate email format
export default function EditProfile() {

    const router = useRouter();

    const [profilePicture, setProfilePicture] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userName, setUserName] = useState('');
    const [birthDate, setBirthDate] = useState(new Date());
    const [gender, setGender] = useState('');
    const [displayText, setDisplayText] = useState("Enter your birthdate");
    const [countryCode, setCountryCode] = useState('PH');
    const [callingCode, setCallingCode] = useState('63');
    const [phoneNumber, setPhoneNumber] = useState('');

    

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
                        setBirthDate(data.birthDate ? new Date(data.birthDate) : new Date());
                        setDisplayText(data.birthDate ? new Date(data.birthDate).toDateString() : 'Enter your birthdate');
                        setGender(data.gender || '');
                        setCallingCode(parsedCallingCode);
                        setCountryCode(data.countryCode || 'PH'); // Set countryCode if available
                        setProfilePicture(data.profilePicture || 'default-image-uri'); // Fetch profile picture
                    } else {
                        console.log('No data available'); // Debugging: No data case
                    }
                } catch (error) {
                    Alert.alert('Error', 'Failed to load profile data. Please try again later.');
                }
            } else {
                Alert.alert('Error', 'No user is currently signed in.');
            }
        };
    
        fetchProfileData();
    }, []);

    const handleBackPress = () => {
        router.replace('./../../(tabs)/profile'); // Replace with your actual route
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

                <View>
                    {/* Profile picture without TouchableOpacity */}
                {profilePicture ? (
                    <Image source={{ uri: profilePicture }} style={styles.profilePic} />
                ) : (
                    <View style={styles.placeholderWrapper}>
                        <Ionicons name="camera" size={30} color="#000" />
                    </View>
                )}
            </View>
        </View>
        <Text style={[styles.title]}>Account Information</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={{}}>First Name</Text>
        <View>
        <TextInput style={[styles.input, {color:'#000'}]}
            value={firstName}
            onChangeText={setFirstName}
            editable={false}
            placeholder="First Name " />
        <Ionicons name="person" size={20} color='#B0B0B0' style={styles.icon2} />
        </View>

        <Text style={{}}>Last Name</Text>
        <View>
        <TextInput style={[styles.input, {color:'#000'}]}
            value={lastName}
            onChangeText={setLastName}
            editable={false}
            placeholder="Last Name"/>
        <Ionicons name="person" size={20} color='#B0B0B0' style={styles.icon2} />
        </View>

        <Text style={{}}>User Name</Text>
        <View>
        <TextInput style={[styles.input, {color:'#000'}]}
            value={userName}
            onChangeText={setUserName}
            editable={false}
            placeholder="Username"/>
        <FontAwesome name="user-circle" size={20} color='#B0B0B0' style={styles.icon2} />
        </View>

        <Text style={{}}>Phone Number</Text>
        <View style={styles.phoneContainer}>
            <CountryPicker
                countryCode={countryCode}
                withFilter={false}
                withFlag
                withCallingCode
                withCallingCodeButton={false}
                withAlphaFilter
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
                editable={false}
                onChangeText={setPhoneNumber} />
        </View>
                 {/* Birthdate */}
                    <Text style={{}}>Birth Date</Text>
                    <View style={{ marginTop: 20, position: 'relative' }}>
                    <View>
                    <TextInput
                        style={[styles.birthdate]}
                        value={displayText}
                        editable={false}
                        onFocus={{}}
                        />
                    <MaterialIcons name="date-range" size={20} color='#B0B0B0' style={styles.icon2} />
                </View>
                </View>

                {/* Gender */}
                <Text style={{top:20}}>Gender</Text>
                <View style={{ marginTop: 20 }}>
                    <View>
                        <TextInput
                            style={[styles.gender]}
                            value={gender || 'Select your gender'}
                            editable={false}
                        />
                        <Fontisto name="genderless" size={20} color='#B0B0B0' style={styles.icon2} />
                    </View>
                </View>
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
        bottom: -18,
        justifyContent: 'flex-start',
        padding: 5,
        borderColor: Colors.GRAY,
        zIndex: 1
    },
    inputPN: {
        paddingLeft: 40,
        borderWidth: 1,
        marginTop: -30,
        borderColor: '#1c1c1c',
        fontFamily: 'outfit',
        fontSize: 16,
        borderRadius: 16,
        padding: 15,
        marginVertical: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#1c1c1c',
        fontFamily: 'outfit',
        fontSize: 16,
        borderRadius: 16,
        padding: 15,
        paddingLeft: 45,
        marginVertical:5
    },
    profileSection: {
        alignItems: 'center',
        marginTop: -100,
        
    },
    profilePic: {
        width: 120,
        height: 120,
        borderRadius: 80,
        
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
        padding: 15,
        paddingLeft: 50,
        marginVertical: -15,
    },
    gender: {
        borderWidth: 1,
        color: '#000',
        fontFamily: 'outfit',
        borderColor: '#1c1c1c',
        borderRadius: 16,
        padding: 15,
        fontSize: 16,
        paddingLeft: 50,
        marginVertical: 7,
    },
    button: {
        backgroundColor: '#002B36',
        paddingVertical: 15,
        borderRadius: 20,
        height: 55,
        alignItems: 'center',
        marginTop: 20,
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

