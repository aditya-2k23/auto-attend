import type { AuthError, Session, User } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../utils/supabase";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<AuthError | null>;
  signUpWithPassword: (
    email: string,
    password: string,
    options?: {
      // optional user metadata to set at signup
      data?: Record<string, any>;
      // optional redirect URL for email confirmations (web only)
      emailRedirectTo?: string;
    }
  ) => Promise<AuthError | null>;
  signOut: () => Promise<AuthError | null>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial session and subscribe to auth changes
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("supabase.auth.getSession error", error);
        }
        if (!isMounted) return;
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
      } catch (e) {
        console.warn("Failed to get session", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    );

    return () => {
      isMounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return error ?? null;
    },
    []
  );

  const signUpWithPassword = useCallback(
    async (
      email: string,
      password: string,
      options?: { data?: Record<string, any>; emailRedirectTo?: string }
    ) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options?.data,
          emailRedirectTo: options?.emailRedirectTo,
        },
      });
      return error ?? null;
    },
    []
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setSession(null);
      setUser(null);
    }
    return error ?? null;
  }, []);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data?.session ?? null);
    setUser(data?.session?.user ?? null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      isLoading,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      refreshSession,
    }),
    [
      session,
      user,
      isLoading,
      signInWithPassword,
      signUpWithPassword,
      signOut,
      refreshSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Minimal helper to upsert the authenticated user into a `users` table.
async function upsertAuthedUser() {
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u) return;

  // Shape: id (uuid, PK), email (text), created_at (timestamptz), last_sign_in_at (timestamptz), raw_user_metadata (jsonb)
  const nameFromMetadata = (
    u.user_metadata?.name as string | undefined
  )?.trim();
  const fallbackName = (u.email?.split("@")[0] ?? "User").toString();
  const payload = {
    id: u.id,
    name:
      nameFromMetadata && nameFromMetadata.length > 0
        ? nameFromMetadata
        : fallbackName,
    email: u.email!,
  } as const;

  const { error } = await supabase.from("users").upsert(payload, {
    onConflict: "id",
  });
  if (error) {
    console.warn("Failed to upsert user row", error);
  }
}

// Subscribe to auth state changes at module scope so it's always active once provider is imported
supabase.auth.onAuthStateChange(async (event) => {
  if (
    event === "SIGNED_IN" ||
    event === "TOKEN_REFRESHED" ||
    event === "USER_UPDATED"
  ) {
    upsertAuthedUser().catch(() => {});
  }
});

// Also run an upsert when the provider mounts and a session already exists
void (async () => {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      await upsertAuthedUser();
    }
  } catch {}
})();

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth must be used within an AuthContextProvider");
  return ctx;
}

export default AuthContextProvider;
