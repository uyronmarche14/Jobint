// constants/constants.js
import backendQuestions from "../DATA/backend.json";
import dataScienceQuestions from "../DATA/datascience.json";
import frontendQuestions from "../DATA/frontend.json";
import softwareEngineerQuestions from "../DATA/softwareengineer.json";
import artificialIntelligenceQuestions from "../DATA/ai.json";
import blockchainQuestions from "../DATA/blockchain.json";
import cloudEngQuestions from "../DATA/cloudEng.json";
import cybersecurityQuestions from "../DATA/cs.json";
import databaseAdminQuestions from "../DATA/dba.json";
import embeddedQuestions from "../DATA/ese.json";
import itQuestions from "../DATA/it.json";
import machineLearningQuestions from "../DATA/ml.json";
import mobileQuestions from "../DATA/mobile.json";

export const colors = {
  primary: "#6200ee",
  secondary: "#03dac4",
  background: "#f5f5f5",
  text: "#000000",
  lightText: "#6b6b6b",
};

export const jobTypes = [
  "datascience",
  "softwareengineer",
  "frontend",
  "backend",
  "artificialIntelligence",
  "blockchain",
  "cloudeng",
  "cybersecurity",
  "database",
  "embedded",
  "IT",
  "machineLearning",
  "mobile",
];

export const difficulties = ["Easy", "Medium", "Hard"];

export const jobQuestions = {
  datascience: dataScienceQuestions,
  softwareengineer: softwareEngineerQuestions,
  frontend: frontendQuestions,
  backend: backendQuestions,
  artificialIntelligence: artificialIntelligenceQuestions,
  blockchain: blockchainQuestions,
  cloudeng: cloudEngQuestions,
  cybersecurity: cybersecurityQuestions,
  database: databaseAdminQuestions,
  embedded: embeddedQuestions,
  IT: itQuestions,
  machineLearning: machineLearningQuestions,
  mobile: mobileQuestions,
};
