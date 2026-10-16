import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../api/client';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await request<{ token: string; agent: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      localStorage.setItem('authToken', response.token);
      localStorage.setItem('agent', JSON.stringify(response.agent));
      navigate('/tickets');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '2rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: '0 0 0.5rem 0' }}>
            Northwind Support
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Sign in to access agent dashboard
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              color: '#b91c1c',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.375rem',
              }}
            >
              Agent Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. nancy.davolio@northwind.com"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                fontSize: '0.875rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'background-color 0.15s ease-in-out',
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
