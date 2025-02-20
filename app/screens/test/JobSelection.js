import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from "react-native";
import { difficulties, jobTypes } from "./UTILS/constants";

// Mapping job types to readable labels
const jobTypeLabels = {
  datascience: "Data Science",
  softwareengineer: "Software Engineering",
  frontend: "Frontend Development",
  backend: "Backend Development",
  artificialIntelligence: "Artificial Intelligence",
  blockchain: "Blockchain",
  cloudeng: "Cloud Engineering",
  cybersecurity: "Cybersecurity",
  database: "Database Administration",
  embedded: "Embedded Systems",
  IT: "Information Technology",
  machineLearning: "Machine Learning",
  mobile: "Mobile Development",
};

const JobSelection = ({ jobType, setJobType, difficulty, setDifficulty }) => {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);

  const handleJobTypeSelect = (type) => {
    if (jobType !== type) {
      setJobType(type);
      setModalVisible(true);
    } else if (!isModalVisible) {
      setModalVisible(true);
    }
  };

  const handleDifficultySelect = (level) => {
    if (difficulty !== level) {
      setDifficulty(level);
    }
    setModalVisible(false);
    // Navigate to the next screen or perform any action here
  };

  const BackPress = () => {
    router.replace("./../../(tabs)/dashboard");
  };

  return (
    <View style={{ flexGrow: 1 }}>
      <LinearGradient
        colors={["#1E1E1E", "#121212"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.Header}>
        <TouchableOpacity style={styles.backbutton} onPress={BackPress}>
          <Ionicons name="arrow-back" size={30} color="#E5E5E5" />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.title}>Choose Job Type</Text>
        </View>

        {/* Placeholder to balance the back button */}
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.selectionContainer}>
        <View style={styles.optionsContainerColumn}>
          {jobTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.card, jobType === type && styles.cardActive]}
              onPress={() => handleJobTypeSelect(type)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={
                  jobType === type
                    ? ["#2E7C81", "#285D5E"]
                    : ["#2A2A2A", "#1F1F1F"]
                }
                style={styles.cardGradient}
              >
                <Text style={styles.cardTitle}>{jobTypeLabels[type]}</Text>
                <Text style={styles.cardDescription}>
                  {/* You can add descriptions for each job type here */}
                  Learn more about {jobTypeLabels[type]} roles.
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Difficulty Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={["#292929", "#000"]}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>Select Difficulty</Text>

              <View style={styles.optionsContainer}>
                {difficulties.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.optionButtonModal,
                      difficulty === level && styles.optionButtonActive,
                    ]}
                    onPress={() => handleDifficultySelect(level)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        difficulty === level && styles.optionButtonTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectionContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 45,
  },
  optionsContainerColumn: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  card: {
    width: "100%",
    marginVertical: 10,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 4,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: "#2E7C81",
  },
  cardGradient: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "#ccc",
  },
  optionButtonModal: {
    padding: 15,
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
    width: "100%",
  },
  optionButtonActive: {
    backgroundColor: "#2E7C81",
  },
  optionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  optionButtonTextActive: {
    fontWeight: "bold",
    color: "#FFF",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    width: "90%",
    borderRadius: 20,
    padding: 0,
    alignItems: "center",
    overflow: "hidden",
  },
  modalGradient: {
    padding: 20,
    width: "100%",
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#E74C3C",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "70%",
    elevation: 3,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backbutton: {
    margin: 3,
    marginTop: 40,
  },
  Header: {
    alignItems: "center",
    flexDirection: "row",
  },
});

export default JobSelection;
