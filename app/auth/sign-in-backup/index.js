import { Entypo, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { fetchSignInMethodsForEmail, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { auth } from '../../../configs/FirebaseConfig';
import { Colors } from '../../../constants/Colors';

export default function SignIn() {
  const navigation = useNavigation();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, []);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('./../../screens/first-page'); // Replace with your actual route
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const onSignIn = async () => {
    if (!email || !password) {
      Alert.alert(
        'Notice📌',
        'Please enter your email address and password first.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert(
        'Invalid Email❌',
        'The email address you entered is not valid. Please enter a valid email address.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true); // Show loading spinner
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length === 0) {
        setLoading(false); // Hide loading spinner
        Alert.alert(
          'Not Registered🚫',
          "This email is not registered. Please check the email and try again.",
          [{ text: 'OK' }]
        );
        return;
      }

      await signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          ToastAndroid.show("Successfully Logged In", ToastAndroid.LONG);
          router.replace('./../../(tabs)/dashboard');
        })
        .catch((error) => {
          setLoading(false); // Hide loading spinner
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorMessage, errorCode);
          if (errorCode === 'auth/wrong-password') {
            Alert.alert(
              'Wrong Password⚠️',
              'The password you entered is incorrect. Please try again.',
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert(
              'Error',
              errorMessage,
              [{ text: 'OK' }]
            );
          }
        });
    } catch (error) {
      setLoading(false); // Hide loading spinner
      console.log(error.message);
      Alert.alert(
        'Error',
        'An error occurred while checking the email registration.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#151e3d' }} />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: 25,
          paddingTop: 50,
          backgroundColor: 'transparent',
          height: '100%'
        }}>

        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons style={{ marginTop: 28 }} name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        <Image
          source={require('./../../../assets/images/sign_in.png')}
          style={{
            width: 360,
            height: 400,
            alignSelf: 'center',
            marginTop: -10
          }}
        />

        <View style={{ marginTop: 4 }}>
          <Ionicons
            name="mail"
            size={24}
            color={Colors.GRAY}
            style={styles.iconemail}
          />
          <TextInput
            style={[styles.input, { paddingLeft: 40, color: Colors.WHITE }]}
            onChangeText={(value) => setEmail(value)}
            placeholder='Enter email'
            placeholderTextColor={Colors.WHITE}
          />
        </View>

        <View style={{ marginTop: 20, position: 'relative' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Entypo
              name="lock"
              size={24}
              color={Colors.GRAY}
              style={styles.iconpasssword}
            />
            <TextInput
              secureTextEntry={!showPassword}
              style={[styles.input, { flex: 1, paddingLeft: 40, color: Colors.WHITE }]}
              onChangeText={(value) => setPassword(value)}
              placeholder='Enter password'
              placeholderTextColor={Colors.WHITE}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.iconContainer}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color={Colors.GRAY}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => router.replace('auth/forgot-password')}
            style={{ marginTop: -1, alignSelf: 'flex-end' }}
          >
            <Text style={styles.forgotPasswordText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onSignIn} style={{
          padding: 20,
          backgroundColor: Colors.BLACK,
          borderRadius: 15,
          marginTop: 6,
          flexDirection: 'row', // To align spinner and text
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.WHITE} />
          ) : (
            <Text style={{
              color: Colors.WHITE,
              textAlign: 'center',
              fontSize: 16
            }}>
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace('auth/sign-up')}
          style={{
            padding: 20,
            backgroundColor: Colors.LIGHTBLUE,
            borderRadius: 15,
            marginTop: 20,
            borderWidth: 1
          }}>
          <Text style={{
            color: Colors.WHITE,
            textAlign: 'center',
            fontSize: 16
          }}>Create Account</Text>
        </TouchableOpacity>
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
    fontFamily: 'outfit'
  },
  forgotPasswordText: {
    fontFamily: 'outfit',
    color: Colors.GRAY,
    fontSize: 15,
    textAlign: 'center',
    padding: 10,
  },
  iconContainer: {
    position: 'absolute',
    right: 20,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconemail: {
    position: 'absolute',
    left: 2,
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 10,
    marginTop: 17,
    alignItems: 'center',
  },
  iconpasssword: {
    position: 'absolute',
    left: 2,
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 10,
    marginBottom: 35,
    alignItems: 'center',
    paddingTop: 15
  },
});
