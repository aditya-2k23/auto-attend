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

export default function SignUpScreen() {
  const router = useRouter();
  const { user, isLoading, signUpWithPassword } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      // Using a cast to satisfy typed routes when root "/" isn't present in the generated union
      router.replace("/" as any);
    }
  }, [isLoading, user]);

  const onSignUp = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert("Missing info", "Please fill all fields");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Mismatch", "Passwords do not match");
      return;
    }
    setSubmitting(true);
    const error = await signUpWithPassword(email.trim(), password, {
      data: { name: name.trim() },
    });
    setSubmitting(false);
    if (error) {
      Alert.alert("Sign up failed", error.message);
    } else {
      Alert.alert(
        "Check your email",
        "We've sent you a confirmation email. Please verify your account before signing in.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/sign-in") }]
      );
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
        <Text className="text-3xl font-bold">Create account</Text>

        <View className="gap-3">
          <View>
            <Text className="mb-2 text-base">Full name</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-3"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />
          </View>
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
              placeholder="Create a password"
            />
          </View>
          <View>
            <Text className="mb-2 text-base">Confirm password</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-3"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Re-enter password"
            />
          </View>
        </View>

        <TouchableOpacity
          className="bg-black rounded-md py-3 items-center"
          disabled={submitting}
          onPress={onSignUp}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold">Create account</Text>
          )}
        </TouchableOpacity>

        <Text className="text-center">
          Already have an account?{" "}
          <Link href="/(auth)/sign-in" className="font-semibold underline">
            Sign in
          </Link>
        </Text>
      </View>
    </SafeAreaView>
  );
}
