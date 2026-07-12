import React from 'react';
import { CheckCheck } from 'lucide-react';
import { Button } from '../../common';

const NotificationsHeader = ({ onMarkAllRead, showMarkRead }) => {
  return (
    <div className="d-flex justify-between align-center mb-lg flex-wrap gap-md">
      <div>
        <h1 className="text-heading font-bold text-3xl m-0">Notifications & Activity</h1>
        <p className="text-muted m-0 mt-xs">Stay updated with approvals, reminders, audit events and organizational activities.</p>
      </div>
      {showMarkRead && (
        <Button 
          variant="primary" 
          onClick={onMarkAllRead} 
          icon={<CheckCheck size={16} />}
          aria-label="Mark All as Read"
        >
          Mark All as Read
        </Button>
      )}
    </div>
  );
};

export default NotificationsHeader;
