import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({
  variant = 'text', // 'text' | 'card' | 'table' | 'avatar'
  rows = 1,
  className = '',
  ...props
}) => {
  const renderSkeleton = () => {
    if (variant === 'table') {
      return (
        <div className="skeleton-table">
          <div className="skeleton-table-header"></div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="skeleton-table-row">
              <div className="skeleton-cell" style={{ width: '25%' }}></div>
              <div className="skeleton-cell" style={{ width: '35%' }}></div>
              <div className="skeleton-cell" style={{ width: '20%' }}></div>
              <div className="skeleton-cell" style={{ width: '15%' }}></div>
            </div>
          ))}
        </div>
      );
    }

    if (variant === 'card') {
      return (
        <div className="skeleton-card nm-flat p-lg rounded-lg">
          <div className="skeleton-item skeleton-avatar mb-md"></div>
          <div className="skeleton-item skeleton-title mb-sm" style={{ width: '60%' }}></div>
          <div className="skeleton-item skeleton-text mb-xs" style={{ width: '90%' }}></div>
          <div className="skeleton-item skeleton-text" style={{ width: '70%' }}></div>
        </div>
      );
    }

    if (variant === 'avatar') {
      return <div className={`skeleton-item skeleton-avatar ${className}`} {...props}></div>;
    }

    // Default 'text'
    return (
      <div className={`skeleton-text-group ${className}`} {...props}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-item skeleton-text mb-sm" style={{ width: i === rows - 1 && rows > 1 ? '60%' : '100%' }}></div>
        ))}
      </div>
    );
  };

  return <div className={`skeleton-wrapper ${className}`}>{renderSkeleton()}</div>;
};

export default SkeletonLoader;
