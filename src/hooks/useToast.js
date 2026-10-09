import { useToastStore } from '../stores/toastStore';

export const useToast = () => {
  const { showToast } = useToastStore();

  const showSuccess = (message) => {
    showToast(message, 'success');
  };

  const showError = (message) => {
    showToast(message, 'error');
  };

  return { showSuccess, showError };
};

