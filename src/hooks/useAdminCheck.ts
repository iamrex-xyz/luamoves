import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Hardcoded list of admin email domains/addresses
const ADMIN_EMAILS = [
  // Add specific admin emails here
  // e.g., "admin@lua.nl"
];

const ADMIN_DOMAINS = [
  "@lua.nl",
  "@luamoves.nl"
];

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const checkAdminStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUserEmail(null);
        setIsLoading(false);
        return;
      }

      const user = session.user;
      setIsAuthenticated(true);

      if (!user.email) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      setUserEmail(user.email);

      // Check if email is in admin list
      const isAdminEmail = ADMIN_EMAILS.includes(user.email);
      
      // Check if email domain is in admin domains
      const isAdminDomain = ADMIN_DOMAINS.some(domain => 
        user.email?.endsWith(domain)
      );

      // Also check the user_roles table for admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      const hasAdminRole = !!roleData;

      console.log('[AdminCheck] User:', user.email, 'isAdminEmail:', isAdminEmail, 'isAdminDomain:', isAdminDomain, 'hasAdminRole:', hasAdminRole);

      setIsAdmin(isAdminEmail || isAdminDomain || hasAdminRole);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Set up the auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AdminCheck] Auth state changed:', event, session?.user?.email);
      
      // Re-check admin status on any auth state change
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        checkAdminStatus();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUserEmail(null);
        setIsLoading(false);
      }
    });

    // Then check current session
    checkAdminStatus();

    return () => subscription.unsubscribe();
  }, [checkAdminStatus]);

  return { isAdmin, isAuthenticated, isLoading, userEmail };
};
