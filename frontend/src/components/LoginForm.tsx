// LoginForm.tsx - React component for user authentication
// Provides login and registration forms with validation and error handling
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function LoginForm() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const success = isLogin 
        ? await login(email, password)
        : await register(email, password);

      if (success) {
        setSuccess(isLogin ? 'Login successful!' : 'Registration successful!');
        setEmail('');
        setPassword('');
      } else {
        setError(isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '40px auto',
      padding: 32,
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      background: '#fff',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
        {isLogin ? 'Login' : 'Register'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 16,
            }}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 16,
            }}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 0',
            fontSize: 18,
            borderRadius: 8,
            border: 'none',
            background: '#635bff',
            color: '#fff',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(99,91,255,0.10)',
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button
          onClick={() => setIsLogin(!isLogin)}
          style={{
            background: 'none',
            border: 'none',
            color: '#635bff',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
      </div>
      
      {error && (
        <div style={{
          marginTop: 16,
          color: '#e53e3e',
          textAlign: 'center',
          padding: 12,
          background: '#fed7d7',
          borderRadius: 8,
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{
          marginTop: 16,
          color: '#38a169',
          textAlign: 'center',
          padding: 12,
          background: '#c6f6d5',
          borderRadius: 8,
        }}>
          {success}
        </div>
      )}
    </div>
  );
}

export default LoginForm; 