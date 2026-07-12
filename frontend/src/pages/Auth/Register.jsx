import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const Register = () => {
  return (
    <div className="nm-flat p-xl rounded-xl w-full max-w-md text-center">
      <h2 className="text-heading font-bold text-2xl mb-md">Create your Account</h2>
      <p className="text-muted mb-lg">Begin tracking, auditing, and reserving organization resource flow.</p>
      
      <div className="mb-md">
        <input type="text" placeholder="Full Name" className="nm-field mb-sm" />
        <input type="email" placeholder="Email Address" className="nm-field mb-sm" />
        <input type="password" placeholder="Password" className="nm-field" />
      </div>

      <button className="nm-btn-primary w-full mb-md" style={{ border: 'none' }}>Create Account</button>
      
      <p className="text-sm text-muted">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary font-semibold">Sign In</Link>
      </p>
    </div>
  );
};

export default Register;
