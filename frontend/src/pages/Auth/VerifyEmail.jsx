import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import useAuth from '../../hooks/useAuth';
import { Button } from '../../components/common';

const VerifyEmail = () => {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Refs for the 6 input elements to support auto-focus jumping
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Auto-focus first field
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only accept numbers
    if (value && isNaN(value)) return;

    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1); // limit to single digit
    setPin(newPin);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Jump backward on Backspace if empty
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    
    if (pasteData.length === 6 && !isNaN(pasteData)) {
      const pinArray = pasteData.split('');
      setPin(pinArray);
      inputRefs[5].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const code = pin.join('');

    if (code.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail(code);
      setIsSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    setError('');
    alert('Simulated: A new 6-digit verification code has been dispatched.');
  };

  return (
    <div className="nm-flat p-xl rounded-xl w-full max-w-md text-center animate-fade-in">
      <div className="d-flex justify-center mb-md">
        <div className="nm-inset rounded-full p-md d-flex align-center justify-center text-primary" style={{ width: '56px', height: '56px' }}>
          <KeyRound size={26} />
        </div>
      </div>
      
      <h2 className="text-heading font-bold text-2xl mb-sm">Verify your Email</h2>
      <p className="text-muted mb-lg">
        We have dispatched a 6-digit confirmation pin to your inbox. Enter it below to unlock your account.
      </p>

      {error && (
        <div className="nm-inset p-sm rounded-md mb-md text-danger text-sm-sz font-semibold">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="nm-inset p-sm rounded-md mb-md text-success text-sm-sz font-semibold">
          Verification successful! Redirecting to dashboard...
        </div>
      )}

      <form onSubmit={handleSubmit} className="d-flex flex-col gap-lg">
        {/* Pin input digit grid */}
        <div className="d-flex justify-between gap-xs mb-sm">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isSubmitting || isSuccess}
              className="nm-field text-center font-bold text-lg-sz"
              style={{
                width: '45px',
                height: '50px',
                fontSize: '1.25rem',
                padding: '0'
              }}
            />
          ))}
        </div>

        <Button 
          variant="primary" 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || isSuccess}
        >
          {isSubmitting ? 'Verifying...' : 'Verify Code'}
        </Button>
      </form>

      <div className="d-flex justify-between align-center mt-lg pt-md" style={{ borderTop: '1px solid var(--color-border)' }}>
        <Link to={ROUTES.LOGIN} className="d-inline-flex align-center gap-xs text-xs-sz text-muted font-semibold hover:text-primary" style={{ textDecoration: 'none' }}>
          <ArrowLeft size={12} />
          <span>Back to Sign In</span>
        </Link>
        <button 
          onClick={handleResend}
          disabled={isSubmitting || isSuccess}
          className="cursor-pointer font-bold text-xs-sz text-primary"
          style={{ border: 'none', background: 'transparent' }}
        >
          Resend Code
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
