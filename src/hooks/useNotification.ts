import { useState } from 'react';

interface NotificationState {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showSuccess = (title: string, message: string) => {
    setNotification({
      isOpen: true,
      type: 'success',
      title,
      message
    });
  };

  const showError = (title: string, message: string) => {
    setNotification({
      isOpen: true,
      type: 'error',
      title,
      message
    });
  };

  const showWarning = (title: string, message: string) => {
    setNotification({
      isOpen: true,
      type: 'warning',
      title,
      message
    });
  };

  const showInfo = (title: string, message: string) => {
    setNotification({
      isOpen: true,
      type: 'info',
      title,
      message
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  return {
    notification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeNotification
  };
};
