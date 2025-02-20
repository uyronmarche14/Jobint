import axios from "axios";
import { Buffer } from "buffer"; // Import Buffer
import { Audio } from "expo-av";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

// Custom recording options for better audio quality
const recordingOptions = {
  isMeteringEnabled: true,
  // iOS options
  ios: {
    extension: ".wav",
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  // Android options
  android: {
    extension: ".wav",
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_PCM,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 128000,
  },
};

// Function to start recording
export const startRecording = async (setRecording) => {
  try {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      alert("Permission to access microphone is required!");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(recordingOptions);
    await recording.startAsync();
    setRecording(recording);
  } catch (err) {
    console.error("Failed to start recording", err);
  }
};

// Function to stop recording and handle transcription
export const stopRecording = async (
  recording,
  setRecordingURI,
  setTranscription,
  setLoadingTranscription
) => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordingURI(uri);

    // Automatically trigger transcription after stopping recording
    transcribeAudio(uri, setTranscription, setLoadingTranscription);
  } catch (err) {
    console.error("Failed to stop recording", err);
  }
};

// Function to handle transcription
const DEEPGRAM_API_KEY = Constants.expoConfig?.extra?.deepgramApiKey;

// Optional: Validate API Key Length (Assuming Deepgram keys have a consistent length)

export const transcribeAudio = async (
  uri,
  setTranscription,
  setLoadingTranscription
) => {
  setLoadingTranscription(true);

  try {
    // Read the file as Base64
    const base64File = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert Base64 to binary data
    const binaryData = Buffer.from(base64File, "base64");

    const response = await axios.post(
      "https://api.deepgram.com/v1/listen",
      binaryData,
      {
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          "Content-Type": "audio/wav",
        },
        params: {
          punctuate: true, // Adds punctuation
          language: "en-US", // Specify language
        },
      }
    );

    if (
      response.data &&
      response.data.results &&
      response.data.results.channels[0].alternatives[0].transcript
    ) {
      setTranscription(
        response.data.results.channels[0].alternatives[0].transcript
      );
    } else {
      console.log("Transcription error: Invalid response structure.");
      Alert.alert("Transcription Failed");
    }
  } catch (error) {
    console.error(
      "Error during transcription:",
      error.response ? error.response.data : error.message
    );
    Alert.alert(
      "Transcription Failed",
      "There was an error processing your transcription."
    );
  } finally {
    setLoadingTranscription(false);
  }
};

// Function to play the recording
export const playRecording = async (uri, sound, setSound) => {
  try {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );
    setSound(newSound);
  } catch (err) {
    console.error("Failed to play the recording", err);
  }
};
