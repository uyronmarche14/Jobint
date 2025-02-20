import {
    GoogleSignin,
    isErrorWithCode,
    statusCodes,
} from "@react-native-google-signin/google-signin";

export const signIn = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        console.log(userInfo.user);
    } catch (error) {
        console.log("Error object:", error); // Log the full error object for debugging

        if (isErrorWithCode(error)) {
            switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                    console.log("Sign in cancelled");
                    break;
                case statusCodes.IN_PROGRESS:
                    console.log("Sign in already in progress");
                    break;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    console.log("Play services not available");
                    break;
                default:
                    console.log("Unknown error occurred with code:", error.code);
            }
        } else {
            console.log("An unexpected error occurred", error);
        }
    }
};
