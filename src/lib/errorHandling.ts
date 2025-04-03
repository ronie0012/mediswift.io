import { toast } from 'sonner';
import { AxiosError } from 'axios';

/**
 * Handles API errors consistently across the application
 * @param error The error object from the API call
 * @param defaultMessage Default message to show if no specific error message is found
 * @param showToast Whether to show a toast notification (default: true)
 * @returns The error message
 */
export const handleApiError = (
  error: unknown, 
  defaultMessage = 'An unexpected error occurred', 
  showToast = true
): string => {
  let errorMessage = defaultMessage;
  
  if (error instanceof Error) {
    const axiosError = error as AxiosError<any>;
    
    if (axiosError.response?.data) {
      const responseData = axiosError.response.data;
      
      // Handle different types of error responses from Django
      if (typeof responseData === 'object') {
        // Check for field-specific errors
        const fieldErrors = Object.entries(responseData)
          .filter(([key, value]) => key !== 'detail' && Array.isArray(value))
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
          .join('; ');
        
        if (fieldErrors) {
          errorMessage = fieldErrors;
        } else if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (responseData.non_field_errors) {
          errorMessage = Array.isArray(responseData.non_field_errors) 
            ? responseData.non_field_errors[0] 
            : responseData.non_field_errors;
        }
      } else if (typeof responseData === 'string') {
        errorMessage = responseData;
      }
    } else if (axiosError.message) {
      // Network errors
      if (axiosError.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = axiosError.message;
      }
    }
  }
  
  if (showToast) {
    toast.error(errorMessage);
  }
  
  return errorMessage;
};

/**
 * Handles API success responses consistently across the application
 * @param message The success message to show
 * @param showToast Whether to show a toast notification (default: true)
 */
export const handleApiSuccess = (message: string, showToast = true): void => {
  if (showToast) {
    toast.success(message);
  }
};
