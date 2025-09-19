import SplashScreenController from "@/utils/SplashScreenController";
import { Stack } from "expo-router";
import { AuthContextProvider } from "../context/AuthContextProvider";

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <SplashScreenController />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthContextProvider>
  );
}
