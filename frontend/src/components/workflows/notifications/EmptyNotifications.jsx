import React from 'react';
import { BellOff } from 'lucide-react';
import { EmptyState } from '../../common';

const EmptyNotifications = () => {
  return (
    <EmptyState
      title="Inbox is Clear!"
      description="You have no notifications or activity alerts in your feed at this time."
      icon={<BellOff size={36} className="text-muted" />}
    />
  );
};

export default EmptyNotifications;
