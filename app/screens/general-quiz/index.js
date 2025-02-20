import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ResultScreen from "../../../components/ResultScreen"; // Import the result screen component
import { quizData } from "../../../components/generalQuiz";

// Utility function to shuffle arrays
const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

export default function Index() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [score, setScore] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null); // Track the correct answer
  const [quizFinished, setQuizFinished] = useState(false); // Track quiz completion
  const [result, setResult] = useState(""); // Store the result category
  const progress = useRef(new Animated.Value(0)).current; // Using useRef for progress value

  const BackPress = () => {
    if (quizStarted) {
      // Reset to the start screen
      setQuizStarted(false); // Return to the start screen
      setSelectedAnswer(null);
      setCurrentQuestion(0);
      animateProgress(0); // Reset the progress bar
    } else {
      router.replace("./../../(tabs)/dashboard"); // Keep this for the exit button in the start screen
    }
  };

  // Shuffle questions and their options
  const shuffleQuestions = () => {
    const allQuestions = quizData.categories.flatMap((category) =>
      category.questions.map((q) => ({
        ...q,
        category: category.name,
        options: shuffleArray([...q.options]), // Shuffle options within each question
      }))
    );
    return shuffleArray(allQuestions); // Shuffle the questions
  };

  // Start the quiz by shuffling the questions
  const startQuiz = () => {
    setQuizQuestions(shuffleQuestions());
    setQuizStarted(true);
    setScore({});
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setCorrectAnswer(null); // Reset correct answer when starting quiz
    setQuizFinished(false);
    setResult("");
    animateProgress(0); // Reset progress when starting quiz
  };

  // Handle answer selection
  const handleAnswer = (selectedAnswer) => {
    const question = quizQuestions[currentQuestion];
    const correctAnswer = question.answer;
    const category = question.category;

    setSelectedAnswer(selectedAnswer);
    setCorrectAnswer(correctAnswer); // Set correct answer to highlight later

    // Update score if the selected answer is correct
    if (selectedAnswer === correctAnswer) {
      setScore((prevScore) => ({
        ...prevScore,
        [category]: (prevScore[category] || 0) + 1,
      }));
    }

    // Move to the next question after a short delay
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        const nextQuestion = currentQuestion + 1;
        setCurrentQuestion(nextQuestion);
        setSelectedAnswer(null); // Reset selected answer
        setCorrectAnswer(null); // Reset correct answer
        const progressValue = (nextQuestion + 1) / quizQuestions.length; // Calculate the progress percentage
        animateProgress(progressValue); // Update progress bar
      } else {
        // Quiz is done, calculate the result
        const resultCategory = calculateResult();
        setResult(resultCategory); // Store the result
        setQuizFinished(true); // Set quiz as finished
        animateProgress(0); // Reset progress bar
      }
    }, 2000); // Delay before moving to the next question
  };

  // Calculate which category the user fits into
  const calculateResult = () => {
    let maxScore = 0;
    let bestFit = "";

    for (const [category, scoreValue] of Object.entries(score)) {
      if (scoreValue > maxScore) {
        maxScore = scoreValue;
        bestFit = category;
      }
    }

    return bestFit;
  };

  // Animate progress bar
  const animateProgress = (progressValue) => {
    Animated.timing(progress, {
      toValue: progressValue,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: false, // Using non-native driver for width animation
    }).start();
  };

  if (quizFinished) {
    return <ResultScreen result={result} onRetry={startQuiz} score={score} />;
  }

  return (
    <View style={{ flexGrow: 1 }}>
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: "#292929" }]}
      />

      {quizStarted && (
        <View style={styles.maintitle}>
          <TouchableOpacity style={styles.backbutton} onPress={BackPress}>
            <Ionicons name="arrow-back" size={30} color="#E5E5E5" />
          </TouchableOpacity>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={styles.maintitleText}>General Quiz</Text>
          </View>
          <View style={{ width: 30 }} />
        </View>
      )}

      {!quizStarted && (
        <View style={styles.instructionContainer}>
          {/* Instructions for the quiz */}
          <Animated.Text style={styles.instructionHeading}>
            Welcome to the{"\n"}General Tech Quiz!
          </Animated.Text>
          <Text style={styles.instructionText}>
            This quiz is designed to assess your skills across various tech
            roles, including Software Development, Web Development, Data
            Science, and more. Answer each question to the best of your ability,
            and at the end, you'll discover the tech career path that suits you
            best!
          </Text>

          {/* Start Quiz Button */}
          <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exitButton} onPress={BackPress}>
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
        </View>
      )}

      {quizStarted ? (
        <View style={styles.quizContainer}>
          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>

          <Text style={styles.questionText}>
            {quizQuestions[currentQuestion].question}
          </Text>

          {quizQuestions[currentQuestion].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === option && option !== correctAnswer
                  ? styles.incorrectOption
                  : null,
                correctAnswer === option ? styles.correctOption : null,
              ]}
              onPress={() => handleAnswer(option)}
              disabled={!!selectedAnswer} // Disable buttons after selecting
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  maintitle: {
    marginBottom: 5,
    marginVertical: 40,
    margin: 15,
    alignItems: "center",
    flexDirection: "row",
  },
  maintitleText: {
    fontSize: 24,
    color: "white",
    fontFamily: "quicksand",
  },
  instructionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    flex: 1, // Center the instructions box vertically
  },
  instructionHeading: {
    fontSize: 36,
    color: "#FFD700", // Golden color for the heading
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  instructionText: {
    fontSize: 18,
    color: "#E5E5E5",
    textAlign: "center",
    lineHeight: 28,
    fontFamily: "quicksand",
    marginBottom: 30,
    opacity: 0.85,
  },
  startButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 30,
    marginVertical: 15,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  exitButton: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 30,
    width: "80%",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  exitButtonText: {
    fontSize: 18,
    color: "white",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#2E3A47",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  quizContainer: {
    padding: 20,
  },
  questionText: {
    fontSize: 20,
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  optionButton: {
    backgroundColor: "#2E3A47",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  correctOption: {
    backgroundColor: "#4CAF50",
  },
  incorrectOption: {
    backgroundColor: "red",
  },
  optionText: {
    color: "white",
    fontSize: 16,
  },
});
