// components/InterviewScreen.js
import { Animated, Easing } from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import {
  calculateAnswerScore,
  filterQuestionsByDifficulty,
  provideEfficientFeedback,
  shuffleArray,
} from "./UTILS/analysisUtils";
import {
  playRecording,
  startRecording,
  stopRecording,
} from "./UTILS/audioUtils";
import generalQuestions from "./DATA/general_questions";
import { jobQuestions } from "./UTILS/constants";
import { analyzeEmotion } from "./UTILS/emotionalAnalysis";

// Helper function to format time in mm:ss
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

// Map difficulty to timer duration in seconds
const difficultyToDuration = {
  easy: 180, // 3 minutes
  medium: 240, // 4 minutes
  hard: 300, // 5 minutes
};

const InterviewScreen = ({ jobType, difficulty, resetSelection }) => {
  const [isTypingFeedback, setIsTypingFeedback] = useState(false);
  const [displayedFeedback, setDisplayedFeedback] = useState(""); // Incremental feedback
  const typingAnimation = useRef(new Animated.Value(0)).current;

  const router = useRouter();
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  const [inputMethod, setInputMethod] = useState("text"); // Default to text input
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);

  // Speech-to-text state variables
  const [recording, setRecording] = useState(null);
  const [recordingURI, setRecordingURI] = useState(null);
  const [sound, setSound] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [loadingTranscription, setLoadingTranscription] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState(false);

  // Timer state variables
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const [isSummaryVisible, setIsSummaryVisible] = useState(false);

  const maxScorePerAnswer = 10;

  useEffect(() => {
    if (isTypingFeedback) {
      Animated.loop(
        Animated.timing(typingAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      typingAnimation.stopAnimation(); // Stop animation
    }
  }, [isTypingFeedback]);
  const simulateTypingFeedback = (feedbackText) => {
    setIsTypingFeedback(true);
    setDisplayedFeedback(""); // Start with an empty display

    let index = 0;
    const typingInterval = setInterval(() => {
      setDisplayedFeedback((prev) => prev + feedbackText[index]);
      index++;
      if (index >= feedbackText.length) {
        clearInterval(typingInterval); // Stop typing when complete
        setIsTypingFeedback(false); // Allow "Next" button to be pressed
      }
    }, 0.1); // Faster typing speed
  };

  // Load questions based on job type and difficulty
  useEffect(() => {
    if (jobType && difficulty) {
      // Select three random general questions
      const randomGeneralQuestions =
        generalQuestions?.length >= 3
          ? shuffleArray(generalQuestions).slice(0, 1)
          : generalQuestions; // Use all general questions if fewer than 3

      // Filter job-specific questions based on difficulty
      const selectedJobQuestions = jobQuestions[jobType]
        ? filterQuestionsByDifficulty(jobQuestions[jobType], difficulty)
        : [];

      if (!selectedJobQuestions.length) {
        Alert.alert(
          "No Questions Found",
          `No questions found for ${jobType} at ${difficulty} difficulty.`,
          [{ text: "OK", onPress: resetSelection }]
        );
        return;
      }

      // Shuffle and limit job-specific questions to 4
      const shuffledJobQuestions = shuffleArray(selectedJobQuestions).slice(
        0,
        1
      );

      // Combine general questions and job-specific questions
      const combinedQuestions = [
        ...randomGeneralQuestions,
        ...shuffledJobQuestions,
      ];

      setInterviewQuestions(combinedQuestions);
    }
  }, [jobType, difficulty]);

  // Set up timer when a new question is loaded
  useEffect(() => {
    if (
      interviewQuestions.length > 0 &&
      currentQuestionIndex < interviewQuestions.length
    ) {
      const currentQ = interviewQuestions[currentQuestionIndex];
      const questionDifficulty = difficulty; // Assuming all questions have the same difficulty
      const duration = difficultyToDuration[questionDifficulty] || 180; // default to easy if undefined
      setTimeLeft(duration);
      startTimer(duration);
    }
    // Cleanup timer when question changes
    return () => {
      clearTimer();
    };
  }, [interviewQuestions, currentQuestionIndex]);

  const startTimer = (duration) => {
    clearTimer(); // Ensure no existing timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearTimer();
          handleTimerExpire();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTimerExpire = () => {
    Alert.alert(
      "Time's Up",
      "You ran out of time for this question. Moving to the next question with a score of 0.",
      [{ text: "OK", onPress: handleNextQuestion }]
    );
    // Add zero score for this question
    const currentQ = interviewQuestions[currentQuestionIndex];
    setTotalScore((prevScore) => prevScore + 0); // Adding zero, no change
    setFeedback(
      `Time's up! You scored 0/${maxScorePerAnswer} on this question.\n\nConsider providing more detailed and well-structured answers in future questions.`
    );
    setHasSubmittedAnswer(true); // Disable submission

    // Automatically move to next question after setting feedback
    // Add a short delay to allow user to read feedback
    setTimeout(() => {
      handleNextQuestion();
    }, 2000); // 2 seconds delay
  };

  // Start recording
  const handleStartRecording = async () => {
    await startRecording(setRecording);
  };

  // Stop recording
  const handleStopRecording = async () => {
    try {
      await stopRecording(
        recording,
        setRecordingURI,
        setTranscription,
        setLoadingTranscription
      );
      setTranscriptionError(false); // Reset error on success
    } catch (error) {
      setTranscriptionError(true); // Handle transcription errors
    }
    setRecording(null);
  };

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  const handleSubmitAnswer = async () => {
    try {
      const answer =
        inputMethod === "voice" ? transcription.trim() : userAnswer.trim();

      if (!answer) {
        Alert.alert("No Answer", "Please provide an answer before submitting.");
        return;
      }

      if (recording) {
        await handleStopRecording();
      }

      clearTimer(); // Stop the timer when user submits

      const currentQ = interviewQuestions[currentQuestionIndex];
      const answerScore = calculateAnswerScore(
        answer,
        currentQ,
        maxScorePerAnswer
      );
      setTotalScore((prevScore) => prevScore + answerScore);

      const feedbackMessage = provideEfficientFeedback(answer, currentQ);

      // Analyze the emotion of the user's answer
      let emotionFeedback = "";
      try {
        const emotionResult = await analyzeEmotion(answer);

        // Parse the response to extract tones
        const tones = emotionResult.document_tone.tones;

        if (tones.length > 0) {
          const toneDetails = tones
            .map(
              (tone) => `${tone.tone_name} (${(tone.score * 100).toFixed(1)}%)`
            )
            .join(", ");
          emotionFeedback = `The emotional tones detected in your response are: ${toneDetails}.`;
        } else {
          emotionFeedback =
            "No significant emotional tones were detected in your response.";
        }
      } catch (error) {
        emotionFeedback =
          "Could not analyze the emotional content of your response.";
      }

      // Combine feedback messages
      const combinedFeedback = `You scored ${answerScore}/${maxScorePerAnswer} on this question.\n\n${feedbackMessage}\n\n${emotionFeedback}`;

      // Trigger typing effect with combined feedback
      simulateTypingFeedback(combinedFeedback);

      setHasSubmittedAnswer(true); // Disable further submission
    } catch (error) {
      console.error("Error submitting answer:", error); // Log any errors
      Alert.alert("Error", "There was an error processing your answer.");
    }
  };

  const generateFinalSummary = () => {
    const maxTotalScore = interviewQuestions.length * maxScorePerAnswer;
    const overallPercentage = (totalScore / maxTotalScore) * 100;
    let performanceCategory = "";

    // Categorize performance
    if (overallPercentage > 80) {
      performanceCategory = "Excellent";
    } else if (overallPercentage > 60) {
      performanceCategory = "Good";
    } else if (overallPercentage > 40) {
      performanceCategory = "Average";
    } else {
      performanceCategory = "Needs Improvement";
    }

    // Generate individual question feedback
    const questionBreakdown = interviewQuestions.map((question, index) => {
      const questionScore = Math.min(
        maxScorePerAnswer,
        (totalScore / interviewQuestions.length).toFixed(1)
      );
      return `Question ${index + 1}: "${question.question_text}" - Score: ${questionScore}/${maxScorePerAnswer}`;
    });

    // Emotional analysis summary
    const emotionalSummary = `Based on your responses, I noticed some emotional tones. It's great to see confidence in your answers, but there were moments of hesitation. Keep working on maintaining a steady tone throughout your responses.`;

    // Actionable suggestions
    const improvementSuggestions = `Here are a few suggestions to help you improve:
    - Use specific examples to strengthen your answers.
    - Maintain a confident and clear tone.
    - Practice managing your time to ensure you address all parts of the question.`;

    // Get current timestamp
    const currentTime = new Date().toLocaleString();

    // Combine into a final summary
    return (
      <View style={styles.finalSummaryContainer}>
        <Text style={styles.finalSummaryTitle}>Final Summary</Text>
        <Text style={styles.finalSummaryText}>
          Performance Level: {performanceCategory}
        </Text>
        <Text style={styles.finalSummaryText}>
          Overall Score: {totalScore}/{maxTotalScore} ({overallPercentage.toFixed(1)}%)
        </Text>
        <Text style={styles.finalSummaryText}>
          Generated on: {currentTime}
        </Text>
        <Text style={styles.finalSummarySectionTitle}>
          Question Breakdown:
        </Text>
        {questionBreakdown.map((breakdown, index) => (
          <Text key={index} style={styles.finalSummaryText}>
            {breakdown}
          </Text>
        ))}
        <Text style={styles.finalSummarySectionTitle}>
          Emotional Analysis:
        </Text>
        <Text style={styles.finalSummaryText}>{emotionalSummary}</Text>
        <Text style={styles.finalSummarySectionTitle}>
          Suggestions for Improvement:
        </Text>
        <Text style={styles.finalSummaryText}>
          {improvementSuggestions}
        </Text>
      </View>
    );
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      // Move to the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);

      // Reset states for the next question
      setUserAnswer("");
      setTranscription("");
      setRecordingURI(null);
      setFeedback("");
      setDisplayedFeedback("");
      setHasSubmittedAnswer(false); // Allow new submission
    } else {
      // Show the final summary modal
      setIsSummaryVisible(true);
    }
  };

  const currentQuestion = interviewQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading question...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#292929", "#1F1F1F"]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={resetSelection}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interview Practice</Text>
          {/* Placeholder to balance the back button */}
          <View style={{ width: 28 }} />
        </View>

        <ProgressBar
          progress={(currentQuestionIndex + 1) / interviewQuestions.length}
          color={"#2E7C81"}
          style={styles.progressBar}
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Question Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              {`Question ${currentQuestionIndex + 1}`}
            </Text>
            <Text style={styles.questionText}>
              {currentQuestion.question_text}
            </Text>
          </View>
          {/* Timer */}
          <View style={styles.timerContainer}>
            <MaterialCommunityIcons
              name="timer-outline"
              size={24}
              color="#fff"
            />
            <Text style={styles.timerText}>
              Time Left: {formatTime(timeLeft)}
            </Text>
          </View>
          {/* Input Method Selector */}
          <View style={styles.inputMethodSelector}>
            <TouchableOpacity
              style={[
                styles.inputMethodButton,
                inputMethod === "voice" && styles.inputMethodButtonActive,
              ]}
              onPress={() => {
                setInputMethod("voice");
                if (recording) {
                  handleStopRecording();
                }
              }}
            >
              <MaterialCommunityIcons
                name="microphone"
                size={20}
                color={inputMethod === "voice" ? "#fff" : "#6DD5FA"}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.inputMethodButtonText,
                  inputMethod === "voice" && { color: "#fff" },
                ]}
              >
                Voice
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.inputMethodButton,
                inputMethod === "text" && styles.inputMethodButtonActive,
              ]}
              onPress={() => {
                setInputMethod("text");
                if (recording) {
                  handleStopRecording();
                }
              }}
            >
              <MaterialCommunityIcons
                name="keyboard"
                size={20}
                color={inputMethod === "text" ? "#fff" : "#6DD5FA"}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.inputMethodButtonText,
                  inputMethod === "text" && { color: "#fff" },
                ]}
              >
                Text
              </Text>
            </TouchableOpacity>
          </View>
          {/* Conditionally Render Input Method */}
          {inputMethod === "voice" ? (
            <>
              <View style={styles.recordingSection}>
                <TouchableOpacity
                  style={[
                    styles.recordButton,
                    recording && styles.recordButtonActive,
                    loadingTranscription && styles.buttonDisabled,
                  ]}
                  onPress={() =>
                    recording ? handleStopRecording() : handleStartRecording()
                  }
                  disabled={loadingTranscription}
                >
                  <MaterialCommunityIcons
                    name={recording ? "stop-circle" : "microphone"}
                    size={24}
                    color="#fff"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.buttonText}>
                    {recording ? "Stop Recording" : "Start Recording"}
                  </Text>
                </TouchableOpacity>

                {recordingURI && (
                  <TouchableOpacity
                    style={[
                      styles.playButton,
                      (!recordingURI || loadingTranscription) &&
                        styles.buttonDisabled,
                    ]}
                    onPress={() => playRecording(recordingURI, sound, setSound)}
                    disabled={!recordingURI || loadingTranscription}
                  >
                    <MaterialCommunityIcons
                      name="play-circle"
                      size={24}
                      color="#fff"
                      style={{ marginRight: 5 }}
                    />
                    <Text style={styles.buttonText}>Play Recording</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.inputCard}>
                {loadingTranscription ? (
                  <ActivityIndicator size="small" color={"#6DD5FA"} />
                ) : transcriptionError ? (
                  <Text style={{ color: "red" }}>
                    Transcription failed, please try again.
                  </Text>
                ) : (
                  <Text style={styles.transcriptionText}>
                    {transcription ||
                      "Transcription will appear here after recording."}
                  </Text>
                )}
              </View>
            </>
          ) : (
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Type your answer here..."
                placeholderTextColor={"#c1c1c1"}
                value={userAnswer}
                onChangeText={setUserAnswer}
                multiline
              />
            </View>
          )}
          {displayedFeedback ? (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackText}>{displayedFeedback}</Text>
              {isTypingFeedback && (
                <Animated.View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: "#6DD5FA",
                    opacity: typingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 1],
                    }),
                  }}
                />
              )}
            </View>
          ) : null}

          {/* Buttons Container */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !userAnswer.trim() && styles.buttonDisabled,
              ]}
              onPress={handleSubmitAnswer}
              disabled={!userAnswer.trim()}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color="#fff"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.nextButton,
                (isTypingFeedback || !displayedFeedback) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleNextQuestion}
              disabled={isTypingFeedback || !displayedFeedback}
            >
              <MaterialCommunityIcons
                name={
                  currentQuestionIndex < interviewQuestions.length - 1
                    ? "arrow-right-circle"
                    : "flag-checkered"
                }
                size={24}
                color="#fff"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.buttonText}>
                {currentQuestionIndex < interviewQuestions.length - 1
                  ? "Next"
                  : "Finish"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Final Summary Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSummaryVisible}
        onRequestClose={() => setIsSummaryVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {generateFinalSummary()}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setIsSummaryVisible(false);
                resetSelection();
              }}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 10,
    marginHorizontal: 16,
    backgroundColor: "#1F1F1F",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  questionText: {
    fontSize: 16,
    color: "#c1c1c1",
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#1F1F1F",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
  },
  timerText: {
    fontSize: 16,
    color: "#fff",
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
    borderColor: "#6DD5FA",
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 5,
    flexDirection: "row",
    justifyContent: "center",
  },
  inputMethodButtonActive: {
    backgroundColor: "#2E7C81",
    borderColor: "#2E7C81",
  },
  inputMethodButtonText: {
    fontSize: 16,
    color: "#6DD5FA",
  },
  recordingSection: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  recordButton: {
    flexDirection: "row",
    backgroundColor: "#2E7C81",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    flex: 1,
    justifyContent: "center",
  },
  recordButtonActive: {
    backgroundColor: "#E74C3C",
  },
  playButton: {
    flexDirection: "row",
    backgroundColor: "#6DD5FA",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    flex: 1,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  inputCard: {
    backgroundColor: "#1F1F1F",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  input: {
    height: 120,
    borderColor: "#6DD5FA",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    textAlignVertical: "top",
    color: "#fff",
    fontSize: 16,
  },
  transcriptionText: {
    fontSize: 16,
    color: "#fff",
  },
  feedbackContainer: {
    backgroundColor: "#2E7C81",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#6DD5FA",
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  feedbackText: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7C81",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    justifyContent: "center",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6DD5FA",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
  },
  finalSummaryContainer: {
    backgroundColor: '#1F1F1F',
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
  },
  finalSummaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  finalSummaryText: {
    fontSize: 16,
    color: '#D1D5DB',
    marginVertical: 5,
    lineHeight: 22,
  },
  finalSummarySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6DD5FA',
    marginTop: 15,
    marginBottom: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#1F1F1F',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#6DD5FA',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
});

export default InterviewScreen;
