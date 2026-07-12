import React from 'react';
import { Link } from 'react-router-dom';
import { ServerCrash, RefreshCw } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { Button, Card } from '../../components/common';

const ServerError = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="auth-layout animate-fade-in">
      <Card variant="flat" className="p-xl rounded-xl w-full max-w-md text-center">
        <div className="d-flex justify-center mb-md">
          <div className="nm-inset rounded-full p-md d-flex align-center justify-center text-danger" style={{ width: '60px', height: '60px' }}>
            <ServerCrash size={32} />
          </div>
        </div>
        
        <h1 className="text-danger font-bold text-3xl m-0 mb-xs">500</h1>
        <h2 className="text-heading font-bold text-xl mb-md">Server Connection Error</h2>
        <p className="text-muted mb-lg">
          The AssetFlow backend server is currently unreachable or encountered an internal error.
        </p>

        <div className="d-flex flex-col gap-sm">
          <Button variant="primary" className="w-full" onClick={handleReload} icon={<RefreshCw size={16} />}>
            Retry Connection
          </Button>
          <Link to={ROUTES.DASHBOARD} style={{ textDecoration: 'none' }}>
            <Button variant="flat" className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ServerError;
