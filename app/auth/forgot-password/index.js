import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth } from './../../../configs/FirebaseConfig';
import { Colors } from './../../../constants/Colors';


export default function ForgotPassword() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false); // Loading state

    // Function to validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handlePassword = async () => {
        setEmailError('');
        if (!email) {
            setEmailError('Please enter your email first.')
            return;
        }

        if (!isValidEmail(email)) {
            setEmailError('Please enter a valid email.')
            return;
        }

        setLoading(true); // Show loading spinner
        try {
            // Check if the email is registered
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);
            if (signInMethods.length === 0) {
                setLoading(false); // Hide loading spinner
                setEmailError('This email is not registered.')
                return;
            }

            await sendPasswordResetEmail(auth, email);
            setLoading(false); // Hide loading spinner
            Toast.show({
                type: 'success',
                text1: 'Success!',
                text2: 'Your password reset link has been sent. Please check your email.✅',
                position: 'top', // Optional, can be 'top' or 'bottom'
                visibilityTime: 4000, // Optional, duration of the toast in milliseconds
            });
        } catch (error) {
            setLoading(false); // Hide loading spinner
            console.log(error.message); // For debugging purposes
            Alert.alert(
                'Error',
                'An error occurred. Please try again later.',
                [{ text: 'OK' }]
            );
        }
    };
    
    const BackPress = () => {
            router.replace('./../../auth/login'); // Replace with your actual route
    };

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient
                colors={['#1C2A38', '#000']}
                style={styles.background}
            />
            <View style={styles.container}>

            <LinearGradient
                colors={['#1C2A38', '#000']}
                style={styles.forgotpassForm}>
                <Text style={styles.resetTitle}>Forgot your password?</Text>
                <View style={[styles.separatorresetTitleSubtitle, { backgroundColor: '#B0B0B0' }]} />
                <Text style={styles.subTitle}></Text>

                <View style={styles.inputContainer}>
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                    <TextInput
                        style={[styles.input, emailError ? styles.errorInput : {}]}
                        onChangeText={(value) => setEmail(value)}
                        placeholder='Enter email'
                        placeholderTextColor={Colors.GRAY}
                    />
                    <Ionicons
                        name="mail"
                        size={24}
                        color={Colors.GRAY}
                        style={{ position: 'absolute',
                            left: 11, // Adjust based on TextInput padding
                            marginTop: 30,
                            transform: [{ translateY: -12 }]}}
                        />
                    </View>

                <TouchableOpacity style={styles.backbutton} onPress={BackPress}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
    
                <TouchableOpacity onPress={handlePassword}
                    style={styles.resetButton}>
                    {loading ? (
                        <ActivityIndicator size="small" color={Colors.WHITE} />
                    ) : (
                        <Text style={styles.resetButtonText}>Send password reset link</Text>
                    )}
                </TouchableOpacity>
                </LinearGradient>
            </View>
        </View>
    );
}
    
    const styles = StyleSheet.create({
        container: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                padding: 25,
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
        },
        background: {
            ...StyleSheet.absoluteFillObject,
        },
        backbutton: {
            position: 'absolute',
            bottom: 470, // Adjust the top position to where you want the button vertically
            left: -20, // Adjust the left position to where you want the button horizontally
            padding: 30, // Increase the touchable area around the button
        },
        forgotpassForm: {
            position: 'absolute',
            borderRadius: 18,
            padding: 25,
            marginTop: 50,
            width: '97%',
            alignItems: 'center',
            // Shadow for iOS
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 15,
            // Elevation for Android
            elevation: 20,
        },
        resetTitle: {
            fontSize: 24,
            fontFamily: 'roboto-plain',
            marginBottom: 2,
            color: '#fff',
            textAlign: 'center',
        },
        inputContainer: {
            width: '100%',
            marginBottom: 20,
            position: 'relative',
        },
        input: {
            position: 'relative',
            flexDirection: 'row',
            borderWidth: 1,
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 10,
            paddingLeft: 50, // Increased to make space for icon
            borderColor: '#B0B0B0',
            padding: 15,
            fontSize: 16,
            color:Colors.BLACK,
        },
        errorInput: {
            borderColor: 'red',
        },
        errorText: {
            color: 'red',
            position: 'absolute',
            top: -25, // Adjust based on your input height and margin
            left: 0,
            right: 0,
            textAlign: 'left',
        },
        resetButton: {
            backgroundColor: '#002B36',
            borderRadius: 10,
            height: 55,
            width: 250,
            justifyContent: 'center',
            alignItems: 'center',
            // Shadow for iOS
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 15,
            // Elevation for Android
            elevation: 20,
        },
        resetButtonText: {
            color: '#fff',
            fontSize: 18,
            fontFamily: 'outfit',
        },
        subTitle: {
            fontSize: 20,
            marginBottom: -5,
            color: '#B0B0B0',
            fontFamily: 'roboto-plain',
            textAlign: 'center',
        },
        separatorresetTitleSubtitle: {
            height: 1,
            width: 150,
            margin: 'auto',
            backgroundColor: '#000',
            marginVertical:8,
        },
    });

