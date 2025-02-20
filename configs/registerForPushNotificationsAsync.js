import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { getDatabase, ref, update } from 'firebase/database'; // Ensure Firebase imports
import { Platform } from 'react-native';

    async function registerForPushNotificationsAsync(userId) {
    let token;

    // Ensure this is a physical device
    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Request permission if not already granted
        if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        }

        // If permission not granted, exit the function
        if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
        }

        // Get Expo Push Token
        try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log("Push token retrieved: ", token);

        // Save the push token to Firebase under the user's data
        const db = getDatabase(); // Initialize database
        const userRef = ref(db, `users/${userId}`);
        await update(userRef, { pushToken: token }); // Save push token to Firebase
        } catch (error) {
        console.error("Error getting push token: ", error);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    // Android specific channel setup
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        });
    }

    return token;
    }

    export default registerForPushNotificationsAsync;
