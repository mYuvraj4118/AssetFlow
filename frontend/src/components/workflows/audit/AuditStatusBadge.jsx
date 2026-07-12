import React from 'react';
import { Badge } from '../../common';

const AuditStatusBadge = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case 'Verified':
        return 'success';
      case 'Missing':
        return 'danger';
      case 'Damaged':
        return 'warning';
      case 'Pending':
      default:
        return 'neutral';
    }
  };

  return (
    <Badge variant={getVariant()} inset={status === 'Pending'}>
      {status}
    </Badge>
  );
};

export default AuditStatusBadge;
