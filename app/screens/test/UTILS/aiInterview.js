export const interviewQuestions = [
  "Can you tell me about yourself?",
  "What are your strengths?",
  "What are your weaknesses?",
  "Why do you want to work here?",
  "Where do you see yourself in 5 years?",
  "Why should we hire you?",
  "Tell me about a challenge you’ve faced and how you overcame it.",
];

export const getFeedbackForResponse = (userResponse) => {
  const responseText = userResponse.toLowerCase();
  let feedbackMessage = "";

  if (responseText.includes("team")) {
    feedbackMessage = "It's great that you value teamwork!";
  } else if (responseText.includes("leadership")) {
    feedbackMessage = "Leadership qualities are essential for this role!";
  } else if (responseText.includes("problem solving")) {
    feedbackMessage = "Problem-solving is an important skill. Keep it up!";
  } else if (responseText.includes("communication")) {
    feedbackMessage = "Good communication skills are critical for success.";
  } else {
    feedbackMessage = "Thank you for your response!";
  }

  return feedbackMessage;
};
