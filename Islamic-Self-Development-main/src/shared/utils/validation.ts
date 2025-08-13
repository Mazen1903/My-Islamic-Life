export const ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    required: true,
    minLength: 6,
    message: 'Password must be at least 6 characters',
  },
  name: {
    required: true,
    minLength: 2,
    message: 'Name must be at least 2 characters',
  },
} as const;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validator {
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email || email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!ValidationRules.email.pattern.test(email)) {
      errors.push(ValidationRules.email.message);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!password || password.trim().length === 0) {
      errors.push('Password is required');
    } else if (password.length < ValidationRules.password.minLength) {
      errors.push(ValidationRules.password.message);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateName(name: string): ValidationResult {
    const errors: string[] = [];
    
    if (!name || name.trim().length === 0) {
      errors.push('Name is required');
    } else if (name.trim().length < ValidationRules.name.minLength) {
      errors.push(ValidationRules.name.message);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateSignUpForm(email: string, password: string, name: string): ValidationResult {
    const emailValidation = this.validateEmail(email);
    const passwordValidation = this.validatePassword(password);
    const nameValidation = this.validateName(name);
    
    const allErrors = [
      ...emailValidation.errors,
      ...passwordValidation.errors,
      ...nameValidation.errors,
    ];
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  static validateSignInForm(email: string, password: string): ValidationResult {
    const emailValidation = this.validateEmail(email);
    const passwordValidation = this.validatePassword(password);
    
    const allErrors = [
      ...emailValidation.errors,
      ...passwordValidation.errors,
    ];
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }
} 