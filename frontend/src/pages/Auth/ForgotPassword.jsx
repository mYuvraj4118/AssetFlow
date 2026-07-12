import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import useAuth from '../../hooks/useAuth';
import { Button } from '../../components/common';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="nm-flat p-xl rounded-xl w-full max-w-md text-center animate-fade-in">
        <div className="d-flex justify-center mb-md">
          <div className="nm-inset rounded-full p-md d-flex align-center justify-center text-success" style={{ width: '60px', height: '60px' }}>
            <CheckCircle size={32} />
          </div>
        </div>
        <h2 className="text-heading font-bold text-2xl mb-sm">Check your Email</h2>
        <p className="text-muted mb-lg">
          We have dispatched a password reset link to <strong>{email}</strong>.
        </p>
        <Link to={ROUTES.LOGIN} style={{ textDecoration: 'none' }}>
          <Button variant="primary" className="w-full">
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="nm-flat p-xl rounded-xl w-full max-w-md text-center animate-fade-in">
      <h2 className="text-heading font-bold text-2xl mb-md">Reset Password</h2>
      <p className="text-muted mb-lg">
        Enter the email associated with your account and we will send a password reset code.
      </p>

      {error && (
        <div className="nm-inset p-sm rounded-md mb-md text-danger text-sm-sz font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="d-flex flex-col gap-md text-left">
        <div className="org-field-group">
          <label htmlFor="email">Email Address</label>
          <div className="pos-relative">
            <input
              id="email"
              type="email"
              placeholder="e.g. admin@assetflow.com"
              className="nm-field p-md"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <Button 
          variant="primary" 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="mt-lg">
        <Link to={ROUTES.LOGIN} className="d-inline-flex align-center gap-xs text-xs-sz text-primary font-bold hover:underline" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={12} />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
