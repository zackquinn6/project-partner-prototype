import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { checkAuthRateLimit, recordAuthAttempt } from '@/utils/securityUtils';
import { sanitizeInput } from '@/utils/inputSanitization';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
    
    // Check server-side rate limiting
    try {
      const { data: rateLimitResult } = await supabase.functions.invoke('auth-rate-limit', {
        body: {
          email: sanitizedEmail,
          action: 'check'
        }
      });
      
      if (!rateLimitResult?.allowed) {
        return { error: { message: 'Too many login attempts. Please try again later.' } };
      }
    } catch (rateLimitError) {
      console.warn('Rate limit check failed, falling back to client-side:', rateLimitError);
      // Fallback to client-side rate limiting
      if (!checkAuthRateLimit(sanitizedEmail)) {
        return { error: { message: 'Too many login attempts. Please try again later.' } };
      }
      recordAuthAttempt(sanitizedEmail);
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });
    
    // Log failed login attempts on server
    if (error) {
      try {
        await supabase.functions.invoke('auth-rate-limit', {
          body: {
            email: sanitizedEmail,
            action: 'record_failure',
            user_agent: navigator.userAgent
          }
        });
      } catch (logError) {
        console.warn('Failed to log login attempt on server:', logError);
        // Fallback to client-side logging
        try {
          await supabase.rpc('log_failed_login', {
            user_email: sanitizedEmail,
            ip_addr: null,
            user_agent_string: navigator.userAgent
          });
        } catch (fallbackError) {
          console.warn('Failed to log login attempt:', fallbackError);
        }
      }
    }
    
    return { error };
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        // Show user-friendly error message and recommend direct signup
        const userFriendlyError = { 
          message: 'Google sign-up is currently experiencing issues. Please try signing up directly with your email and password instead.' 
        };
        return { error: userFriendlyError };
      }
      
      return { error };
    } catch (err) {
      // Fallback error for any unexpected issues
      return { 
        error: { 
          message: 'Google sign-up is currently experiencing issues. Please try signing up directly with your email and password instead.' 
        } 
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};