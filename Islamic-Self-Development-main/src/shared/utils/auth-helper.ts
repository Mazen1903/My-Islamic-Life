import { useAuth } from '@clerk/clerk-expo';

// Auth helper class for getting authentication tokens
class AuthHelper {
  private static instance: AuthHelper;
  private authInstance: any = null; // Will hold the auth context

  static getInstance(): AuthHelper {
    if (!AuthHelper.instance) {
      AuthHelper.instance = new AuthHelper();
    }
    return AuthHelper.instance;
  }

  // Set the auth instance (call this from a component that has access to useAuth)
  setAuthInstance(authInstance: any) {
    this.authInstance = authInstance;
  }

  // Get the current auth token
  async getAuthToken(): Promise<string | null> {
    try {
      if (!this.authInstance || !this.authInstance.getToken) {
        console.warn('Auth instance not set. Call setAuthInstance first.');
        return null;
      }

      const token = await this.authInstance.getToken();
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Get auth headers for API calls
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }

    return {
      'Content-Type': 'application/json'
    };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authInstance && this.authInstance.isSignedIn;
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    if (this.authInstance && this.authInstance.userId) {
      return this.authInstance.userId;
    }
    return null;
  }
}

// Export singleton instance
export const authHelper = AuthHelper.getInstance();

// React Hook wrapper for easy use in components
export const useAuthHelper = () => {
  const authInstance = useAuth();
  
  // Set the auth instance when this hook is used
  authHelper.setAuthInstance(authInstance);
  
  return {
    getAuthToken: () => authHelper.getAuthToken(),
    getAuthHeaders: () => authHelper.getAuthHeaders(),
    isAuthenticated: authHelper.isAuthenticated(),
    getCurrentUserId: () => authHelper.getCurrentUserId(),
  };
}; 