import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, Package, Share2, 
  CalendarCheck, Wrench, ShieldCheck, BarChart3, 
  Bell, ChevronLeft, ChevronRight, X, Layers
} from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import './Sidebar.css';

const menuItems = [
  { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Organization', path: ROUTES.ORGANIZATION, icon: Building2 },
  { name: 'Assets', path: ROUTES.ASSETS, icon: Package },
  { name: 'Allocation', path: ROUTES.ALLOCATION, icon: Share2 },
  { name: 'Resource Booking', path: ROUTES.BOOKING, icon: CalendarCheck },
  { name: 'Maintenance', path: ROUTES.MAINTENANCE, icon: Wrench },
  { name: 'Audit', path: ROUTES.AUDIT, icon: ShieldCheck },
  { name: 'Reports', path: ROUTES.REPORTS, icon: BarChart3 },
  { name: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: Bell }
];

const Sidebar = ({ isCollapsed, setIsCollapsed, isOpen, setIsOpen }) => {
  const sidebarContent = (
    <div className={`sidebar-inner ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon nm-flat rounded-md">
            <Layers className="text-primary" size={20} />
          </div>
          {!isCollapsed && <span className="logo-text text-heading">AssetFlow</span>}
        </div>
        {/* Mobile close button */}
        <button 
          className="mobile-close-btn d-none nm-btn rounded-full p-0" 
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active nm-inset' : 'nm-flat'} transition-nm`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <div className="nav-icon-wrapper">
                <IconComponent size={20} className="nav-icon" />
              </div>
              {!isCollapsed && <span className="nav-text">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle Button (Desktop/Tablet) */}
      <div className="sidebar-footer">
        <button 
          className="collapse-toggle-btn nm-btn rounded-full transition-nm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop/Tablet Static Sidebar */}
      <aside className={`sidebar-desktop ${isCollapsed ? 'collapsed' : ''}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div 
              className="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            {/* Sliding Drawer */}
            <motion.aside 
              className="sidebar-mobile"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
