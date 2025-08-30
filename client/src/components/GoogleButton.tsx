import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../features/auth/api";
import { useAuthStore } from "../features/auth/useAuthStore";
import { GOOGLE_CLIENT_ID } from "../config";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function GoogleButton() {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setError = useAuthStore((s) => s.setError);

  const [isLoading, setIsLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const scriptLoaded = useRef(false);
  const mountedRef = useRef(true);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      if (!mountedRef.current) return;

      try {
        setIsLoading(true);
        const result = await googleLogin(response.credential);
        setUser(result.data.data.user);
        setError(null);
        navigate("/welcome");
      } catch (error: any) {
        setError(
          error.response?.data?.message || "Google login failed. Please try again."
        );
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    [navigate, setError, setUser]
  );

  const initializeGoogleAuth = useCallback(
    (clientId: string) => {
      if (!mountedRef.current || initialized) return;

      const google = window.google;
      if (!google?.accounts?.id) {
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          setTimeout(() => initializeGoogleAuth(clientId), 1000 * retryCount.current);
        } else {
          setGoogleError("Google authentication service is not available.");
          setIsLoading(false);
        }
        return;
      }

      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        if (ref.current && mountedRef.current) {
          ref.current.innerHTML = "";
          google.accounts.id.renderButton(ref.current, {
            type: "standard",
            size: "large",
            shape: "pill",
            text: "continue_with",
            theme: "outline",
          });
          setInitialized(true);
          setIsLoading(false);
        }
      } catch (err) {
        setGoogleError("Failed to initialize Google authentication.");
        setIsLoading(false);
      }
    },
    [handleCredentialResponse, initialized]
  );

  useEffect(() => {
    mountedRef.current = true;
    const clientId = GOOGLE_CLIENT_ID;

    if (!clientId) {
      setGoogleError("Google authentication is not configured properly.");
      setIsLoading(false);
      return;
    }

    if (window.google?.accounts?.id) {
      initializeGoogleAuth(clientId);
    } else if (!scriptLoaded.current) {
      scriptLoaded.current = true;

      const script = document.createElement("script");
      script.id = "google-client-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogleAuth(clientId);
      script.onerror = () => {
        setGoogleError("Failed to load Google authentication. Please try again later.");
        setIsLoading(false);
      };

      document.body.appendChild(script);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [initializeGoogleAuth]);

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
