import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import reactIcon from "../../../assets/images/icons/react.png";
import pythonIcon from "../../../assets/images/icons/python.png";
import javascriptIcon from "../../../assets/images/icons/javascript.png";
import csharpIcon from "../../../assets/images/icons/csharp.png";
import htmlIcon from "../../../assets/images/icons/html.png";
import cplusplusIcon from "../../../assets/images/icons/cplusplus.png";
import rubyIcon from "../../../assets/images/icons/ruby.png";
import flutterIcon from "../../../assets/images/icons/flutter.png";
import cssIcon from "../../../assets/images/icons/css.png";
import javaIcon from "../../../assets/images/icons/java.png";

const LanguageSelection = ({ setSelectedLanguage, setStep }) => {
  const languages = [
    {
      name: "Python",
      icon: pythonIcon,
      color: "#306998",
      description: "General-purpose, versatile language",
      difficulty: "Beginner Friendly",
      questionsCount: 50,
    },
    {
      name: "JavaScript",
      icon: javascriptIcon,
      color: "#F7DF1E",
      description: "Web development essential",
      difficulty: "Intermediate",
      questionsCount: 45,
    },
    {
      name: "C#",
      icon: csharpIcon,
      color: "#9B4F96",
      description: ".NET development & game design",
      difficulty: "Intermediate",
      questionsCount: 40,
    },
    {
      name: "HTML",
      icon: htmlIcon,
      color: "#E34F26",
      description: "Web structure & semantics",
      difficulty: "Beginner",
      questionsCount: 35,
    },
    {
      name: "C++",
      icon: cplusplusIcon,
      color: "#F34B7D",
      description: "System & game programming",
      difficulty: "Advanced",
      questionsCount: 55,
    },
    {
      name: "Ruby",
      icon: rubyIcon,
      color: "#E0115F",
      description: "Web development with Rails",
      difficulty: "Intermediate",
      questionsCount: 38,
    },
    {
      name: "Flutter",
      icon: flutterIcon,
      color: "#42A5F5",
      description: "Cross-platform mobile development",
      difficulty: "Intermediate",
      questionsCount: 42,
    },
    {
      name: "CSS",
      icon: cssIcon,
      color: "#264DE4",
      description: "Web styling & design",
      difficulty: "Beginner",
      questionsCount: 30,
    },
    {
      name: "React",
      icon: reactIcon,
      color: "#61DAFB",
      description: "UI development framework",
      difficulty: "Intermediate",
      questionsCount: 48,
    },
    {
      name: "Java",
      icon: javaIcon,
      color: "#F89820",
      description: "Enterprise & Android development",
      difficulty: "Intermediate",
      questionsCount: 52,
    },
  ];

  const renderLanguageCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedLanguage(item.name);
        setStep(2);
      }}
    >
      <View style={styles.cardHeader}>
        <View
          style={[styles.iconContainer, { backgroundColor: item.color + "0D" }]}
        >
          <Image source={item.icon} style={styles.icon} resizeMode="contain" />
        </View>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: item.color + "15" },
          ]}
        >
          <Text style={[styles.difficultyText, { color: item.color }]}>
            {item.difficulty}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.languageText}>{item.name}</Text>
        <Text style={styles.descriptionText}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.questionsText}>
            {item.questionsCount} Learnable Documents
          </Text>
        </View>
      </View>

      <View style={[styles.indicator, { backgroundColor: item.color }]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Documentation</Text>
      <Text style={styles.subHeader}>
        Select a programming language to begin
      </Text>
      <FlatList
        data={languages}
        renderItem={renderLanguageCard}
        keyExtractor={(item) => item.name}
        numColumns={1}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
    paddingTop: 80,
    marginVertical: -50,
  },
  header: {
    fontSize: 32, // Increased from 28
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subHeader: {
    fontSize: 18, // Increased from 16
    color: "#aaa", // Lightened from #888 for better readability
    marginBottom: 28,
    letterSpacing: 0.3,
  },
  grid: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 20, // Increased from 16
    padding: 20, // Increased from 16
    marginBottom: 20, // Increased from 16
    position: "relative",
    overflow: "hidden",
    elevation: 3, // Slightly increased shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16, // Increased from 12
  },
  iconContainer: {
    width: 56, // Increased from 48
    height: 56, // Increased from 48
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 32, // Increased from 28
    height: 32, // Increased from 28
  },
  difficultyBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  difficultyText: {
    fontSize: 14, // Increased from 12
    fontWeight: "600",
  },
  cardContent: {
    flex: 1,
  },
  languageText: {
    fontSize: 24, // Increased from 20
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
    marginBottom: 8, // Increased from 4
  },
  descriptionText: {
    fontSize: 16, // Increased from 14
    color: "#aaa", // Lightened from #888
    letterSpacing: 0.2,
    marginBottom: 16, // Increased from 12
    lineHeight: 22, // Added line height for better readability
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  questionsText: {
    fontSize: 14, // Increased from 12
    color: "#888", // Lightened from #666
    letterSpacing: 0.2,
    fontWeight: "500", // Added medium weight for better visibility
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4, // Increased from 3
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});

export default LanguageSelection;
