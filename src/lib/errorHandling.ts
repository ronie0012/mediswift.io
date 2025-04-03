
import { toast } from 'sonner';
import { AxiosError } from 'axios';

// Handle API errors consistently across the application
export const handleApiError = (error: unknown, defaultMessage = 'An error occurred') => {
  const axiosError = error as AxiosError<any>;
  
  // Log the error for debugging
  console.error('API Error:', axiosError);
  
  // Determine the error message to display
  let errorMessage = defaultMessage;
  
  if (axiosError.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const responseData = axiosError.response.data;
    
    if (typeof responseData === 'string') {
      errorMessage = responseData;
    } else if (responseData.detail) {
      errorMessage = responseData.detail;
    } else if (responseData.message) {
      errorMessage = responseData.message;
    } else if (responseData.error) {
      errorMessage = responseData.error;
    } else if (typeof responseData === 'object') {
      // Handle field errors from Django REST Framework
      const fieldErrors = Object.entries(responseData)
        .filter(([key, value]) => key !== 'detail' && Array.isArray(value))
        .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
        .join('; ');
      
      if (fieldErrors) {
        errorMessage = fieldErrors;
      }
    }
  } else if (axiosError.request) {
    // The request was made but no response was received
    errorMessage = 'No response from server. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = axiosError.message || defaultMessage;
  }
  
  // Show the error to the user
  toast.error(errorMessage);
  
  return errorMessage;
};

// Handle successful API operations
export const handleApiSuccess = (message: string) => {
  toast.success(message);
  return message;
};
