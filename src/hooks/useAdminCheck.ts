import { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.email) {
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

        setIsAdmin(isAdminEmail || isAdminDomain || hasAdminRole);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, isLoading, userEmail };
};
