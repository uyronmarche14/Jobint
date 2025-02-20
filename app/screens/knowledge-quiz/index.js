// Quiz.js

import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { PieChart } from "react-native-chart-kit";
import { get, ref, set, update } from "firebase/database";
import { auth, db } from "./../../../configs/FirebaseConfig";
import { quizData } from "./../../../components/quiz"; // Import the consolidated quiz data

const screenWidth = Dimensions.get("window").width;

// Shuffle function for questions and options
const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

export default function Quiz() {
  const router = useRouter();
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params || {}; // Get category from route params

  // Safely access the category data from quizData
  const categoryData = quizData?.[category];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timer, setTimer] = useState(15);
  const [feedback, setFeedback] = useState("");
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState(
    categoryData?.questions || []
  );
  const [showAlert, setShowAlert] = useState(false);
  const intervalRef = useRef(null);

  const progressPercentage =
    showResults || quizCompleted
      ? 100
      : ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;

  useEffect(() => {
    if (!categoryData || !categoryData.questions) {
      Alert.alert(
        "Category Not Found",
        "The selected quiz category does not exist or has no questions.",
        [
          {
            text: "OK",
            onPress: () => router.replace("./../choose-category"),
          },
        ]
      );
      return;
    }
    shuffleQuestionsAndChoices();
    loadQuizProgress();
  }, [categoryData]);

  useEffect(() => {
    if (timer > 0 && !showResults && !isAnswered) {
      intervalRef.current = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timer === 0 && !showResults) {
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        handleNextQuestion();
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [timer, showResults, isAnswered]);

  const shuffleQuestionsAndChoices = () => {
    if (!categoryData?.questions) return;
    const shuffledQns = shuffleArray([...categoryData.questions]);
    const shuffledQuestionsWithChoices = shuffledQns.map((question) => ({
      ...question,
      options: shuffleArray([...question.options]),
    }));
    setShuffledQuestions(shuffledQuestionsWithChoices);
  };

  const loadQuizProgress = async () => {
    try {
      const user = auth.currentUser; // Get the current authenticated user
      if (user) {
        const quizProgressRef = ref(
          db,
          `users/${user.uid}/quizProgress/${category}`
        ); // Reference to the user's quiz progress for this category
        const snapshot = await get(quizProgressRef);
        if (snapshot.exists()) {
          const progressData = snapshot.val();
          if (progressData.completed) {
            setShowResults(true); // If the quiz is completed, show results
            setScore(progressData.score || 0); // Load the score
            setQuizCompleted(true); // Set quiz as completed
          } else {
            // Resume the quiz progress
            setCurrentQuestionIndex(progressData.currentQuestionIndex || 0);
            setScore(progressData.score || 0);
            setTimer(progressData.timer || 15);
            setSelectedAnswer(progressData.selectedAnswer || null);
            setShuffledQuestions(
              progressData.shuffledQuestions || categoryData.questions
            );
          }
        } else {
          console.log("No previous progress found. Starting a new quiz.");
        }
      }
    } catch (error) {
      console.error("Error loading quiz progress:", error);
    }
  };

  // Modified saveQuizProgress to accept newScore and completed as parameters
  const saveQuizProgress = async ({
    newScore = score,
    completed = false,
  } = {}) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const quizProgressRef = ref(
          db,
          `users/${user.uid}/quizProgress/${category}`
        );
        await update(quizProgressRef, {
          currentQuestionIndex,
          score: newScore,
          timer,
          selectedAnswer,
          shuffledQuestions,
          completed: completed || quizCompleted,
        });
      }
    } catch (error) {
      console.error("Error saving quiz progress:", error);
    }
  };

  const handleAnswerSelect = (option) => {
    setSelectedAnswer(option);
    setIsAnswered(true);
    clearInterval(intervalRef.current);

    const currentQuestion = shuffledQuestions[currentQuestionIndex];

    let newScore = score;
    if (option === currentQuestion.answer) {
      newScore += 1;
      setFeedback("Correct! " + currentQuestion.explanation);
    } else {
      setFeedback(
        `Incorrect! The correct answer is "${currentQuestion.answer}". ${currentQuestion.explanation}`
      );
    }

    setScore(newScore);
    saveQuizProgress({ newScore });
  };

  const handleNextQuestion = async () => {
    clearInterval(intervalRef.current);
    setFeedback("");
    if (currentQuestionIndex + 1 < shuffledQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimer(15);
    } else {
      setShowResults(true);
      setQuizCompleted(true);
      // Save the final progress with completion status
      saveQuizProgress({ completed: true, newScore: score });
    }
  };

  const BackPress = () => {
    Alert.alert("Exit Quiz", "Are you sure you want to exit the quiz?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Exit",
        style: "destructive",
        onPress: () => {
          saveQuizProgress();
          router.replace("./../choose-category");
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#121212" }}>
      {showAlert && (
        <View style={styles.alertContainer}>
          <Text style={styles.alertText}>Time's Up!</Text>
        </View>
      )}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backbutton} onPress={BackPress}>
          <Ionicons name="arrow-back" size={27} color="#E5E5E5" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.headerTitle}>
            {categoryData?.title || "Quiz"}
          </Text>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBar, { width: `${progressPercentage}%` }]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {!showResults && !quizCompleted && (
          <View style={styles.card}>
            <View style={styles.timerContainer}>
              <Text style={styles.timer}>Time Remaining: {timer}s</Text>
            </View>
            <Text style={styles.question}>
              {shuffledQuestions[currentQuestionIndex].question}
            </Text>
            {shuffledQuestions[currentQuestionIndex].options.map(
              (option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect =
                  isAnswered &&
                  option === shuffledQuestions[currentQuestionIndex].answer;
                const isIncorrect =
                  isAnswered &&
                  isSelected &&
                  option !== shuffledQuestions[currentQuestionIndex].answer;

                let optionStyle = styles.optionButton;
                if (isCorrect) {
                  optionStyle = { ...optionStyle, ...styles.correctOption };
                } else if (isIncorrect) {
                  optionStyle = { ...optionStyle, ...styles.incorrectOption };
                } else if (isSelected) {
                  optionStyle = { ...optionStyle, ...styles.selectedOption };
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={optionStyle}
                    onPress={() => handleAnswerSelect(option)}
                    disabled={isAnswered}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                );
              }
            )}
            {isAnswered && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedback}>{feedback}</Text>
              </View>
            )}
            {isAnswered && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextQuestion}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {(showResults || quizCompleted) && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultText}>Quiz Completed!</Text>
            <Text style={styles.resultText}>
              Your Score: <Text style={styles.yellowText}>{score}</Text>
            </Text>
            <PieChart
              data={[
                {
                  name: "Correct",
                  population: score,
                  color: "#4CAF50",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
                {
                  name: "Incorrect",
                  population: shuffledQuestions.length * 1 - score,
                  color: "#E74C3C",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 15,
                },
              ]}
              width={screenWidth}
              height={220}
              chartConfig={{
                backgroundColor: "#121212",
                backgroundGradientFrom: "#121212",
                backgroundGradientTo: "#121212",
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            <TouchableOpacity
              style={styles.restartButton}
              onPress={() => router.replace("./../choose-category")}
            >
              <Text style={styles.restartButtonText}>
                Choose Another Category
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 50,
    marginBottom: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  backbutton: {},
  scrollContainer: {
    paddingBottom: 20,
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  question: {
    fontSize: 18,
    color: "#fff",
    lineHeight: 24,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: "#1F1F1F",
    padding: 15,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
  selectedOption: {
    borderColor: "#2E7C81",
    backgroundColor: "#2E7C81",
  },
  correctOption: {
    borderColor: "#4CAF50",
    backgroundColor: "#4CAF50",
  },
  incorrectOption: {
    borderColor: "#E74C3C",
    backgroundColor: "#E74C3C",
  },
  nextButton: {
    backgroundColor: "#2E7C81",
    padding: 15,
    marginTop: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  resultsContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultText: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 10,
  },
  yellowText: {
    color: "#FFD700",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  timer: {
    fontSize: 16,
    color: "#fff",
  },
  restartButton: {
    backgroundColor: "#2E7C81",
    padding: 15,
    marginTop: 30,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  restartButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  feedbackContainer: {
    backgroundColor: "#1F1F1F",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  feedback: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#333",
    borderRadius: 5,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2E7C81",
    borderRadius: 5,
  },
  alertContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#E74C3C",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  alertText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
