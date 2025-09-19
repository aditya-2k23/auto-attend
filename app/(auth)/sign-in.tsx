import { useAuth } from "@/context/AuthContextProvider";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const router = useRouter();
  const { user, isLoading, signInWithPassword, signOut } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      // Already signed in: go to app
      router.replace("/" as any);
    }
  }, [isLoading, user]);

  const onSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter email and password");
      return;
    }
    setSubmitting(true);
    const error = await signInWithPassword(email.trim(), password);
    setSubmitting(false);
    if (error) {
      Alert.alert("Sign in failed", error.message);
    } else {
      router.replace("/" as any);
    }
  };

  const onSignOut = async () => {
    setSubmitting(true);
    const error = await signOut();
    setSubmitting(false);
    if (error) {
      Alert.alert("Sign out failed", error.message);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 px-6 justify-center">
      <View className="gap-6">
        <Text className="text-3xl font-bold">Sign in</Text>

        {!user ? (
          <>
            <View className="gap-3">
              <View>
                <Text className="mb-2 text-base">Email</Text>
                <TextInput
                  className="border border-gray-300 rounded-md p-3"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                />
              </View>
              <View>
                <Text className="mb-2 text-base">Password</Text>
                <TextInput
                  className="border border-gray-300 rounded-md p-3"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-black rounded-md py-3 items-center"
              disabled={submitting}
              onPress={onSignIn}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Sign in</Text>
              )}
            </TouchableOpacity>

            <Text className="text-center">
              New here?{" "}
              <Link href="/(auth)/sign-up" className="font-semibold underline">
                Create an account
              </Link>
            </Text>
          </>
        ) : (
          <>
            <Text className="text-base">You are already signed in.</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="bg-black rounded-md py-3 px-4 items-center"
                onPress={() => router.replace("/" as any)}
              >
                <Text className="text-white font-semibold">Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="border border-gray-300 rounded-md py-3 px-4 items-center"
                disabled={submitting}
                onPress={onSignOut}
              >
                {submitting ? (
                  <ActivityIndicator />
                ) : (
                  <Text className="font-semibold">Sign out</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
