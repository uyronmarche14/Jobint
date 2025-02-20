import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  ref as dbRef,
  get,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from "firebase/storage";
import mime from "mime";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import Toast from "react-native-toast-message";
import { auth, db, storage } from "./../../../configs/FirebaseConfig";

// Utility function for formatting timestamps
const formatTimestamp = (timestamp) => {
  const now = new Date();
  const postDate = new Date(timestamp);
  const seconds = Math.floor((now - postDate) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

const fetchNotifications = async (userId) => {
  try {
    const notificationsRef = ref(db, `notifications/${userId}`);
    const snapshot = await get(notificationsRef);
    if (snapshot.exists()) {
      const notifications = snapshot.val();
      console.log("Fetched Notifications:", notifications); // Log to verify data
      return Object.values(notifications); // Convert object to array
    }
    return [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// Fetch user data by ID
const fetchUserData = async (userId) => {
  try {
    const userSnapshot = await get(ref(db, `users/${userId}`));
    return userSnapshot.exists()
      ? userSnapshot.val()
      : { userName: "Unknown", profilePicture: "", isAdmin: false }; // Include isAdmin: false as default
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { userName: "Unknown", profilePicture: "", isAdmin: false }; // Include isAdmin in the error case too
  }
};

// Fetch like status for a specific topic and user
const fetchLikes = async (topicId, userId) => {
  try {
    const likeSnapshot = await get(ref(db, `likes/${topicId}/${userId}`));
    return likeSnapshot.exists();
  } catch (error) {
    console.error("Error fetching like status:", error);
    return false;
  }
};

// Fetch the count of likes for a topic
const fetchLikesCount = async (topicId) => {
  try {
    const likesSnapshot = await get(ref(db, `likes/${topicId}`));
    return likesSnapshot.exists() ? Object.keys(likesSnapshot.val()).length : 0;
  } catch (error) {
    console.error("Error fetching likes count:", error);
    return 0;
  }
};

// Update like status for a topic
const updateLike = async (topicId, userId) => {
  try {
    await set(ref(db, `likes/${topicId}/${userId}`), true);
  } catch (error) {
    console.error("Error updating like:", error);
  }
};

// Remove like status for a topic
const removeLike = async (topicId, userId) => {
  try {
    await remove(ref(db, `likes/${topicId}/${userId}`));
  } catch (error) {
    console.error("Error removing like:", error);
  }
};

// Fetch comments for a topic and count both comments and replies
const fetchCommentsWithCount = async (topicId) => {
  try {
    const commentsSnapshot = await get(ref(db, `comments/${topicId}`));
    if (commentsSnapshot.exists()) {
      const commentsData = commentsSnapshot.val();
      const comments = Object.values(commentsData);
      const totalCommentsAndReplies = comments.reduce((count, comment) => {
        return count + 1 + countReplies(comment.replies);
      }, 0);
      return { comments, totalCommentsAndReplies };
    }
    return { comments: [], totalCommentsAndReplies: 0 };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return { comments: [], totalCommentsAndReplies: 0 };
  }
};

// Helper function to count replies recursively
const countReplies = (replies) => {
  if (!replies) return 0;
  const replyList = Object.values(replies);
  return replyList.reduce((count, reply) => {
    return count + 1 + countReplies(reply.replies); // Count each reply and its nested replies
  }, 0);
};

// New: Helper function to determine trending topics based on likes and comments
const fetchTrendingTopics = async (topics) => {
  const trendingTopics = topics
    .filter(
      (topic) => topic.likesCount > 0 || topic.totalCommentsAndReplies > 0
    )
    .sort(
      (a, b) =>
        b.likesCount +
        b.totalCommentsAndReplies -
        (a.likesCount + a.totalCommentsAndReplies)
    )
    .slice(0, 5); // Show top 5 trending topics
  return trendingTopics;
};

// Fetch users who liked a specific topic
const fetchTopicLikes = async (topicId) => {
  try {
    const topicRef = ref(db, `likes/${topicId}`);
    const snapshot = await get(topicRef);
    const likesData = snapshot.val() || {};

    const userIds = Object.keys(likesData);

    const users = await Promise.all(
      userIds.map(async (userId) => {
        const userSnapshot = await get(ref(db, `users/${userId}`));
        return userSnapshot.val(); // Ensure this returns an object with a 'username' property
      })
    );

    return users;
  } catch (error) {
    console.error("Error fetching topic likes:", error);
    throw error;
  }
};

async function sendPushNotification(expoPushToken, title, body, data) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: title,
    body: body,
    data: data,
  };

  // Send the push notification
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

const fetchTopContributors = async () => {
  try {
    // Fetch all users, topics, likes, and comments from the database
    const usersSnapshot = await get(ref(db, "users"));
    const topicsSnapshot = await get(ref(db, "topics"));
    const likesSnapshot = await get(ref(db, "likes"));
    const commentsSnapshot = await get(ref(db, "comments"));

    const usersData = usersSnapshot.val();
    const topicsData = topicsSnapshot.val();
    const likesData = likesSnapshot.val();
    const commentsData = commentsSnapshot.val();

    const contributors = {};

    // Track post counts for each user
    Object.keys(topicsData || {}).forEach((topicId) => {
      const topic = topicsData[topicId];
      if (!contributors[topic.userId]) {
        contributors[topic.userId] = {
          postCount: 0,
          likeCount: 0,
          commentCount: 0,
        };
      }
      contributors[topic.userId].postCount += 1;
    });

    // Track like counts for each user
    Object.keys(likesData || {}).forEach((topicId) => {
      Object.keys(likesData[topicId] || {}).forEach((userId) => {
        if (!contributors[userId]) {
          contributors[userId] = {
            postCount: 0,
            likeCount: 0,
            commentCount: 0,
          };
        }
        contributors[userId].likeCount += 1;
      });
    });

    // Track comment counts for each user
    Object.keys(commentsData || {}).forEach((topicId) => {
      const comments = commentsData[topicId];
      Object.keys(comments || {}).forEach((commentId) => {
        const comment = comments[commentId];
        if (!contributors[comment.userId]) {
          contributors[comment.userId] = {
            postCount: 0,
            likeCount: 0,
            commentCount: 0,
          };
        }
        contributors[comment.userId].commentCount += 1;

        // Include replies in comment counts
        if (comment.replies) {
          Object.keys(comment.replies || {}).forEach((replyId) => {
            const reply = comment.replies[replyId];
            if (!contributors[reply.userId]) {
              contributors[reply.userId] = {
                postCount: 0,
                likeCount: 0,
                commentCount: 0,
              };
            }
            contributors[reply.userId].commentCount += 1;
          });
        }
      });
    });

    // Fetch user details for each contributor
    const enrichedContributors = await Promise.all(
      Object.keys(contributors).map(async (userId) => {
        const userData = usersData[userId];
        if (userData) {
          return {
            userId,
            userName: userData.userName || "Unknown User",
            profilePicture:
              userData.profilePicture ||
              "https://example.com/default-profile.png",
            ...contributors[userId],
          };
        }
        return null;
      })
    );

    // Filter out any null results
    const validContributors = enrichedContributors.filter(
      (contributor) => contributor !== null
    );

    // Sort by the highest activity
    const sortedContributors = validContributors.sort((a, b) => {
      const totalA = a.postCount + a.likeCount + a.commentCount;
      const totalB = b.postCount + b.likeCount + b.commentCount;
      return totalB - totalA;
    });

    return sortedContributors.slice(0, 5); // Return top 5 contributors
  } catch (error) {
    console.error("Error fetching top contributors:", error);
    return [];
  }
};

export default function CommunityDiscussion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [likes, setLikes] = useState({});
  const [editingTopic, setEditingTopic] = useState(null);
  const [editTopicText, setEditTopicText] = useState("");
  const [isEditingPoll, setIsEditingPoll] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likers, setLikers] = useState([]);
  const [selectedTopicForLikes, setSelectedTopicForLikes] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsModalVisible, setNotificationsModalVisible] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPoll, setIsPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [totalVotes, setTotalVotes] = React.useState(0);
  const [image, setImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [voted, setVoted] = React.useState(false);

  const user = auth.currentUser;
  const userId = user?.uid;
  const [isAdmin, setIsAdmin] = useState(false);

  const [userName, setUserName] = useState("Unknown");
  const [profilePicture, setProfilePicture] = useState("");

  const [leaderboardModalVisible, setLeaderboardModalVisible] = useState(false);
  const [topContributors, setTopContributors] = useState([]);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingTopicId, setReportingTopicId] = useState(null); // Track which topic is being reported

  const handleLeaderboardPress = async () => {
    const contributors = await fetchTopContributors();
    setTopContributors(contributors);
    setLeaderboardModalVisible(true);
  };

  if (!user) {
    Alert.alert(
      "Error",
      "No user is currently signed in. Please sign in and try again.",
      [{ text: "OK" }]
    );
    return null;
  }

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (userId) {
        const userData = await fetchUserData(userId);
        setIsAdmin(userData.isAdmin || false); // Set admin status
      }
    };

    checkAdminStatus();
  }, [userId]);

  // Fetch user notifications when the component is focused
  useFocusEffect(
    useCallback(() => {
      const fetchUserNotifications = async () => {
        const data = await fetchNotifications(userId);
        const enrichedNotifications = await Promise.all(
          data.map(async (notification) => {
            console.log("Notification Data Before Enrichment:", notification); // Debugging log

            if (notification.userId) {
              const userData = await fetchUserData(notification.userId); // Fetch user data based on notification's userId
              console.log("Fetched User Data:", userData); // Debugging log

              return {
                ...notification,
                userName: userData.userName,
                profilePicture: userData.profilePicture,
                timestamp: notification.timestamp,
              };
            }
            return notification;
          })
        );

        console.log("Enriched Notifications:", enrichedNotifications); // Log the final enriched notifications
        setNotifications(enrichedNotifications);
      };

      fetchUserNotifications();
    }, [userId])
  );

  useFocusEffect(
    useCallback(() => {
      const userRef = ref(db, `users/${userId}`);

      const unsubscribe = onValue(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserName(userData.userName || "Unknown");
            setProfilePicture(userData.profilePicture || "");
            fetchTopics(); // Ensure the latest profile picture is shown
          } else {
            setUserName("Unknown");
            setProfilePicture("");
          }
        },
        (error) => {
          console.error("Error fetching user data:", error);
          Alert.alert(
            "Error",
            "There was an error fetching user data. Please try again."
          );
        }
      );

      return () => unsubscribe();
    }, [userId])
  );

  // Fetch whether the user has favorited a specific topic
  const fetchFavorites = async (topicId, userId) => {
    try {
      const favoriteSnapshot = await get(
        ref(db, `favorites/${topicId}/${userId}`)
      );
      return favoriteSnapshot.exists(); // Return true if the user has favorited the topic
    } catch (error) {
      console.error("Error fetching favorite status:", error);
      return false;
    }
  };

  // Fetch the count of users who favorited the topic
  const fetchFavoritesCount = async (topicId) => {
    try {
      const favoritesSnapshot = await get(ref(db, `favorites/${topicId}`));
      return favoritesSnapshot.exists()
        ? Object.keys(favoritesSnapshot.val()).length
        : 0;
    } catch (error) {
      console.error("Error fetching favorites count:", error);
      return 0;
    }
  };

  // Handle favorite button click
  const handleFavorite = async (topicId) => {
    try {
      const isFavorited = favorites[topicId]; // Check if the user already favorited the topic

      if (isFavorited) {
        // Unfavorite: remove favorite from the database
        await remove(ref(db, `favorites/${topicId}/${userId}`));
        setFavorites((prevFavorites) => ({
          ...prevFavorites,
          [topicId]: false,
        }));

        // Fetch the topic data to get the owner's userId
        const topicRef = ref(db, `topics/${topicId}`);
        const topicSnapshot = await get(topicRef);

        if (topicSnapshot.exists()) {
          const topicData = topicSnapshot.val();
          const topicOwnerId = topicData.userId;

          // Only delete the notification if the current user is not the topic owner
          if (userId !== topicOwnerId) {
            const notificationsRef = ref(db, `notifications/${topicOwnerId}`);
            const notificationSnapshot = await get(notificationsRef);

            if (notificationSnapshot.exists()) {
              const notifications = notificationSnapshot.val();
              const notificationKey = Object.keys(notifications).find(
                (key) =>
                  notifications[key].title === "New Favorite on Your Topic" &&
                  notifications[key].body.includes(userName || "Someone")
              );

              if (notificationKey) {
                await remove(
                  ref(db, `notifications/${topicOwnerId}/${notificationKey}`)
                );
                console.log("Notification removed for user:", topicOwnerId);
              }
            }
          }
        }
      } else {
        // Favorite: add favorite to the database
        await set(ref(db, `favorites/${topicId}/${userId}`), true);
        setFavorites((prevFavorites) => ({
          ...prevFavorites,
          [topicId]: true,
        }));

        // Fetch the topic data to get the owner's userId
        const topicRef = ref(db, `topics/${topicId}`);
        const topicSnapshot = await get(topicRef);

        if (topicSnapshot.exists()) {
          const topicData = topicSnapshot.val();
          const topicOwnerId = topicData.userId;

          // Only add the notification if the current user is not the topic owner
          if (userId !== topicOwnerId) {
            const ownerData = await fetchUserData(topicOwnerId);
            const ownerPushToken = ownerData?.pushToken;

            if (ownerPushToken) {
              const notificationTitle = "New Favorite on Your Topic";
              const notificationBody = `${userName} added your topic to favorites!`;

              // Send push notification to the topic owner
              await sendPushNotification(
                ownerPushToken,
                notificationTitle,
                notificationBody,
                { topicId }
              );

              // Save the notification to the database for the topic owner
              const newNotificationRef = push(
                ref(db, `notifications/${topicOwnerId}`)
              );
              await set(newNotificationRef, {
                title: notificationTitle,
                body: notificationBody,
                timestamp: Date.now(),
                userId: auth.currentUser?.uid,
              });
              console.log(
                "Notification saved to Firebase for topic owner:",
                topicOwnerId
              );
            }
          }
        }
      }

      // Fetch topics again to update the favorite count and refresh the UI
      fetchTopics();
    } catch (error) {
      console.error("Error handling favorite:", error);
    }
  };

  const fetchTopics = async () => {
    try {
      const snapshot = await get(ref(db, "topics"));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const topicIds = Object.keys(data);
        const topicList = await Promise.all(
          topicIds.map(async (topicId) => {
            const topic = data[topicId];
            const reviewerData = await fetchUserData(topic.userId);
            const userLiked = await fetchLikes(topicId, userId);
            const userFavorited = await fetchFavorites(topicId, userId);
            const likesCount = await fetchLikesCount(topicId);
            const favoritesCount = await fetchFavoritesCount(topicId);
            const { comments, totalCommentsAndReplies } =
              await fetchCommentsWithCount(topicId);
            return {
              ...topic,
              ...reviewerData,
              id: topicId,
              liked: userLiked,
              favorited: userFavorited,
              likesCount,
              favoritesCount,
              comments,
              totalCommentsAndReplies,
            };
          })
        );

        const sortedTopics = topicList.sort((a, b) => {
          if (a.userId === userId && b.userId !== userId) {
            return -1; // Put current user's topic at the top
          }
          if (a.userId !== userId && b.userId === userId) {
            return 1; // Keep other topics below
          }
          return 0; // Keep the order as is for other users
        });

        setTopics(sortedTopics);

        // Recalculate trending topics
        const trending = await fetchTrendingTopics(sortedTopics);
        setTrendingTopics(trending); // Ensure trending topics are set
      } else {
        setTopics([]);
        setLikes({});
        setTrendingTopics([]); // Clear trending topics if there are no topics
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
      Alert.alert(
        "Error",
        "There was an error fetching topics. Please try again."
      );
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [profilePicture]);

  // Handle notification icon click
  const handleNotificationIconPress = () => {
    setNotificationsModalVisible(true); // Open notifications modal
  };

  // Filter topics based on search query
  const filteredTopics = topics.filter(
    (topic) =>
      topic.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteTopics = filteredTopics.filter((topic) => favorites[topic.id]);

  // Filter out trending topics from other topics
  const otherTopics = filteredTopics.filter(
    (topic) =>
      !trendingTopics.some((trendingTopic) => trendingTopic.id === topic.id)
  );

  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  // Function to handle changing poll options
  const handlePollOptionChange = (text, index) => {
    const newOptions = [...pollOptions];
    newOptions[index] = text;
    setPollOptions(newOptions);
  };

  // Function to handle creating a poll
  const handleCreatePoll = async (topicId) => {
    try {
      if (isPoll && pollOptions.length >= 2) {
        const pollData = {
          options: pollOptions.reduce((acc, option) => {
            acc[option] = 0; // Initialize poll options with zero votes
            return acc;
          }, {}),
        };

        // Save the poll to the database under the topic
        await set(ref(db, `topics/${topicId}/poll`), pollData);
        console.log("Poll created successfully");
      }
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  };

  // Function to handle voting on a poll option
  const handleVote = async (topicId, selectedOption) => {
    try {
      const userId = auth.currentUser?.uid;

      // Check if the user has already voted for this option
      const votedUsersRef = ref(
        db,
        `topics/${topicId}/poll/votedUsers/${userId}`
      );
      const votedSnapshot = await get(votedUsersRef);

      if (votedSnapshot.exists()) {
        const votedOption = votedSnapshot.val();

        if (votedOption === selectedOption) {
          // User is unvoting
          const pollOptionRef = ref(
            db,
            `topics/${topicId}/poll/options/${selectedOption}`
          );
          const pollSnapshot = await get(pollOptionRef);

          if (pollSnapshot.exists()) {
            const currentVotes = pollSnapshot.val();
            await set(pollOptionRef, currentVotes > 0 ? currentVotes - 1 : 0); // Decrement the vote count

            // Remove the vote from the user's vote record
            await remove(votedUsersRef);

            await fetchTopics();

            // Remove the notification for the poll owner
            const topicRef = ref(db, `topics/${topicId}`);

            const topicSnapshot = await get(topicRef);

            if (topicSnapshot.exists()) {
              const topicData = topicSnapshot.val();
              const topicOwnerId = topicData.userId;

              // Avoid deleting the notification if the user is the topic owner
              if (topicOwnerId !== userId) {
                const notificationsRef = ref(
                  db,
                  `notifications/${topicOwnerId}`
                );
                const notificationSnapshot = await get(notificationsRef);

                if (notificationSnapshot.exists()) {
                  const notifications = notificationSnapshot.val();
                  const notificationKey = Object.keys(notifications).find(
                    (key) =>
                      notifications[key].title === "New Vote on Your Poll" &&
                      notifications[key].userId === userId // Match the userId who voted
                  );

                  if (notificationKey) {
                    await remove(
                      ref(
                        db,
                        `notifications/${topicOwnerId}/${notificationKey}`
                      )
                    );
                    console.log(
                      "Notification removed for poll owner:",
                      topicOwnerId
                    );
                  }
                }
              }
            }

            // Update UI to show unvote success
            Toast.show({
              type: "success",
              text1: "Vote removed!",
              text2: `Your vote for "${selectedOption}" has been removed.`,
            });

            // Fetch updated total votes
            fetchTotalVotes(topicId);
          }
        } else {
          Alert.alert("You can only vote for one option.");
        }
      } else {
        // Normal voting logic (vote for the selected option)
        const pollOptionRef = ref(
          db,
          `topics/${topicId}/poll/options/${selectedOption}`
        );
        const pollSnapshot = await get(pollOptionRef);

        if (pollSnapshot.exists()) {
          const currentVotes = pollSnapshot.val();
          await set(pollOptionRef, currentVotes + 1); // Increment the vote count

          // Track that the user has voted
          await set(votedUsersRef, selectedOption);

          await fetchTopics();

          // Send a push notification to the poll owner
          const topicRef = ref(db, `topics/${topicId}`);
          const topicSnapshot = await get(topicRef);

          if (topicSnapshot.exists()) {
            const topicData = topicSnapshot.val();
            const topicOwnerId = topicData.userId;

            // Avoid sending notifications to the user who voted
            if (topicOwnerId !== userId) {
              const ownerData = await fetchUserData(topicOwnerId);
              const ownerPushToken = ownerData?.pushToken;

              if (ownerPushToken) {
                const notificationTitle = "New Vote on Your Poll";
                const notificationBody = `${userName} voted on your poll!`;

                // Send push notification
                await sendPushNotification(
                  ownerPushToken,
                  notificationTitle,
                  notificationBody,
                  { topicId }
                );

                // Save notification in the database
                const newNotificationRef = push(
                  ref(db, `notifications/${topicOwnerId}`)
                );
                await set(newNotificationRef, {
                  title: notificationTitle,
                  body: notificationBody,
                  timestamp: Date.now(),
                  userId: auth.currentUser?.uid,
                });

                console.log("Notification sent to the poll owner");
              }
            }
          }

          // Update UI to show vote success
          Toast.show({
            type: "success",
            text1: "Voted successfully!",
            text2: `Your vote for "${selectedOption}" has been recorded.`,
          });

          // Fetch updated total votes and update in real-time
          fetchTotalVotes(topicId);
        }
      }
    } catch (error) {
      console.error("Error voting on poll:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const pollRef = ref(db, "topics");
      // Real-time listener for poll updates
      const unsubscribe = onValue(pollRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          // Ensure dynamic data like profile pictures, likes, comments, and favorites are preserved
          const updatedTopics = Object.keys(data).map((topicId) => {
            const topic = data[topicId];

            return {
              ...topic,
              id: topicId,
              profilePicture:
                topic.profilePicture ||
                "https://example.com/default-profile.png", // Fallback to default if missing
              likesCount: topic.likesCount || 0, // Default to 0 likes if not defined
              favoritesCount: topic.favoritesCount || 0, // Default to 0 favorites if not defined
              totalCommentsAndReplies: topic.totalCommentsAndReplies || 0, // Default to 0 comments if not defined
              userName: topic.userName || "Loading",
            };
          });
          setTopics(updatedTopics); // Update state with the new topics
        }
      });

      return () => unsubscribe(); // Cleanup listener on component unmount
    }, [])
  );

  const fetchTotalVotes = async (topicId) => {
    try {
      const pollRef = ref(db, `topics/${topicId}/poll/options`);
      const pollSnapshot = await get(pollRef);
      if (pollSnapshot.exists()) {
        const options = pollSnapshot.val();
        const total = Object.values(options).reduce(
          (sum, votes) => sum + votes,
          0
        );
        setTotalVotes(total);
      }
    } catch (error) {
      console.error("Error fetching total votes:", error);
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopic.trim()) {
      Alert.alert("Notice📌", "Please enter a topic before creating.", [
        { text: "OK" },
      ]);
      return;
    }

    setLoading(true);

    try {
      const newTopicRef = ref(db, "topics");
      const newTopicKey = push(newTopicRef).key;

      let imageUrl = null;
      if (selectedImage) {
        const fileName = `${Date.now()}.jpeg`;
        const fileRef = storageRef(
          storage,
          `communityPosts/${userId}/${fileName}`
        );

        const response = await fetch(selectedImage);
        const blob = await response.blob();

        const uploadTask = uploadBytesResumable(fileRef, blob);
        await uploadTask;

        imageUrl = await getDownloadURL(fileRef); // Get the image URL after upload
      }

      await set(ref(db, `topics/${newTopicKey}`), {
        topic: newTopic,
        userId,
        timestamp: Date.now(),
        imageUrl,
        poll: isPoll
          ? pollOptions.reduce((acc, option) => {
              acc[option] = 0;
              return acc;
            }, {})
          : null,
      });

      // Call handleCreatePoll if a poll is being created
      await handleCreatePoll(newTopicKey);

      Toast.show({
        type: "success",
        text1: "Topic Created!",
        text2: "Your topic has been successfully created.",
        position: "top",
        visibilityTime: 4000,
      });

      setNewTopic("");
      setSelectedImage(null);
      setIsPoll(false);
      setPollOptions(["", ""]);
      setIsModalVisible(false);
      fetchTopics();
    } catch (error) {
      console.error("Error creating topic:", error);
      Alert.alert(
        "Error",
        "There was an error creating your topic. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTopic = async (topicId) => {
    if (!editTopicText.trim() || (isEditingPoll && pollOptions.length < 2)) {
      Alert.alert(
        "Notice📌",
        "Please provide a topic and at least two poll options.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);

    try {
      const topicRef = ref(db, `topics/${topicId}`);
      const pollRef = ref(db, `topics/${topicId}/poll`);
      const pollSnapshot = await get(pollRef);

      // Fetch existing poll data
      const existingPoll = pollSnapshot.exists()
        ? pollSnapshot.val()
        : { options: {}, votedUsers: {} };

      const updatedPollOptions = {};
      const oldPollOptions = existingPoll.options || {};
      const votedUsers = existingPoll.votedUsers || {};

      // We'll track the mapping of the old option names to the new ones
      const optionMapping = {};

      pollOptions.forEach((newOption, index) => {
        const oldOption = Object.keys(oldPollOptions)[index]; // Match by index
        if (oldOption) {
          updatedPollOptions[newOption] = oldPollOptions[oldOption]; // Keep the vote count, only change the name
          optionMapping[oldOption] = newOption; // Map old option to the new one for updating votedUsers
        } else {
          updatedPollOptions[newOption] = 0; // If it's a brand new option, start with 0 votes
        }
      });

      // Update the poll options in Firebase with the renamed options
      await update(pollRef, { options: updatedPollOptions });

      // Now, update the votedUsers to reflect the renamed options
      const updatedVotedUsers = {};
      Object.keys(votedUsers).forEach((userId) => {
        const oldOptionVoted = votedUsers[userId];
        const newOptionVoted = optionMapping[oldOptionVoted] || oldOptionVoted; // Use the new name if it was renamed

        updatedVotedUsers[userId] = newOptionVoted; // Update with the renamed option
      });

      // Update votedUsers in Firebase
      await update(
        ref(db, `topics/${topicId}/poll/votedUsers`),
        updatedVotedUsers
      );

      // Also update the topic text if necessary
      await update(topicRef, {
        topic: editTopicText,
      });

      // Show success message
      Toast.show({
        type: "success",
        text1: "Poll Updated!",
        text2: "Your poll has been updated, and votes have been preserved.",
        position: "top",
        visibilityTime: 4000,
      });

      // Clear edit state
      setEditTopicText("");
      setEditingTopic(null);
      setIsEditingPoll(false);
      setPollOptions(["", ""]);
      fetchTopics(); // Reload topics to reflect changes
    } catch (error) {
      console.error("Error updating poll:", error);
      Alert.alert(
        "Error",
        "There was an error updating your poll. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async (topicId, userId, isAdmin) => {
    try {
      const topicRef = ref(db, `topics/${topicId}`);
      const topicSnapshot = await get(topicRef);

      if (topicSnapshot.exists()) {
        const topicData = topicSnapshot.val();
        const topicOwnerId = topicData.userId;

        // Ensure only the owner or admin can delete the topic
        if (userId === topicOwnerId || isAdmin) {
          await remove(topicRef); // Proceed to delete
          Toast.show({
            type: "success",
            text1: "Topic Deleted!",
            text2: "The topic has been successfully deleted.",
            position: "top",
            visibilityTime: 4000,
          });
          fetchTopics();
        } else {
          Alert.alert(
            "Error",
            "You don't have permission to delete this topic."
          );
        }
      } else {
        Alert.alert("Error", "Topic not found.");
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
      Alert.alert(
        "Error",
        "There was an error deleting the topic. Please try again."
      );
    }
  };

  const handleReportTopic = (topicId) => {
    setReportingTopicId(topicId); // Store the topic ID
    setReportModalVisible(true); // Show the report modal
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert(
        "Notice📌",
        "Please provide a reason for reporting the topic."
      );
      return;
    }

    try {
      // Store the report in Firebase under 'reports'
      const reportRef = push(ref(db, "reports"));
      await set(reportRef, {
        topicId: reportingTopicId,
        userId, // The ID of the user who is reporting the topic
        reportReason,
        timestamp: Date.now(),
      });

      Toast.show({
        type: "success",
        text1: "Report Submitted!",
        text2: "Your report has been submitted successfully.",
        position: "top",
        visibilityTime: 4000,
      });

      // Reset the modal state
      setReportModalVisible(false);
      setReportReason("");
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert(
        "Error",
        "There was an error submitting your report. Please try again."
      );
    }
  };

  const handleEditOption = (topic) => {
    setEditingTopic(topic.id);
    setEditTopicText(topic.topic);
    setPollOptions(Object.keys(topic.poll?.options || {})); // Load current poll options for editing
    setIsEditingPoll(true); // Enable poll editing mode
  };

  const handleCancelEdit = () => {
    setEditTopicText("");
    setEditingTopic(null);
  };

  const handleDeleteOption = (topicId, isAdmin) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this topic?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => handleDeleteTopic(topicId, isAdmin) },
      ]
    );
  };
  const handleLike = async (topicId) => {
    try {
      const isAlreadyLiked = likes[topicId]; // Check if the user already liked the topic

      if (isAlreadyLiked) {
        // Unlike case: remove like and delete the notification
        await removeLike(topicId, userId);
        setLikes((prevLikes) => ({
          ...prevLikes,
          [topicId]: false,
        }));

        // Fetch the topic data to get the owner's userId
        const topicRef = ref(db, `topics/${topicId}`);
        const topicSnapshot = await get(topicRef);

        if (topicSnapshot.exists()) {
          const topicData = topicSnapshot.val();
          const topicOwnerId = topicData.userId; // This is the topic author's ID

          // Only delete the notification if the current user is not the topic owner
          if (userId !== topicOwnerId) {
            // Delete the notification for the topic owner
            const notificationsRef = ref(db, `notifications/${topicOwnerId}`);
            const notificationSnapshot = await get(notificationsRef);

            if (notificationSnapshot.exists()) {
              const notifications = notificationSnapshot.val();
              const notificationKey = Object.keys(notifications).find(
                (key) =>
                  notifications[key].title === "New Like on Your Topic" &&
                  notifications[key].userId === userId // Match the userId who liked the topic
              );

              if (notificationKey) {
                await remove(
                  ref(db, `notifications/${topicOwnerId}/${notificationKey}`)
                );
                console.log("Notification removed for user:", topicOwnerId);
              }
            }
          }
        }
      } else {
        // Like case: save the like and add the notification
        await updateLike(topicId, userId);
        setLikes((prevLikes) => ({
          ...prevLikes,
          [topicId]: true,
        }));

        // Fetch the topic data to get the owner's userId
        const topicRef = ref(db, `topics/${topicId}`);
        const topicSnapshot = await get(topicRef);

        if (topicSnapshot.exists()) {
          const topicData = topicSnapshot.val();
          const topicOwnerId = topicData.userId; // This is the topic author's ID

          // Only add the notification if the current user is not the topic owner
          if (userId !== topicOwnerId) {
            // Fetch the author's push token
            const ownerData = await fetchUserData(topicOwnerId);
            const ownerPushToken = ownerData?.pushToken;

            if (ownerPushToken) {
              const notificationTitle = "New Like on Your Topic";
              const notificationBody = `${userName} liked your topic!`;

              // Send push notification to the topic owner
              await sendPushNotification(
                ownerPushToken,
                notificationTitle,
                notificationBody,
                { topicId }
              );

              // Save notification only for the author (topicOwnerId)
              const newNotificationRef = push(
                ref(db, `notifications/${topicOwnerId}`)
              );
              await set(newNotificationRef, {
                title: notificationTitle,
                body: notificationBody,
                timestamp: Date.now(),
                userId: auth.currentUser?.uid,
              });
              console.log(
                "Notification saved to Firebase for topic owner:",
                topicOwnerId
              );
            }
          }
        }
      }

      fetchTopics(); // Refresh topics to reflect like changes
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const pickImage = async () => {
    try {
      setUploading(true);

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        if (!imageUri) {
          Alert.alert("Error", "Image URI is not available.");
          return;
        }

        // Set selected image for preview
        setSelectedImage(imageUri); // Show preview before uploading

        // Adjust the image URI
        const newImageUri = "file:///" + imageUri.split("file:/").join("");

        // Create FormData object
        const formData = new FormData();
        formData.append("image", {
          uri: newImageUri,
          type: mime.getType(newImageUri),
          name: newImageUri.split("/").pop(),
        });

        // Upload the image to the correct location
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User is not authenticated");
        }

        const userId = user.uid;
        const fileName = `${Date.now()}.jpeg`;
        const fileRef = storageRef(
          storage,
          `communityPosts/${userId}/${fileName}`
        ); // Correct path for post images

        // Create a Blob from the FormData object
        const response = await fetch(newImageUri);
        const blob = await response.blob();

        if (!blob) {
          throw new Error("Blob creation failed");
        }

        // Upload to Firebase
        const uploadTask = uploadBytesResumable(fileRef, blob);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Progress monitoring can be added here if needed
          },
          (error) => {
            console.error("Upload error:", error);
            Alert.alert("Error", "Failed to upload image. Please try again.");
          },
          async () => {
            // Get download URL after upload completes
            const imageUrl = await getDownloadURL(fileRef);
            console.log("Image URL:", imageUrl);

            // Save the image URL as part of the new community discussion post
            const newPostKey = push(dbRef(db, "communityPosts")).key;
            const newPostRef = dbRef(db, `communityPosts/${newPostKey}`);
            await set(newPostRef, {
              userId,
              imageUrl, // Save the image URL with the post
              timestamp: Date.now(),
              content: "Your post content here", // Add other relevant post content
            });
          }
        );
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleLongPress = useCallback(async (topicId) => {
    try {
      const users = await fetchTopicLikes(topicId);
      console.log("Fetched likers:", users); // Check the fetched data
      setLikers(users);
      setShowLikesModal(true);
    } catch (error) {
      console.error("Error fetching likes:", error);
      Alert.alert("Error", "Unable to fetch likes. Please try again.");
    }
  }, []);

  useEffect(() => {
    console.log("Likers state:", likers); // Verify the state
  }, [likers]);

  const handleNavigateToCommentScreen = (topicId) => {
    router.push(`/screens/comment-screen?topicId=${topicId}`);
  };

  const BackPress = () => {
    router.replace("./../../(tabs)/dashboard"); // Adjust the route as needed
  };

  const handleShowLikes = (topicId) => {
    console.log("Showing likes for topic:", topicId); // Debugging line
    setSelectedTopicForLikes(topicId);
    handleLongPress(topicId); // Fetch the likers data for this topic
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true); // Show the loading spinner
    fetchTopics().then(() => {
      setIsRefreshing(false); // Hide the spinner when the data is fetched
    });
  }, []);

  const handleRemovePollOption = (index) => {
    const updatedPollOptions = pollOptions.filter((_, i) => i !== index);
    setPollOptions(updatedPollOptions);
  };

  const renderPollOptions = (topic) => {
    const options = topic.poll?.options || {};
    const totalVotes = Object.values(options).reduce(
      (sum, votes) => sum + votes,
      0
    );

    return Object.keys(options).map((option) => {
      const votes = options[option];
      const votePercentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

      return (
        <View key={option} style={styles.pollOptionContainer}>
          <View style={styles.pollOptionRowRender}>
            <Text style={styles.pollOptionText}>{option}</Text>
            <Text style={styles.pollOptionVotes}>{votes} votes</Text>
          </View>

          {/* Make the progress bar tappable */}
          <TouchableOpacity
            onPress={() => handleVote(topic.id, option)}
            style={styles.progressBarContainer}
          >
            <ProgressBar
              progress={votePercentage / 100}
              color="#292929"
              style={styles.progressBar}
            />
            <Text style={styles.progressBarText}>
              {Math.round(votePercentage)}%
            </Text>
          </TouchableOpacity>
        </View>
      );
    });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "#292929" }]}
      />
      <View style={styles.maintitle}>
        <TouchableOpacity style={styles.backbutton} onPress={BackPress}>
          <Ionicons name="arrow-back" size={30} color="#E5E5E5" />
        </TouchableOpacity>

        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.maintitleText}>Community Discussions</Text>
        </View>
        {/* Placeholder to balance the back button */}
        <View style={{ width: 30 }} />
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search topics or users..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Topic Creation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalView}>
          <TextInput
            style={styles.modalInput}
            placeholder="Enter new topic"
            value={newTopic}
            onChangeText={setNewTopic}
          />

          {/* Image Picker */}
          <TouchableOpacity
            onPress={() => {
              if (selectedImage) {
                // If image is already selected, allow removing it
                setSelectedImage(null);
              } else {
                // Otherwise, allow picking an image
                pickImage();
              }
            }}
            style={styles.imagePickerButton}
          >
            <Text style={styles.imagePickerText}>
              {selectedImage ? "Remove Image" : "Select Image"}
            </Text>
          </TouchableOpacity>

          {/* Show image preview if selected */}
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.imagePreview}
            />
          )}

          {/* Poll Toggle */}
          <View style={styles.pollToggle}>
            <Text style={styles.pollToggleText}>Create a Poll?</Text>
            <Switch value={isPoll} onValueChange={setIsPoll} />
          </View>

          {/* Poll Options */}
          {isPoll && (
            <View style={styles.pollOptionsContainer}>
              <Text style={styles.pollInstructions}>
                Enter at least two poll options:
              </Text>

              <ScrollView
                style={styles.pollOptionsScrollView}
                keyboardShouldPersistTaps="handled"
              >
                {pollOptions.map((option, index) => (
                  <View key={index} style={styles.pollOptionRow}>
                    <TextInput
                      keyboardShouldPersistTaps="handled"
                      style={styles.pollOptionInput}
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      placeholderTextColor={"#c1c1c1"}
                      onChangeText={(text) =>
                        handlePollOptionChange(text, index)
                      }
                      maxLength={20}
                    />
                    {index > 1 && (
                      <TouchableOpacity
                        onPress={() => handleRemovePollOption(index)}
                        style={styles.removeOptionButton}
                      >
                        <Text style={styles.removeOptionButtonText}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>

              <View style={styles.centerButtonWrapper}>
                <TouchableOpacity
                  onPress={handleAddPollOption}
                  style={styles.addPollOptionButton}
                >
                  <Text style={styles.addPollOptionText}>
                    Add Another Option
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Modal Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCreateTopic}
              disabled={loading}
            >
              <Text style={styles.modalButtonText}>
                {loading ? "Creating..." : "Create Topic"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.title}>Topics</Text>

        {/* Icon Container for three icons */}
        <View style={styles.iconContainer}>
          {/* Report data Icon */}
          {isAdmin && (
            <TouchableOpacity
              style={styles.icon}
              onPress={() => router.push("../admin-reports")}
            >
              <Ionicons name="alert-circle-outline" size={30} color="red" />
            </TouchableOpacity>
          )}
          {/* Leaderboard Icon */}
          <TouchableOpacity
            style={styles.icon}
            onPress={handleLeaderboardPress}
          >
            <Ionicons name="trophy-outline" size={30} color="gold" />
          </TouchableOpacity>

          {/* Notification Icon */}
          <TouchableOpacity
            style={styles.icon}
            onPress={handleNotificationIconPress}
          >
            <Ionicons name="notifications-outline" size={30} color="white" />
          </TouchableOpacity>

          {/* Add Topic Icon */}
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#3498DB"]}
          />
        }
      >
        {/* Favorite Topics Section */}
        {favoriteTopics.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Favorites:</Text>
            {favoriteTopics
              .slice(0, showAllFavorites ? favoriteTopics.length : 1)
              .map((topic) => (
                <View key={topic.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Image
                      source={{ uri: topic.profilePicture }}
                      style={styles.profilePicture}
                    />
                    <View style={styles.cardHeaderText}>
                      <Text style={styles.userName}>{topic.userName}</Text>
                      <Text style={styles.timestamp}>
                        {formatTimestamp(topic.timestamp)}
                      </Text>
                    </View>
                    {userId === topic.userId ? (
                      // For the topic owner (show both Edit and Delete)
                      <Menu>
                        <MenuTrigger>
                          <Ionicons
                            name="ellipsis-horizontal"
                            size={24}
                            color="white"
                          />
                        </MenuTrigger>
                        <MenuOptions>
                          <MenuOption
                            onSelect={() => handleEditOption(topic)} // Only show for owner
                            style={styles.menuOption}
                          >
                            <Text style={styles.menuText}>Edit</Text>
                          </MenuOption>
                          <MenuOption
                            onSelect={() =>
                              handleDeleteOption(topic.id, topic.userId)
                            } // Owner can delete their own topic
                            style={styles.menuOption}
                          >
                            <Text style={styles.menuText}>Delete</Text>
                          </MenuOption>
                        </MenuOptions>
                      </Menu>
                    ) : isAdmin ? (
                      // For admins (only show Delete)
                      <Menu>
                        <MenuTrigger>
                          <Ionicons
                            name="ellipsis-horizontal"
                            size={24}
                            color="white"
                          />
                        </MenuTrigger>
                        <MenuOptions>
                          <MenuOption
                            onSelect={() =>
                              handleDeleteOption(topic.id, topic.userId)
                            } // Admin can delete any topic
                            style={styles.menuOption}
                          >
                            <Text style={styles.menuText}>Delete</Text>
                          </MenuOption>
                        </MenuOptions>
                      </Menu>
                    ) : (
                      // For other users (show Report)
                      <Menu>
                        <MenuTrigger>
                          <Ionicons
                            name="ellipsis-horizontal"
                            size={24}
                            color="white"
                          />
                        </MenuTrigger>
                        <MenuOptions>
                          <MenuOption
                            onSelect={() => handleReportTopic(topic.id)} // Only non-owner and non-admin can report
                            style={styles.menuOption}
                          >
                            <Text style={styles.menuText}>Report</Text>
                          </MenuOption>
                        </MenuOptions>
                      </Menu>
                    )}
                  </View>
                  {editingTopic === topic.id ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={{ color: "white", fontSize: 16 }}
                        value={editTopicText}
                        onChangeText={setEditTopicText}
                        multiline
                      />
                      {/* Poll Editing Section */}
                      {isEditingPoll && (
                        <View>
                          <Text style={styles.pollTitle}>
                            Edit Poll Options:
                          </Text>
                          {pollOptions.map((option, index) => (
                            <TextInput
                              key={index}
                              style={styles.pollOptionInput}
                              placeholder={`Option ${index + 1}`}
                              placeholderTextColor={"#fff"}
                              value={option}
                              onChangeText={(text) =>
                                handlePollOptionChange(text, index)
                              }
                            />
                          ))}
                          <TouchableOpacity
                            onPress={handleAddPollOption}
                            style={styles.addPollOptionButtonFavorites}
                          >
                            <Text style={styles.addPollOptionText}>
                              Add Another Option
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                          style={{ marginRight: 10 }}
                          onPress={() => handleUpdateTopic(topic.id)}
                          disabled={loading}
                        >
                          <Text style={{ color: "#c1c1c1", fontSize: 16 }}>
                            {loading ? "Updating..." : "Save"}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={handleCancelEdit}
                        >
                          <Text style={{ color: "#c1c1c1", fontSize: 16 }}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.topicText}>{topic.topic}</Text>
                      {topic.imageUrl && (
                        <Image
                          source={{ uri: topic.imageUrl }}
                          style={{
                            width: 200,
                            height: 200,
                            marginTop: 10,
                            borderRadius: 15,
                          }}
                        />
                      )}
                      {topic.poll && (
                        <View style={styles.pollContainer}>
                          {/* Render poll options */}
                          {renderPollOptions(topic)}
                        </View>
                      )}
                      <View style={styles.cardFooter}>
                        <View style={styles.iconContainer}>
                          {/* Like Button */}
                          <TouchableOpacity
                            style={styles.likeButton}
                            onPress={() => handleLike(topic.id)}
                            onLongPress={() => handleShowLikes(topic.id)}
                          >
                            <Ionicons
                              name={topic.liked ? "heart" : "heart-outline"}
                              size={24}
                              color={topic.liked ? "red" : "white"}
                            />
                            <Text style={styles.likeCount}>
                              {topic.likesCount}
                            </Text>
                          </TouchableOpacity>

                          {/* Comment Button */}
                          <TouchableOpacity
                            style={styles.commentButton}
                            onPress={() =>
                              handleNavigateToCommentScreen(topic.id)
                            }
                          >
                            <Ionicons
                              name="chatbubble-outline"
                              size={24}
                              color="white"
                            />
                            <Text style={styles.commentCount}>
                              {topic.totalCommentsAndReplies}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* Favorite Button */}
                        <TouchableOpacity
                          style={styles.favoriteButton}
                          onPress={() => handleFavorite(topic.id)}
                        >
                          <FontAwesome
                            name={
                              favorites[topic.id] ? "bookmark" : "bookmark-o"
                            }
                            size={24}
                            color={favorites[topic.id] ? "gold" : "white"}
                          />
                          <Text style={styles.favoriteCount}>
                            {topic.favoritesCount}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            {favoriteTopics.length > 1 && !showAllFavorites && (
              <TouchableOpacity onPress={() => setShowAllFavorites(true)}>
                <Text style={styles.viewMoreText}>
                  View {favoriteTopics.length - 1} more{" "}
                  {favoriteTopics.length - 1 === 1 ? "favorite" : "favorites"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Show "Show Less" button if the section is expanded */}
            {showAllFavorites && (
              <TouchableOpacity onPress={() => setShowAllFavorites(false)}>
                <Text style={styles.viewMoreText}>Show Less</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Trending Topics Section */}
        {trendingTopics.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Trending:</Text>
            {trendingTopics.map((topic) => (
              <View key={topic.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Image
                    source={{ uri: topic.profilePicture }}
                    style={styles.profilePicture}
                  />
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.userName}>{topic.userName}</Text>
                    <Text style={styles.timestamp}>
                      {formatTimestamp(topic.timestamp)}
                    </Text>
                  </View>
                  {userId === topic.userId ? (
                    // For the topic owner (show both Edit and Delete)
                    <Menu>
                      <MenuTrigger>
                        <Ionicons
                          name="ellipsis-horizontal"
                          size={24}
                          color="white"
                        />
                      </MenuTrigger>
                      <MenuOptions>
                        <MenuOption
                          onSelect={() => handleEditOption(topic)} // Only show for owner
                          style={styles.menuOption}
                        >
                          <Text style={styles.menuText}>Edit</Text>
                        </MenuOption>
                        <MenuOption
                          onSelect={() =>
                            handleDeleteOption(topic.id, topic.userId)
                          } // Owner can delete their own topic
                          style={styles.menuOption}
                        >
                          <Text style={styles.menuText}>Delete</Text>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  ) : isAdmin ? (
                    // For admins (only show Delete)
                    <Menu>
                      <MenuTrigger>
                        <Ionicons
                          name="ellipsis-horizontal"
                          size={24}
                          color="white"
                        />
                      </MenuTrigger>
                      <MenuOptions>
                        <MenuOption
                          onSelect={() =>
                            handleDeleteOption(topic.id, topic.userId)
                          } // Admin can delete any topic
                          style={styles.menuOption}
                        >
                          <Text style={styles.menuText}>Delete</Text>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  ) : (
                    // For other users (show Report)
                    <Menu>
                      <MenuTrigger>
                        <Ionicons
                          name="ellipsis-horizontal"
                          size={24}
                          color="white"
                        />
                      </MenuTrigger>
                      <MenuOptions>
                        <MenuOption
                          onSelect={() => handleReportTopic(topic.id)} // Only non-owner and non-admin can report
                          style={styles.menuOption}
                        >
                          <Text style={styles.menuText}>Report</Text>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  )}
                </View>
                {editingTopic === topic.id ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={{ color: "white", fontSize: 16 }}
                      value={editTopicText}
                      onChangeText={setEditTopicText}
                      multiline
                    />
                    {isEditingPoll && (
                      <View>
                        <Text style={styles.pollTitle}>Edit Poll Options:</Text>
                        {pollOptions.map((option, index) => (
                          <TextInput
                            key={index}
                            style={styles.pollOptionInput}
                            placeholder={`Option ${index + 1}`}
                            placeholderTextColor={"#fff"}
                            value={option}
                            onChangeText={(text) =>
                              handlePollOptionChange(text, index)
                            }
                          />
                        ))}
                        <TouchableOpacity
                          onPress={handleAddPollOption}
                          style={styles.addPollOptionButtonTrending}
                        >
                          <Text style={styles.addPollOptionText}>
                            Add Another Option
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity
                        style={{ marginRight: 10 }}
                        onPress={() => handleUpdateTopic(topic.id)}
                        disabled={loading}
                      >
                        <Text style={{ color: "#c1c1c1", fontSize: 16 }}>
                          {loading ? "Updating..." : "Save"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelEdit}
                      >
                        <Text style={{ color: "#c1c1c1", fontSize: 16 }}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.topicText}>{topic.topic}</Text>
                    {topic.imageUrl && (
                      <Image
                        source={{ uri: topic.imageUrl }}
                        style={{
                          width: 200,
                          height: 200,
                          marginTop: 10,
                          borderRadius: 15,
                        }}
                      />
                    )}
                    {topic.poll && (
                      <View style={styles.pollContainer}>
                        {/* Render poll options */}
                        {renderPollOptions(topic)}
                      </View>
                    )}
                    <View style={styles.cardFooter}>
                      <View style={styles.iconContainer}>
                        {/* Like Button */}
                        <TouchableOpacity
                          style={styles.likeButton}
                          onPress={() => handleLike(topic.id)}
                          onLongPress={() => handleShowLikes(topic.id)}
                        >
                          <Ionicons
                            name={topic.liked ? "heart" : "heart-outline"}
                            size={24}
                            color={topic.liked ? "red" : "white"}
                          />
                          <Text style={styles.likeCount}>
                            {topic.likesCount}
                          </Text>
                        </TouchableOpacity>

                        {/* Comment Button */}
                        <TouchableOpacity
                          style={styles.commentButton}
                          onPress={() =>
                            handleNavigateToCommentScreen(topic.id)
                          }
                        >
                          <Ionicons
                            name="chatbubble-outline"
                            size={24}
                            color="white"
                          />
                          <Text style={styles.commentCount}>
                            {topic.totalCommentsAndReplies}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Favorite Button */}
                      <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => handleFavorite(topic.id)}
                      >
                        <FontAwesome
                          name={favorites[topic.id] ? "bookmark" : "bookmark-o"}
                          size={24}
                          color={favorites[topic.id] ? "gold" : "white"}
                        />
                        <Text style={styles.favoriteCount}>
                          {topic.favoritesCount}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View>
          <Text style={styles.otherTopicsTitle}>Others:</Text>
        </View>

        {otherTopics.length ? (
          otherTopics.map((topic) => (
            <View key={topic.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image
                  source={{ uri: topic.profilePicture }}
                  style={styles.profilePicture}
                />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.userName}>{topic.userName}</Text>
                  <Text style={styles.timestamp}>
                    {formatTimestamp(topic.timestamp)}
                  </Text>
                </View>
                {userId === topic.userId ? (
                  // For the topic owner (show both Edit and Delete)
                  <Menu>
                    <MenuTrigger>
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={24}
                        color="white"
                      />
                    </MenuTrigger>
                    <MenuOptions>
                      <MenuOption
                        onSelect={() => handleEditOption(topic)} // Only show for owner
                        style={styles.menuOption}
                      >
                        <Text style={styles.menuText}>Edit</Text>
                      </MenuOption>
                      <MenuOption
                        onSelect={() =>
                          handleDeleteOption(topic.id, topic.userId)
                        } // Owner can delete their own topic
                        style={styles.menuOption}
                      >
                        <Text style={styles.menuText}>Delete</Text>
                      </MenuOption>
                    </MenuOptions>
                  </Menu>
                ) : isAdmin ? (
                  // For admins (only show Delete)
                  <Menu>
                    <MenuTrigger>
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={24}
                        color="white"
                      />
                    </MenuTrigger>
                    <MenuOptions>
                      <MenuOption
                        onSelect={() =>
                          handleDeleteOption(topic.id, topic.userId)
                        } // Admin can delete any topic
                        style={styles.menuOption}
                      >
                        <Text style={styles.menuText}>Delete</Text>
                      </MenuOption>
                    </MenuOptions>
                  </Menu>
                ) : (
                  // For other users (show Report)
                  <Menu>
                    <MenuTrigger>
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={24}
                        color="white"
                      />
                    </MenuTrigger>
                    <MenuOptions>
                      <MenuOption
                        onSelect={() => handleReportTopic(topic.id)} // Only non-owner and non-admin can report
                        style={styles.menuOption}
                      >
                        <Text style={styles.menuText}>Report</Text>
                      </MenuOption>
                    </MenuOptions>
                  </Menu>
                )}
              </View>
              {editingTopic === topic.id ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={{ color: "white", fontSize: 16 }}
                    value={editTopicText}
                    onChangeText={setEditTopicText}
                    multiline
                  />
                  {isEditingPoll && (
                    <View>
                      <Text style={styles.pollTitle}>Edit Poll Options:</Text>
                      {pollOptions.map((option, index) => (
                        <TextInput
                          key={index}
                          style={styles.pollOptionInput}
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          placeholderTextColor={"#fff"}
                          onChangeText={(text) =>
                            handlePollOptionChange(text, index)
                          }
                        />
                      ))}
                      <TouchableOpacity
                        onPress={handleAddPollOption}
                        style={styles.addPollOptionButtonOthers}
                      >
                        <Text style={styles.addPollOptionText}>
                          Add Another Option
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      style={{ marginRight: 10 }}
                      onPress={() => handleUpdateTopic(topic.id)}
                      disabled={loading}
                    >
                      <Text style={{ color: "#c1c1c1", fontSize: 16 }}>
                        {loading ? "Updating..." : "Save"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancelEdit}
                    >
                      <Text style={{ color: "#c1c1c1", fontSize: 16 }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.topicText}>{topic.topic}</Text>
                  {topic.imageUrl && (
                    <Image
                      source={{ uri: topic.imageUrl }}
                      style={{
                        width: 200,
                        height: 200,
                        marginTop: 10,
                        borderRadius: 15,
                      }}
                    />
                  )}
                  {topic.poll && (
                    <View style={styles.pollContainer}>
                      {/* Render poll options */}
                      {renderPollOptions(topic)}
                    </View>
                  )}
                  <View style={styles.cardFooter}>
                    <View style={styles.iconContainer}>
                      {/* Like Button */}
                      <TouchableOpacity
                        style={styles.likeButton}
                        onPress={() => handleLike(topic.id)}
                        onLongPress={() => handleShowLikes(topic.id)}
                      >
                        <Ionicons
                          name={topic.liked ? "heart" : "heart-outline"}
                          size={24}
                          color={topic.liked ? "red" : "white"}
                        />
                        <Text style={styles.likeCount}>{topic.likesCount}</Text>
                      </TouchableOpacity>

                      {/* Comment Button */}
                      <TouchableOpacity
                        style={styles.commentButton}
                        onPress={() => handleNavigateToCommentScreen(topic.id)}
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={24}
                          color="white"
                        />
                        <Text style={styles.commentCount}>
                          {topic.totalCommentsAndReplies}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Favorite Button */}
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() => handleFavorite(topic.id)}
                    >
                      <FontAwesome
                        name={favorites[topic.id] ? "bookmark" : "bookmark-o"}
                        size={24}
                        color={favorites[topic.id] ? "gold" : "white"}
                      />
                      <Text style={styles.favoriteCount}>
                        {topic.favoritesCount}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noTopicsText}>
            No others topics yet. Be the first to add one!
          </Text>
        )}

        {/* Modal for displaying likes */}
        <Modal
          visible={showLikesModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLikesModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {likers.length > 0 ? (
                <FlatList
                  data={likers}
                  keyExtractor={(item) => item.email}
                  renderItem={({ item }) => (
                    <View style={styles.likerItem}>
                      <Image
                        source={{ uri: item.profilePicture }}
                        style={styles.likerImage}
                      />
                      <Text style={styles.likerName}>
                        {item.userName || "No Name"}
                      </Text>
                    </View>
                  )}
                />
              ) : (
                <Text style={styles.noLikersText}>No likers found.</Text>
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowLikesModal(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Modal for Notifications */}
      <ScrollView>
        <Modal
          visible={notificationsModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setNotificationsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <ScrollView>
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <View key={index} style={styles.notificationCard}>
                      <Image
                        source={{
                          uri:
                            notification.profilePicture ||
                            "https://example.com/default-profile.png",
                        }}
                        style={styles.profilePicture}
                      />
                      <View style={styles.notificationTextContainer}>
                        <Text style={styles.notificationBody} numberOfLines={0}>
                          <Text style={{ color: "black", fontWeight: "bold" }}>
                            {notification.userName || "Someone"}
                          </Text>{" "}
                          {notification.body.replace(
                            `${notification.userName || "Someone"} `,
                            ""
                          )}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {formatTimestamp(notification.timestamp)}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noNotificationsText}>
                    No notifications yet.
                  </Text>
                )}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setNotificationsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Leaderboard Modal */}
        <Modal
          visible={leaderboardModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setLeaderboardModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Top Contributors</Text>

              <ScrollView contentContainerStyle={styles.leaderboardScrollView}>
                {topContributors.length > 0 ? (
                  topContributors.slice(0, 5).map((contributor, index) => {
                    let icon = null;
                    let color = "black";
                    if (index === 0) {
                      icon = (
                        <FontAwesome5 name="medal" size={24} color="gold" />
                      );
                      color = "gold";
                    } else if (index === 1) {
                      icon = (
                        <FontAwesome5 name="medal" size={24} color="silver" />
                      );
                      color = "silver";
                    } else if (index === 2) {
                      icon = (
                        <FontAwesome5 name="medal" size={24} color="#cd7f32" />
                      );
                      color = "#cd7f32";
                    } else {
                      icon = (
                        <FontAwesome5 name="medal" size={24} color="#000" />
                      );
                    }
                    return (
                      <View key={index} style={styles.contributorCard}>
                        <Text style={[styles.rankNumber, { color }]}>
                          {index + 1}
                        </Text>

                        {icon && (
                          <View style={styles.iconContainer}>{icon}</View>
                        )}

                        <Image
                          source={{ uri: contributor.profilePicture }}
                          style={styles.contributorImage}
                        />
                        <View style={styles.contributorTextContainer}>
                          <Text style={styles.contributorName}>
                            {contributor.userName}
                          </Text>
                          <Text style={styles.contributorStats}>
                            Posts: {contributor.postCount} | Likes:{" "}
                            {contributor.likeCount} | Comments:{" "}
                            {contributor.commentCount}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.noContributorsText}>
                    No contributors found.
                  </Text>
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setLeaderboardModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={reportModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setReportModalVisible(false)}
        >
          <View style={styles.modalContainer1}>
            <View style={styles.modalContent1}>
              <Text style={styles.modalTitle1}>Report Topic</Text>
              <TextInput
                style={styles.input1}
                placeholder="Enter the reason for reporting this topic"
                value={reportReason}
                onChangeText={setReportReason}
                multiline
              />
              <View style={styles.modalButtons1}>
                <TouchableOpacity
                  style={styles.modalButton1}
                  onPress={submitReport} // Function to submit the report
                >
                  <Text style={styles.modalButtonText1}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton1}
                  onPress={() => setReportModalVisible(false)} // Close modal
                >
                  <Text style={styles.modalButtonText1}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  maintitle: {
    marginBottom: 20,
    marginVertical: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  maintitleText: {
    fontSize: 22,
    color: "white",
    fontFamily: "quicksand",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    color: "white",
    fontFamily: "quicksand",
    flex: 1,
  },
  searchInput: {
    backgroundColor: "#1f1f1f",
    color: "#E5E5E5",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
    fontFamily: "outfit",
  },
  addButton: {
    padding: 8,
  },
  backbutton: {},
  noTopicsText: {
    color: "white",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1f1f1f",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  cardHeaderText: {
    flex: 1,
  },
  userName: {
    color: "white",
    fontSize: 17,
  },
  timestamp: {
    color: "#BDC3C7",
  },
  moreButton: {
    marginLeft: "auto",
    padding: 10,
  },
  topicTextEditing: {
    color: "white",
  },
  topicText: {
    color: "white",
    fontSize: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "space-between",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  likeCount: {
    color: "white",
    marginLeft: 4,
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentCount: {
    color: "white",
    marginLeft: 4,
  },
  commentsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 17,
    color: "#c1c1c1",
    marginVertical: 10,
  },
  otherTopicsTitle: {
    fontSize: 17,
    color: "#c1c1c1",
    marginVertical: 10,
    alignItems: "flex-start",
  },
  imagePickerButton: {
    backgroundColor: "#2E7C81",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  imagePickerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
  modalInput: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#2E7C81",
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
  },
  modalTitle: {
    fontSize: 19,
    fontFamily: "pt-bold",
    marginBottom: 10,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
  },
  notificationDetails: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    color: "#333",
  },
  notificationTimestamp: {
    fontSize: 12,
    color: "#888",
  },
  notificationBody: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    flexWrap: "wrap", // This ensures the text wraps if it's too long
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: "80%",
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
  likerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
  },
  likerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  likerName: {
    fontSize: 16,
    color: "#333",
  },
  noLikersText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#2E7C81",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  noNotificationsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  contributorItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  contributorRank: {
    fontSize: 16,
    fontWeight: "bold",
    color: "gold",
    marginRight: 10,
  },
  contributorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  contributorName: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  contributorStats: {
    fontSize: 14,
    color: "#666",
  },
  contributorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
  },
  leaderboardScrollView: {
    alignItems: "center",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Align icons to the right
    marginRight: 10,
  },
  icon: {
    marginLeft: 15, // Space between icons
  },
  favoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: -5,
    justifyContent: "flex-end",
  },
  favoriteCount: {
    color: "white",
    marginLeft: 4,
  },
  viewMoreText: {
    color: "#4EA8DE",
    textAlign: "center",
    marginTop: -5,
  },
  noContributorsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  pollToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  pollToggleText: {
    color: "#fff",
    fontSize: 16,
    marginRight: 10,
  },
  pollOptionContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#1f1f1f",
    borderRadius: 8,
  },
  pollOptionRow: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  pollOptionRowRender: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  pollOptionsContainer: {
    alignItems: "center", // Center the contents horizontally
  },
  pollInstructions: {
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  pollOptionsScrollView: {
    maxHeight: 110,
    marginVertical: 5,
  },
  pollOptionInput: {
    backgroundColor: "#292929",
    color: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: "100%", // Fix the width to a percentage or set a fixed width like '250' based on your layout
    flexShrink: 1, // Prevents expanding and allows shrinking
    textAlign: "center",
  },
  addPollOptionButton: {
    backgroundColor: "#2E7C81",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 13,
    width: "90%",
  },
  addPollOptionButtonOthers: {
    backgroundColor: "#292929",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 13,
  },
  addPollOptionButtonTrending: {
    backgroundColor: "#292929",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 13,
  },
  addPollOptionButtonFavorites: {
    backgroundColor: "#292929",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 13,
  },
  addPollOptionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pollResults: {
    marginTop: 20,
    backgroundColor: "#34495E",
    padding: 10,
    borderRadius: 5,
  },
  pollContainer: {
    backgroundColor: "#292929",
    borderRadius: 10,
    padding: 16,
    marginTop: 20,
  },
  pollTitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 8,
    fontWeight: "bold",
  },
  pollOptionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  pollVotesText: {
    color: "#BDC3C7",
    fontSize: 14,
  },
  progressBarContainer: {
    position: "relative",
    height: 20,
    justifyContent: "center",
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#292929",
  },
  progressBarText: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -15 }], // Center the text
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  pollQuestion: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pollOptionText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  pollOptionVotes: {
    fontSize: 14,
    color: "#BDC3C7",
  },
  modalContainer1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent1: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle1: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input1: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    height: 100,
    textAlignVertical: "top",
  },
  modalButtons1: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton1: {
    backgroundColor: "#2E7C81",
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText1: {
    color: "white",
    fontWeight: "bold",
  },
  removeOptionButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 13,
    width: "100%", // Fix the width to a percentage or set a fixed width like '250' based on your layout
    alignItems: "center",
    justifyContent: "center",
  },
  removeOptionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  pollOptionWrapper: {
    width: "90%",
  },
  centerButtonWrapper: {
    alignItems: "center", // Centers the button horizontally
  },
});
