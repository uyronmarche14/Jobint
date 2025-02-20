import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <View style={styles.tabs}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "Problem" && styles.activeTab]}
        onPress={() => setActiveTab("Problem")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "Problem" && styles.activeTabText,
          ]}
        >
          Problem
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "Hints" && styles.activeTab]}
        onPress={() => setActiveTab("Hints")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "Hints" && styles.activeTabText,
          ]}
        >
          Hints
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === "Solution" && styles.activeTab]}
        onPress={() => setActiveTab("Solution")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "Solution" && styles.activeTabText,
          ]}
        >
          Solution
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#292929", // Darker background to contrast with the tabs
    paddingVertical: 12,
    borderRadius: 12, // Rounded corners for modern design
    marginBottom: 12,
    elevation: 5, // Adds a subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    backgroundColor: "#3E3E3E", // Dark gray background for tabs
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeTab: {
    backgroundColor: "#4CAF50", // Solid green for active tab
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8, // Larger shadow for active tab to make it stand out
  },
  tabText: {
    color: "#A5A5A5", // Subtle gray for inactive tabs
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF", // White text for active tab
    fontWeight: "600",
  },
});

export default Tabs;
