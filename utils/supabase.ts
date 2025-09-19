import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// Use Expo public envs so values are available on the client bundle
const supabaseUrl =
  (process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined) ||
  (process.env.SUPABASE_PROJECT_URL as string | undefined);

const supabaseAnonKey =
  (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
  (process.env.SUPABASE_API_KEY as string | undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase env missing. Define EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env.local (or app config)."
  );
}

export const supabase = createClient(
  supabaseUrl as string,
  supabaseAnonKey as string,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
