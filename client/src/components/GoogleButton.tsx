import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../features/auth/api";
import { useAuthStore } from "../features/auth/useAuthStore";
import { GOOGLE_CLIENT_ID } from "../config";

// Google API types
interface GoogleAccounts {
  id: {
    initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
    renderButton: (element: HTMLElement, options: any) => void;
  };
}

interface WindowWithGoogle extends Window {
  google?: GoogleAccounts;
}

declare const window: WindowWithGoogle;

export default function GoogleButton() {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setError = useAuthStore((s) => s.setError);
  const [isLoading, setIsLoading] = useState(true);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const clientId = GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error("GoogleButton: Missing Google Client ID");
      setGoogleError("Google authentication is not configured properly.");
      setIsLoading(false);
      return;
    }

    // Check if Google script is already loaded
    if ((window as any).google) {
      initializeGoogleAuth(clientId);
      return;
    }

    // Load Google script if not already loaded
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => initializeGoogleAuth(clientId);
    script.onerror = () => {
      console.error("Failed to load Google script");
      setGoogleError(
        "Failed to load Google authentication. Please try again later."
      );
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isMounted]);

  const initializeGoogleAuth = (clientId: string) => {
    try {
      if (!isMounted) return;

      console.log("Initializing Google Auth with clientId:", clientId);
      console.log("Google object available:", !!(window as any).google);
      console.log("Ref current:", !!ref.current);
      console.log("Component mounted:", isMounted);

      if (!ref.current) {
        console.log("GoogleButton: Ref not available, waiting...");
        setTimeout(() => initializeGoogleAuth(clientId), 50);
        return;
      }

      const google = (window as any).google;

      if (!google || !google.accounts || !google.accounts.id) {
        const errorMsg =
          "Google authentication API is not available. Make sure the Google script is loaded correctly.";
        console.error("GoogleButton:", errorMsg, { google });
        setGoogleError(
          "Google authentication service is not available. Please try email signup."
        );
        setIsLoading(false);
        return;
      }

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          console.log("Google auth callback received response:", !!response);
          try {
            setIsLoading(true);
            const result = await googleLogin(response.credential);
            setUser(result.data.data.user);
            setError(null);
            navigate("/welcome");
          } catch (error: any) {
            console.error("Google login failed:", error);
            setError(
              error.response?.data?.message ||
                "Google login failed. Please try again."
            );
          } finally {
            setIsLoading(false);
          }
        },
      });

      // Only render if the ref is still available and component is mounted
      if (ref.current && isMounted) {
        console.log("GoogleButton: Rendering button...");

        // Clear any existing buttons first
        while (ref.current.firstChild) {
          ref.current.removeChild(ref.current.firstChild);
        }

        google.accounts.id.renderButton(ref.current, {
          type: "standard",
          size: "large",
          shape: "pill",
          text: "continue_with",
          theme: "outline",
        });

        // Add a small delay before hiding the loader to ensure smooth transition
        setTimeout(() => setIsLoading(false), 100);
      }
    } catch (error) {
      console.error("Error initializing Google Auth:", error);
      setGoogleError(
        "Failed to initialize Google authentication. Please try email signup."
      );
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-11 flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (googleError) {
    return (
      <div className="text-sm text-gray-600 text-center py-2">
        {googleError} Please use email signup instead.
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={ref} className="w-full"></div>
    </div>
  );
}
