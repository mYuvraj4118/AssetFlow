import React from 'react';
import './Card.css';

const Card = ({
  children,
  variant = 'flat', // 'flat' | 'inset' | 'hoverable'
  padding = 'md',   // 'none' | 'sm' | 'md' | 'lg'
  className = '',
  onClick,
  ...props
}) => {
  const isClickable = !!onClick;
  return (
    <div
      className={`nm-card-comp card-${variant} card-pad-${padding} ${isClickable ? 'clickable' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
