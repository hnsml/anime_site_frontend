"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthData } = useAuth();

  useEffect(() => {
    // Handle the case where searchParams might be null
    if (!searchParams) {
      router.push('/login?error=' + encodeURIComponent('No search parameters found'));
      return;
    }

    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      console.error('Auth error:', error);
      router.push('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Use the auth context method to set authentication data
        setAuthData(user, token);
        
        // Redirect to home
        router.push('/');
      } catch (e) {
        console.error('Failed to parse user data:', e);
        router.push('/login?error=' + encodeURIComponent('Invalid authentication response'));
      }
    } else {
      router.push('/login?error=' + encodeURIComponent('Missing authentication data'));
    }
  }, [searchParams, router, setAuthData]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-white">Authenticating...</div>
    </div>
  );
}