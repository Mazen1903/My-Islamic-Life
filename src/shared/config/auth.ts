// Clerk Auth Configuration
export const AuthConfig = {
  // Clerk automatically handles OAuth redirects
  redirectUri: {
    scheme: 'self-development-app',
    web: 'http://localhost:19006',
  },
  // Sign-in/up options (configured in Clerk Dashboard)
  signInOptions: {
    emailAndPassword: true,
    googleOAuth: true,
    appleOAuth: true,
    microsoftOAuth: true,
    // You can enable more options in Clerk Dashboard:
    // phoneNumber: true,
    // facebookOAuth: true,
    // githubOAuth: true,
    // discordOAuth: true,
  },
} as const; 