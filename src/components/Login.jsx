import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!identifier || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await login(identifier, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="logo">cycl3 ♾️</span>
        </h1>
        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="form-group">
            <input
              type="text"
              className="input"
              placeholder="Handle (e.g., username.bsky.social) or email"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError('');
              }}
              disabled={loading}
              autoComplete="username"
              name="username"
              spellCheck="false"
              autoCapitalize="none"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="input"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              disabled={loading}
              autoComplete="current-password"
              name="password"
            />
          </div>
          {error && (
            <div className="error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login with Bluesky'}
          </button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray)' }}>
            Don't have a Bluesky account?{' '}
            <a 
              href="https://bsky.app" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--primary)' }}
            >
              Join Bluesky
            </a>
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray)', marginTop: '0.5rem' }}>
            Use your full Bluesky handle (e.g., username.bsky.social) or email
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
