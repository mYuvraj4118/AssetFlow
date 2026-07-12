import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { Button, Card } from '../../components/common';

const Forbidden = () => {
  return (
    <div className="auth-layout animate-fade-in">
      <Card variant="flat" className="p-xl rounded-xl w-full max-w-md text-center">
        <div className="d-flex justify-center mb-md">
          <div className="nm-inset rounded-full p-md d-flex align-center justify-center text-danger" style={{ width: '60px', height: '60px' }}>
            <ShieldAlert size={32} />
          </div>
        </div>
        
        <h1 className="text-danger font-bold text-3xl m-0 mb-xs">403</h1>
        <h2 className="text-heading font-bold text-xl mb-md">Access Forbidden</h2>
        <p className="text-muted mb-lg">
          You do not have the permissions required to access this section of AssetFlow.
        </p>

        <Link to={ROUTES.DASHBOARD} style={{ textDecoration: 'none' }}>
          <Button variant="primary" className="w-full" icon={<Home size={16} />}>
            Back to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default Forbidden;
