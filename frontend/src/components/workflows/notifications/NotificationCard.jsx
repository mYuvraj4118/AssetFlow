import React from 'react';
import { Trash2, Calendar, Wrench, ClipboardCheck, FileCheck, Info } from 'lucide-react';
import { Card } from '../../common';
import NotificationBadge from './NotificationBadge';
import { formatDate } from '../../../utils/helpers';

const NotificationCard = ({ notification, onToggleRead, onDelete, onSelect, isSelected }) => {
  const getIcon = () => {
    switch (notification.category) {
      case 'Audit':
        return <ClipboardCheck className="text-primary" size={16} />;
      case 'Maintenance':
        return <Wrench className="text-warning" size={16} />;
      case 'Bookings':
        return <Calendar className="text-primary" size={16} />;
      case 'Approvals':
        return <FileCheck className="text-success" size={16} />;
      case 'System':
      default:
        return <Info className="text-muted" size={16} />;
    }
  };

  return (
    <Card 
      variant="inset" 
      className={`notif-card type-${notification.category.toLowerCase()} ${!notification.read ? 'unread' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={() => onToggleRead(notification.id)}
      style={{ display: 'flex', width: '100%', gap: '12px', alignItems: 'flex-start' }}
    >
      <div 
        onClick={(e) => { e.stopPropagation(); onSelect(notification.id); }}
        className="d-flex align-center mt-xs flex-shrink-0"
        style={{ cursor: 'pointer' }}
      >
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => {}} 
          className="nm-checkbox"
          aria-label="Select notification"
        />
      </div>

      <div className="notif-card-body flex-grow d-flex gap-md">
        <div className="notif-icon-box bg-surface">
          {getIcon()}
        </div>
        
        <div className="notif-details d-flex flex-col gap-xxs flex-grow">
          <div className="d-flex justify-between align-center flex-wrap gap-xs">
            <h4 className="text-heading font-bold text-sm-sz m-0">{notification.title}</h4>
            <div className="d-flex align-center gap-xs">
              <NotificationBadge priority={notification.priority} />
            </div>
          </div>
          <p className="notif-text text-xs-sz text-main m-0">{notification.description}</p>
          <div className="notif-time-row d-flex align-center gap-sm mt-xs">
            <span>{formatDate(notification.timestamp)}</span>
            {!notification.read && <span className="unread-indicator-dot" title="Unread"></span>}
          </div>
        </div>
      </div>

      <div className="d-flex align-center gap-xs mt-xs flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <button 
          className="notif-delete-btn"
          onClick={(e) => onDelete(notification.id, e)}
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </Card>
  );
};

export default NotificationCard;
