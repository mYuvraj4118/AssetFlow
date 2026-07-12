import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import './Navbar.css';

const Navbar = ({ isSidebarCollapsed, setIsSidebarCollapsed, isMobileOpen, setIsMobileOpen }) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Mobile toggle button */}
        <button 
          className="mobile-menu-trigger d-none nm-btn rounded-full"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <Breadcrumb />
      </div>

      <div className="navbar-right">
        {/* Search box placeholder */}
        <div className="navbar-search">
          <Search size={16} className="search-icon text-muted" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="nm-field search-input" 
          />
        </div>

        {/* Notification bell placeholder */}
        <button 
          className="navbar-action-btn nm-btn rounded-full"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="notification-badge" />
        </button>

        {/* User Profile placeholder */}
        <button 
          className="navbar-profile-btn nm-btn rounded-full"
          aria-label="User profile"
        >
          <User size={18} className="text-primary" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
