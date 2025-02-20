import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Login() {
    const router = useRouter();

    return (
        <View style={{ flex: 1 }}>
            <Image
                source={require('./../../../assets/images/etonatalaga.jpg')}
                style={{
                    width: '100%',
                    height: 560
                }}
            />
            <View style={styles.container}>
                <Text style={{
                    fontSize: 35,
                    fontFamily: 'outfit-bold',
                    textAlign: 'center',
                    marginTop: 10
                }}>JobIntHelper</Text>

                <Text style={{
                    fontFamily: 'outfit',
                    fontSize: 20,
                    textAlign: 'center',
                    color: Colors.GRAY,
                    marginTop: 19
                }}>
                    Master communication with real-world questions and instant feedback, your path to confident and compelling interviews.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.replace('/auth/login')}
                >
                    <Text style={{
                        color: Colors.WHITE,
                        textAlign: 'center',
                        fontFamily: 'outfit',
                        fontSize: 20
                    }}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.WHITE,
        marginTop: 10,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        height: '100%',
        padding: 30,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        // Elevation for Android
        elevation: 50,
    },
    button: {
        padding: 15,
        backgroundColor: Colors.PRIMARY,
        borderRadius: 99,
        marginTop: 50
    }
});
