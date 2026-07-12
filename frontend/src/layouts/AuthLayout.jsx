import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layers } from 'lucide-react';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout flex-col">
      <div className="auth-brand-header d-flex flex-col align-center justify-center mb-lg">
        <div className="auth-brand-logo nm-flat rounded-md d-flex align-center justify-center mb-sm">
          <Layers className="text-primary" size={28} />
        </div>
        <h1 className="auth-brand-text text-heading font-bold text-2xl m-0">AssetFlow</h1>
      </div>
      <div className="auth-container">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
