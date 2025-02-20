import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import Header from "../screens/technical_interview/Header"; // Header component
import ProblemList from "../screens/technical_interview/ProblemList"; // List of problems
import ProblemSection from "../screens/technical_interview/ProblemSection"; // Problem details with tabs

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("ProblemList"); // Track which screen is active
  const [selectedProblem, setSelectedProblem] = useState(null); // Track the selected problem

  // Function to handle problem selection
  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setCurrentScreen("ProblemSection"); // Switch to the ProblemSection screen
  };

  console.log("Current screen: ", currentScreen); // Check the current screen

  return (
    <SafeAreaView style={styles.container}>
      {/* Pass a prop to conditionally show the header text */}
      <Header showHeaderText={currentScreen === "ProblemList"} />
      {currentScreen === "ProblemList" ? (
        // Show ProblemList screen
        <ProblemList onProblemSelect={handleProblemSelect} />
      ) : (
        // Show ProblemSection screen with the selected problem
        <ProblemSection
          problem={selectedProblem}
          onBack={() => setCurrentScreen("ProblemList")}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
});
