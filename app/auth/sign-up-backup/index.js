import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { auth } from '../../../configs/FirebaseConfig';
import { Colors } from '../../../constants/Colors';

export default function SignUp() {
  const navigation = useNavigation();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [secureTextConfirmPassword, setSecureTextConfirmPassword] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, []);

  const OnCreateAccount = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert(
        'Notice📌',
        'Please enter your credentials before proceeding.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!passwordsMatch) {
      Alert.alert(
        'Passwords Do Not Match',
        'Please ensure that both passwords match before proceeding.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true); // Show loading spinner
    try {
      await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log(user);
          ToastAndroid.show("Successfully Created Account", ToastAndroid.LONG);
          router.replace('auth/sign-in');
        })
        .catch((error) => {
          setLoading(false); // Hide loading spinner if there's an error
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorMessage, errorCode);

          if (errorCode === 'auth/weak-password') {
            Alert.alert(
              'Weak Password💢',
              'Password should be at least 6 characters.',
              [{ text: 'OK' }]
            );
          } else if (errorCode === 'auth/email-already-in-use') {
            Alert.alert(
              'Email Already in Use🤔',
              'The email address is already associated with another account.',
              [{ text: 'OK' }]
            );
          } else if (errorCode === 'auth/invalid-email') {
            Alert.alert(
              'Invalid Email❌',
              'The email address you entered is not valid. Please enter a valid email address.',
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
      setLoading(false); // Hide loading spinner on any other error
      Alert.alert('Error', 'An error occurred while creating the account.', [{ text: 'OK' }]);
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    setPasswordsMatch(value === password);
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

        {/* Image above email input */}
        <Image
          source={require('./../../../assets/images/signup.png')}
          style={{
            width: 360,
            height: 400,
            alignSelf: 'center',
            marginTop: 25
          }}
        />

        {/* Email Input */}
        <View style={{ marginTop: 20 }}>
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

        {/* Password Input */}
        <View style={{ marginTop: 20 }}>
          <Entypo
            name="lock"
            size={24}
            color={Colors.GRAY}
            style={styles.iconpassword}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry={secureText}
              style={[styles.input, { paddingLeft: 40, color: Colors.WHITE }]}
              onChangeText={(value) => setPassword(value)}
              placeholder='Enter password'
              placeholderTextColor={Colors.WHITE}
              value={password}  // Ensure TextInput is controlled
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setSecureText(!secureText)}
            >
              <Ionicons
                name={secureText ? 'eye-off' : 'eye'}
                size={24}
                color={Colors.GRAY}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View style={{ marginTop: 20 }}>
          <FontAwesome
            name="repeat"
            size={24}
            color={Colors.GRAY}
            style={styles.iconpassword}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry={secureTextConfirmPassword}
              style={[
                styles.input,
                { paddingLeft: 40, color: Colors.WHITE },
                !passwordsMatch && { borderColor: 'red' } // Change border color if passwords don't match
              ]}
              onChangeText={handleConfirmPasswordChange}
              placeholder='Confirm password'
              placeholderTextColor={Colors.WHITE}
              value={confirmPassword}  // Ensure TextInput is controlled
            />
            <TouchableOpacity
              style={styles.eyeIcon2}
              onPress={() => setSecureTextConfirmPassword(!secureTextConfirmPassword)}
            >
              <Ionicons
                name={secureTextConfirmPassword ? 'eye-off' : 'eye'}
                size={24}
                color={Colors.GRAY}
              />
            </TouchableOpacity>
          </View>
          {!passwordsMatch && (
            <Text style={{ color: 'red', marginTop: 5 }}>
              Passwords do not match.
            </Text>
          )}
        </View>

        {/* Create Account Button */}
        <TouchableOpacity onPress={OnCreateAccount} style={{
          padding: 20,
          backgroundColor: Colors.LIGHTBLUE,
          borderRadius: 15,
          marginTop: 30,
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
            }}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Back to Sign In */}
        <View style={{
          marginTop: 20,
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
          <Text style={{
            fontFamily: 'outfit',
            color: Colors.GRAY,
            fontSize: 17,
          }}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.replace('auth/login')}>
            <Text style={{
              fontFamily: 'outfit-bold',
              color: Colors.WHITE,
              fontSize: 17
            }}>
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
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
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 18,
    height: '100%',
    justifyContent: 'center',
  },
  eyeIcon2: {
    position: 'absolute',
    right: 18,
    height: '100%',
    justifyContent: 'center',
  },
  iconpassword: {
    position: 'absolute',
    left: 2,
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 10,
    marginTop: 17,
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
});
