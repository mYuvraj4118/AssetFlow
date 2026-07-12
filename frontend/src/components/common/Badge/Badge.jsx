import React from 'react';
import './Badge.css';

const Badge = ({
  children,
  variant = 'neutral', // 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | 'info'
  inset = false,       // true for sunken status indicator, false for raised
  className = '',
  ...props
}) => {
  return (
    <span
      className={`nm-badge badge-${variant} ${inset ? 'badge-inset' : 'badge-raised'} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
