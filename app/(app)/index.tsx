import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <Text className="text-4xl font-bold">Hello SignedIn User!</Text>
    </SafeAreaView>
  );
}
