import { MaterialIcons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from './../../../configs/FirebaseConfig';

import devProfilePic4 from '../../../assets/picture/elmer.jpg';
import devProfilePic2 from '../../../assets/picture/kaiz.jpg';
import devProfilePic3 from '../../../assets/picture/olivian.jpg';
import devProfilePic1 from '../../../assets/picture/ron.jpg';

const { width: windowWidth } = Dimensions.get('window');

const About = () => {
    const router = useRouter();
    const translateX = useRef(new Animated.Value(0)).current;

    const [reviews, setReviews] = useState([]);

    const user = auth.currentUser;
    const userId = user?.uid;

    const [userName, setUserName] = useState('Unknown');
    const [profilePicture, setProfilePicture] = useState('');

    const developers = [
        {
            name: 'Rhyss\nUy',
            position: 'Main Programmer',
            profilePicture: devProfilePic1,
        },
        {
            name: 'Russel Nitullano',
            position: 'Main Programmer',
            profilePicture: devProfilePic2,
        },
        {
            name: 'Lexter Oliva',
            position: 'Main Programmer',
            profilePicture: devProfilePic3,
        },
        {
            name: 'Elmer Malbas',
            position: 'Main Programmer',
            profilePicture: devProfilePic4,
        },
    ];

    const BackPress = () => {
        router.replace('/(tabs)/profile'); 
    };

    useEffect(() => {
        const startScrolling = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(translateX, {
                        toValue: -windowWidth,
                        duration: 15000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateX, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        startScrolling();
    }, [translateX]);

    return (
        <View style={[styles.fullScreenContainer, { backgroundColor: '#292929' }]}>
            <View style={styles.innerContainer}>
                <Text style={styles.headerText}>
                    About{'\n'}This App
                </Text>

                <Text style={styles.subHeading}>Mission:</Text>
                <View style={styles.missionSection}>
                    <Text style={styles.missionText}>
                        To empower job seekers by providing an interactive platform that enhances their interview preparation through personalized feedback, practical insights, and valuable tools.
                    </Text>
                </View>

                <Text style={styles.subHeading}>Vision:</Text>
                <View style={styles.missionSection}>
                    <Text style={styles.missionText}>
                        To empower job seekers by providing an interactive platform that enhances their interview preparation through personalized feedback, practical insights, and valuable tools.
                    </Text>
                </View>

                <TouchableOpacity style={styles.backButton} onPress={BackPress}>
                    <Ionicons name="arrow-back" size={30} color="#E5E5E5" />
                </TouchableOpacity>

                <View style={styles.developerSection}>
                    <Text style={styles.developerHeader}>Developers:</Text>
                    <Animated.View style={[styles.animatedContainer, { transform: [{ translateX }] }]}>
                        {developers.map((developer, index) => (
                            <View key={index} style={styles.developerCard}>
                                <Image source={developer.profilePicture} style={styles.profilePicture} />
                                <View style={styles.infoContainer}>
                                    <Text style={styles.developerName}>{developer.name}</Text>
                                    <Text style={styles.developerPosition}>{developer.position}</Text>
                                </View>
                            </View>
                        ))}
                    </Animated.View>
                </View>

                <View style={styles.contactSection}>
                    <View style={styles.socialMediaIcons}>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/PeiXi.0222')}>
                            <Ionicons name="logo-facebook" size={30} color="#1877F2" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.tiktok.com/@kzllntl')}>
                            <MaterialIcons name="tiktok" size={30} color="#00f2ea" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/kai.zll?igsh=MmJqMmI0Ymh2cG01')}>
                            <Ionicons name="logo-instagram" size={30} color="#ee2a7b" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.contactText}>Contact Us</Text>
                    <Text style={styles.subtitle}>JobIntHelper v.1.0.0</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    innerContainer: {
        width: '85%',
        alignItems: 'center',
    },
    headerText: {
        color: '#f5f5f5',
        fontSize: 45,
        textAlign: 'center',
        fontFamily: 'montserrat',
    },
    subHeading: {
        fontSize: 17,
        fontFamily: 'quicksand',
        color: '#fff',
        textAlign: 'center',
    },
    missionSection: {
        backgroundColor: '#1f1f1f',
        padding: 20,
        borderRadius: 20,
        marginVertical: 10,
        width: '100%',
    },
    missionText: {
        fontSize: 15,
        color: '#fff',
        fontFamily: 'quicksand',
        textAlign: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 45,
        left: 10,
        padding: 10,
        zIndex: 1,
    },
    developerSection: {

        alignItems: 'center',
    },
    developerHeader: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
        fontFamily: 'quicksand',
    },
    animatedContainer: {
        flexDirection: 'row',
    },
    developerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1f1f1f',
        padding: 10,
        borderRadius: 20,
        marginHorizontal: 10,
        width: 150,
    },
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 30,
        marginRight: 10,
    },
    infoContainer: {
        flex: 1,
    },
    developerName: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'outfit',
    },
    developerPosition: {
        fontSize: 12,
        color: '#ccc',
    },
    contactSection: {
        marginTop: 25,
        alignItems: 'center',
    },
    socialMediaIcons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 6,
    },
    contactText: {
        fontFamily: 'quicksand',
        color: '#fff',
        fontSize: 17,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'quicksand',
        color: '#c1c1c1',
    },
});

export default About;
