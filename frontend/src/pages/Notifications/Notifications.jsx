import React, { useState } from 'react';
import { Bell, Activity, FileCheck, AlertTriangle } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { Card, StatCard } from '../../components/common';
import { useNotification } from '../../hooks';
import { 
  initialNotifications, 
  timelineEvents, 
  categories, 
  priorities, 
  statuses 
} from './dummyData';
import {
  NotificationsHeader,
  NotificationFilterBar,
  NotificationTabs,
  NotificationCard,
  ActivityTimeline,
  NotificationActions,
  EmptyNotifications
} from '../../components/workflows/notifications';
import './Notifications.css';

const Notifications = () => {
  const { showNotification } = useNotification();

  // Page States
  const [notifications, setNotifications] = useState(initialNotifications);
  const [timeline] = useState(timelineEvents);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Dynamic KPI Counts
  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'Critical' && !n.read).length;
  const pendingApprovals = notifications.filter(n => n.category === 'Approvals' && !n.read).length;
  const todayActivities = timeline.length;

  // Clear all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('All');
    setStatusFilter('All');
    setDateFilter('');
  };

  // Toggle single read/unread status
  const handleToggleRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  // Delete single notification
  const handleDeleteNotification = (id, e) => {
    if (e) e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
    setSelectedIds(selectedIds.filter(item => item !== id));
    showNotification('Notification removed.', 'success');
  };

  // Handle individual selection checkbox
  const handleSelectId = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Mark all as read
  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showNotification('All notifications marked as read.', 'success');
  };

  // Bulk mark selected as read
  const handleMarkSelectedRead = () => {
    setNotifications(notifications.map(n => selectedIds.includes(n.id) ? { ...n, read: true } : n));
    setSelectedIds([]);
    showNotification('Selected items marked as read.', 'success');
  };

  // Bulk delete selected
  const handleDeleteSelected = () => {
    setNotifications(notifications.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
    showNotification('Selected items deleted.', 'success');
  };

  // Clear all notifications
  const handleClearAll = () => {
    setNotifications([]);
    setSelectedIds([]);
    showNotification('Notification inbox cleared.', 'success');
  };

  // Category counts builder for tabs
  const getTabCounts = () => {
    const counts = {};
    categories.forEach(cat => {
      if (cat === 'All') {
        counts[cat] = notifications.length;
      } else if (cat === 'Unread') {
        counts[cat] = notifications.filter(n => !n.read).length;
      } else {
        counts[cat] = notifications.filter(n => n.category === cat).length;
      }
    });
    return counts;
  };

  // Filter listings
  const getFilteredNotifications = () => {
    return notifications.filter(n => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        n.title.toLowerCase().includes(q) || 
        n.description.toLowerCase().includes(q);

      // Tab filters
      let matchesTab = true;
      if (activeTab === 'Unread') matchesTab = !n.read;
      else if (activeTab !== 'All') matchesTab = n.category === activeTab;

      // Dropdown filters
      const matchesPriority = priorityFilter === 'All' || n.priority === priorityFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'Read') matchesStatus = n.read;
      else if (statusFilter === 'Unread') matchesStatus = !n.read;

      const matchesDate = !dateFilter || n.timestamp.startsWith(dateFilter);

      return matchesSearch && matchesTab && matchesPriority && matchesStatus && matchesDate;
    });
  };

  const filteredNotifs = getFilteredNotifications();
  const tabCounts = getTabCounts();

  return (
    <PageContainer title="Notifications & Activity">
      
      {/* 1. Header component */}
      <NotificationsHeader 
        onMarkAllRead={handleMarkAllRead} 
        showMarkRead={unreadCount > 0} 
      />

      {/* 2. KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
        <StatCard 
          title="Unread Alerts" 
          value={unreadCount} 
          icon={<Bell size={20} className="text-primary" />} 
        />
        <StatCard 
          title="Today's Activities" 
          value={todayActivities} 
          icon={<Activity size={20} className="text-success" />} 
        />
        <StatCard 
          title="Pending Approvals" 
          value={pendingApprovals} 
          icon={<FileCheck size={20} className="text-info" />} 
        />
        <StatCard 
          title="Critical Warnings" 
          value={criticalCount} 
          icon={<AlertTriangle size={20} className="text-danger" />} 
        />
      </div>

      {/* 3. Filter inputs bar */}
      <NotificationFilterBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        priorities={priorities}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statuses={statuses}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        onReset={handleResetFilters}
      />

      {/* 4. Horizontal tabs chips list */}
      <NotificationTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        categories={categories}
        counts={tabCounts}
      />

      {/* 5. Split Feed and Timeline Section */}
      <div className="notifications-split-grid">
        
        {/* Left: Feed Panel */}
        <Card variant="flat" className="p-lg">
          <div className="d-flex justify-between align-center mb-md border-bottom pb-xs">
            <h3 className="text-heading font-semibold text-lg m-0">System Alerts Feed</h3>
            <Badge variant="info">{filteredNotifs.length} Alerts</Badge>
          </div>

          {notifications.length > 0 && (
            <NotificationActions 
              onMarkRead={handleMarkSelectedRead}
              onDeleteSelected={handleDeleteSelected}
              onClearAll={handleClearAll}
              selectedCount={selectedIds.length}
            />
          )}

          {filteredNotifs.length === 0 ? (
            <EmptyNotifications />
          ) : (
            <div className="notif-list">
              {filteredNotifs.map((notif) => (
                <NotificationCard 
                  key={notif.id}
                  notification={notif}
                  onToggleRead={handleToggleRead}
                  onDelete={handleDeleteNotification}
                  onSelect={handleSelectId}
                  isSelected={selectedIds.includes(notif.id)}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Right: Activity Timeline Tracker */}
        <ActivityTimeline events={timeline} />

      </div>

    </PageContainer>
  );
};

export default Notifications;
