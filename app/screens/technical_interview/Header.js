import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Header = ({ showHeaderText }) => {
  console.log("Show header text: ", showHeaderText); // Debugging prop

  return (
    <View style={styles.header}>
      {showHeaderText ? (
        <Text style={styles.title}>QUESTIONS</Text>
      ) : (
        <Text style={styles.titleHidden}></Text> // Ensure proper spacing when hidden
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50,
    backgroundColor: "#2E2E2E",
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  titleHidden: {
    fontSize: 0, // Hide the text without affecting layout
  },
});

export default Header;
