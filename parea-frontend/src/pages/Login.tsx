import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../api/authService';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isExpired = searchParams.get('expired') === 'true';

  // 1. Handle standard login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await authService.login({ username, password });
      navigate('/'); 
    } catch (err) {
      setError("Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Google Login Success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError('');
    
    try {
      await authService.googleLogin(credentialResponse.credential);
      navigate('/');
    } catch (err) {
      setError("Google authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      
      <div style={{ width: '100%', maxWidth: '420px', padding: '40px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '40px' }}>🍷</span>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', margin: '10px 0 8px 0', letterSpacing: '-0.5px' }}>Welcome back</h1>
          <p style={{ color: '#6b7280', margin: 0, fontWeight: '500' }}>Log in to your Parea account</p>
        </div>

        {/* SESSION EXPIRED ALERT */}
        {isExpired && (
          <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', border: '1px solid #fee2e2' }}>
            ⚠️ Your session has expired. Please log in again.
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#fff7ed', color: '#c2410c', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', border: '1px solid #ffedd5' }}>
            {error}
          </div>
        )}

        {/* GOOGLE LOGIN BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={() => setError('Google Login was cancelled or failed.')} 
            useOneTap={false}
            shape="pill"
          />
        </div>

        {/* DIVIDER */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#f3f4f6' }}></div>
          <span style={{ padding: '0 12px', color: '#9ca3af', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#f3f4f6' }}></div>
        </div>
        
        {/* TRADITIONAL LOGIN FORM */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase' }}>Username</label>
            <input 
              type="text" required disabled={isLoading}
              value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #f3f4f6', fontSize: '16px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                disabled={isLoading}
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 45px 12px 16px', borderRadius: '12px', border: '2px solid #f3f4f6', fontSize: '16px', boxSizing: 'border-box', outline: 'none' }} 
              />
              <button
                type="button" // Prevents form submission
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ width: '100%', padding: '14px', marginTop: '10px', backgroundColor: isLoading ? '#9ca3af' : '#111827', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'transform 0.1s active' }}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
          Don't have an account? <Link to="/register" style={{ color: '#4f46e5', fontWeight: '700', textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}