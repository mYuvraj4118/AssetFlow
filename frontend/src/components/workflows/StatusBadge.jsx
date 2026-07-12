import React from 'react';
import Badge from '../common/Badge';

export default function StatusBadge({
  status,
  className = '',
}) {
  const normalizedStatus = String(status || '').toLowerCase();

  // Map workflow status strings to common Badge component variants
  const getBadgeVariant = (s) => {
    switch (s) {
      case 'active':
      case 'approved':
      case 'resolved':
        return 'success';
      case 'return requested':
      case 'pending':
        return 'warning';
      case 'returned':
      case 'ongoing':
      case 'in progress':
        return 'primary';
      case 'rejected':
      case 'critical':
      case 'critical unresolved':
        return 'danger';
      case 'completed':
      case 'upcoming':
      case 'technician assigned':
        return 'info';
      case 'cancelled':
      default:
        return 'neutral';
    }
  };

  return (
    <Badge
      variant={getBadgeVariant(normalizedStatus)}
      inset={true}
      className={className}
    >
      {status}
    </Badge>
  );
}

