import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter } from "expo-router";
import { get, ref, update } from "firebase/database";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "./../../../configs/FirebaseConfig";

// Import multiple quiz JSON files
// Adjust these import paths based on your actual file structure
import SE from "./../../../components/quiz/SE.json";
import ML from "./../../../components/quiz/ML.json";
import CS from "./../../../components/quiz/cs.json";
import DS from "./../../../components/quiz/datascience.json";
import mobile from "./../../../components/quiz/mobile.json";
import frontend from "./../../../components/quiz/frontend.json";

// Combine multiple quiz data files into one object
// Each file assumed to follow the structure { "categories": [ { "name": ..., "questions": [...] }, ... ] }
const quizFiles = [SE, ML, CS, DS, mobile, frontend];

const quizData = quizFiles
  .flatMap((file) => file.categories)
  .reduce((acc, categoryObj) => {
    acc[categoryObj.name] = {
      title: categoryObj.name,
      questions: categoryObj.questions,
    };
    return acc;
  }, {});

const badgeImages = {
  "Newbie Badge": require("./../../../assets/images/badges/newbie.png"),
  "Intermediate Badge": require("./../../../assets/images/badges/intermediate.png"),
  "Advanced Badge": require("./../../../assets/images/badges/advanced.png"),
  "Expert Badge": require("./../../../assets/images/badges/expert.png"),
};

