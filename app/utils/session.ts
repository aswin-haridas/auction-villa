import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SESSION_KEY = 'username';
const EXPIRY_TIME_MS = 4 * 60 * 60 * 1000; // 4 hours

const getSessionData = () => {
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;
  return JSON.parse(sessionData);
};

function useValidateSession() {
  const router = useRouter();

  useEffect(() => {
    const sessionData = getSessionData();
    if (!sessionData) {
      router.push('/auth');
      return;
    }

    const currentTime = Date.now();
    if (currentTime > sessionData.expiryTime || !sessionData.username) {
      sessionStorage.removeItem(SESSION_KEY);
      router.push('/auth');
    }
  }, [router]);
}

export const setUsernameInSession = (username: string) => {
  const expiryTime = Date.now() + EXPIRY_TIME_MS;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username, expiryTime }));
};

export const checkUsernameExists = (): string => {
  const sessionData = getSessionData();
  if (!sessionData) return '###';
  return sessionData.username;
};

export const useSignOut = () => {
  const router = useRouter();
  return () => {
    sessionStorage.removeItem(SESSION_KEY);
    router.push('/auth');
  };
};

export default useValidateSession;
