
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserNotifications, markNotificationAsRead, Notification } from '@/data/medicineData';
import { useQuery } from '@tanstack/react-query';

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { 
    data: notifications = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchUserNotifications,
    enabled: isAuthenticated,
    refetchInterval: 60000, // Refetch every minute
  });
  
  useEffect(() => {
    if (notifications) {
      const count = notifications.filter(n => !n.is_read).length;
      setUnreadCount(count);
    }
  }, [notifications]);
  
  const markAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    refetch();
  };
  
  const markAllAsRead = async () => {
    const promises = notifications
      .filter(n => !n.is_read)
      .map(n => markNotificationAsRead(n.id));
    
    await Promise.all(promises);
    refetch();
  };
  
  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refetch,
  };
};
