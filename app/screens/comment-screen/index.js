import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { get, push, ref, remove, set, update } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from 'firebase/storage'; // Add this to your imports
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db, storage } from './../../../configs/FirebaseConfig';

const formatTimestamp = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) return 'Unknown time';

    const now = new Date();x``
    const commentDate = new Date(timestamp);
    
    const seconds = Math.floor((now - commentDate) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    } else if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
};

const fetchUserData = async (userId) => {
    if (!userId) return { userName: 'Unknown User', profilePicture: '' };

    try {
        const userRef = ref(db, `users/${userId}`);
        const userSnapshot = await get(userRef);
        return userSnapshot.exists() ? userSnapshot.val() : { userName: 'Unknown User', profilePicture: '' };
    } catch (error) {
        console.error('Error fetching user data:', error);
        return { userName: 'Unknown User', profilePicture: '' };
    }
};


// Notification Functions
async function sendPushNotification(expoPushToken, title, body, data) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}

// Comment Screen Component
const CommentScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { topicId } = route.params;
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [editCommentId, setEditCommentId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editReplyId, setEditReplyId] = useState(null);
    const [editReplyText, setEditReplyText] = useState('');
    const [showAllReplies, setShowAllReplies] = useState({});
    const userId = auth.currentUser?.uid;
    const [selectedImage, setSelectedImage] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    

    const fetchComments = async () => {
        try {
            const commentsSnapshot = await get(ref(db, `comments/${topicId}`));
            if (commentsSnapshot.exists()) {
                const commentsData = commentsSnapshot.val();
                const commentKeys = Object.keys(commentsData);

                const commentsWithUserData = await Promise.all(commentKeys.map(async (key) => {
                    const comment = commentsData[key];
                    const userData = await fetchUserData(comment.userId);

                    const repliesData = comment.replies || {};
                    const repliesWithUserData = await fetchRepliesWithUserData(repliesData);

                    return {
                        ...comment,
                        commentId: key,
                        userName: userData ? userData.userName : 'Unknown User',
                        profilePicture: userData ? userData.profilePicture : '',
                        replies: repliesWithUserData,
                        likes: comment.likes || [],
                        timestamp: comment.timestamp || Date.now(),
                    };
                }));

                setComments(commentsWithUserData);
            } else {
                setComments([]);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
            Alert.alert("Error", "There was an error fetching comments. Please try again.");
        }
    };

    const fetchRepliesWithUserData = async (repliesData) => {
        const replyKeys = Object.keys(repliesData);

        return await Promise.all(replyKeys.map(async (replyKey) => {
            const reply = repliesData[replyKey];
            const replyUserData = await fetchUserData(reply.userId);

            return {
                ...reply,
                replyId: replyKey,
                userName: replyUserData.userName,
                profilePicture: replyUserData.profilePicture,
                likes: reply.likes || [],
                timestamp: reply.timestamp || Date.now(),
            };
        }));
    };

    useEffect(() => {
        fetchComments();
    }, [topicId]);

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
    
            if (result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
    
                if (!imageUri) {
                    Alert.alert('Error', 'Image URI is not available.');
                    return;
                }
    
                setSelectedImage(imageUri); 
    
                const newImageUri = "file:///" + imageUri.split("file:/").join("");
    
                const user = auth.currentUser;
                const fileName = `${Date.now()}.jpeg`;
                const filePath = `comment_images/${user.uid}/${fileName}`; 
                const fileRef = storageRef(storage, filePath); 
    
                const response = await fetch(newImageUri);
                const blob = await response.blob();
    
                if (!blob) {
                    throw new Error('Blob creation failed');
                }
    
                const uploadTask = uploadBytesResumable(fileRef, blob);
    
                return new Promise((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        null,
                        (error) => {
                            console.error('Upload error:', error);
                            Alert.alert('Error', 'Failed to upload image. Please try again.');
                            reject(error);
                        },
                        async () => {
                            const imageUrl = await getDownloadURL(fileRef);
                            console.log('Image URL:', imageUrl);
    
                            resolve({ imageUrl, filePath });  // Return an object with both imageUrl and filePath
                        }
                    );
                });
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim() && !selectedImage) {
            Alert.alert('Notice📌', 'Please enter a comment or reply before submitting.', [{ text: 'OK' }]);
            return;
        }
    
        try {
            const userData = await fetchUserData(userId); // Fetch the current user data
            if (!userData) {
                Alert.alert('Error', 'Unable to fetch user data.');
                return;
            }

            let imageUrl = null;
            let imagePath = null;

            if (selectedImage) {
                // If the user has selected an image, use it
                imageUrl = selectedImage;
                imagePath = `comment_images/${userId}/${selectedImage.split('/').pop()}`;
            }
        
            
            // If replying to a comment
            if (replyingTo) {
                const { commentId, userName, userId: commentAuthorId } = replyingTo;
                const replyText = newComment.startsWith(`@${userName}`) ? newComment : `@${userName} ${newComment}`;
    
                const newReplyKey = push(ref(db, `comments/${topicId}/${commentId}/replies`)).key;
                await set(ref(db, `comments/${topicId}/${commentId}/replies/${newReplyKey}`), {
                    replyText: replyText,
                    userId: userId,
                    timestamp: Date.now(),
                    likes: [],
                    imageUrl: selectedImage ? selectedImage : null,
                });
    
                // Skip notification if the user is replying to their own comment
                if (userId !== commentAuthorId) {
                    const authorData = await fetchUserData(commentAuthorId);
                    const authorPushToken = authorData?.pushToken;
    
                    if (authorPushToken) {
                        await sendPushNotification(
                            authorPushToken,
                            "New Reply on Your Comment",
                            `${userData.userName} replied to your comment`,
                            { topicId, commentId }
                        );
    
                        // Save the notification to the database
                        const notificationRef = push(ref(db, `notifications/${commentAuthorId}`));
                        await set(notificationRef, {
                            title: 'New Reply on Your Comment',
                            body: `${userData.userName} replied to your comment`,
                            timestamp: Date.now(),
                            userId: auth.currentUser?.uid,
                            commentId,
                            topicId,
                        });
                    }
                }
            } else {
                // Handle new comment on the topic
                const newCommentKey = push(ref(db, `comments/${topicId}`)).key;
                await set(ref(db, `comments/${topicId}/${newCommentKey}`), {
                    commentText: newComment,
                    userId: userId,
                    timestamp: Date.now(),
                    likes: [],
                    replies: {},
                    imageUrl: imageUrl || null,  // Only add the image URL if available
                     imagePath: imagePath || null // Only add the image path if available
                });
    
                // Notify the topic owner about the new comment, unless the user is the topic owner
                const topicRef = ref(db, `topics/${topicId}`);
                const topicSnapshot = await get(topicRef);
                if (topicSnapshot.exists()) {
                    const topicData = topicSnapshot.val();
                    const topicOwnerId = topicData.userId;
    
                    if (userId !== topicOwnerId) {
                        const topicOwnerData = await fetchUserData(topicOwnerId);
                        const topicOwnerPushToken = topicOwnerData?.pushToken;
    
                        if (topicOwnerPushToken) {
                            await sendPushNotification(
                                topicOwnerPushToken,
                                "New Comment on Your Topic",
                                `${userData.userName} commented on your topic`,
                                { topicId, newCommentKey }
                            );
    
                            // Save the notification to the database for the topic owner
                            const notificationRef = push(ref(db, `notifications/${topicOwnerId}`));
                            await set(notificationRef, {
                                title: 'New Comment on Your Topic',
                                body: `${userData.userName} commented on your topic`,
                                timestamp: Date.now(),
                                userId: auth.currentUser?.uid,
                                commentId: newCommentKey,
                                topicId,
                            });
                        }
                    }
                }
            }
    
            setNewComment('');
            setSelectedImage(null);
            setReplyingTo(null);  // Reset replying state
            await fetchComments();  // Refresh comments and replies
        } catch (error) {
            console.error("Error posting comment/reply:", error);
            Alert.alert("Error", "There was an error posting your comment or reply. Please try again.");
        }
    };

    const handleImageSelect = async () => {
        try {
            const imageData = await pickImage();  // Only call pickImage when user selects the image
            if (imageData) {
                setSelectedImage(imageData.imageUrl);  // Set the selected image URL
            }
        } catch (error) {
            console.error("Error selecting image:", error);
        }
    };
    

    const handleReplyClick = (commentId, userName, commentAuthorId) => {
        console.log("Replying to commentId:", commentId, "userId:", commentAuthorId);  // Debugging log
        if (!commentId || !userName || !commentAuthorId) {
            console.error("Error: Missing data when clicking reply. CommentId or userName or commentAuthorId is missing.");
            return;
        }
    
        setReplyingTo({ commentId, userName, userId: commentAuthorId });
        setNewComment(`@${userName} `);  // Pre-fill input with the username
    };
    

    const handleLike = async (commentId, replyId = null) => {
        try {
            const path = replyId
                ? `comments/${topicId}/${commentId}/replies/${replyId}`
                : `comments/${topicId}/${commentId}`;
            
            const itemRef = ref(db, path);
            const itemSnapshot = await get(itemRef);
    
            if (itemSnapshot.exists()) {
                const itemData = itemSnapshot.val();
                const likes = itemData.likes || [];
    
                const isAlreadyLiked = likes.includes(userId); // Check if the user already liked
                const updatedLikes = isAlreadyLiked
                    ? likes.filter(likeUserId => likeUserId !== userId) // Unlike
                    : [...likes, userId]; // Like
    
                // Update the likes in Firebase
                await update(itemRef, { likes: updatedLikes });
                await fetchComments(); // Refresh comments after updating likes
    
                // Fetch the current user's data to get their userName
                const currentUserSnapshot = await get(ref(db, `users/${userId}`));
                const currentUserData = currentUserSnapshot.val();
                const userName = currentUserData?.userName || 'Someone';
    
                if (isAlreadyLiked) {
                    // Unlike case: remove the notification if it exists
                    const notificationsRef = ref(db, `notifications/${itemData.userId}`);
                    const notificationsSnapshot = await get(notificationsRef);
                    if (notificationsSnapshot.exists()) {
                        const notifications = notificationsSnapshot.val();
                        const notificationKey = Object.keys(notifications).find(
                            key => notifications[key].title === (replyId ? 'New Like on Your Reply' : 'New Like on Your Comment') &&
                            notifications[key].userId === userId && // Match the notification with the correct liker
                            notifications[key].commentId === commentId
                        );
    
                        if (notificationKey) {
                            await remove(ref(db, `notifications/${itemData.userId}/${notificationKey}`));
                            console.log('Notification removed for user:', itemData.userId);
                        }
                    }
                } else {
                    // Like case: Notify the original author only when the user is liking the comment/reply
                    if (userId !== itemData.userId) {
                        const authorData = await fetchUserData(itemData.userId); // Fetch the comment/reply author's data
                        const authorPushToken = authorData?.pushToken;
    
                        const notificationTitle = replyId ? 'New Like on Your Reply' : 'New Like on Your Comment';
                        const notificationBody = `${userName} liked your ${replyId ? 'reply' : 'comment'}`;
    
                        if (authorPushToken) {
                            // Send push notification to the comment/reply author
                            await sendPushNotification(
                                authorPushToken,
                                notificationTitle,
                                notificationBody,
                                { topicId, commentId }
                            );
    
                            // Save the notification to the database for the comment/reply author
                            const newNotificationRef = push(ref(db, `notifications/${itemData.userId}`));
                            await set(newNotificationRef, {
                                title: notificationTitle,
                                body: notificationBody,
                                timestamp: Date.now(),
                                userId: auth.currentUser?.uid, // Store current user's ID who liked the comment/reply
                                topicId,
                                commentId,
                                replyId,
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error handling like:", error);
        }
    };
    
    
    

    const handleEdit = async (commentId) => {
        if (editText.trim() === '') {
            Alert.alert('Notice📌', 'Please enter some text to update the comment.', [{ text: 'OK' }]);
            return;
        }

        try {
            await update(ref(db, `comments/${topicId}/${commentId}`), {
                commentText: editText,
            });
            setEditCommentId(null);
            setEditText('');
            await fetchComments();
        } catch (error) {
            Alert.alert("Error", "There was an error editing the comment.");
        }
    };

    const handleDeleteComment = async (commentId) => {
        Alert.alert(
            'Delete Comment',
            'Are you sure you want to delete this comment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const commentRef = ref(db, `comments/${topicId}/${commentId}`);
                            const commentSnapshot = await get(commentRef);
    
                            if (commentSnapshot.exists()) {
                                // Just delete the comment without touching the image in Firebase Storage
                                await remove(commentRef);
                                console.log("Comment deleted from database");
                            }
    
                            // Refresh the comments after deletion
                            await fetchComments();
                        } catch (error) {
                            Alert.alert("Error", "There was an error deleting the comment.");
                            console.error("Error deleting comment:", error);
                        }
                    },
                },
            ]
        );
    };
    
    
    

    const handleDeleteReply = async (parentCommentId, replyId) => {
        Alert.alert(
            'Delete Reply',
            'Are you sure you want to delete this reply?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await remove(ref(db, `comments/${topicId}/${parentCommentId}/replies/${replyId}`));
                            await fetchComments();
                        } catch (error) {
                            Alert.alert("Error", "There was an error deleting the reply.");
                        }
                    },
                },
            ]
        );
    };

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);  // Show the loading spinner
        fetchComments().then(() => {
            setIsRefreshing(false);  // Hide the spinner when the data is fetched
        });
    }, []);

    const renderReplies = (replies, parentCommentId) => {
        const replyCount = replies.length;
        const isShowingAllReplies = showAllReplies[parentCommentId];
        const repliesToShow = isShowingAllReplies ? replies : replies.slice(0, 1);
    
        return (
            <View style={styles.repliesContainer}>
                {repliesToShow.map((reply) => (
                    <View key={reply.replyId} style={styles.replyCard}>
                        <View style={styles.commentHeader}>
                            <Image source={{ uri: reply.profilePicture }} style={styles.profilePicture} />
                            <View style={styles.commentHeaderText}>
                                <Text style={styles.userName}>{reply.userName}</Text>
                                <Text style={styles.timestamp}>{formatTimestamp(reply.timestamp)}</Text>
                            </View>
                        </View>

                        {editReplyId === reply.replyId ? (
                            <TextInput
                                style={styles.commentInput}
                                value={editReplyText}
                                onChangeText={setEditReplyText}
                                placeholder="Edit your reply..."
                                placeholderTextColor="#888"
                            />
                        ) : (
                            <Text style={styles.commentText}>
                                {renderReplyTextWithColoredUsername(reply.replyText)}
                            </Text>
                        )}

                            {reply.imageUrl ? (
                                <Image source={{ uri: reply.imageUrl }} style={styles.commentImage} />
                            ) : null}

                        <View style={styles.commentActions}>
                            <TouchableOpacity onPress={() => handleLike(parentCommentId, reply.replyId)}>
                                <Ionicons
                                    name={reply.likes.includes(userId) ? "heart" : "heart-outline"}
                                    size={20}
                                    color={reply.likes.includes(userId) ? "red" : "white"}
                                />
                            </TouchableOpacity>
                            <Text style={styles.likeCountText}>{reply.likes.length}</Text>
                            <TouchableOpacity onPress={() => handleReplyClick(parentCommentId, reply.userName, reply.userId)}>
                                <Text style={styles.actionText}>Reply</Text>
                            </TouchableOpacity>
    
                            {reply.userId === userId && (
                                <>
                                    {editReplyId === reply.replyId ? (
                                        <>
                                            <TouchableOpacity onPress={() => handleEditReply(parentCommentId, reply.replyId)}>
                                                <Text style={styles.actionText}>Save</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setEditReplyId(null)}>
                                                <Text style={styles.actionText}>Cancel</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <TouchableOpacity onPress={() => { setEditReplyId(reply.replyId); setEditReplyText(reply.replyText); }}>
                                                <Text style={styles.actionText}>Edit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteReply(parentCommentId, reply.replyId)}>
                                                <Text style={styles.actionTextDelete}>Delete</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                ))}
    
                {replyCount > 1 && !isShowingAllReplies && (
                    <TouchableOpacity onPress={() => setShowAllReplies({ ...showAllReplies, [parentCommentId]: true })}>
                        <Text style={styles.viewMoreRepliesText}>View {replyCount - 1} more {replyCount - 1 === 1 ? 'reply' : 'replies'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };
    
    // Function to render the reply text with colored username
    const renderReplyTextWithColoredUsername = (text) => {
        const usernameMatch = text.match(/^@\S+/);
        if (usernameMatch) {
            const username = usernameMatch[0];
            const remainingText = text.replace(username, ''); // Separate the remaining text

            return (
                <>
                    <Text style={styles.usernameText}>{username}</Text>
                    <Text>{remainingText}</Text>
                </>
            );
        }
        return text;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backbutton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={30} color="#E5E5E5" />
                </TouchableOpacity>
                <Text style={styles.title}>Comments</Text>
            </View>
            <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}  // Pass the refreshing state
                    onRefresh={onRefresh}  // Trigger the refresh function
                    colors={['#3498DB']}  // Customize the refresh spinner color
                />
            }
            style={styles.commentList}>
                {comments.map((comment) => (
                    <View key={comment.commentId} style={styles.commentCard}>
                        <View style={styles.commentHeader}>
                            <Image source={{ uri: comment.profilePicture }} style={styles.profilePicture} />
                            <View style={styles.commentHeaderText}>
                                <Text style={styles.userName}>{comment.userName}</Text>
                                <Text style={styles.timestamp}>{formatTimestamp(comment.timestamp)}</Text>
                            </View>
                        </View>
                    
                        {editCommentId === comment.commentId ? (
                            <TextInput
                                style={styles.commentInput}
                                value={editText}
                                onChangeText={setEditText}
                                placeholder="Edit your comment..."
                                placeholderTextColor="#888"
                            />
                        ) : (
                            <Text style={styles.commentText}>{comment.commentText}</Text>
                        )}

                        {comment.imageUrl ? (
                                <Image source={{ uri: comment.imageUrl }} style={styles.commentImage} />
                            ) : null}

                        <View style={styles.commentActions}>
                            <TouchableOpacity onPress={() => handleLike(comment.commentId)}>
                                <Ionicons
                                    name={comment.likes.includes(userId) ? "heart" : "heart-outline"}
                                    size={20}
                                    color={comment.likes.includes(userId) ? "red" : "white"}
                                />
                            </TouchableOpacity>
                            <Text style={styles.likeCountText}>{comment.likes.length}</Text>
                            <TouchableOpacity onPress={() => handleReplyClick(comment.commentId, comment.userName, comment.userId)}>
                                <Text style={styles.actionText}>Reply</Text>
                            </TouchableOpacity>
                            {comment.userId === userId && (
                                <>
                                    {editCommentId === comment.commentId ? (
                                        <>
                                            <TouchableOpacity onPress={() => handleEdit(comment.commentId)}>
                                                <Text style={styles.actionText}>Save</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => setEditCommentId(null)}>
                                                <Text style={styles.actionText}>Cancel</Text>
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <TouchableOpacity onPress={() => { setEditCommentId(comment.commentId); setEditText(comment.commentText); }}>
                                                <Text style={styles.actionText}>Edit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteComment(comment.commentId)}>
                                                <Text style={styles.actionTextDelete}>Delete</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </>
                            )}
                        </View>
                        {comment.replies && renderReplies(comment.replies, comment.commentId)}
                    </View>
                ))}
            </ScrollView>
            <View style={styles.commentInputContainer}>
            <TouchableOpacity onPress={handleImageSelect} style={styles.addImageButton}>
                <Entypo name="image" size={30} color="#E5E5E5" />
                </TouchableOpacity>
                {selectedImage && (
                    <Image source={{ uri: selectedImage }} style={styles.selectedImage} />  // Preview selected image
                )}
                <TextInput
                    style={styles.commentInput}
                    placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                    placeholderTextColor={"#888"}
                    value={newComment}
                    onChangeText={setNewComment}
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleCommentSubmit}
                >
                    <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#292929',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 15
    },
    backbutton: {
        marginTop: 50,
    },
    title: {
        fontSize: 22,
        color: '#E5E5E5',
        flex: 1,
        textAlign: 'center',
        marginRight: 20,
        fontFamily: 'quicksand'
    },
    commentList: {
        flex: 1,
    },
    commentCard: {
        backgroundColor: '#1f1f1f',
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    commentHeaderText: {
        flex: 1,
    },
    userName: {
        fontSize: 17,
        color: '#E5E5E5',
    },
    timestamp: {
        fontSize: 13,
        color: '#BDC3C7',
    },
    commentText: {
        color: '#E5E5E5',
        fontSize: 18,
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    likeCountText: {
        color: 'white',
        marginLeft: 5,
        marginRight: 15, // Adjust spacing between like count and Reply
    },
    actionText: {
        color: '#4EA8DE',
        fontSize: 16,
        marginRight: 15, // Add some spacing between action buttons
    },
    actionTextDelete: {
        color: '#DC143C',
        fontSize: 16,
        marginRight: 15, // Add some spacing for delete
    },
    replyCard: {
        backgroundColor: '#1f1f1f',
        padding: 16,
        marginBottom: -10,
        borderRadius: 8,
        marginLeft: 20, // Indent the replies
    },
    viewMoreRepliesText: {
        color: '#4EA8DE',
        marginLeft: 20,
        marginTop: 10,
    },
    usernameText: {
        color: '#4EA8DE', // Customize the color of @username
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        paddingVertical: 10,
    },
    commentInput: {
        flex: 1,
        backgroundColor: '#1f1f1f',
        color: '#E5E5E5',
        padding: 10,
        borderRadius: 5,
    },
    sendButton: {
        marginLeft: 10,
    },
    addImageButton: {
        marginRight: 10,
    },
    selectedImage: {
        width: 50,
        height: 50,
        marginRight: 10,
        borderRadius: 5,
    },
    commentImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginVertical: 10,
        resizeMode: 'stretch',
    },
});

export default CommentScreen;
