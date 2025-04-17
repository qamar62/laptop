'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification, { NotificationType } from '@/components/ui/Notification';

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [notificationProps, setNotificationProps] = useState({
    type: 'info' as NotificationType,
    message: '',
    duration: 3000
  });

  const showNotification = (type: NotificationType, message: string, duration = 3000) => {
    setNotificationProps({ type, message, duration });
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Notification
        type={notificationProps.type}
        message={notificationProps.message}
        duration={notificationProps.duration}
        onClose={handleClose}
        isVisible={isVisible}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
