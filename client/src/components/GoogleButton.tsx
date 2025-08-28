import React, { useEffect, useRef } from 'react';
import { googleLogin } from '../features/auth/api';
import { useAuthStore } from '../features/auth/useAuthStore';

export default function GoogleButton() {
  const ref = useRef<HTMLDivElement>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const setError = useAuthStore((s) => s.setError);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!(window as any).google || !ref.current || !clientId) {
      return;
    }

    const google = (window as any).google;
    
    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        try {
          const result = await googleLogin(response.credential);
          setUser(result.data.data.user);
          setError(null);
        } catch (error: any) {
          setError(error.response?.data?.message || 'Google login failed');
        }
      }
    });

    google.accounts.id.renderButton(ref.current, {
      type: 'standard',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      theme: 'outline'
    });
  }, [setUser, setError]);

  return (
    <div className="w-full">
      <div ref={ref} className="w-full" />
    </div>
  );
}
