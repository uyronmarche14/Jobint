// emotionAnalysis.js

export const analyzeEmotion = (answer) => {
  const lowerCaseAnswer = answer.toLowerCase();

  // Helper function to check if any keyword exists in the answer
  const containsKeyword = (keywords) =>
    keywords.some((keyword) => lowerCaseAnswer.includes(keyword));

  // Emotion definitions with associated keywords and detailed messages
  const emotions = [
    // Positive Emotions
    {
      emotion: "happy",
      keywords: ["happy", "happiness", "glad", "cheerful", "delighted"],
      message:
        "You sound genuinely happy! This positive emotion can make your responses more engaging and leave a pleasant impression on your interviewer.",
    },
    {
      emotion: "joyful",
      keywords: ["joyful", "joy", "elated", "ecstatic", "thrilled"],
      message:
        "Your response exudes joy and excitement, which is fantastic! This enthusiasm can help convey your passion for the role and make you more memorable to your interviewer.",
    },
    {
      emotion: "excited",
      keywords: ["excited", "thrilled", "eager", "animated", "passionate"],
      message:
        "You sound truly excited about this opportunity! Your eagerness can demonstrate your strong interest and motivation to contribute to the team.",
    },
    {
      emotion: "enthusiastic",
      keywords: ["enthusiastic", "eager", "keen", "animated", "vibrant"],
      message:
        "Your enthusiasm is palpable! This vibrant energy can showcase your dedication and positive attitude, making you a compelling candidate.",
    },
    {
      emotion: "delighted",
      keywords: ["delighted", "pleased", "grateful", "content"],
      message:
        "You sound delighted and grateful, which reflects a positive and appreciative mindset. This can indicate that you value opportunities and are likely to bring a positive attitude to the workplace.",
    },
    {
      emotion: "pleased",
      keywords: ["pleased", "satisfied", "content", "gratified"],
      message:
        "Your response conveys satisfaction and contentment. This indicates that you find fulfillment in your work, which can translate to sustained motivation and productivity.",
    },
    {
      emotion: "content",
      keywords: ["content", "satisfied", "fulfilled", "at ease"],
      message:
        "You express a sense of contentment and fulfillment, suggesting that you maintain a balanced and positive outlook in your professional life.",
    },
    {
      emotion: "determined",
      keywords: [
        "determined",
        "resolute",
        "persistent",
        "tenacious",
        "driven",
        "dedicated",
      ],
      message:
        "You exhibit determination and dedication, which are highly valued traits. This showcases your commitment to achieving goals and overcoming challenges.",
    },
    {
      emotion: "grateful",
      keywords: ["grateful", "thankful", "appreciative", "obliged", "indebted"],
      message:
        "Your gratitude reflects humility and appreciation, which can foster positive relationships and a respectful work environment.",
    },
    {
      emotion: "proud",
      keywords: ["proud", "accomplished", "satisfied", "honored", "pleased"],
      message:
        "You express pride and accomplishment, highlighting your achievements and the value you bring to the role.",
    },
    {
      emotion: "inspired",
      keywords: ["inspired", "motivated", "driven", "energized", "enthused"],
      message:
        "You convey a sense of inspiration and motivation, showcasing your drive and enthusiasm for the role and the organization's mission.",
    },

    // Negative Emotions
    {
      emotion: "sad",
      keywords: ["sad", "sorrowful", "downcast", "unhappy", "depressed"],
      message:
        "Your answer reflects sadness, which might indicate underlying concerns or lack of confidence. Consider framing your experiences in a more positive light to demonstrate resilience.",
    },
    {
      emotion: "disappointed",
      keywords: ["disappointed", "let down", "dissatisfied", "disheartened"],
      message:
        "You sound disappointed, which could suggest unmet expectations or challenges. Try to focus on how you've overcome obstacles or what you've learned from these experiences.",
    },
    {
      emotion: "frustrated",
      keywords: [
        "frustrated",
        "angry",
        "irritated",
        "exasperated",
        "resentful",
      ],
      message:
        "Your response conveys frustration, which may stem from past challenges. Focus on how you've managed or overcome these frustrations to highlight your problem-solving abilities.",
    },
    {
      emotion: "angry",
      keywords: ["angry", "mad", "furious", "irate", "livid"],
      message:
        "You sound angry, which can create a negative impression. It's important to remain calm and composed, even when discussing challenging topics.",
    },
    {
      emotion: "irritated",
      keywords: ["irritated", "annoyed", "bothered", "vexed"],
      message:
        "Your response indicates irritation, which may suggest dissatisfaction. Strive to maintain professionalism and focus on constructive aspects when discussing past experiences.",
    },
    {
      emotion: "resentful",
      keywords: ["resentful", "bitter", "begrudging", "disgruntled"],
      message:
        "You convey a sense of resentment, which can be concerning. Emphasize how you've addressed and learned from past difficulties to demonstrate growth.",
    },
    {
      emotion: "overwhelmed",
      keywords: ["overwhelmed", "swamped", "burdened", "stressed", "flooded"],
      message:
        "Your response suggests that you feel overwhelmed or stressed. Highlight your strategies for managing stress and maintaining productivity under pressure.",
    },

    // Anxious Emotions
    {
      emotion: "nervous",
      keywords: ["nervous", "anxious", "tense", "apprehensive", "worried"],
      message:
        "You sound nervous, which is completely normal in interview settings. Practicing your responses and deep breathing can help alleviate anxiety and project more confidence.",
    },
    {
      emotion: "uncertain",
      keywords: ["uncertain", "unsure", "doubtful", "hesitant"],
      message:
        "Your response indicates some uncertainty. Building confidence through preparation and familiarity with common interview questions can help you feel more assured.",
    },

    // Confident Emotions
    {
      emotion: "confident",
      keywords: ["confident", "self-assured", "certain", "poised"],
      message:
        "You project a strong sense of confidence, which is excellent for making a positive impression. Ensure that your confidence is balanced with humility to avoid appearing arrogant.",
    },
    {
      emotion: "assertive",
      keywords: ["assertive", "strong-willed", "determined", "decisive"],
      message:
        "Your assertiveness showcases your ability to take initiative and make decisions. This trait is highly valuable in leadership and collaborative roles.",
    },

    // Optimistic Emotions
    {
      emotion: "hopeful",
      keywords: ["hopeful", "aspiring", "expectant", "looking forward"],
      message:
        "You express a hopeful outlook, indicating optimism about future opportunities. This positive anticipation is attractive to employers.",
    },
    {
      emotion: "optimistic",
      keywords: ["optimistic", "positive outlook", "buoyant", "sanguine"],
      message:
        "Your optimism reflects a forward-thinking and positive mindset, which can contribute to a proactive and resilient work attitude.",
    },

    // Curious Emotions
    {
      emotion: "curious",
      keywords: [
        "curious",
        "interested",
        "eager to learn",
        "inquisitive",
        "keen",
        "intrigued",
      ],
      message:
        "Your curiosity and eagerness to learn are excellent traits. They demonstrate your willingness to grow and adapt, which are highly valued in dynamic work environments.",
    },

    // Indifferent Emotions
    {
      emotion: "indifferent",
      keywords: [
        "indifferent",
        "uninterested",
        "apathetic",
        "detached",
        "lukewarm",
      ],
      message:
        "Your response appears indifferent or lacking in enthusiasm. Try to convey more interest and passion for the role to make a stronger impression.",
    },

    // Additional Emotions
    {
      emotion: "empathetic",
      keywords: [
        "empathetic",
        "understanding",
        "compassionate",
        "sympathetic",
        "considerate",
      ],
      message:
        "Your empathy demonstrates your ability to connect with others and consider their perspectives, which is invaluable for teamwork and leadership roles.",
    },
    {
      emotion: "confused",
      keywords: ["confused", "unclear", "bewildered", "perplexed", "puzzled"],
      message:
        "Your response indicates some confusion or uncertainty. It's okay to seek clarification when needed, as it shows your commitment to understanding and accuracy.",
    },
    {
      emotion: "skeptical",
      keywords: ["skeptical", "doubtful", "cautious", "hesitant", "wary"],
      message:
        "Your response suggests skepticism or caution, indicating critical thinking. Balance this with openness to demonstrate both analytical skills and adaptability.",
    },
    {
      emotion: "surprised",
      keywords: ["surprised", "astonished", "amazed", "stunned", "startled"],
      message:
        "You convey surprise, which can indicate openness to new experiences and adaptability. Ensure that your responses remain composed to maintain professionalism.",
    },
    {
      emotion: "relaxed",
      keywords: [
        "relaxed",
        "calm",
        "composed",
        "serene",
        "tranquil",
        "peaceful",
      ],
      message:
        "You come across as calm and composed, which can be very reassuring in an interview setting. Balance your calmness with active engagement to demonstrate both confidence and enthusiasm.",
    },
  ];

  // Iterate through each emotion and return the first matching emotion
  for (let i = 0; i < emotions.length; i++) {
    if (containsKeyword(emotions[i].keywords)) {
      return {
        emotion: emotions[i].emotion,
        message: emotions[i].message,
      };
    }
  }

  // Default Neutral Feedback if no emotions matched
  return {
    emotion: "neutral",
    message:
      "Your response seems neutral. Adding a bit more emotion, confidence, or engagement could help strengthen your answers and make them more compelling.",
  };
};
