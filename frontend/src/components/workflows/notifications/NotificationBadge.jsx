import React from 'react';
import { Badge } from '../../common';

const NotificationBadge = ({ priority }) => {
  const getVariant = () => {
    switch (priority) {
      case 'Critical':
        return 'danger';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      case 'Low':
      default:
        return 'success';
    }
  };

  return (
    <Badge variant={getVariant()} inset={priority === 'Low'}>
      {priority}
    </Badge>
  );
};

export default NotificationBadge;
