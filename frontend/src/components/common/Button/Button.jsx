import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'flat', // 'flat' | 'raised' | 'primary' | 'danger' | 'success' | 'inset'
  size = 'md',      // 'sm' | 'md' | 'lg'
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  icon = null,
  ...props
}) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  
  return (
    <button
      type={type}
      className={`nm-button-comp ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children && <span className="btn-content">{children}</span>}
    </button>
  );
};

export default Button;
