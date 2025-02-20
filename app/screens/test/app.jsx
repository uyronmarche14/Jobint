import React, { useState } from "react";
import { View } from "react-native";
import InterviewScreen from "./InterviewScreen";
import JobSelection from "./JobSelection";
export default function App() {
    const [jobType, setJobType] = useState("");
    const [difficulty, setDifficulty] = useState("");

    console.log('Current jobType:', jobType);
    console.log('Current difficulty:', difficulty);

    return (
        <View style={styles.container}>
        {!jobType || !difficulty ? (

            <JobSelection
            jobType={jobType}
            setJobType={setJobType}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            />
        ) : (

            <InterviewScreen
            jobType={jobType}
            difficulty={difficulty}
            resetSelection={() => {
                setJobType("");
                setDifficulty("");
            }}
            />
        )}
        </View>
    );
    };

    export const styles = {
    container: {
        flex: 1,
        backgroundColor: "#292929",
    },
    // other styles...
    };
