import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ref as dbRef, get } from "firebase/database";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/FontAwesome"; // Import the icon library
import { auth, db } from "./../../configs/FirebaseConfig";
import { Colors } from "./../../constants/Colors";

export default function Profile() {
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

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
              setFullName(userData.fullName || user.email || "Anonymous");
              setProfilePicture(userData.profilePicture || ""); // Ensure profilePicture is handled
            } else {
              console.log("No data available");
              setFullName(user.email || "Anonymous");
              setUserName("Hello world"); // Ensure default value is set
              setProfilePicture(""); // Ensure default value is set
            }
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            Alert.alert(
              "Error",
              "Could not retrieve data. Please try again later."
            );
            setFullName(user.email || "Anonymous");
            setUserName("Hello world"); // Ensure default value is set
            setProfilePicture(""); // Ensure default value is set
          });
      }
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              await auth.signOut(); // Sign out the user from Firebase Auth
              await AsyncStorage.removeItem("userToken"); // Clear token from AsyncStorage (if used)
              router.replace("auth/login"); // Navigate back to login screen
              Toast.show({
                type: "success",
                text1: "Success!",
                text2: "You’ve been logged out. Until next time!",
                position: "top",
                visibilityTime: 4000,
              });
            } catch (error) {
              Alert.alert(
                "Error",
                "An error occurred while logging out. Please try again."
              );
              console.error("Logout error:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    await AsyncStorage.setItem("isDarkMode", newDarkMode.toString());
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#292929" }}>
      <View style={styles.profileWrapper}>
        <View style={[styles.profileSection, styles.profileSectionLeft]}>
          <View style={styles.imageWrapper}>
            {profilePicture ? (
              <Image
                source={{
                  uri: profilePicture || "default-placeholder-image-url",
                }}
                style={styles.profilePic}
              />
            ) : (
              <View style={styles.profilePicPlaceholder}>
                <Icon name="user" size={50} color="raleway-bold" />
              </View>
            )}
          </View>
          {uploading && <ActivityIndicator size="large" color="#0000ff" />}
          <Text style={[styles.userName, { color: "#fff" }]}>{userName}</Text>
          <Text style={[styles.fullName, { color: "#c1c1c1" }]}>
            {fullName}
          </Text>
        </View>

        <View
          style={[
            styles.editProfileButtonWrapper,
            { backgroundColor: "#2E7C81", borderRadius: 13 },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.push("./../screens/edit-profile")}
            style={styles.editButton}
          >
            <Text style={[styles.editButtonText, { color: "#e5e5e5" }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Container */}
      <View style={[styles.container, { backgroundColor: "#fff" }]}>
        <View style={styles.optionsContainer}>
          {/*
          <TouchableOpacity onPress={() => router.push('./../screens/about-app')}style={styles.optionabout}>
            <MaterialIcons name="notes" size={27} color={"#1C2A38"} />
            <Text style={[styles.optionText, { color: "#1C2A38", fontFamily: 'outfit' }]}>Activity History</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={"#1C2A38"}
              style={{ marginLeft: 'auto' }} // pushes the icon to the right
            />
          </TouchableOpacity>
           
          <View style={[styles.separator, { backgroundColor: "#1C2A38" }]} />
*/}
          {/* Rate our App */}
          <TouchableOpacity
            onPress={() => router.push("./../screens/rate-our-app")}
            style={styles.optionabout}
          >
            <Feather name="star" size={27} color={"#1C2A38"} />
            <Text
              style={[
                styles.optionText,
                { color: "#1C2A38", fontFamily: "outfit" },
              ]}
            >
              Rate our app
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={"#1C2A38"}
              style={{ marginLeft: "auto" }} // pushes the icon to the right
            />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: "#1C2A38" }]} />

          {/* About This App */}
          <TouchableOpacity
            onPress={() => router.push("./../screens/about-app")}
            style={styles.optionabout}
          >
            <Feather name="info" size={27} color={"#1C2A38"} />
            <Text
              style={[
                styles.optionText,
                { color: "#1C2A38", fontFamily: "outfit" },
              ]}
            >
              About
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={"#1C2A38"}
              style={{ marginLeft: "auto" }} // pushes the icon to the right
            />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: "#1C2A38" }]} />

          {/* Logout */}
          <TouchableOpacity style={styles.optionlogout} onPress={handleLogout}>
            <Feather name="log-out" size={27} color={"#1C2A38"} />
            <Text
              style={[
                styles.optionText,
                { color: "#1C2A38", fontFamily: "outfit" },
              ]}
            >
              Logout
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={"#1C2A38"}
              style={{ marginLeft: "auto" }} // pushes the icon to the right
            />
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: "#1C2A38" }]} />
        </View>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    height: "100%",
    padding: 30,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    // Elevation for Android
    elevation: 50,
  },
  scrollContainer: {
    paddingBottom: "100%", // adds some padding at the bottom
    flexGrow: 1,
  },
  profileSection: {
    alignItems: "center",
    justifyContent: "center", // Center horizontally and vertically
    marginBottom: 10,
  },
  imageWrapper: {
    alignItems: "center",
  },
  profileWrapper: {
    alignItems: "center",
    marginTop: height * 0.1, // Move the profile section down (10% of the screen height)
  },
  profilePic: {
    width: width * 0.4, // 30% of the screen width for responsive sizing
    height: width * 0.4, // Same as width to make it a square
    borderRadius: (width * 0.3) / 1, // Half of the width to make it a circle
    marginTop: height * 0.01, // 5% of the screen height to move it slightly down
  },
  profilePicPlaceholder: {
    width: width * 0.4, // Adjusted for a circle
    height: width * 0.4, // Same as width for a square shape
    borderRadius: (width * 0.3) / 1, // Circle
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    lineHeight: width * 0.3, // Centers the text vertically
  },
  userName: {
    fontSize: 25,
    fontFamily: "outfit",
    marginTop: -5, // Space above the username
    marginBottom: -15, // Space below the username
    margin: "auto",
    padding: 19,
  },
  fullName: {
    fontSize: 15,
    fontFamily: "outfit",
    marginBottom: -5, // Space below the full name
    textAlign: "center",
    color: Colors.GRAY,
  },
  editProfileButtonWrapper: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    height: 31,
    width: 112,
    borderRadius: 20,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 13,
    marginTop: -4,
    textAlign: "center",
    fontFamily: "outfit-bold",
  },
  optionsContainer: {},
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  optionText: {
    fontSize: 17,
    marginLeft: 50,
  },
  optionabout: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  optionlogout: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  separator: {
    height: 1,
    width: 370,
    margin: "auto",
    backgroundColor: "#000",
    marginVertical: 10,
  },
  profilestatsContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
    marginTop: -13,
  },
  profstatsText: {
    fontSize: 17,
    fontFamily: "outfit",
    marginLeft: 50,
  },
});
