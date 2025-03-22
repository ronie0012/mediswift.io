
// This is a compatibility layer for react-toastify to toast
import { toast as uiToast } from '@/components/ui/use-toast';

export const toast = {
  success: (message: string) => {
    uiToast({
      title: "Success",
      description: message,
    });
  },
  error: (message: string) => {
    uiToast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
  },
  info: (message: string) => {
    uiToast({
      title: "Info",
      description: message,
    });
  },
  warning: (message: string) => {
    uiToast({
      title: "Warning",
      description: message,
    });
  }
};
