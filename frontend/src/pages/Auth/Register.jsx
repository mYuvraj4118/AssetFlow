import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ShieldAlert } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import useAuth from '../../hooks/useAuth';
import { Button } from '../../components/common';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 3) {
      setError('Name must contain at least 3 characters.');
      return;
    }
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
      await register(name, email, password);
      // Automatically logs user in and redirects to verify-email to confirm
      navigate(ROUTES.VERIFY_EMAIL);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nm-flat p-xl rounded-xl w-full max-w-md text-center animate-fade-in">
      <h2 className="text-heading font-bold text-2xl mb-md">Create your Account</h2>
      <p className="text-muted mb-lg">Begin tracking, auditing, and reserving organization resource flow.</p>

      {error && (
        <div className="nm-inset p-sm rounded-md mb-md text-danger text-sm-sz font-semibold d-flex align-center justify-center gap-xs">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="d-flex flex-col gap-md text-left">
        <div className="org-field-group">
          <label htmlFor="fullname">Full Name</label>
          <input
            id="fullname"
            type="text"
            placeholder="John Doe"
            className="nm-field"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="org-field-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="john@organization.com"
            className="nm-field"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="org-field-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Min. 6 characters"
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
          icon={<UserPlus size={16} />}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-xl pt-md text-sm-sz text-muted" style={{ borderTop: '1px solid var(--color-border)' }}>
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary font-bold hover:underline" style={{ textDecoration: 'none' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
