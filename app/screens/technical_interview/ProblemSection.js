import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";

const ProblemSection = ({ problem, onBack }) => {
  const [activeTab, setActiveTab] = useState("Problem");
  const [revealedHints, setRevealedHints] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false); // Track if the quiz has been answered

  if (!problem) {
    return <Text>No problem selected.</Text>;
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "#4CAF50";
      case "Medium":
        return "#FFC107";
      case "Hard":
        return "#F44336";
      default:
        return "#4CAF50";
    }
  };

  const difficultyColor = getDifficultyColor(problem.difficulty);

  const highlightKeywords = (text) => {
    const parts = text.split(/(Example)/i);
    return parts.map((part, index) => (
      <Text
        key={index}
        style={
          /Example/i.test(part)
            ? { color: difficultyColor, fontWeight: "bold" }
            : null
        }
      >
        {part}
      </Text>
    ));
  };

  const renderDescription = () => {
    const descriptionParts = problem.description.split(/```python|```/);
    return descriptionParts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <View key={index} style={styles.codeContainer}>
            <Text style={styles.codeText}>{part.trim()}</Text>
          </View>
        );
      }
      return (
        <Text key={index} style={styles.problemText}>
          {highlightKeywords(part.trim())}
        </Text>
      );
    });
  };

  const toggleHintVisibility = (index) => {
    if (revealedHints.includes(index)) {
      setRevealedHints(revealedHints.filter((i) => i !== index));
    } else {
      setRevealedHints([...revealedHints, index]);
    }
  };

  const handleSubmitQuiz = () => {
    setIsSubmitting(true);

    const selectedOptionObj = problem.multiple_choice.options.find(
      (option) => option.option === selectedOption
    );

    if (selectedOptionObj.is_correct) {
      setEvaluationResult({
        correct: true,
        message: "Correct! Well done.",
      });
    } else {
      setEvaluationResult({
        correct: false,
        message: "Incorrect. Try reviewing the hints or approach.",
      });
    }

    setQuizAnswered(true); // Mark the quiz as answered
    setIsSubmitting(false);
  };

  // Define tabs
  const tabs = ["Problem", "Hints", "Approach", "Quiz"];
  if (quizAnswered) {
    tabs.push("Solution");
  }

  const renderContent = () => {
    switch (activeTab) {
      case "Problem":
        return (
          <ScrollView style={styles.contentContainer}>
            {renderDescription()}
          </ScrollView>
        );
      case "Hints":
        return (
          <ScrollView style={styles.contentContainer}>
            <Text style={[styles.sectionTitle, { color: difficultyColor }]}>
              Hints:
            </Text>
            {problem.hints.map((hint, index) => (
              <View key={index} style={styles.hintContainer}>
                <TouchableOpacity
                  onPress={() => toggleHintVisibility(index)}
                  style={[
                    styles.showHintButton,
                    { backgroundColor: difficultyColor },
                  ]}
                >
                  <Text style={styles.showHintButtonText}>
                    {revealedHints.includes(index)
                      ? "Hide Hint"
                      : `Show Hint ${index + 1}`}
                  </Text>
                </TouchableOpacity>
                {revealedHints.includes(index) && (
                  <Text style={styles.hintText}>{highlightKeywords(hint)}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        );
      case "Approach":
        return (
          <ScrollView style={styles.contentContainer}>
            <Text style={[styles.sectionTitle, { color: difficultyColor }]}>
              Approach:
            </Text>
            <Text style={styles.problemText}>
              {problem.problem_solver.approach}
            </Text>
            {problem.problem_solver.steps.map((step, index) => (
              <View key={index} style={styles.stepContainer}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </ScrollView>
        );
      case "Quiz":
        return (
          <ScrollView style={styles.contentContainer}>
            <Text style={[styles.sectionTitle, { color: difficultyColor }]}>
              Quiz:
            </Text>
            <Text style={styles.problemText}>
              {problem.multiple_choice.question}
            </Text>
            {problem.multiple_choice.options.map((option) => (
              <TouchableOpacity
                key={option.option}
                style={[
                  styles.optionButton,
                  selectedOption === option.option && {
                    borderColor: difficultyColor,
                    backgroundColor: "#1E1E1E",
                  },
                ]}
                onPress={() => setSelectedOption(option.option)}
              >
                <Text style={styles.optionText}>
                  {option.option}. {option.text}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: selectedOption ? difficultyColor : "#A5A5A5",
                },
              ]}
              onPress={handleSubmitQuiz}
              disabled={!selectedOption || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Answer</Text>
              )}
            </TouchableOpacity>

            {/* Display evaluation results */}
            {evaluationResult && (
              <View style={styles.resultContainer}>
                <Text
                  style={[
                    styles.resultText,
                    evaluationResult.correct
                      ? styles.successText
                      : styles.errorText,
                  ]}
                >
                  {evaluationResult.message}
                </Text>
              </View>
            )}
          </ScrollView>
        );
      case "Solution":
        return (
          <ScrollView style={styles.contentContainer}>
            <Text style={[styles.sectionTitle, { color: difficultyColor }]}>
              Solution:
            </Text>
            <Text style={styles.solutionText}>
              {highlightKeywords(problem.solution.text)}
            </Text>
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{problem.solution.code}</Text>
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.maintitle}>
        <TouchableOpacity style={styles.backbutton} onPress={onBack}>
          <Ionicons name="arrow-back" size={30} color="#E5E5E5" />
        </TouchableOpacity>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={[styles.title, { color: difficultyColor }]}>
            {problem.title}
          </Text>
        </View>
        <View style={{ width: 30 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { backgroundColor: difficultyColor },
              !quizAnswered && tab === "Solution" && { opacity: 0.5 },
            ]}
            onPress={() => {
              if (tab === "Solution" && !quizAnswered) {
                Alert.alert(
                  "Access Denied",
                  "You must answer the quiz before viewing the solution."
                );
              } else {
                setActiveTab(tab);
              }
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && { color: "#FFF", fontWeight: "bold" },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Based on Active Tab */}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: "140%",
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#2E2E2E",
  },
  backbutton: {},
  maintitle: {
    marginBottom: 5,
    marginVertical: -10,
    alignItems: "center",
    flexDirection: "row",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1F1F1F",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#4CAF50",
  },
  tabText: {
    color: "#A5A5A5",
    fontSize: 16,
  },
  activeTabText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  contentContainer: {
    flexGrow: 1,
  },
  problemText: {
    color: "#E0E0E0",
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 15,
  },
  hintContainer: {
    marginBottom: 10,
  },
  showHintButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  showHintButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  hintText: {
    color: "#A5A5A5",
    fontSize: 15,
    marginLeft: 10,
    marginBottom: 5,
  },
  highlightedText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  solutionText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 10,
  },
  codeContainer: {
    backgroundColor: "#1E1E1E",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  codeText: {
    color: "#FFF",
    fontFamily: "monospace",
    fontSize: 14,
  },
  textInput: {
    backgroundColor: "#1E1E1E",
    color: "#E0E0E0",
    fontSize: 16,
    padding: 10,
    borderRadius: 5,
    height: 150,
    textAlignVertical: "top",
    marginBottom: 15,
  },
  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultContainer: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "#1E1E1E",
    borderRadius: 5,
  },
  successText: {
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#F44336",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorDetails: {
    color: "#E0E0E0",
    fontSize: 14,
    marginTop: 5,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#A5A5A5",
    borderRadius: 5,
    padding: 15,
    marginVertical: 8,
    backgroundColor: "#2E2E2E",
  },
  optionText: {
    color: "#E0E0E0",
    fontSize: 18,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  stepNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#3A3A3A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  stepNumber: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepText: {
    flex: 1,
    color: "#E0E0E0",
    fontSize: 16,
    lineHeight: 22,
  },
});

export default ProblemSection;
