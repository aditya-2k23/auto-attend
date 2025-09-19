import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContextProvider";

// Prevent auto-hide as early as possible on import
void SplashScreen.preventAutoHideAsync().catch(() => {
  // ignore if it was already called/hidden
});

/**
 * Keeps the splash screen visible until authentication loading completes.
 * Place this once near the root of the app (e.g., inside _layout.tsx).
 */
export default function SplashScreenController() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // auth finished loading; hide splash
      SplashScreen.hideAsync().catch(() => {
        // ignore errors if already hidden
      });
    }
  }, [isLoading]);

  return null;
}
