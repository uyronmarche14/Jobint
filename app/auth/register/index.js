import Entypo from '@expo/vector-icons/Entypo';
import { default as FontAwesome, default as Ionicons } from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth } from './../../../configs/FirebaseConfig';
import { Colors } from './../../../constants/Colors';

export default function Register() {

    const navigation = useNavigation();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [secureTextConfirmPassword, setSecureTextConfirmPassword] = useState(true);
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [loading, setLoading] = useState(false); // Loading state

    useEffect(() => {
        navigation.setOptions({
            headerShown: false
            });
        }, []);

    const OnCreateAccount = async () => {
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');

        if (!email || !password || !confirmPassword) {
        setEmailError('Please enter your email address first.');
        setPasswordError('Please enter your password first.');
        return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match.');
            return;
        }

      setLoading(true); // Show loading spinner
        try {
            await createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                const user = userCredential.user;
                console.log(user);
                Toast.show({
                    type: 'success',
                    text1: 'Success!',
                    text2: 'Account created successfully. Welcome aboard.✅',
                    position: 'top', // Optional, can be 'top' or 'bottom'
                    visibilityTime: 4000, // Optional, duration of the toast in milliseconds
                });;
                router.replace('auth/login');
            })
            .catch((error) => {
                setLoading(false); // Hide loading spinner if there's an error
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage, errorCode);

            if (errorCode === 'auth/weak-password') {
                setPasswordError('Password should be at least 6 characters.')
            } else if (errorCode === 'auth/email-already-in-use') {
                setEmailError('Email already in use.')
            } else if (errorCode === 'auth/invalid-email') {
                setEmailError('Invalid email.')
            } else {
                Alert.alert(
                    'Error',
                    errorMessage,
                    [{ text: 'OK' }]
                );
                }
            });
        } catch (error) {
            setLoading(false); // Hide loading spinner on any other error
            Alert.alert('Error', 'An error occurred while creating the account.', [{ text: 'OK' }]);
            }
        };

        const handleConfirmPasswordChange = (value) => {
            setConfirmPassword(value);
        
            // Check if the passwords match and set the error accordingly
            if (value !== password) {
                setConfirmPasswordError('Passwords do not match.'); // Show error message
            } else {
                setConfirmPasswordError(''); // Clear the error message if they match
            }
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
                style={styles.registerForm}>
                <Text style={{
                fontSize: 30,
                fontFamily: 'montserrat',
                marginBottom: 19,
                color: '#fff',
                textAlign: 'center',
                }}>Create Account?</Text>

                {/* emailInput */}
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

                {/*Password Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        secureTextEntry={!showPassword}
                        style={[styles.input, passwordError ? styles.errorInput : {}]}
                        onChangeText={(value) => setPassword(value)}
                        placeholder='Enter password'
                        placeholderTextColor={Colors.GRAY}
                    />
                    <Entypo
                        name="lock"
                        size={24}
                        color={Colors.GRAY}
                        style={{ position: 'absolute',
                            left: 11, // Adjust based on TextInput padding
                            marginTop: 30,
                            transform: [{ translateY: -12 }]}}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.iconContainer}>

                        <Ionicons
                            name={showPassword ? "eye" : "eye-off"}
                            size={24}
                            color={Colors.GRAY}
                        />
                    </TouchableOpacity>
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            secureTextEntry={secureTextConfirmPassword}
                            style={[styles.input, confirmPasswordError ? styles.errorInput : {}]} // Error styling applied conditionally
                            onChangeText={handleConfirmPasswordChange}
                            placeholder='Confirm password'
                            placeholderTextColor={Colors.GRAY}
                            value={confirmPassword}  // Controlled TextInput
                        />
                        <FontAwesome
                            name="repeat"
                            size={24}
                            color={Colors.GRAY}
                            style={{
                                position: 'absolute',
                                left: 11,  // Adjust based on TextInput padding
                                marginTop: 30,
                                transform: [{ translateY: -12 }],
                            }}
                        />
                        <TouchableOpacity
                            style={styles.iconContainer}
                            onPress={() => setSecureTextConfirmPassword(!secureTextConfirmPassword)}
                        >
                            <Ionicons
                                name={secureTextConfirmPassword ? 'eye-off' : 'eye'}
                                size={24}
                                color={Colors.GRAY}
                            />
                        </TouchableOpacity>

                        {/* Display the confirm password error */}
                        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                    </View>
        
                <TouchableOpacity onPress={OnCreateAccount}
                    style={styles.registerButton}>
                    {loading ? (
                        <ActivityIndicator size="small" color={Colors.WHITE} />
                    ) : (
                        <Text style={styles.registerButtonText}>Sign up</Text>
                    )}
                </TouchableOpacity>

                
                {/* Add Login Link Below to navigate to Login page */}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>
                        Already have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => router.push('./../login')}>
                            <Text style={styles.loginLink}>Log  in</Text>
                        </TouchableOpacity>
                </View>
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
            padding: 20,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
        },
        background: {
            
            ...StyleSheet.absoluteFillObject,
        },
        backButton: {
            position: 'absolute',
            top: 40,
            left: 20,
        },
        centeredform: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        registerForm: {
            position: 'absolute',
            borderRadius: 18,
            padding: 25,
            marginTop: -60,
            width: '97%',
            alignItems: 'center',
            zIndex: 1,
            // Shadow for iOS
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 15,
            // Elevation for Android
            elevation: 10,
        },
        inputContainer: {
            width: '100%',
            marginBottom: 28,
            position: 'relative',
        },
        icon: {
            position: 'absolute',
            top: '50%',
            transform: [{ translateY: -12 }],
        },
        input: {
            position: 'relative',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 10,
            paddingLeft: 50, // Increased to make space for icon
            borderColor: '#B0B0B0',
            padding: 15,
            fontSize: 16,
            color: Colors.BLACK,
            
        },
        eyeIconConfirmpass: {
            position: 'absolute',
            right: 20,
            top: '2%', // Aligns the icon at the top of the TextInput
            bottom: 0, // Ensures it covers the entire height of the input
            justifyContent: 'center', // Vertically centers the icon
            alignItems: 'right', // Ensures the icon remains in the center
            height: '100%'
        },
        passwordContainer: {
            position: 'relative',
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
            fontFamily: 'outfit',
            textAlign: 'left',
        },
        registerTitle: {
            fontSize: 24,
            fontFamily: 'roboto-plain',
            marginBottom: 20,
            color: '#fff',
            textAlign: 'center',
        },
        registerButton: {
            backgroundColor: '#2E7C81',
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
            elevation: 10,
        },
        registerButtonText: {
            color: '#fff',
            fontSize: 18,
            fontFamily: 'outfit',
        },
        iconContainer: {
            position: 'absolute',
            right: 20,
            height: '100%',
            top: '50%',
            transform: [{ translateY: -12 }],
        },
        loginContainer: {
            flexDirection: 'row',
            textAlign: 'center',
            alignItems: 'center',
            marginTop: 15,
        },
        loginText: {
            color: Colors.GRAY,
            fontSize: 14,
            fontFamily: 'outfit',
            lineHeight: 20,
        },
        loginLink: {
            color: "#F5F5F5",
            fontSize: 16,
            fontFamily: 'outfit',
            lineHeight: 20,
        },
    });
