import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema, EmailInput } from "../schemas";
import { requestOtp } from "../api";
import { useAuthStore } from "../useAuthStore";
import ErrorBanner from "../../../components/ErrorBanner";
import Loader from "../../../components/Loader";
import GoogleButton from "../../../components/GoogleButton";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const setError = useAuthStore((s) => s.setError);
  const error = useAuthStore((s) => s.error);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
  });

  const email = watch("email");

  const onSubmit = async (data: EmailInput) => {
    try {
      setIsLoading(true);
      setError(null);
      await requestOtp(data.email);
      setSuccess(true);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string; code?: string } };
      };
      const message =
        axiosError?.response?.data?.message || "Failed to send OTP";
      const code = axiosError?.response?.data?.code;
      setError(`${message}${code ? ` (${code})` : ""}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 pb-24 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Check your email
            </h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to <strong>{email}</strong>
            </p>
          </div>

          <button
            onClick={() =>
              navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
            }
            className="form-button"
          >
            Continue to verification
          </button>

          <button
            onClick={() => setSuccess(false)}
            className="w-full mt-3 text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Use different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-24 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {error && (
          <ErrorBanner message={error} onClose={() => setError(null)} />
        )}

        <div className="space-y-6">
          <GoogleButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={`form-input ${
                  errors.email ? "border-red-500 focus:ring-red-500" : ""
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="form-button">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader size="sm" className="mr-2" />
                  Sending OTP...
                </div>
              ) : (
                "Send verification code"
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
