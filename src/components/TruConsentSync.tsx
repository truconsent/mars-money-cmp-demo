import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    truTagManager?: {
      identify?: (userId: string) => void;
      [key: string]: unknown;
    };
  }
}

function callIdentify(userId: string) {
  window.truTagManager?.identify?.(userId);
}

// Notifies the truConsent CDN SDK (cmp.min.js, loaded in index.html) of the
// logged-in user so it can check for and show any pending legacy consent
// reconsent popup. Covers both already-logged-in users (page load/refresh)
// and fresh logins, since `user` changes in both cases.
export default function TruConsentSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Delay slightly so any in-flight navigation completes before the
    // reconsent XHR fires (prevents it being cancelled mid-navigation).
    const timer = setTimeout(() => callIdentify(user.id), 200);
    return () => clearTimeout(timer);
  }, [user]);

  return null;
}
