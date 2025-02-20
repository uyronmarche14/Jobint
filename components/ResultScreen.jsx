import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ResultScreen({ result, onRetry, score }) {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0); // Initial opacity: 0
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state

  // Fade in animation when the result screen is shown
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 1000,
    easing: Easing.ease,
    useNativeDriver: true,
  }).start();

  const exit = () => {
    router.replace("./../../(tabs)/dashboard");
  };

  const toggleModal = () => setModalVisible(!modalVisible);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "#292929" }]}
      />

      <Animated.View style={[styles.resultContainer, { opacity: fadeAnim }]}>
        <Ionicons name="trophy" size={80} color="gold" />
        <Text style={styles.resultText}>Congratulations!</Text>
        <Text style={styles.categoryText}>
          You are best suited for:{" "}
          <Text style={styles.highlight}>{result}</Text>
        </Text>

        <TouchableOpacity style={styles.retryButton} onPress={exit}>
          <Text style={styles.retryButtonText}>Goodluck!</Text>
        </TouchableOpacity>

        {/* Button to view full results */}
        <TouchableOpacity
          style={styles.fullResultsButton}
          onPress={toggleModal}
        >
          <Text style={styles.fullResultsButtonText}>View Full Results</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal for detailed results */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detailed Results</Text>
            {Object.entries(score).map(([category, count], index) => (
              <View key={index} style={styles.resultRow}>
                <Text style={styles.resultCategory}>{category}</Text>
                <Text style={styles.resultCount}>Correct: {count}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultText: {
    fontSize: 30,
    color: "white",
    marginBottom: 20,
    fontFamily: "quicksand",
  },
  categoryText: {
    fontSize: 20,
    color: "#E5E5E5",
    textAlign: "center",
    marginBottom: 30,
  },
  highlight: {
    color: "gold",
    fontWeight: "bold",
    fontSize: 22,
  },
  retryButton: {
    backgroundColor: "#2E7C81",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
  },
  retryButtonText: {
    color: "white",
    fontSize: 18,
  },
  fullResultsButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  fullResultsButtonText: {
    color: "white",
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.😎",
  },
  modalContent: {
    backgroundColor: "#292929",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    color: "gold",
    marginBottom: 20,
    fontWeight: "bold",
  },
  resultRow: {
    width: "100%",
    marginVertical: 10,
    alignItems: "center",
  },
  resultCategory: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultCount: {
    color: "#FFD700",
    fontSize: 16,
    marginTop: 5, // Space between category and correct count
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#E53935",
    padding: 10,
    borderRadius: 10,
    width: "60%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
  },
});
