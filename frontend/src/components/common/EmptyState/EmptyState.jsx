import React from 'react';
import './EmptyState.css';

const EmptyState = ({
  title = 'No Data Found',
  description = 'There are no records to display at this time.',
  icon = null,
  actionButton = null,
  className = '',
  ...props
}) => {
  return (
    <div className={`nm-empty-state nm-flat p-xl rounded-xl text-center ${className}`} {...props}>
      {icon && <div className="empty-icon-wrapper nm-inset rounded-full mb-md">{icon}</div>}
      <h3 className="empty-title text-heading font-semibold text-lg mb-xs">{title}</h3>
      <p className="empty-description text-muted text-sm-sz mb-lg">{description}</p>
      {actionButton && <div className="empty-action-wrapper">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
