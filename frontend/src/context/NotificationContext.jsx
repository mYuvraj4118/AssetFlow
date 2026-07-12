import React, { createContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import './NotificationContext.css';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Pushes a notification item onto the list
  const showNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  // Removes notification by ID
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Get state icon depending on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-success" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-warning" size={18} />;
      case 'danger':
        return <AlertCircle className="text-danger" size={18} />;
      case 'info':
      default:
        return <Info className="text-info" size={18} />;
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Floating container holding active toasts */}
      <div className="notification-container">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`notification-toast nm-flat p-md rounded-md d-flex align-center justify-between gap-md toast-${n.type} animate-fade-in`}
          >
            <div className="d-flex align-center gap-sm">
              {getIcon(n.type)}
              <span className="toast-message text-sm-sz font-semibold text-main">{n.message}</span>
            </div>
            <button 
              className="toast-close-btn d-flex align-center justify-center cursor-pointer" 
              onClick={() => removeNotification(n.id)}
            >
              <X size={14} className="text-muted" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
