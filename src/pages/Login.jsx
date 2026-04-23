import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PixelButton from '../components/common/PixelButton';
import PixelCard from '../components/common/PixelCard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      setMessage('Logged in successfully!');
      navigate('/');
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
          <p className="text-tp-text2">Learn Dutch with Pixel Art</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
            {loading ? 'Loading...' : 'Login'}
          </PixelButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-tp-text2 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-tp-primary hover:underline font-pixel text-xs">
              Sign Up
            </Link>
          </p>
        </div>
      </PixelCard>
    </div>
  );
};

export default Login;
