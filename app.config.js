import "dotenv/config";

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra, // Preserve existing extra values, like deepgramApiKey
    deepgramApiKey: process.env.DEEPGRAM_API_KEY,
    eas: {
      projectId: "e61de2aa-7061-460b-a598-96faa09d20a7" // Add your EAS project ID here
    }
  },
});
