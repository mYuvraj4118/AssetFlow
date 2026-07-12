import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import './MainLayout.css';

const MainLayout = ({ isSidebarCollapsed, setIsSidebarCollapsed, isMobileOpen, setIsMobileOpen }) => {
  return (
    <div className={`main-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar navigation */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        isOpen={isMobileOpen} 
        setIsOpen={setIsMobileOpen} 
      />

      {/* Main content body */}
      <div className="main-content">
        <Navbar 
          isSidebarCollapsed={isSidebarCollapsed} 
          setIsSidebarCollapsed={setIsSidebarCollapsed} 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen} 
        />
        <main className="content-outlet">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
