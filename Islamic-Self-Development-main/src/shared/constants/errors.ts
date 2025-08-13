export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User with this email already exists',
  ALL_FIELDS_REQUIRED: 'All fields are required',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  SIGN_IN_FAILED: 'Sign in failed',
  SIGN_UP_FAILED: 'Sign up failed',
  SIGN_OUT_FAILED: 'Sign out failed',
  
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  
  // Validation errors
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Password must be at least 6 characters',
  INVALID_NAME: 'Name must be at least 2 characters',
  
  // Generic errors
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  DATA_LOAD_FAILED: 'Failed to load data',
  SAVE_FAILED: 'Failed to save data',
} as const;

export const SUCCESS_MESSAGES = {
  SIGN_IN_SUCCESS: 'Welcome back!',
  SIGN_UP_SUCCESS: 'Account created successfully!',
  SIGN_OUT_SUCCESS: 'Signed out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;

export class AppError extends Error {
  public readonly code: string;
  public readonly userMessage: string;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    userMessage: string = ERROR_MESSAGES.SOMETHING_WENT_WRONG
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
  }
} 