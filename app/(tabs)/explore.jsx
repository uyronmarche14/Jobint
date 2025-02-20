import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import ContentDisplay from "../screens/documentations/ContentDisplay";
import LanguageSelection from "../screens/documentations/LanguageSelection";
import cplus from "../screens/documentations/PL/c++.json";
import csharp from "../screens/documentations/PL/cSharp.json";
import css from "../screens/documentations/PL/css.json";
import flutter from "../screens/documentations/PL/flutter.json";
import html from "../screens/documentations/PL/html.json";
import java from "../screens/documentations/PL/Java.json";
import js from "../screens/documentations/PL/js.json";
import pythonData from "../screens/documentations/PL/python.json";
import react from "../screens/documentations/PL/react.json";
import ruby from "../screens/documentations/PL/ruby.json";
import TopicSelection from "../screens/documentations/TopicSelection";

export default function App() {
  const [step, setStep] = useState(1); // Tracks which step of the app we are on
  const [selectedLanguage, setSelectedLanguage] = useState(null); // Holds the selected programming language
  const [selectedTopics, setSelectedTopics] = useState([]); // Tracks the topics for the selected language
  const [selectedTopic, setSelectedTopic] = useState(null); // Tracks the selected topic

  // Mapping language data
  const languageData = {
    Python: pythonData.languages.Python, // Assuming the structure of your JSON
    "C#": csharp.languages["C#"],
    HTML: html.languages.HTML,
    JavaScript: js.languages.JavaScript,
    CSS: css.languages.CSS,
    "C++": cplus.languages["C++"],
    Java: java.languages.Java,
    Flutter: flutter.languages.Flutter,
    React: react.languages.React,
    Ruby: ruby.languages.Ruby,
    // Add other languages here if you have them in similar JSON files (e.g. JavaScript, C#)
  };

  // Handles language selection and sets the topics for the selected language
  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language); // Set the selected language
    const topics = languageData[language]?.topics || []; // Safely access topics for the selected language
    setSelectedTopics(topics); // Set the topics to the state
    setStep(2); // Move to the next step (Topic selection)
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1); // Go back to language selection
      setSelectedLanguage(null);
    } else if (step === 3) {
      setStep(2); // Go back to topic selection
      setSelectedTopic(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Language Selection Screen */}
      {step === 1 && (
        <LanguageSelection
          setSelectedLanguage={handleLanguageSelect} // Pass language selection handler
          setStep={setStep} // Handle moving to the next step
        />
      )}

      {/* Topic Selection Screen */}
      {step === 2 && (
        <TopicSelection
          selectedLanguage={selectedLanguage} // Passing the selected language
          selectedTopics={selectedTopics} // Passing the list of topics for that language
          setSelectedTopic={setSelectedTopic} // Handle topic selection
          setStep={setStep} // Handle moving to the content display
          goBack={goBack} // Handle going back to language selection
        />
      )}

      {/* Content Display Screen */}
      {step === 3 && (
        <ContentDisplay
          selectedLanguage={selectedLanguage} // Pass selected language for reference
          selectedTopic={selectedTopic} // Pass selected topic to show content
          goBack={goBack} // Handle going back to topic selection
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: "#F9F9F9",
  },
});
