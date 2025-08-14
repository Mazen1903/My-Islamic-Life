import React, { createContext, useContext, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser, useSignIn, useSignUp, useOAuth } from '@clerk/clerk-expo';
import { User, AuthContextType } from '@/shared/types';
import { AuthService } from '@/shared/services/auth.service';
import { supabaseCommunityService } from '@/shared/services/supabase-community.service';

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signInWithApple: async () => {},
  signInWithMicrosoft: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { signIn, setActive } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: 'oauth_apple' });
  const { startOAuthFlow: startMicrosoftOAuthFlow } = useOAuth({ strategy: 'oauth_microsoft' });

  // Convert Clerk user to our User type
  const user: User | null = clerkUser ? AuthService.mapClerkUserToUser(clerkUser) : null;
  
  // Loading state - true when Clerk is not loaded or when authentication is in progress
  const isLoading = !isLoaded;

  // Sync user to Supabase when Clerk user changes
  useEffect(() => {
    const syncUserToSupabase = async () => {
      if (clerkUser && isLoaded) {
        // Sync user to Supabase (this handles errors internally)
        await supabaseCommunityService.syncUser(clerkUser);
      }
    };

    syncUserToSupabase();
  }, [clerkUser, isLoaded]);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      if (!signIn) throw new Error('Sign in not available');

      // Start the sign-in process using the email and password
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        // If sign-in is complete, set the active session
        await setActive({ session: result.createdSessionId });
      } else {
        // If sign-in is not complete, handle any required steps
        console.error('Sign-in incomplete:', result);
        throw new Error('Sign in failed - please check your credentials');
      }
    } catch (error: any) {
      console.error('Email sign-in failed:', error);
      
      // Map Clerk errors to user-friendly messages
      let errorMessage = 'Sign in failed';
      if (error?.errors?.[0]?.code === 'form_identifier_not_found') {
        errorMessage = 'No account found with this email';
      } else if (error?.errors?.[0]?.code === 'form_password_incorrect') {
        errorMessage = 'Invalid email or password';
      } else if (error?.errors?.[0]?.code === 'form_identifier_exists') {
        errorMessage = 'Invalid email address';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      if (!signUp) throw new Error('Sign up not available');

      // Validation
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Start the sign-up process
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      if (result.status === 'complete') {
        // If sign-up is complete, set the active session
        await setActiveSignUp({ session: result.createdSessionId });
      } else if (result.status === 'missing_requirements') {
        // Handle email verification if required
        if (result.unverifiedFields.includes('email_address')) {
          // Send verification email
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          throw new Error('Please check your email and verify your account');
        }
      } else {
        console.error('Sign-up incomplete:', result);
        throw new Error('Sign up failed - please try again');
      }
    } catch (error: any) {
      console.error('Email sign-up failed:', error);
      
      // Map Clerk errors to user-friendly messages
      let errorMessage = error.message || 'Sign up failed';
      if (error?.errors?.[0]?.code === 'form_identifier_exists') {
        errorMessage = 'An account with this email already exists';
      } else if (error?.errors?.[0]?.code === 'form_password_pwned') {
        errorMessage = 'Password is too weak - please choose a stronger password';
      } else if (error?.errors?.[0]?.code === 'form_param_format_invalid') {
        errorMessage = 'Invalid email address';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Start the OAuth flow
      const { createdSessionId, setActive } = await startGoogleOAuthFlow();

      if (createdSessionId) {
        // Set the active session
        await setActive!({ session: createdSessionId });
      } else {
        throw new Error('Google sign in failed');
      }
    } catch (error: any) {
      console.error('Google sign-in failed:', error);
      
      let errorMessage = 'Google sign in failed';
      if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
        errorMessage = 'Google sign in was cancelled';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signInWithApple = async () => {
    try {
      // Start the Apple OAuth flow
      const { createdSessionId, setActive } = await startAppleOAuthFlow();

      if (createdSessionId) {
        // Set the active session
        await setActive!({ session: createdSessionId });
      } else {
        throw new Error('Apple sign in failed');
      }
    } catch (error: any) {
      console.error('Apple sign-in failed:', error);
      
      let errorMessage = 'Apple sign in failed';
      if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
        errorMessage = 'Apple sign in was cancelled';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signInWithMicrosoft = async () => {
    try {
      // Start the Microsoft OAuth flow
      const { createdSessionId, setActive } = await startMicrosoftOAuthFlow();

      if (createdSessionId) {
        // Set the active session
        await setActive!({ session: createdSessionId });
      } else {
        throw new Error('Microsoft sign in failed');
      }
    } catch (error: any) {
      console.error('Microsoft sign-in failed:', error);
      
      let errorMessage = 'Microsoft sign in failed';
      if (error.message?.includes('cancelled') || error.message?.includes('canceled')) {
        errorMessage = 'Microsoft sign in was cancelled';
      }
      
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      await clerkSignOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signInWithMicrosoft,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 