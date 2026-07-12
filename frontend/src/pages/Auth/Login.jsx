import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import useAuth from '../../hooks/useAuth';
import { Button } from '../../components/common';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      // Success triggers context state update and protected route redirects automatically
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nm-flat p-xl rounded-xl w-full max-w-md text-center animate-fade-in">
      <h2 className="text-heading font-bold text-2xl mb-md">Sign In to AssetFlow</h2>
      <p className="text-muted mb-lg">Access your dashboard to allocate and manage organization assets.</p>

      {error && (
        <div className="nm-inset p-sm rounded-md mb-md text-danger text-sm-sz font-semibold d-flex align-center justify-center gap-xs">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="d-flex flex-col gap-md text-left">
        <div className="org-field-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="admin@assetflow.com"
            className="nm-field"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="org-field-group">
          <div className="d-flex justify-between align-center mb-xs">
            <label htmlFor="password" style={{ margin: 0 }}>Password</label>
            <Link 
              to={ROUTES.FORGOT_PASSWORD} 
              className="text-xs-sz text-primary font-bold hover:underline"
              style={{ textDecoration: 'none' }}
            >
              Forgot Password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="nm-field"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <Button
          variant="primary"
          type="submit"
          className="w-full mt-xs"
          disabled={isSubmitting}
          icon={<LogIn size={16} />}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-xl pt-md d-flex flex-col gap-xs text-sm-sz text-muted" style={{ borderTop: '1px solid var(--color-border)' }}>
        <p className="m-0">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-primary font-bold hover:underline" style={{ textDecoration: 'none' }}>
            Sign Up
          </Link>
        </p>
        <p className="m-0">
          Need verification?{' '}
          <Link to={ROUTES.VERIFY_EMAIL} className="text-primary font-bold hover:underline" style={{ textDecoration: 'none' }}>
            Verify Email
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
