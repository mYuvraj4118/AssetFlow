import React from 'react';
import './Input.css';

const Input = ({
  label,
  error,
  icon = null,
  type = 'text',
  id,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className={`nm-input-group ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}>
      {label && <label htmlFor={id} className="input-label text-muted">{label}</label>}
      <div className="input-field-wrapper pos-relative">
        {icon && <span className="input-icon text-muted">{icon}</span>}
        <input
          id={id}
          type={type}
          disabled={disabled}
          className={`nm-field nm-input-control ${icon ? 'has-icon' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="input-error-msg text-danger text-xs-sz">{error}</span>}
    </div>
  );
};

export default Input;
