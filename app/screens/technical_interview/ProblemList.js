import { FontAwesome } from "@expo/vector-icons"; // Icon library for better visual design
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import problemsData from "./problems.json"; // Import your problems data

const ProblemList = ({ onProblemSelect }) => {
  const [searchText, setSearchText] = useState(""); // State for search input
  const [filteredDifficulty, setFilteredDifficulty] = useState("All"); // State for filtering by difficulty
  const [showDropdown, setShowDropdown] = useState(false); // Dropdown visibility state

  // Function to filter the problem list based on search and difficulty
  const filteredProblems = problemsData.filter((problem) => {
    const matchesSearch = problem.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesDifficulty =
      filteredDifficulty === "All" || problem.difficulty === filteredDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  // Function to dynamically change the difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "#4CAF50"; // Green for Easy
      case "Medium":
        return "#FFC107"; // Yellow for Medium
      case "Hard":
        return "#F44336"; // Red for Hard
      default:
        return "#4CAF50"; // Default to green if difficulty is missing
    }
  };

  const renderProblemItem = ({ item }) => (
    <TouchableOpacity
      style={styles.problemCard}
      onPress={() => onProblemSelect(item)} // Use onProblemSelect to switch screen
    >
      <View style={styles.cardHeader}>
        {/* Title and Difficulty aligned side by side */}
        <Text style={styles.problemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(item.difficulty) },
          ]}
        >
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>

      <Text style={styles.problemDescription} numberOfLines={2}>
        {item.description.split("\n")[0]}... {/* Show the first sentence */}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.hintContainer}>
          <FontAwesome name="lightbulb-o" size={20} color="#FFD700" />
          <Text style={styles.hintText}> {item.hints.length} Hints</Text>
        </View>
        <View style={styles.accuracyContainer}>
          <FontAwesome name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.accuracyText}> {item.accuracy}Accuracy</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search and Filter section */}
      <View style={styles.searchAndFilterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search problem..."
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Filter Icon for Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <FontAwesome name="filter" size={24} color="#FFF" />
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdownMenu}>
              {["All", "Easy", "Medium", "Hard"].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.dropdownItem,
                    level === "All" && { backgroundColor: "#2196F3" }, // Blue for All
                    level === "Easy" && { backgroundColor: "#4CAF50" }, // Green for Easy
                    level === "Medium" && { backgroundColor: "#FFC107" }, // Yellow for Medium
                    level === "Hard" && { backgroundColor: "#F44336" }, // Red for Hard
                    filteredDifficulty === level && styles.activeDropdownItem, // Highlight active item
                  ]}
                  onPress={() => {
                    setFilteredDifficulty(level);
                    setShowDropdown(false); // Close the dropdown after selection
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      filteredDifficulty === level &&
                        styles.activeDropdownItemText, // Bold text for active item
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* List of filtered problems */}
      <FlatList
        data={filteredProblems}
        renderItem={renderProblemItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 130 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    padding: 10,
  },
  searchAndFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  dropdownContainer: {
    position: "relative",
    zIndex: 1, // Ensure dropdown appears above other content
  },
  iconButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#009688",
  },
  dropdownMenu: {
    position: "absolute",
    top: 50, // Adjust this value to place the dropdown below the filter icon
    right: 0,
    width: "250%", // Adjust the width to fit the text properly
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    zIndex: 9999, // Ensure high z-index for dropdown visibility
    elevation: 5, // Android specific for dropdown visibility
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50", // Add background color for dropdown items
    marginVertical: 5, // Add spacing between dropdown items
  },
  activeDropdownItem: {},
  dropdownItemText: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  activeDropdownItemText: {
    fontWeight: "bold",
  },
  problemCard: {
    backgroundColor: "#1F1F1F",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Ensures items align correctly in a row
    marginBottom: 10, // Add some spacing between the title and description
  },
  problemTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1, // Ensure title takes up available space
    marginRight: 10, // Add margin to separate from difficulty badge
  },
  difficultyBadge: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  difficultyText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  problemDescription: {
    color: "#A5A5A5",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  hintText: {
    color: "#FFD700",
    fontSize: 14,
    marginLeft: 5,
  },
  accuracyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  accuracyText: {
    color: "#4CAF50",
    fontSize: 14,
    marginLeft: 5,
  },
});

export default ProblemList;
