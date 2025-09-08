/**
 * Client-side input sanitization utility
 * Provides XSS protection by sanitizing user inputs
 */

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Remove potential script injections
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  
  // Trim excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
};

export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data } as any;
  
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    }
  });
  
  return sanitized as T;
};

// Generate CSRF token
export const generateCSRFToken = (): string => {
  return crypto.randomUUID();
};

// Store CSRF token in session storage
export const setCSRFToken = (token: string): void => {
  sessionStorage.setItem('csrf_token', token);
};

// Get CSRF token from session storage
export const getCSRFToken = (): string | null => {
  return sessionStorage.getItem('csrf_token');
};

// Validate CSRF token
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return storedToken === token;
};