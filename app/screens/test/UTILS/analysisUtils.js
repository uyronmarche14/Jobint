// utils/analysisUtils.js
export const filterQuestionsByDifficulty = (questions, difficulty) => {
  if (!questions) return [];
  return questions.filter(
    (question) => question.difficulty.toLowerCase() === difficulty.toLowerCase()
  );
};

export const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

export const tokenize = (text) => {
  return text.toLowerCase().split(/\s+/);
};

export const analyzeSentiment = (text) => {
  const positiveWords = ["good", "great", "excellent", "positive", "happy"];
  const negativeWords = ["bad", "poor", "negative", "sad", "terrible"];

  const tokens = tokenize(text);
  let score = 0;

  tokens.forEach((word) => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });

  return score;
};

export const compareToSampleAnswers = (answer, sampleAnswers) => {
  const userTokens = tokenize(answer);

  let bestMatchScore = 0;
  let closestAnswer = null;

  sampleAnswers.forEach((sample) => {
    const sampleTokens = tokenize(sample.answer_text);
    const intersection = sampleTokens.filter((token) =>
      userTokens.includes(token)
    );
    const matchScore = (intersection.length / sampleTokens.length) * 100;

    if (matchScore > bestMatchScore) {
      bestMatchScore = matchScore;
      closestAnswer = sample;
    }
  });

  return { matchScore: bestMatchScore, closestAnswer };
};

export const calculateAnswerScore = (answer, question, maxScorePerAnswer) => {
  let answerScore = 0;

  // Sample answer comparison
  if (question.sample_answers && question.sample_answers.length > 0) {
    const { matchScore } = compareToSampleAnswers(
      answer,
      question.sample_answers
    );

    if (matchScore > 70) {
      answerScore += 7;
    } else if (matchScore > 40) {
      answerScore += 4;
    } else {
      answerScore += 2;
    }
  }

  // Sentiment analysis
  const sentimentScore = analyzeSentiment(answer);
  answerScore += sentimentScore > 1 ? 2 : sentimentScore < -1 ? 0 : 1;

  return Math.min(answerScore, maxScorePerAnswer);
};

export const provideEfficientFeedback = (answer, question) => {
  let feedbackMessages = [];

  // Sample answer comparison
  if (question.sample_answers && question.sample_answers.length > 0) {
    const { matchScore, closestAnswer } = compareToSampleAnswers(
      answer,
      question.sample_answers
    );

    if (matchScore > 70) {
      feedbackMessages.push(
        "Your answer closely aligns with the ideal response. Great job!"
      );
    } else if (matchScore > 40) {
      feedbackMessages.push(
        "Your answer is decent but could use more detail to match a high-quality response."
      );
      feedbackMessages.push(
        `Consider mentioning key points like "${closestAnswer.answer_text}".`
      );
    } else {
      feedbackMessages.push(
        "Your answer could be improved. Here are some suggestions:"
      );
      question.sample_answers.forEach((sample) => {
        feedbackMessages.push(`- You might mention: "${sample.answer_text}"`);
      });
    }
  } else {
    feedbackMessages.push(
      "We do not have a sample answer for this question, but try to elaborate on your response."
    );
  }

  // Sentiment-based feedback
  const sentimentScore = analyzeSentiment(answer);
  if (sentimentScore > 1) {
    feedbackMessages.push("Your answer has a positive tone. Keep it up!");
  } else if (sentimentScore < -1) {
    feedbackMessages.push(
      "Your answer seems a bit negative. Try to focus on positive aspects."
    );
  } else {
    feedbackMessages.push(
      "Your answer has a neutral tone. Consider adding more enthusiasm or detail."
    );
  }

  return feedbackMessages.join("\n");
};
