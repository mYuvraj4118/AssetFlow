import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from './MainLayout';
import './ProtectedLayout.css';

const ProtectedLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route navigation change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  return (
    <div className="protected-layout">
      <MainLayout 
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
    </div>
  );
};

export default ProtectedLayout;
