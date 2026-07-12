import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const NotFound = () => {
  return (
    <div className="d-flex flex-col align-center justify-center h-screen w-screen text-center p-md" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="nm-flat p-xl rounded-xl max-w-md">
        <h1 className="text-primary font-bold text-5xl mb-xs">404</h1>
        <h2 className="text-heading font-semibold text-xl mb-md">Page Not Found</h2>
        <p className="text-muted mb-lg">The page you are looking for does not exist or has been moved.</p>
        <Link to={ROUTES.DASHBOARD} className="nm-btn-primary w-full" style={{ display: 'inline-block', textDecoration: 'none', border: 'none' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
