// config.js
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,
};