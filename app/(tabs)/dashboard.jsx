import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ref as dbRef, get, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import registerForPushNotificationsAsync from "../../configs/registerForPushNotificationsAsync";
import { auth, db } from "./../../configs/FirebaseConfig";

import Pic3 from "../../assets/images/comdisc.png";
import { default as Pic2, default as Pic4 } from "../../assets/images/kq.png";
import Pic1 from "../../assets/images/rockett.png";
import Pic5 from "../../assets/images/tips-and-tricks.png";

const QuickStart = [{ Picture: Pic1 }];
const ResumeGenerator = [{ Picture: Pic2 }];
const CommunityDiscussion = [{ Picture: Pic3 }];
const TipsSuggestion = [{ Picture: Pic5 }];
const Genquiz = [{ Picture: Pic4 }];

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const router = useRouter();
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );

  const getResponsiveFontSize = (baseFontSize) => {
    const scale = screenWidth / 375;
    return Math.round(baseFontSize * scale);
  };

  useEffect(() => {
    const onChange = ({ window }) => {
      setScreenWidth(window.width);
    };

    const subscription = Dimensions.addEventListener("change", onChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  const communitydiscussion = () => {
    router.replace("./../screens/community-discussions");
  };

  useFocusEffect(
    React.useCallback(() => {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        const userRef = dbRef(db, `users/${userId}`);

        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.val();
              setUserName(userData.userName || "Hello world");
              setProfilePicture(userData.profilePicture || "");
            } else {
              console.log("No data available");
              setUserName("Hello world");
              setProfilePicture("");
            }
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            Alert.alert(
              "Error",
              "Could not retrieve data. Please try again later."
            );
            setUserName("Hello world");
            setProfilePicture("");
          });
      }
    }, [])
  );

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      registerForPushNotificationsAsync(userId).then((token) => {
        if (token) {
          console.log(`User ${userId} registered with token: ${token}`);
          const userRef = dbRef(db, `users/${userId}`);
          update(userRef, { pushToken: token })
            .then(() => console.log("Push token saved to Firebase"))
            .catch((error) => console.error("Error saving push token:", error));
        } else {
          console.log("No push token retrieved");
        }
      });
    }
  }, []);

  const quickStart = () => {
    router.push("./../screens/test/app");
  };

  const navigateToQuiz = () => {
    router.push("./../screens/choose-category");
  };

  const navigateToGeneralQuiz = () => {
    router.push("./../screens/general-quiz");
  };

  const tipsSuggestion = () => {
    router.push('./../screens/Tips/InterviewTips');
  };

  return (
    <View style={{ flexGrow: 1 }}>
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "#292929" }]}
      />

      <View style={styles.userHeader}>
        <Text style={styles.userSubHeaderText}>Hi {userName}!</Text>
        {profilePicture && (
          <Image
            source={{ uri: profilePicture }}
            style={styles.profilePictureHeader}
          />
        )}
      </View>
      <Text style={styles.userSubHeaderText2}>
        Let's not wait anymore, Let's do this
      </Text>
      <View style={styles.quickStartCard}>
        {QuickStart.map((Quickstart, index) => (
          <View
            key={index}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Image source={Quickstart.Picture} style={styles.profilePicture} />
            <View style={{ marginLeft: 15 }}>
              <TouchableOpacity onPress={quickStart}>
                <Text style={styles.text}>Get started with Jobint Helper</Text>
                <Text style={styles.text2}>Quick Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.generalquizCard}>
        {CommunityDiscussion.map((Comdisc, index) => (
          <View
            key={index}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Image source={Comdisc.Picture} style={styles.profilePicture} />
            <View style={{ marginLeft: 15 }}>
              <TouchableOpacity onPress={communitydiscussion}>
                <Text style={styles.text}>Share. Learn. Advise.</Text>
                <Text style={styles.text2}>Community Discussions</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.generalquizCard}>
        {TipsSuggestion.map((Comdisc, index) => (
          <View
            key={index}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Image source={Comdisc.Picture} style={styles.profilePicture} />
            <View style={{ marginLeft: 15 }}>
              <TouchableOpacity onPress={tipsSuggestion}>
                <Text style={styles.text}>Tips about your Interview</Text>
                <Text style={styles.text2}>Interview Suggestion</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.featuresContainer}>
        <FlatList
          data={[...ResumeGenerator, ...Genquiz]}
          numColumns={2}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <Image source={item.Picture} style={styles.profilePicture} />
              <View style={{ marginLeft: 10 }}>
                {item === ResumeGenerator[0] ? (
                  <TouchableOpacity onPress={navigateToQuiz}>
                    <Text style={styles.featureText}>Test and Grow</Text>
                    <Text style={styles.featureTitle}>Interactive Quiz</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={navigateToGeneralQuiz}>
                    <Text style={styles.featureText}>
                      Unlock your tech Path
                    </Text>
                    <Text style={styles.featureTitle}>General Quiz</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      </View>

      <View style={styles.TrendingTopics}>
        <Text style={styles.TrendingTopicsText}>Free Courses:</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.learningResources}>
          {/* Video Learning Resource */}
          <View style={styles.videoContainer}>
            <WebView
              source={{
                uri: "https://www.youtube.com/embed/lAFbKzO-fss?si=l0Dwr5baP3DeAOkL",
              }}
              style={styles.videoPlayer}
            />
          </View>
        </View>
        <View style={styles.learningResources2}>
          <View style={styles.videoContainer}>
            <WebView
              source={{
                uri: "https://www.youtube.com/embed/8jH07r6135o?si=eWjUZSgBxKdTCqv5",
              }}
              style={styles.videoPlayer}
            />
          </View>
        </View>
        <View style={styles.learningResources3}>
          <View style={styles.videoContainer}>
            <WebView
              source={{
                uri: "https://www.youtube.com/embed/ZcZu1NYx-WE?si=lRQDswdYiLuzkYe4",
              }}
              style={styles.videoPlayer}
            />
          </View>
        </View>
        <View style={styles.learningResources4}>
          <View style={styles.videoContainer}>
            <WebView
              source={{
                uri: "https://www.youtube.com/embed/_uQrJ0TkZlc?si=mwIM3kry67soC4T_",
              }}
              style={styles.videoPlayer}
            />
          </View>
        </View>
        <View style={styles.learningResources5}>
          <View style={styles.videoContainer}>
            <WebView
              source={{
                uri: "https://www.youtube.com/embed/nu_pCVPKzTk?si=4PFxj2HWabMhY-VE",
              }}
              style={styles.videoPlayer}
            />
          </View>
        </View>
        <View style={styles.learningResources6}>
          <View style={styles.videoContainer}>
            <WebView
              source={{
                uri: "https://www.youtube.com/embed/wxznTygnRfQ?si=MgR0t3AuI3oNwgjH",
              }}
              style={styles.videoPlayer}
            />
          </View>
        </View>
        <View style={styles.learningResources7}>
          <View style={styles.videoContainer}>
            <WebView
              source={{
                uri: "https://www.youtube.com/embed/-TkoO8Z07hI?si=AhWu7aEmDvcnITR2",
              }}
              style={styles.videoPlayer}
            />
          </View>
        </View>
        <View style={styles.learningResources8}>
          <View style={styles.videoContainer}>
            <WebView
              source={{
                uri: "https://www.youtube.com/embed/AmGSEH7QcDg?si=wjnvAx5n2D9X66We",
              }}
              style={styles.videoPlayer}
            />
          </View>
        </View>
        <View style={styles.learningResources9}>
          <View style={styles.videoContainer}>
            <WebView
              source={{
                uri: "https://www.youtube.com/embed/6UlU_FsicK8?si=34CT5QbjS01vfOhB",
              }}
              style={styles.videoPlayer}
            />
          </View>
        </View>
        <View style={styles.learningResources10}>
          <View style={styles.videoContainer}>
            <WebView
              source={{
                uri: "https://www.youtube.com/embed/xk4_1vDrzzo?si=EMfc4w5OQ2HNNT6r",
              }}
              style={styles.videoPlayer}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: "140%",
  },
  profilePictureHeader: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: "auto",
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 15,
    marginRight: 15,
    marginTop: 50,
  },
  userSubHeaderText: {
    fontSize: 28,
    fontFamily: "pt-regular",
    color: "#fff",
  },
  userSubHeaderText2: {
    fontFamily: "suse",
    fontSize: 16,
    color: "#A4A4A4",
    marginLeft: 15,
    marginBottom: 20,
  },
  quickStartCard: {
    backgroundColor: "#1F1F1F",
    padding: 15,
    margin: 15,
    borderRadius: 20,
    marginTop: -3,
    // Android elevation
    elevation: 5,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  generalquizCard: {
    backgroundColor: "#1F1F1F",
    padding: 15,
    margin: 18,
    borderRadius: 20,
    marginTop: -0,
    // Android elevation
    elevation: 5,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  profilePicture: {
    width: 55,
    height: 55,
    borderRadius: 25,
    alignItems: "center",
  },
  text: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "#E1D9D1",
  },
  text2: {
    fontFamily: "nunito-bold",
    fontSize: 19,
    color: "#fff",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginHorizontal: 10,
    marginTop: -8,
  },
  gridItem: {
    backgroundColor: "#1F1F1F",
    padding: 12,
    margin: 8,
    borderRadius: 15,
    width: "45%",
    alignItems: "center",
    justifyContent: "center",
    // Android elevation
    elevation: 5,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  featureText: {
    fontSize: 12,
    color: "#E1D9D1",
    textAlign: "center",
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: "nunito-bold",
    color: "#fff",
    textAlign: "center",
  },
  TrendingTopics: {
    marginLeft: 15,
    marginTop: 0,
    marginBottom: 5,
  },
  TrendingTopicsText: {
    fontFamily: "suse",
    fontSize: 20,
    color: "#fff",
  },
  learningResources: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#1F1F1F",
    borderRadius: 20,
    margin: 15,
    // Android elevation
    elevation: 5,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  learningResources2: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#1F1F1F",
    borderRadius: 20,
    margin: 15,
    // Android elevation
    elevation: 5,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  learningResources3: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#1F1F1F",
    borderRadius: 20,
    margin: 15,
    // Android elevation
    elevation: 5,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  learningResources4: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#1F1F1F",
    borderRadius: 20,
    margin: 15,
    // Android elevation
    elevation: 5,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  learningResources5: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#1F1F1F",
    borderRadius: 20,
    margin: 15,
    // Android elevation
    elevation: 5,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  learningResources6: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#1F1F1F",
    borderRadius: 20,
    margin: 15,
    // Android elevation
    elevation: 5,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  learningResources7: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#1F1F1F",
    borderRadius: 20,
    margin: 15,
    // Android elevation
    elevation: 5,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { w8dth: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  learningResources8: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#1F1F1F",
    borderRadius: 20,
    margin: 15,
    // Android elevation
    elevation: 5,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  learningResources9: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#1F1F1F",
    borderRadius: 20,
    margin: 15,
    // Android elevation
    elevation: 5,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  learningResources10: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: "#1F1F1F",
    borderRadius: 20,
    margin: 15,
    // Android elevation
    elevation: 5,
    // iOS shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Offset for the shadow
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  videoContainer: {
    height: 180,
  },
  videoPlayer: {
    flex: 1,
  },
});
