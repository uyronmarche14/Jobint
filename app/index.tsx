
import { View } from "react-native";
import { auth } from './../configs/FirebaseConfig';
import Login from './screens/splash-mainpage';

export default function Index() {

  const user = auth.currentUser;

  return (
    <View
      style={{ flex:1 }}>
        <Login />
    </View>
  );
}

