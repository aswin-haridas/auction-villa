"use client";
import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import { supabase } from './client';

export const checkAuth = async (username: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('username')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error) throw error;

    setUsernameInSession(username);
    return true;
  } catch (error) {
    throw new Error('Invalid username or password');
  }
};

const SESSION_KEY = "username";
const EXPIRY_TIME_MS = 4 * 60 * 60 * 1000; // 4 hours

interface SessionData {
  username: string;
  expiryTime: number;
}

const getSessionData = (): SessionData | null => {
  try {
    const sessionData = sessionStorage.getItem(SESSION_KEY);
    return sessionData ? (JSON.parse(sessionData) as SessionData) : null;
  } catch (error) {
    console.error("Error parsing session data:", error);
    return null;
  }
};

const setSessionData = (username: string): void => {
  const expiryTime = Date.now() + EXPIRY_TIME_MS;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username, expiryTime }));
};

const clearSession = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
};

const isSessionValid = (): boolean => {
  const sessionData = getSessionData();
  return !!sessionData && Date.now() < sessionData.expiryTime;
};

export const getUsername = (): string | null => {
  const sessionData = getSessionData();
  return sessionData?.username || null;
};

export const setUsernameInSession = (username: string): void => {
  if (!username) return;
  setSessionData(username);
};

export const checkUsernameExists = (): string => {
  return getUsername() || "###";
};

export const useValidateSession = (): void => {
  const router = useRouter();

  useEffect(() => {
    if (!isSessionValid()) {
      clearSession();
      router.push("/auth");
    }
  }, [router]);
};

export const useSignOut = (): (() => void) => {
  const router = useRouter();
  return useCallback(() => {
    clearSession();
    router.push("/auth");
  }, [router]);
};

export default {
  getUsername,
  setUsernameInSession,
  checkUsernameExists,
  useValidateSession,
  useSignOut,
  checkAuth,
};
