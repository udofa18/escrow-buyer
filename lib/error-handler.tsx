'use client';

import { useEffect } from 'react';
import { ApiError } from './api-client';

export function GlobalErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      // You can add toast notifications or error reporting here
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      if (event.reason instanceof ApiError) {
        // Handle API errors specifically
        const apiError = event.reason as ApiError;
        console.error(`API Error [${apiError.status}]:`, apiError.message);
        // You can add toast notifications here
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    // Use the API's error message if available, otherwise use generic messages
    const apiMessage = error.data?.message || error.message;
    
    switch (error.status) {
      case 400:
        return apiMessage || 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in.';
      case 403:
        return 'Access denied.';
      case 404:
        return apiMessage || 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return apiMessage || error.message || 'An error occurred.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
}
