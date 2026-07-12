import React from 'react';
import './Loader.css';

const Loader = ({
  size = 'md', // 'sm' | 'md' | 'lg'
  color = 'primary', // 'primary' | 'muted'
  text = '',
  className = '',
  ...props
}) => {
  return (
    <div className={`nm-loader-container ${className}`} {...props}>
      <div className={`nm-loader-spinner spinner-${size} spinner-${color} nm-flat rounded-full`}>
        <div className="spinner-inner"></div>
      </div>
      {text && <span className="loader-text text-muted text-sm-sz mt-xs">{text}</span>}
    </div>
  );
};

export default Loader;
