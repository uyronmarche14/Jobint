import { Entypo, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { fetchSignInMethodsForEmail, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth } from './../../../configs/FirebaseConfig';
import { Colors } from './../../../constants/Colors';

//GoogleSignin.configure({
   // webClientId: '148668706429-178u8nptped5dacbn8j051mf3vt29ck6.apps.googleusercontent.com', // Replace with your web client ID
   // iosClientId: '148668706429-7ahmvjjv8h7ljbau6un261hjm9glg9ed.apps.googleusercontent.com', // Replace with your iOS client ID
   // androidClientId: '148668706429-l2m8jlf6dt6a20pdo9svpjl20m572via.apps.googleusercontent.com', // Replace with your Android client ID
    //offlineAccess: true,
   // forceCodeForRefreshToken: true,
   // scopes: ["https://www.googleapis.com/auth/drive.readonly"], // Specify the scopes
//});

export default function Login() {

    const navigation = useNavigation();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false); // Loading staten


    useEffect(() => {
        navigation.setOptions({
            headerShown: false
        });
    }, []);

    const handleBackPress = () => {
        router.push('./../../screens/splash-mainpage');
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const onSignIn = async () => {
        setEmailError('');
        setPasswordError('');

        if (!email || !password) {
            setEmailError('Please enter your email address first.');
            setPasswordError('Please enter your password first.');
            return;
        }

        if (!isValidEmail(email)) {
            setEmailError('The email address you entered is not valid.');
            return;
        }

        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);
            if (signInMethods.length === 0) {
                setLoading(false);
                setEmailError('This email is not registered.');
                return;
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await AsyncStorage.setItem('userToken', userCredential.user.uid);
            Toast.show({
                type: 'success',
                text1: 'Success!',
                text2: 'You\'re all set and ready for your next achievement.✅',
                position: 'top',
                visibilityTime: 4000,
            });

            router.replace('./../../(tabs)/dashboard');
        } catch (error) {
            setLoading(false);
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage, errorCode);
            if (errorCode === 'auth/wrong-password') {
                setPasswordError('The password you entered is incorrect.');
            } else {
                setPasswordError(errorMessage);
            }
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient
                colors={['#1C2A38', '#000']}
                style={styles.background}
            />
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                <Ionicons name="arrow-back" size={29} color="white" />
            </TouchableOpacity>

            <View style={styles.container}>
                <LinearGradient
                    colors={['#1C2A38', '#000']}
                    style={styles.loginForm}>

                    <Text style={{
                        fontSize: 30,
                        fontFamily: 'montserrat',
                        marginBottom: 17,
                        color: '#fff',
                        textAlign: 'center',
                    }}>Welcome Back</Text>
                    <View style={[styles.separator, { backgroundColor: '#B0B0B0' }]} />

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
                            color={emailError ? 'red' : Colors.GRAY}
                            style={styles.icon}
                        />
                    </View>

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
                            color={passwordError ? 'red' : Colors.GRAY}
                            style={styles.icon}
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

                    <TouchableOpacity
                        onPress={() => router.replace('auth/forgot-password')}
                        style={styles.forgotPasswordContainer}>
                        <Text style={styles.forgotPassword}>
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onSignIn}
                        style={styles.loginButton}>
                        {loading ? (
                            <ActivityIndicator size="small" color={'#f5f5f5'} />
                        ) : (
                            <Text style={styles.loginButtonText}>Log in</Text>
                        )}
                    </TouchableOpacity>

                    {/* Add SignUp Link Below Login Button */}
                    <View style={styles.signupContainer}>
                        <Text style={styles.registerText}>
                            Don't have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => router.push('./../register')}>
                            <Text style={styles.registerLink}>Sign up</Text>
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
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 23,
        padding: 10,
        zIndex: 1
    },
    loginForm: {
        position: 'absolute',
        borderRadius: 20,
        padding: 20,
        width: '98%',
        alignItems: 'center',
        zIndex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 20,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 25,
        position: 'relative',
    },
    icon: {
        position: 'absolute',
        left: 10,
        top: '50%',
        transform: [{ translateY: -12 }],
    },
    input: {
        position: 'relative',
        flexDirection: 'row',
        borderWidth: 1,
        alignItems: 'center',
        backgroundColor: '#E5E5E5',
        borderRadius: 10,
        paddingLeft: 50,
        borderColor: '#B0B0B0',
        padding: 15,
        fontSize: 16,
        color: Colors.BLACK,
    },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        position: 'absolute',
        top: -20,
        left: 0,
        right: 0,
        fontFamily: 'outfit',
        textAlign: 'left',
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: 10,
        marginTop: -15,
    },
    forgotPassword: {
        color: '#B0B0B0',
        fontSize: 14,
        fontFamily: 'outfit',
    },
    loginButton: {
        backgroundColor: '#2E7C81',
        borderRadius: 10,
        height: 50,
        width: 250,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 20,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'outfit',
    },
    iconContainer: {
        position: 'absolute',
        right: 20,
        top: '50%',
        transform: [{ translateY: -12 }],
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    separator: {
        height: 1,
        flex: 1,
        backgroundColor: '#B0B0B0',
    },
    orText: {
        marginHorizontal: 10,
        color: '#B0B0B0',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DB4437',
        borderRadius: 10,
        height: 50,
        width: 250,
        justifyContent: 'center',
    },
    googleButtonText: {
        marginLeft: 10,
        color: '#fff',
        fontSize: 18,
        fontFamily: 'outfit',
    },
    signupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    registerText: {
        color: Colors.GRAY,
        fontSize: 14,
        fontFamily: 'outfit',
    },
    registerLink: {
        color: "#F5F5F5",
        fontSize: 16,
        fontFamily: 'outfit',
    },
});
