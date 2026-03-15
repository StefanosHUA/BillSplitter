import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authService } from '../api/authService';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // 1. PASSWORD STRENGTH CALCULATION
  const requirements = useMemo(() => ([
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Number', met: /[0-9]/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ]), [password]);

  const strength = useMemo(() => {
    const score = requirements.filter(req => req.met).length;
    const mapping = [
      { label: 'Too Short', color: 'bg-gray-200', text: 'text-gray-400' },
      { label: 'Weak', color: 'bg-red-500', text: 'text-red-500' },
      { label: 'Fair', color: 'bg-orange-500', text: 'text-orange-500' },
      { label: 'Good', color: 'bg-yellow-500', text: 'text-yellow-500' },
      { label: 'Strong', color: 'bg-green-500', text: 'text-green-500' },
    ];
    return { score, ...mapping[score] };
  }, [requirements]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (strength.score < 3) {
      setError("Please create a stronger password.");
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await authService.register({ username, email, password, confirmPassword });
      navigate('/'); 
    } catch (err: any) {
      setError(err.response?.data || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
        
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">🍷</span>
          <h1 className="text-3xl font-black text-gray-950 mb-2 tracking-tight">Join Parea</h1>
          <p className="text-gray-500 font-medium">Start splitting bills with friends</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold border border-red-100 text-center animate-shake">
            {error}
          </div>
        )}

        <div className="flex justify-center mb-6">
          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={() => setError('Google Sign Up failed.')} 
            shape="pill"
          />
        </div>

        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-gray-100"></div>
          <span className="px-4 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Or email</span>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>
        
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Username</label>
            <input 
              type="text" required disabled={isLoading} 
              value={username} onChange={(e) => setUsername(e.target.value)} 
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-parea-primary outline-none transition-all font-medium"
              placeholder="Your handle"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input 
              type="email" required disabled={isLoading} 
              value={email} onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-parea-primary outline-none transition-all font-medium"
              placeholder="name@example.com"
            />
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                required disabled={isLoading} 
                value={password} onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-parea-primary outline-none transition-all font-medium"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-gray-400 hover:text-parea-primary transition-colors"
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>

            {/* STRENGTH METER BAR */}
            {password && (
              <div className="px-1">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div 
                      key={step} 
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= strength.score ? strength.color : 'bg-gray-100'}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${strength.text}`}>{strength.label}</span>
                </div>
                
                {/* CHECKLIST */}
                <div className="grid grid-cols-2 gap-y-1">
                  {requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${req.met ? 'bg-green-500' : 'bg-gray-200'}`} />
                      <span className={`text-[10px] font-bold ${req.met ? 'text-gray-900' : 'text-gray-400'}`}>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
              <input 
                type="password" required disabled={isLoading} 
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-parea-primary outline-none transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className={`w-full py-4 mt-2 text-white font-black rounded-2xl text-lg shadow-xl transition-all active:scale-95
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-950 hover:bg-parea-primary'}
            `}
          >
            {isLoading ? 'Creating account...' : 'Create Account & Start'}
          </button>
        </form>
        
        <p className="text-center mt-8 text-sm text-gray-500 font-bold uppercase tracking-tight">
          Already have an account? <Link to="/login" className="text-parea-primary hover:underline ml-1">Sign in</Link>
        </p>
      </div>
    </div>
  );
}