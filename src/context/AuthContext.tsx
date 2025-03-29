
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isPremium: boolean;
  userFeatures: string[];
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkFeatureAccess: (featureName: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [userFeatures, setUserFeatures] = useState<string[]>([]);

  // Initialize auth state
  useEffect(() => {
    // Set up the subscription first to avoid race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Fetch premium status on auth change, using setTimeout to avoid Supabase deadlock
        if (newSession?.user) {
          setTimeout(() => {
            fetchUserPremiumStatus(newSession.user.id);
          }, 0);
        } else {
          setIsPremium(false);
          setUserFeatures([]);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserPremiumStatus(currentSession.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch premium status and features
  const fetchUserPremiumStatus = async (userId: string) => {
    try {
      // Fetch profile for premium status
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching premium status:', profileError);
        return;
      }
      
      setIsPremium(profileData?.is_premium || false);
      
      // Fetch premium features
      const { data: featuresData, error: featuresError } = await supabase
        .from('premium_features')
        .select('feature_name, expiry_date, is_active')
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (featuresError) {
        console.error('Error fetching features:', featuresError);
        return;
      }
      
      // Filter out expired features
      const now = new Date();
      const activeFeatures = featuresData?.filter(feature => 
        !feature.expiry_date || new Date(feature.expiry_date) > now
      ).map(feature => feature.feature_name);
      
      setUserFeatures(activeFeatures || []);
      
    } catch (error) {
      console.error('Error in fetchUserPremiumStatus:', error);
    }
  };

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      toast({
        title: 'Account created',
        description: 'Please check your email to confirm your registration.',
      });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: 'Sign out failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has access to a specific feature
  const checkFeatureAccess = (featureName: string) => {
    // If user is premium and the feature is in their list, grant access
    return isPremium && userFeatures.includes(featureName);
  };

  const value = {
    session,
    user,
    isLoading,
    isPremium,
    userFeatures,
    signIn,
    signUp,
    signOut,
    checkFeatureAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
