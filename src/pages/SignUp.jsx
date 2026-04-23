import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PixelButton from '../components/common/PixelButton';
import PixelCard from '../components/common/PixelCard';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/\d/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const { data, error } = await signUp(email, password);

    if (error) {
      setError(error.message);
    } else {
      setMessage('Account created! Please check your email to confirm.');
      setTimeout(() => navigate('/login'), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tp-bg p-4">
      <PixelCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-2xl md:text-3xl text-tp-primary mb-2">
            TaalPix
          </h1>
          <p className="text-tp-text2">Create your account</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label htmlFor="email" className="block font-pixel text-xs text-tp-text2 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-solid border-tp-border bg-tp-surface text-tp-text font-body focus:outline-none focus:border-tp-primary"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-pixel text-xs text-tp-text2 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-solid border-tp-border bg-tp-surface text-tp-text font-body focus:outline-none focus:border-tp-primary"
              placeholder="••••••••"
            />
            <p className="text-xs text-tp-text3 mt-1">
              Min 8 chars, 1 number, 1 special character
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block font-pixel text-xs text-tp-text2 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-solid border-tp-border bg-tp-surface text-tp-text font-body focus:outline-none focus:border-tp-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-tp-error-light border-2 border-solid border-tp-error text-tp-error text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-tp-success-light border-2 border-solid border-tp-success text-tp-success text-sm">
              {message}
            </div>
          )}

          <PixelButton
            type="submit"
            variant="primary"
            size="large"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Sign Up'}
          </PixelButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-tp-text2 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-tp-primary hover:underline font-pixel text-xs">
              Login
            </Link>
          </p>
        </div>
      </PixelCard>
    </div>
  );
};

export default SignUp;
