import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  AlertTriangle, 
  CalendarCheck, 
  Wrench, 
  Info,
  X,
  CheckCheck,
  Search,
  AlertCircle
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { Card, Button, Badge, SearchBar, EmptyState } from '../../components/common';
import { INITIAL_NOTIFICATIONS } from '../../constants/notificationConstants';
import { formatDate } from '../../utils/helpers';
import './Notifications.css';

const Notifications = () => {
  // Page states
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Toggle single notification read status
  const handleToggleRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  // Delete single notification
  const handleDeleteNotification = (id, e) => {
    e.stopPropagation(); // prevent triggering row read status toggle
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Clear all notifications
  const handleClearAll = () => {
    setNotifications([]);
  };

  // Helper icons depending on type
  const getIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="text-danger" size={16} />;
      case 'booking':
        return <CalendarCheck className="text-info" size={16} />;
      case 'maintenance':
        return <Wrench className="text-warning" size={16} />;
      case 'system':
      default:
        return <Info className="text-success" size={16} />;
    }
  };

  // Filter records based on active tabs and search text
  const getFilteredNotifications = () => {
    const q = searchQuery.toLowerCase().trim();
    return notifications.filter(n => {
      const matchesSearch = n.message.toLowerCase().includes(q);
      let matchesFilter = true;
      if (activeFilter === 'Alerts') matchesFilter = n.type === 'alert';
      else if (activeFilter === 'Bookings') matchesFilter = n.type === 'booking';
      else if (activeFilter === 'Maintenance') matchesFilter = n.type === 'maintenance';
      else if (activeFilter === 'System') matchesFilter = n.type === 'system';

      return matchesSearch && matchesFilter;
    });
  };

  const filteredNotifs = getFilteredNotifications();

  return (
    <PageContainer title="System Notifications">
      
      {/* 1. Toolbar holding Search & Actions */}
      <div className="notif-toolbar">
        <div className="audit-search-box flex-grow">
          <SearchBar 
            placeholder="Search notification messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {notifications.length > 0 && (
          <div className="notif-actions-group">
            {unreadCount > 0 && (
              <Button 
                variant="flat" 
                onClick={handleMarkAllRead}
                icon={<CheckCheck size={16} />}
              >
                Mark all read
              </Button>
            )}
            <Button 
              variant="danger" 
              onClick={handleClearAll}
              icon={<Trash2 size={16} />}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* 2. Category Chips Bar */}
      <div className="notif-filters-bar">
        {['All', 'Alerts', 'Bookings', 'Maintenance', 'System'].map((filter) => {
          const typeMap = {
            'All': null,
            'Alerts': 'alert',
            'Bookings': 'booking',
            'Maintenance': 'maintenance',
            'System': 'system'
          };
          const count = notifications.filter(n => filter === 'All' || n.type === typeMap[filter]).length;
          return (
            <button
              key={filter}
              className={`notif-chip ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter} ({count})
            </button>
          );
        })}
      </div>

      {/* 3. Notification List or Empty State */}
      <Card variant="flat" className="p-lg">
        {notifications.length === 0 ? (
          <EmptyState
            title="All Caught Up!"
            description="You have no notifications in your inbox at this time."
            icon={<Bell size={36} className="text-muted" />}
          />
        ) : searchQuery && filteredNotifs.length === 0 ? (
          <EmptyState
            title="No Matching Notifications"
            description={`We couldn't find any notifications matching "${searchQuery}".`}
            icon={<AlertCircle size={36} className="text-warning" />}
            actionButton={
              <Button variant="flat" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            }
          />
        ) : filteredNotifs.length === 0 ? (
          <EmptyState
            title="No Notifications Found"
            description={`There are no notifications matching the "${activeFilter}" filter.`}
            icon={<Bell size={36} className="text-muted" />}
            actionButton={
              <Button variant="flat" onClick={() => setActiveFilter('All')}>
                Reset Filter
              </Button>
            }
          />
        ) : (
          <div className="notif-list">
            {filteredNotifs.map((n) => (
              <Card 
                key={n.id} 
                variant="inset" 
                className={`notif-card type-${n.type} ${!n.read ? 'unread' : ''}`}
                onClick={() => handleToggleRead(n.id)}
                title="Click to toggle read status"
              >
                <div className="notif-card-body">
                  <div className="notif-icon-box bg-surface">
                    {getIcon(n.type)}
                  </div>
                  
                  <div className="notif-details">
                    <p className="notif-text">{n.message}</p>
                    <div className="notif-time-row">
                      <span>{formatDate(n.timestamp)}</span>
                      {!n.read && <span className="unread-indicator-dot" title="Unread"></span>}
                    </div>
                  </div>
                </div>

                <button 
                  className="notif-delete-btn" 
                  onClick={(e) => handleDeleteNotification(n.id, e)}
                  title="Remove notification"
                >
                  <X size={14} />
                </button>
              </Card>
            ))}
          </div>
        )}
      </Card>
      
    </PageContainer>
  );
};

export default Notifications;
