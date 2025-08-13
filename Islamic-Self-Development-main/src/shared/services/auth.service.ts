import { useAuth, useUser } from '@clerk/clerk-expo';
import { User, SignInCredentials, SignUpCredentials, ApiResponse } from '@/shared/types';

// Helper function to convert Clerk user to our User type
const mapClerkUserToUser = (clerkUser: any): User => {
  return {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || '',
    name: clerkUser.fullName || clerkUser.firstName || 'User',
    avatar: clerkUser.imageUrl || undefined,
  };
};

export class AuthService {
  // Note: With Clerk, you should use the useAuth and useUser hooks directly in components
  // This service class is maintained for compatibility with existing code structure
  // In a real migration, you'd gradually replace these with direct hook usage

  static async loadUser(): Promise<User | null> {
    // This method is not needed with Clerk as useUser hook provides real-time user data
    // Keeping for compatibility - components should migrate to useUser hook
    console.warn('AuthService.loadUser() is deprecated - use useUser hook from @clerk/clerk-expo instead');
    return null;
  }

  static async signInWithEmail(credentials: SignInCredentials): Promise<ApiResponse<User>> {
    // This method should not be called directly with Clerk
    // Use the signIn methods from useSignIn hook instead
    console.warn('AuthService.signInWithEmail() is deprecated - use useSignIn hook from @clerk/clerk-expo instead');
    
    return {
      success: false,
      error: 'Please use Clerk hooks directly. See updated AuthContext implementation.',
    };
  }

  static async signUpWithEmail(credentials: SignUpCredentials): Promise<ApiResponse<User>> {
    // This method should not be called directly with Clerk
    // Use the signUp methods from useSignUp hook instead
    console.warn('AuthService.signUpWithEmail() is deprecated - use useSignUp hook from @clerk/clerk-expo instead');
    
    return {
      success: false,
      error: 'Please use Clerk hooks directly. See updated AuthContext implementation.',
    };
  }

  static async signInWithGoogle(): Promise<ApiResponse<User>> {
    // This method should not be called directly with Clerk
    // Use the OAuth methods from useOAuth hook instead
    console.warn('AuthService.signInWithGoogle() is deprecated - use useOAuth hook from @clerk/clerk-expo instead');
    
    return {
      success: false,
      error: 'Please use Clerk hooks directly. See updated AuthContext implementation.',
    };
  }

  static async signOut(): Promise<void> {
    // This method should not be called directly with Clerk
    // Use the signOut method from useAuth hook instead
    console.warn('AuthService.signOut() is deprecated - use useAuth().signOut from @clerk/clerk-expo instead');
    throw new Error('Please use Clerk hooks directly. See updated AuthContext implementation.');
  }

  // Helper method to convert Clerk user to our User type (for use in AuthContext)
  static mapClerkUserToUser = mapClerkUserToUser;
} 