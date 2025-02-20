// Import all JSON files
import SE from "./SE.json";
import ML from "./ML.json";
import CS from "./cs.json";
import DS from "./datascience.json";
import mobile from "./mobile.json";
import frontend from "./frontend.json";

// Combine all categories into a single object
export const quizData = [
  ...SE.categories,
  ...ML.categories,
  ...CS.categories,
  ...DS.categories,
  ...mobile.categories,
  ...frontend.categories,
  // Add more category arrays here if needed
].reduce((acc, categoryObj) => {
  const categoryName = categoryObj.name;
  acc[categoryName] = {
    title: categoryName,
    questions: categoryObj.questions,
  };
  return acc;
}, {});
