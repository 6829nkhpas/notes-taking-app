import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema, OtpInput } from '../schemas';
import { verifyOtp } from '../api';
import { useAuthStore } from '../useAuthStore';
import FormInput from '../../../components/FormInput';
import ErrorBanner from '../../../components/ErrorBanner';
import Loader from '../../../components/Loader';

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setError = useAuthStore((s) => s.setError);
  const error = useAuthStore((s) => s.error);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema)
  });

  const email = watch('email');
  const otp = watch('otp');

  // Pre-fill email from URL params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setValue('email', emailParam);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: OtpInput) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await verifyOtp(data.email, data.otp);
      setUser(result.data.data.user);
      navigate('/welcome');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to verify OTP';
      const code = error.response?.data?.code;
      setError(`${message}${code ? ` (${code})` : ''}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-24 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify your email</h1>
          <p className="text-gray-600">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {error && (
          <ErrorBanner 
            message={error} 
            onClose={() => setError(null)}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            label="Email address"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={email || ''}
            onChange={(e) => setValue('email', e.target.value)}
            error={errors.email?.message}
            required
          />

          <FormInput
            label="Verification code"
            name="otp"
            type="text"
            placeholder="Enter 6-digit code"
            value={otp || ''}
            onChange={(e) => setValue('otp', e.target.value)}
            error={errors.otp?.message}
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="form-button"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader size="sm" className="mr-2" />
                Verifying...
              </div>
            ) : (
              'Verify & Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Request new code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