export default function ChooseCategory() {
  const router = useRouter();
  const categories = Object.keys(quizData);
  const [userProgress, setUserProgress] = useState({});
  const [userBadges, setUserBadges] = useState([]);
  const [userLevel, setUserLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [leaderboardModalVisible, setLeaderboardModalVisible] = useState(false);
  const [topContributors, setTopContributors] = useState([]);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    loadUserProgress();
    loadUserBadgesAndLevel();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      const usersSnapshot = await get(ref(db, "users"));
      const usersData = usersSnapshot.val();

      const leaderboard = Object.keys(usersData).map((uid) => {
        const user = usersData[uid];
        const profile = user.profile || {};
        return {
          userId: uid,
          userName: user.userName,
          profilePicture:
            user.profilePicture || "https://example.com/default-profile.png",
          level: calculateLevel(user.quizProgress),
          badges: profile.badges || [],
        };
      });

      const sortedLeaderboard = leaderboard
        .sort((a, b) => b.level - a.level)
        .slice(0, 10);
      setTopContributors(sortedLeaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    }
  };

  const calculateLevel = (quizProgress) => {
    if (!quizProgress) return 1;
    const totalPoints = Object.values(quizProgress).reduce(
      (acc, progress) => acc + (progress.score || 0),
      0
    );
    return Math.floor(totalPoints / 100) + 1;
  };

  const handleLeaderboardPress = async () => {
    await fetchLeaderboardData();
    setLeaderboardModalVisible(true);
  };

  const loadUserProgress = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const quizProgressRef = ref(db, `users/${user.uid}/quizProgress`);
        const snapshot = await get(quizProgressRef);
        if (snapshot.exists()) {
          const progressData = snapshot.val();
          setUserProgress(progressData);

          // Calculate total points
          const points = Object.keys(progressData).reduce((acc, category) => {
            return acc + (progressData[category].score || 0);
          }, 0);
          setTotalPoints(points);

          // Calculate and set user level based on total points
          const newLevel = Math.floor(points / 100) + 1;
          setUserLevel(newLevel);

          // Update badges based on level
          const earnedBadges = calculateBadges(newLevel);
          setUserBadges(earnedBadges);

          // Save earned badges to database
          await update(ref(db, `users/${user.uid}/profile`), {
            badges: earnedBadges,
          });
        }
      }
    } catch (error) {
      console.log("Error loading user progress: ", error);
    }
  };

  const loadUserBadgesAndLevel = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(db, `users/${user.uid}/profile`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const { badges } = snapshot.val();
          setUserBadges(badges || []);
        }
      }
    } catch (error) {
      console.log("Error loading user badges: ", error);
    }
  };

  const calculateBadges = (level) => {
    const earnedBadges = [];
    if (level >= 1)
      earnedBadges.push({
        name: "Newbie Badge",
        image: badgeImages["Newbie Badge"],
      });
    if (level >= 5)
      earnedBadges.push({
        name: "Intermediate Badge",
        image: badgeImages["Intermediate Badge"],
      });
    if (level >= 10)
      earnedBadges.push({
        name: "Advanced Badge",
        image: badgeImages["Advanced Badge"],
      });
    if (level >= 20)
      earnedBadges.push({
        name: "Expert Badge",
        image: badgeImages["Expert Badge"],
      });
    return earnedBadges;
  };

  const handleCategorySelect = (category) => {
    router.push({
      pathname: "./../knowledge-quiz",
      params: { category },
    });
  };

  const BackPress = () => {
    router.replace("./../../(tabs)/dashboard");
  };

  const getProgressPercentage = (category) => {
    if (userProgress[category]) {
      const { currentQuestionIndex } = userProgress[category];
      const totalQuestions = quizData[category].questions.length;
      const progress = Math.round(
        ((currentQuestionIndex + 1) / totalQuestions) * 100
      );
      return userProgress[category].completed ? 100 : progress;
    }
    return 0;
  };

  const isCategoryCompleted = (category) => {
    return userProgress[category]?.completed || false;
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadUserProgress().then(() => {
      setIsRefreshing(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={BackPress}>
          <Ionicons name="arrow-back" size={24} color="#C1C1C1" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Categories</Text>
        <TouchableOpacity
          style={styles.leaderboardButton}
          onPress={handleLeaderboardPress}
        >
          <Ionicons name="trophy-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {/* User Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>Level {userLevel}</Text>
          <Text style={styles.pointsText}>{totalPoints} Points</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgeScroll}
        >
          {userBadges.length > 0 ? (
            userBadges.map((badge, index) => (
              <View key={index} style={styles.badgeItem}>
                <Image source={badge.image} style={styles.badgeImage} />
              </View>
            ))
          ) : (
            <Text style={styles.noBadgesText}>
              Complete quizzes to earn badges
            </Text>
          )}
        </ScrollView>
      </View>

      {/* Categories List */}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryCard}
            onPress={() => handleCategorySelect(category)}
          >
            <View style={styles.categoryContent}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>
                  {quizData[category].title}
                </Text>
                <Text style={styles.categoryPoints}>
                  {userProgress[category]?.score || 0} pts
                </Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${getProgressPercentage(category)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {getProgressPercentage(category)}%
                </Text>
              </View>

              {isCategoryCompleted(category) && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Leaderboard Modal */}
      <Modal
        visible={leaderboardModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLeaderboardModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Top Users</Text>
            <ScrollView style={styles.leaderboardList}>
              {topContributors.slice(0, 5).map((contributor, index) => (
                <View key={index} style={styles.leaderboardItem}>
                  {/* User Info */}
                  <View style={styles.userSection}>
                    {/* Rank and Medal */}
                    <View style={styles.rankSection}>
                      <Text
                        style={[
                          styles.rankNumber,
                          {
                            color:
                              index < 3
                                ? ["#FFD700", "#C0C0C0", "#CD7F32"][index]
                                : "#fff",
                          },
                        ]}
                      >
                        #{index + 1}
                      </Text>
                      {index < 3 && (
                        <FontAwesome5
                          name="medal"
                          size={20}
                          color={["#FFD700", "#C0C0C0", "#CD7F32"][index]}
                          style={styles.medalIcon}
                        />
                      )}
                    </View>
                    <Image
                      source={{ uri: contributor.profilePicture }}
                      style={styles.leaderboardAvatar}
                    />
                    <View style={styles.userInfo}>
                      <Text style={styles.leaderboardName}>
                        {contributor.userName}
                      </Text>
                      <View style={styles.levelBadgeContainer}>
                        <Text style={styles.leaderboardLevel}>
                          Level {contributor.level}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Badges Section */}
                  <View style={styles.badgesSection}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {contributor.level >= 1 && (
                        <View style={styles.badgeWrapper}>
                          <Image
                            source={badgeImages["Newbie Badge"]}
                            style={styles.leaderboardBadge}
                          />
                        </View>
                      )}
                      {contributor.level >= 5 && (
                        <View style={styles.badgeWrapper}>
                          <Image
                            source={badgeImages["Intermediate Badge"]}
                            style={styles.leaderboardBadge}
                          />
                        </View>
                      )}
                      {contributor.level >= 10 && (
                        <View style={styles.badgeWrapper}>
                          <Image
                            source={badgeImages["Advanced Badge"]}
                            style={styles.leaderboardBadge}
                          />
                        </View>
                      )}
                      {contributor.level >= 20 && (
                        <View style={styles.badgeWrapper}>
                          <Image
                            source={badgeImages["Expert Badge"]}
                            style={styles.leaderboardBadge}
                          />
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Badge Legend */}
            <View style={styles.badgeLegend}>
              <Text style={styles.legendTitle}>Badge Requirements:</Text>
              <View style={styles.legendItem}>
                <Image
                  source={badgeImages["Newbie Badge"]}
                  style={styles.legendBadge}
                />
                <Text style={styles.legendText}>Newbie / Level 1+</Text>
              </View>
              <View style={styles.legendItem}>
                <Image
                  source={badgeImages["Intermediate Badge"]}
                  style={styles.legendBadge}
                />
                <Text style={styles.legendText}>Intermediate / Level 5+</Text>
              </View>
              <View style={styles.legendItem}>
                <Image
                  source={badgeImages["Advanced Badge"]}
                  style={styles.legendBadge}
                />
                <Text style={styles.legendText}>Advanced / Level 10+</Text>
              </View>
              <View style={styles.legendItem}>
                <Image
                  source={badgeImages["Expert Badge"]}
                  style={styles.legendBadge}
                />
                <Text style={styles.legendText}>Expert / Level 20+</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setLeaderboardModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#292929",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#1F1F1F",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  backButton: {
    padding: 8,
  },
  leaderboardButton: {
    padding: 8,
  },
  statsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#1F1F1F",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#333",
  },
  levelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  levelText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  pointsText: {
    fontSize: 18,
    color: "#ccc",
  },
  badgeScroll: {
    marginTop: 8,
  },
  badgeItem: {
    marginRight: 12,
  },
  badgeImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  noBadgesText: {
    color: "#999",
    fontSize: 14,
  },
  scrollContainer: {
    padding: 16,
  },
  categoryCard: {
    backgroundColor: "#1F1F1F",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#333",
  },
  categoryContent: {
    padding: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  categoryPoints: {
    fontSize: 16,
    color: "#ccc",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBackground: {
    height: 6,
    backgroundColor: "#404040",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#ccc",
    marginTop: 4,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  completedText: {
    fontSize: 14,
    color: "#4CAF50",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "80%",
    backgroundColor: "#1F1F1F",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
  },
  leaderboardList: {
    maxHeight: 400,
  },
  leaderboardItem: {
    flexDirection: "column",
    padding: 16,
    backgroundColor: "#262626",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  rankSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: -5,
    marginRight: 10,
    justifyContent: "center",
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  medalIcon: {
    marginLeft: 4,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  leaderboardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#333",
  },
  userInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  levelBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  leaderboardLevel: {
    fontSize: 14,
    color: "#ccc",
    backgroundColor: "#333",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgesSection: {
    marginTop: -5,
  },
  badgeWrapper: {
    marginRight: 8,
    alignItems: "center",
  },
  leaderboardBadge: {
    width: 32,
    height: 35,
    borderRadius: 16,
  },
  badgeLegend: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#262626",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  legendText: {
    color: "#ccc",
    fontSize: 12,
  },
  modalCloseButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  modalCloseText: {
    color: "#C1C1C1",
  },
});
