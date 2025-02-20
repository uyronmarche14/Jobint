// components/JobSelectionStyles.js

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  selectionContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  selectionSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  optionsContainerColumn: {
    flexDirection: 'column', // Now displaying items in a column
    justifyContent: 'space-around',
  },
  optionButton: {
    padding: 15,
    backgroundColor: "#1C2A38",
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10, // Add some spacing between buttons
  },
  optionButtonActive: {
    backgroundColor: "#2E7C81",
  },
  optionButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  optionButtonTextActive: {
    fontWeight: "bold",
  },
});

