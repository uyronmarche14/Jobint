// components/styles.js

import { StyleSheet } from "react-native";

export const colors = {
  primary: "#6200ee",
  secondary: "#03dac4",
  background: "#f5f5f5",
  text: "#000000",
  lightText: "#6b6b6b",
  placeholder: "#cccccc", // Added placeholder color
};

export const styles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  selectionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: "center",
  },
  selectionSection: {
    marginBottom: 40, // Added space between sections for cleaner layout
  },

  // Text Styles
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 20, // Ensure there's space below the title
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
    textAlign: "center",
  },
  questionText: {
    fontSize: 18,
    color: colors.text,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary, // Use primary color for title
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22, // Adjust line height for better readability
    textAlign: "left", // Left align text for a cleaner look
  },

  // Button Styles
  quitButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#ff1744",
    padding: 10,
    borderRadius: 5,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  inputMethodSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  inputMethodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderColor: colors.primary,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 5,
    flexDirection: "row",
    justifyContent: "center",
  },
  inputMethodButtonActive: {
    backgroundColor: colors.primary,
  },
  inputMethodButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  recordButton: {
    flexDirection: "row",
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  recordButtonActive: {
    backgroundColor: "#ff1744",
  },
  playButton: {
    flexDirection: "row",
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    justifyContent: "center",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    justifyContent: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },

  // Card Styles
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 5,
    marginBottom: 20,
    elevation: 3, // For slight shadow on Android
    shadowColor: "#000", // Slight shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  inputCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  feedbackContainer: {
    backgroundColor: "#f9f9f9", // Light background for feedback section
    padding: 15,
    borderRadius: 10, // Rounded corners for smoother appearance
    marginVertical: 20,
    borderColor: colors.primary, // Optional border to highlight feedback area
    borderWidth: 1,
  },

  // Input Styles
  input: {
    height: 100,
    borderColor: colors.placeholder,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    textAlignVertical: "top",
    color: colors.text,
  },

  // Progress Bar
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginVertical: 10,
  },

  // Timer Styles
  timerContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  timerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
  },

  // Recording Section
  recordingSection: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },

  // Emotion Feedback Styles (if needed)
  emotionFeedback: {
    fontSize: 16,
    color: colors.text,
    marginTop: 10,
  },
});
