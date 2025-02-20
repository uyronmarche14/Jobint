import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { get, push, ref, remove, set } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth, db } from './../../../configs/FirebaseConfig';

async function sendPushNotification(expoPushToken, title, body, data) {
    console.log('Sending Push Notification:', { expoPushToken, title, body, data });
    
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json();
        console.log('Push Notification Result:', result);  // Log the result of the push notification

        if (result.data && result.data.status !== 'ok') {
            console.error("Error sending push notification:", result.data);
        }
    } catch (error) {
        console.error("Failed to send push notification:", error);
    }
}


export default function AdminReports() {

    const router = useRouter();
    const [reportedTopics, setReportedTopics] = useState([]);
    const userId = auth.currentUser?.uid;

    useEffect(() => {
            fetchReportedTopics();
    }, []);

    const fetchReportedTopics = async () => {
        try {
            const reportsSnapshot = await get(ref(db, 'reports'));
            if (reportsSnapshot.exists()) {
                const reportsData = reportsSnapshot.val();
                const reportedTopics = await Promise.all(
                    Object.keys(reportsData).map(async (reportId) => {
                        const report = reportsData[reportId];
                        const topicSnapshot = await get(ref(db, `topics/${report.topicId}`));
                        return {
                            reportId,
                            ...report,
                            topic: topicSnapshot.exists() ? topicSnapshot.val() : null,
                        };
                    })
                );
                setReportedTopics(reportedTopics.filter(topic => topic.topic !== null));
            } else {
                setReportedTopics([]);
            }
        } catch (error) {
            console.error('Error fetching reported topics:', error);
        }
    };

    const handleDeleteOption = async (topicId, reportId, topicOwnerId, deletionReason = "Your topic was deleted due to\nviolation of community guidelines.") => {
        console.log('handleDeleteOption called with:', { topicId, reportId, topicOwnerId });
    
        try {
            // Delete the topic
            await remove(ref(db, `topics/${topicId}`));
            console.log('Topic deleted:', topicId);
    
            // Also remove the report associated with the topic
            await remove(ref(db, `reports/${reportId}`));
            console.log('Report deleted:', reportId);
    
            // Notify the owner about the topic deletion
            const ownerSnapshot = await get(ref(db, `users/${topicOwnerId}`));
            if (ownerSnapshot.exists()) {
                const ownerData = ownerSnapshot.val();
                const ownerPushToken = ownerData.pushToken;
                console.log('Owner Push Token:', ownerPushToken);
    
                // Create a notification in the database
                const newNotificationRef = push(ref(db, `notifications/${topicOwnerId}`));
                await set(newNotificationRef, {
                    title: "Your topic has been deleted",
                    body: `${deletionReason}`,
                    timestamp: Date.now(),
                    userId: topicOwnerId,
                });
    
                console.log('Notification created for user:', topicOwnerId);
    
                // Optionally, send a push notification if the owner has a push token
                if (ownerPushToken) {
                    await sendPushNotification(ownerPushToken, "Topic Deleted", `${deletionReason}`, { topicId });
                    console.log('Push notification sent to:', ownerPushToken);
                } else {
                    console.warn("Push notification token is not available for the user:", topicOwnerId);
                }
            }
    
            Toast.show({
                type: 'success',
                text1: 'Topic Deleted',
                text2: 'The topic has been successfully deleted.',
                position: 'top',
                visibilityTime: 4000,
            });
    
            fetchReportedTopics();  // Refresh after deletion
        } catch (error) {
            console.error("Error deleting topic:", error);
            Alert.alert("Error", "There was an error deleting the topic. Please try again.");
        }
    };
    

    const dismissReport = async (reportId) => {
        try {
            await remove(ref(db, `reports/${reportId}`));

            Toast.show({
                type: 'success',
                text1: 'Report Dismissed',
                text2: 'The report has been successfully dismissed.',
                position: 'top',
                visibilityTime: 4000,
            });

            fetchReportedTopics();
        } catch (error) {
            console.error("Error dismissing report:", error);
            Alert.alert("Error", "There was an error dismissing the report. Please try again.");
        }
    };

    const BackPress = () => {
        router.replace('./../../screens/community-discussions'); 
    };

    return (
        <ScrollView style={styles.reportedTopicsContainer}>
            <View style={styles.maintitle}>
                <TouchableOpacity style={styles.backbutton} onPress={BackPress}>
                    <Ionicons name="arrow-back" size={30} color="#E5E5E5" />
                </TouchableOpacity>

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.maintitleText}>Reported Topics</Text>
                </View>
                <View style={{ width: 30 }} />
            </View>

            {reportedTopics.map((report) => (
                <View key={report.reportId} style={styles.reportCard}>
                    <Text style={styles.topicText}>Topic: {report.topic?.topic}</Text>

                    {/* Display the image if available */}
                    {report.topic?.imageUrl && (
                        <Image 
                            source={{ uri: report.topic.imageUrl }} 
                            style={styles.topicImage}
                        />
                    )}

                <Text style={styles.reportReason}>Reason: {report.reportReason}</Text>

                    {/* Display the poll if available */}
                    {report.topic?.poll && (
                        <View style={styles.pollContainer}>
                            <Text style={styles.pollTitle}>Poll:</Text>
                            {Object.keys(report.topic.poll.options).map((option, index) => (
                                <View key={index} style={styles.pollOptionContainer}>
                                    <Text style={styles.pollOptionText}>{option}: {report.topic.poll.options[option]} votes</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.adminActions}>
                        <TouchableOpacity onPress={() => dismissReport(report.reportId)} style={styles.dismissButton}>
                            <Text style={styles.buttonText}>Dismiss</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteOption(report.topicId, report.reportId, report.topic?.userId)} style={styles.deleteButton}>
                            <Text style={styles.buttonText}>Delete Topic</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    reportedTopicsContainer: {
        flex: 1,
        backgroundColor: '#292929',
        padding: 16,
    },
    reportCard: {
        backgroundColor: '#2f2f2f',
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
    },
    topicText: {
        color: '#fff',
        fontSize: 15,
    },
    reportReason: {
        color: '#c1c1c1',
        marginVertical: 10,
        fontSize: 14,
    },
    adminActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dismissButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
    },
    deleteButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    maintitle: {
        marginBottom: 20,
        marginVertical: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    maintitleText: {
        fontSize: 22,
        color: 'white',
        fontFamily: 'quicksand',
    },
    topicImage: {
        width: '100%',
        height: 200,
        marginTop: 8,
        borderRadius: 8,
        marginVertical: -5,
        resizeMode: 'stretch',
    },
    pollContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#3a3a3a',
        borderRadius: 8,
    },
    pollTitle: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 8,
    },
    pollOptionContainer: {
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    pollOptionText: {
        color: '#fff',
    },
});
