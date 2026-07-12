import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const Login = () => {
  return (
    <div className="nm-flat p-xl rounded-xl w-full max-w-md text-center">
      <h2 className="text-heading font-bold text-2xl mb-md">Sign In to AssetFlow</h2>
      <p className="text-muted mb-lg">Access your dashboard to allocate and manage organization assets.</p>
      
      <div className="mb-md">
        <input type="email" placeholder="Email Address" className="nm-field mb-sm" />
        <input type="password" placeholder="Password" className="nm-field" />
      </div>

      <button className="nm-btn-primary w-full mb-md" style={{ border: 'none' }}>Sign In</button>
      
      <p className="text-sm text-muted">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-primary font-semibold">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
