import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ContentDisplay = ({ selectedLanguage, selectedTopic, goBack }) => {
  const content = selectedTopic; // Use the passed selectedTopic directly

  return (
    <View style={styles.container}>
      <View style={styles.maintitle}>
      <TouchableOpacity onPress={goBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={30} color="#E5E5E5" />
      </TouchableOpacity>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.header}>{content.title}</Text>
      </View>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.contentContainer}>
        <Text style={styles.contentText}>
          <Text style={styles.boldText}>Description:</Text> {"\n"}
          {content.description}
        </Text>
        <Text style={styles.boldText}>Example:</Text>
        {/* Code Block Styled */}
        <View style={styles.codeBlockContainer}>
          <Text style={styles.codeBlock}>{content.example}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  maintitle: {
    marginBottom: 5,
    marginVertical: 40,
    margin: 15,
    alignItems: 'center',
    flexDirection: 'row'
  },
  maintitleText: {
      fontSize: 20,
      color: 'white',
      fontFamily: 'quicksand'
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#292929", // Light background for a clean look
    marginBottom: -40,
    marginTop: -40,
    paddingVertical: 35
  },
  backButton: {
    marginTop: -9,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "300",
    color: "#666666", // Light gray for subtlety
    marginBottom: 15,
  },
  contentContainer: {
    backgroundColor: "#1f1f1f",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    paddingBottom: 230,
    flex: 1,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3, // Subtle shadow for raised effect
  },
  contentText: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 26,
    marginBottom: 15,
  },
  boldText: {
    fontWeight: "600",
    fontSize: 18,
    color: "#4CAF50",
  },
  codeBlockContainer: {
    backgroundColor: "#F5F5F5", // Light gray for code block
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
  },
  codeBlock: {
    fontFamily: "monospace",
    fontSize: 15,
    lineHeight: 22,
    color: "#333333",
  },
});

export default ContentDisplay;
