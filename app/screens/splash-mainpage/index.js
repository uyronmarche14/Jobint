import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from './../../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function StartupScreen() {
    const router = useRouter();
    const [loadingSignIn, setLoadingSignIn] = useState(false);
    const [loadingSignUp, setLoadingSignUp] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true); // Loading state for checking auth

    // Check if the user is already signed in on app launch
    useEffect(() => {
        const checkIfLoggedIn = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken'); // Get the stored token
                if (userToken) {
                    // If a token exists, navigate to the dashboard directly
                    router.replace('./../../(tabs)/dashboard');
                } else {
                    // If no token, stop checking and show login screen
                    setCheckingAuth(false);
                }
            } catch (error) {
                console.error('Error checking login status:', error); // Log any errors
                setCheckingAuth(false); // Even if there's an error, show login screen
            }
        };
        checkIfLoggedIn();
    }, []);

    // Function to navigate to the login screen
    const onSignIn = () => {
        setLoadingSignIn(true);
        setTimeout(() => {
            setLoadingSignIn(false);
            router.replace('./../../auth/login');
        }, 500);
    };

    // Function to navigate to the sign-up screen
    const onSignUp = () => {
        setLoadingSignUp(true);
        setTimeout(() => {
            setLoadingSignUp(false);
            router.replace('./../../auth/register');
        }, 500);
    };

    if (checkingAuth) {
        // Show loading spinner while checking if the user is authenticated
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.WHITE} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#000', '#1C2A38']} style={styles.background} />


            <View style={styles.loginContainer}>
                <Text style={styles.header}>JobInt Helper</Text>
                <Text style={styles.subheader}>Your partner in interview preparation, empowering you to succeed in every interview.</Text>

                {/* Sign In Button */}
                <TouchableOpacity onPress={onSignIn} style={styles.buttonSignIn}>
                    {loadingSignIn ? (
                        <ActivityIndicator size="small" color={Colors.WHITE} />
                    ) : (
                        <Text style={styles.buttonSignInText}>Log in</Text>
                    )}
                </TouchableOpacity>

                {/* Sign Up Button */}
                <TouchableOpacity onPress={onSignUp} style={styles.buttonSignUp}>
                    {loadingSignUp ? (
                        <ActivityIndicator size="small" color={Colors.WHITE} />
                    ) : (
                        <Text style={styles.buttonSignUpText}>Sign up</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1C2A38',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    overlayGif: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '100%',
        opacity: 0.2,
    },
    loginContainer: {
        width: '100%',
        paddingHorizontal: 35,
        paddingBottom: 50,
    },
    header: {
        fontSize: 40,
        fontFamily: 'quicksand',
        color: Colors.WHITE,
        textAlign: 'left',
        marginBottom: 10,
    },
    subheader: {
        fontSize: 16,
        color: Colors.WHITE,
        fontFamily: 'quicksand',
        textAlign: 'left',
        marginBottom: 40,
    },
    buttonSignIn: {
        padding: 17,
        backgroundColor: "#2E7C81",
        borderRadius: 10,
        marginVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonSignInText: {
        color: Colors.WHITE,
        fontSize: 16,
    },
    buttonSignUp: {
        padding: 17,
        backgroundColor: "transparent",
        borderColor: '#2E7C81',
        borderWidth: 2,
        borderRadius: 10,
        marginVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonSignUpText: {
        color: Colors.WHITE,
        fontSize: 16,
    },
});
