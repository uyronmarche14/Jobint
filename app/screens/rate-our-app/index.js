import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { child, get, onValue, ref, remove, set } from 'firebase/database';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { auth, db } from './../../../configs/FirebaseConfig';

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const fetchUserData = async (userId) => {
  try {
    const userSnapshot = await get(ref(db, `users/${userId}`));
    if (userSnapshot.exists()) {
      return userSnapshot.val();
    } else {
      return { userName: 'Unknown', profilePicture: '' };
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { userName: 'Unknown', profilePicture: '' };
  }
};


const fetchLikes = async (reviewId, userId) => {
  try {
    const likeSnapshot = await get(ref(db, `likes/${reviewId}/${userId}`));
    return likeSnapshot.exists();
  } catch (error) {
    console.error("Error fetching like status:", error);
    return false;
  }
};
const fetchLikesCount = async (reviewId) => {
  try {
    const likesSnapshot = await get(ref(db, `likes/${reviewId}`));
    return likesSnapshot.exists() ? Object.keys(likesSnapshot.val()).length : 0;
  } catch (error) {
    console.error("Error fetching likes count:", error);
    return 0;
  }
};


const updateLike = async (reviewId, userId) => {
  try {
    await set(ref(db, `likes/${reviewId}/${userId}`), true);
  } catch (error) {
    console.error("Error updating like:", error);
  }
};

const removeLike = async (reviewId, userId) => {
  try {
    await remove(ref(db, `likes/${reviewId}/${userId}`));
  } catch (error) {
    console.error("Error removing like:", error);
  }
};

export default function RatingScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [likes, setLikes] = useState({}); // Updated to use an object for tracking likes
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const user = auth.currentUser;
  const userId = user?.uid;

  const [userName, setUserName] = useState('Unknown');
  const [profilePicture, setProfilePicture] = useState('');

  if (!user) {
    Alert.alert('Error', 'No user is currently signed in. Please sign in and try again.', [{ text: 'OK' }]);
    return;
  }

  useFocusEffect(
    useCallback(() => {
      const userRef = ref(db, `users/${userId}`);
  
      // Real-time listener for profile data (including profile picture)
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserName(userData.userName || 'Unknown');
          setProfilePicture(userData.profilePicture || '');
          
          // Re-fetch reviews to ensure the latest profile picture is shown
          fetchReviews();
        } else {
          setUserName('Unknown');
          setUserPhoto('');
        }
      }, (error) => {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "There was an error fetching user data. Please try again.");
      });
  
      // Clean up the listener when the component unmounts or userId changes
      return () => unsubscribe();
    }, [userId])
  );

  const userReviewRef = ref(db, `reviews/${userId}`);

  const fetchReviews = async () => {
    try {
      const snapshot = await get(ref(db, 'reviews'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const reviewIds = Object.keys(data);
        const reviewList = await Promise.all(
          reviewIds.map(async (reviewId) => {
            const review = data[reviewId];
            const reviewerData = await fetchUserData(review.userId); // Ensure it fetches the latest profile data
            const userLiked = await fetchLikes(reviewId, userId);
            const likesCount = await fetchLikesCount(reviewId);
            return { ...review, ...reviewerData, id: reviewId, liked: userLiked, likesCount };
          })
        );
        setReviews(reviewList);
  
        // Track likes state
        const initialLikes = {};
        reviewList.forEach((review) => {
          initialLikes[review.id] = review.liked ? 1 : 0;
        });
        setLikes(initialLikes);
      } else {
        setReviews([]);
        setLikes({});
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Alert.alert('Error', 'There was an error fetching reviews. Please try again.');
    }
  };
  
  // Fetch reviews on component mount and when userPhoto updates
  useEffect(() => {
    fetchReviews();
  }, [profilePicture]);

  const handleSubmit = async () => {
    if (rating === 0 || !comment) {
      Alert.alert('Notice📌', 'Please provide a rating and write a comment before submitting.', [{ text: 'OK' }]);
      return;
    }

    setLoading(true);

    try {
      const snapshot = await get(child(ref(db), `reviews/${userId}`));

      if (snapshot.exists()) {
        Alert.alert("Ooopss", "You have already submitted a review.");
      } else {
        await set(userReviewRef, {
          rating,
          comment,
          userId,
          timestamp: formatTimestamp(Date.now()),
        });

        Toast.show({
          type: 'success',
          text1: 'Review Submitted!',
          text2: 'Thank you for your feedback',
          position: 'top',
          visibilityTime: 4000,
        });

        setRating(0);
        setComment('');
        fetchReviews();
        router.back();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "There was an error submitting your review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReview = async () => {
    if (editRating === 0 || !editComment) {
      Alert.alert('Notice📌', 'Please provide a rating and update your comment before submitting.', [{ text: 'OK' }]);
      return;
    }

    setLoading(true);

    try {
      const reviewRef = ref(db, `reviews/${editingReview.id}`);
      await set(reviewRef, {
        ...editingReview,
        rating: editRating,
        comment: editComment,
        timestamp: formatTimestamp(Date.now()),
      });

      Toast.show({
        type: 'success',
        text1: 'Review Updated!',
        text2: 'Your review has been updated.',
        position: 'top',
        visibilityTime: 4000,
      });

      setEditingReview(null);
      setEditRating(0);
      setEditComment('');
      fetchReviews();
    } catch (error) {
      console.error("Error updating review:", error);
      Alert.alert("Error", "There was an error updating your review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingPress = (rate) => {
    if (editingReview) {
      setEditRating(rate);
    } else {
      setRating(rate);
    }
  };

  const BackPress = () => {
      router.replace('./../../(tabs)/profile');
  };

  const handleLike = async (id) => {
    const index = reviews.findIndex((review) => review.id === id);
    const newLikes = { ...likes };
    const newReviews = [...reviews]; // Copy of reviews array
    const isLiked = await fetchLikes(id, userId); // Check if the user has already liked the review
  
    // Optimistically update the UI immediately
    if (isLiked) {
      newLikes[id] = newLikes[id] ? newLikes[id] - 1 : 0;
      newReviews[index].liked = false;  // Set liked to false
      newReviews[index].likesCount -= 1;  // Decrease like count
      setLikes(newLikes);
      setReviews(newReviews);
  
      // Update Firebase (remove like)
      await removeLike(id, userId);
    } else {
      newLikes[id] = (newLikes[id] || 0) + 1;
      newReviews[index].liked = true;  // Set liked to true
      newReviews[index].likesCount += 1;  // Increase like count
      setLikes(newLikes);
      setReviews(newReviews);
  
      // Update Firebase (add like)
      await updateLike(id, userId);
    }
  
    // Sync the like count with Firebase after updating
    const updatedLikesCount = await fetchLikesCount(id);
    newReviews[index].likesCount = updatedLikesCount;  // Sync the correct like count from Firebase
    setReviews(newReviews);  // Re-render with the correct like count
  };

  return (
    <View style={{ flexGrow: 1 }}>
      <LinearGradient
        colors={['#1C2A38', '#000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <TouchableOpacity style={{ top: 60, left: 30, zIndex: 1 }} onPress={BackPress}>
        <Ionicons name="arrow-back" size={30} color="#E5E5E5" />
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.title}>Rate our App</Text>

        {/* Star Rating */}
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRatingPress(star)}>
              <Ionicons
                name={star <= (editingReview ? editRating : rating) ? 'star' : 'star-outline'}
                size={40}
                color="#FFD700"
                style={styles.star}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Comment Box */}
        <TextInput
          placeholder="Write your review..."
          placeholderTextColor="#f5f5f5"
          style={styles.commentBox}
          multiline={true}
          value={editingReview ? editComment : comment}
          onChangeText={(text) => editingReview ? setEditComment(text) : setComment(text)}
        />

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={editingReview ? handleUpdateReview : handleSubmit}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{editingReview ? 'Update Review' : 'Submit Review'}</Text>
          )}
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: '#F5F5F5'}]} />

        {/* Users Feedback */}
        <View style={styles.usersFeedback}>
          <Text style={styles.usersFeedbackText}>Users Feedback:</Text>
        </View>

        {/* Display Reviews */}
        <ScrollView style={styles.reviewsContainer}>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              {/* Profile Picture and Username */}
              <View style={styles.profileSection}>
                {review.profilePicture ? (
                  <Image source={{ uri: review.profilePicture }} style={styles.profilePicture} />
                ) : (
                  <Ionicons name="person-circle-outline" size={50} color="#E5E5E5" style={styles.profileIcon} />
                )}
                <Text style={styles.reviewTextUsername}>{review.userName || 'Unknown'}</Text>
              </View>

              {/* Display Stars for Rating */}
              <View style={styles.starsContainerReview}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= review.rating ? 'star' : 'star-outline'}
                    size={15}
                    color="#FFD700"
                  />
                ))}
                {/* Date */}
              <Text style={styles.reviewTextDate}>{review.timestamp}</Text>
              </View>

              
              {/* Like Button */}
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => handleLike(review.id)}
              >
                <Ionicons
                  name="thumbs-up"
                  size={24}
                  color={likes[review.id] > 0 ? '#2E7C81' : '#cccccc'} // Change color based on like status
                />
                <Text style={styles.likeCount}>{review.likesCount || 0}</Text>
              </TouchableOpacity>

              {/* Comment */}
              <Text style={styles.reviewText}>{review.comment}</Text>

              {/* Edit Button */}
              {review.userId === userId && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setEditingReview(review);
                    setEditRating(review.rating);
                    setEditComment(review.comment);
                  }}
                >
                  <Ionicons name="pencil" size={20} color="#2E7C81" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'top',
    marginVertical: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'quicksand',
    color: '#fff',
    marginVertical: -5,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  star: {
    marginHorizontal: 5,
  },
  commentBox: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: '#fff',
    backgroundColor: '#333',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#2E7C81',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily:'outfit',
    color: '#fff',
    fontSize: 16,
  },
  separator: {
    height: 1,
    marginVertical: 20,
  },
  usersFeedback: {
    marginVertical: 20,
  },
  usersFeedbackText: {
    fontSize: 18,
    fontFamily:'quicksand',
    color: '#fff',
  },
  reviewsContainer: {
    flex: 1,
  },
  reviewCard: {
    backgroundColor: '#1C2A38',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    position: 'relative',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileIcon: {
    marginRight: 10,
  },
  reviewText: {
    fontSize: 14,
    color: '#cccccc',
  },
  reviewTextUsername: {
    fontSize: 14,
    color: '#CCCCCC',
    marginHorizontal: 10
  },
  likeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  likeCount: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
    marginTop: 3,
  },
  starsContainerReview: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  reviewTextDate: {
    fontSize: 12,
    color: '#777',
    flexDirection: 'row',
    marginTop: 0,
    marginLeft:8,
  },
  editButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    padding: 5,
  },
});
