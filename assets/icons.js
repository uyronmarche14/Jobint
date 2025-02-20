import { AntDesign, Feather, Foundation } from "@expo/vector-icons";

export const icons = {
  dashboard: (props) => <AntDesign name="home" size={26} {...props} />,
  explore: (props) => <AntDesign name="profile" size={26} {...props} />,
  questions: (props) => (
    <Foundation name="clipboard-notes" size={26} {...props} />
  ),
  profile: (props) => <AntDesign name="user" size={26} {...props} />,
};
