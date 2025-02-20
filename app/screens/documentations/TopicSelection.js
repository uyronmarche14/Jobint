import { FontAwesome5, Ionicons } from "@expo/vector-icons"; // Use icons for topics
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TopicSelection = ({
  selectedLanguage,
  selectedTopics,
  setSelectedTopic,
  setStep,
  goBack,
}) => {
  const [searchText, setSearchText] = useState("");
  const [filteredTopics, setFilteredTopics] = useState(selectedTopics);
  const [selectedLevel, setSelectedLevel] = useState(""); // New state for the selected level
  const [showFilter, setShowFilter] = useState(false); // Toggle filter options

  // Levels for filtering
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  // Function to handle the search and filter topics by title or level
  const handleSearch = (text) => {
    setSearchText(text);
    filterTopics(text, selectedLevel);
  };

  // Function to filter topics based on search text and selected level
  const filterTopics = (searchText, level) => {
    let filtered = selectedTopics;

    if (searchText) {
      filtered = filtered.filter(
        (topic) =>
          topic.title.toLowerCase().includes(searchText.toLowerCase()) ||
          topic.level.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (level && level !== "All") {
      filtered = filtered.filter((topic) => topic.level === level);
    }

    setFilteredTopics(filtered);
  };

  // Handle the level filter change
  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    filterTopics(searchText, level);
    setShowFilter(false); // Hide filter dropdown after selection
  };

  return (
    <View style={styles.container}>
      <View style={styles.maintitle}>
        <TouchableOpacity style={styles.backbutton} onPress={goBack}>
            <Ionicons name="arrow-back" size={30} color="#E5E5E5" />
        </TouchableOpacity>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={styles.maintitleText}>Topic in {selectedLanguage}:</Text>
      </View>
      <View style={{ width: 30 }} />
      </View>
      {/* Search Bar and Filter Button in a row */}
      <View style={styles.searchFilterRow}>
        {/* Search Bar */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search by title or level (e.g., Beginner)"
          value={searchText}
          onChangeText={handleSearch}
        />

        {/* Filter Button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter(!showFilter)}
        >
          <FontAwesome5 name="filter" size={17} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Show filter options */}
      {showFilter && (
        <View style={styles.filterOptions}>
          {levels.map((level, index) => (
            <React.Fragment key={level}>
              <TouchableOpacity
                style={styles.filterOption}
                onPress={() => handleLevelChange(level)}
              >
                <Text style={styles.filterOptionText}>{level}</Text>
              </TouchableOpacity>
              {/* Add a divider below each option except the last one */}
              {index < levels.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.topicContainer}>
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic, index) => (
            <TouchableOpacity
              key={index}
              style={styles.topicCard}
              onPress={() => {
                setSelectedTopic(topic);
                setStep(3); // Move to content display
              }}
            >
              <View style={styles.topicCardContent}>
                {/* Use different icons for different topic types */}
                <FontAwesome5
                  name={topic.type === "Basics" ? "book" : "lightbulb"}
                  size={24}
                  color={topic.type === "Basics" ? "#4CAF50" : "#FDD835"}
                />
                <View style={styles.textWrapper}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicSubText}>
                    Level: {topic.level} | Type: {topic.type}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noTopics}>
            No topics available for "{searchText}".
          </Text>
        )}
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
    backgroundColor: "#292929",
    marginTop: -40,
    marginBottom: -40,
    paddingVertical: 30,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    paddingHorizontal: 20,
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  searchFilterRow: {
    flexDirection: "row", // Places items in a row
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 15,
    marginTop: 15,
  },
  searchBar: {
    flex: 1, // Takes up the remaining space
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    marginRight: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF", // Matches the search bar background
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  filterButtonText: {
    color: "#333",
    fontSize: 16,
  },
  filterOptions: {
    position: "absolute",
    zIndex: 999,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderColor: "#E0E0E0",
    top: 185,
    borderWidth: 1,
    width: "27%",
    alignSelf: "flex-end",
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  filterOptionText: {
    color: "#333",
    fontSize: 14,
    textAlign: "center",
  },
  topicContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 130
  },
  topicCard: {
    backgroundColor: "#1f1f1f",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    width: "90%",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  topicCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  textWrapper: {
    marginLeft: 15,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  topicSubText: {
    fontSize: 14,
    color: "#CCCCCC",
    marginTop: 5,
  },
  noTopics: {
    color: "#FF0000",
    fontSize: 18,
    marginTop: 50,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0", // Light gray color for the divider
    marginVertical: 2, // Adds space between the divider and the text
  },
});

export default TopicSelection;
