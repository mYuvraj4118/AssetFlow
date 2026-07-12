import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and check for existing local session
  useEffect(() => {
    const savedUser = localStorage.getItem('assetflow_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('assetflow_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Simulate mock login
  const login = async (email, password) => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Quick validate format
        if (email && email.includes('@') && password && password.length >= 6) {
          const mockUser = {
            id: 'usr_mock1',
            email: email,
            name: email.split('@')[0].toUpperCase(),
            role: 'Admin'
          };
          localStorage.setItem('assetflow_user', JSON.stringify(mockUser));
          setUser(mockUser);
          setIsAuthenticated(true);
          setIsLoading(false);
          resolve(mockUser);
        } else {
          setIsLoading(false);
          reject(new Error('Invalid email format or password must be at least 6 characters.'));
        }
      }, 1000);
    });
  };

  // Simulate mock registration
  const register = async (name, email, password) => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (name && email && email.includes('@') && password && password.length >= 6) {
          const mockUser = {
            id: 'usr_' + Date.now(),
            email: email,
            name: name,
            role: 'Member'
          };
          localStorage.setItem('assetflow_user', JSON.stringify(mockUser));
          setUser(mockUser);
          setIsAuthenticated(true);
          setIsLoading(false);
          resolve(mockUser);
        } else {
          setIsLoading(false);
          reject(new Error('Please fill in all fields correctly (password min 6 chars).'));
        }
      }, 1000);
    });
  };

  // Clear session
  const logout = () => {
    localStorage.removeItem('assetflow_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Simulate mock password recovery email
  const forgotPassword = async (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && email.includes('@')) {
          resolve({ success: true, message: 'Recovery email dispatched successfully.' });
        } else {
          reject(new Error('Please enter a valid email address.'));
        }
      }, 800);
    });
  };

  // Simulate mock verification code submission (accepts any 6 digit input)
  const verifyEmail = async (code) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (code && code.trim().length === 6) {
          resolve({ success: true, message: 'Email address verified.' });
        } else {
          reject(new Error('Verification pin code must be exactly 6 digits.'));
        }
      }, 800);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        verifyEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
