import { useAuth } from "@/context/AuthContextProvider";
import { Redirect, Slot } from "expo-router";
import React from "react";

export default function AppGroupLayout() {
  const { user, isLoading } = useAuth();

  // While splash is shown, do nothing. SplashScreenController controls hiding.
  if (isLoading) return null;

  if (!user) return <Redirect href="/(auth)/sign-in" />;

  return <Slot />;
}
