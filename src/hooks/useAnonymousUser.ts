import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "lua_anonymous_user_id";
const COOKIE_NAME = "lua_anon_id";

/**
 * Generate a unique anonymous user ID
 */
const generateAnonymousId = (): string => {
  return `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Set a cookie with the anonymous user ID
 */
const setCookie = (value: string, days: number = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${COOKIE_NAME}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

/**
 * Get the anonymous user ID from cookie
 */
const getCookie = (): string | null => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === COOKIE_NAME) {
      return value;
    }
  }
  return null;
};

/**
 * Hook to manage anonymous user identity
 * Creates and persists a unique ID for users before they authenticate
 */
export const useAnonymousUser = () => {
  const [anonymousUserId, setAnonymousUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize anonymous user ID on mount
  useEffect(() => {
    // First check localStorage
    let id = localStorage.getItem(STORAGE_KEY);
    
    // Then check cookie as fallback
    if (!id) {
      id = getCookie();
    }
    
    // If still no ID, generate one
    if (!id) {
      id = generateAnonymousId();
    }
    
    // Persist to both localStorage and cookie
    localStorage.setItem(STORAGE_KEY, id);
    setCookie(id);
    
    setAnonymousUserId(id);
    setIsInitialized(true);
    
    console.log("[useAnonymousUser] Initialized with ID:", id);
  }, []);

  /**
   * Clear anonymous user data (after successful authentication)
   */
  const clearAnonymousUser = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    // Clear cookie by setting expiry to past
    document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    setAnonymousUserId(null);
    console.log("[useAnonymousUser] Cleared anonymous user ID");
  }, []);

  /**
   * Get the current anonymous user ID (sync)
   */
  const getAnonymousUserId = useCallback((): string | null => {
    return localStorage.getItem(STORAGE_KEY) || getCookie();
  }, []);

  return {
    anonymousUserId,
    isInitialized,
    clearAnonymousUser,
    getAnonymousUserId,
  };
};
