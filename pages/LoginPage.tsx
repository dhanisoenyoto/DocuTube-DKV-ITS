import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, ArrowRight, User, Key, ShieldCheck } from 'lucide-react';
import { loginWithCredentials } from '../services/authService';
import { isConfigured } from '../services/firebaseConfig';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await loginWithCredentials(username, password);
      onLoginSuccess();
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa username dan password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        
        {/* Status Indicator */}
        <div className={`absolute top-0 left-0 w-full py-1 text-[10px] font-bold text-center tracking-widest uppercase ${
            isConfigured ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-400'
        }`}>
            {isConfigured ? 'Database: Online' : 'Database: Local Storage'}
        </div>

        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700 rotate-3 hover:rotate-6 transition-transform">
            <ShieldCheck className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Masuk untuk mengelola galeri video screening.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
            <div className="relative group">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-600"
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <div className="relative group">
              <Key className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-600"
                placeholder="Masukkan password"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               <>
                 <span>Masuk Dashboard</span>
                 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </>
            )}
          </button>
        </form>
          
        <div className="text-center text-xs text-slate-600 mt-8">
          <p>DocuTube DKV ITS &copy; 2025</p>
        </div>
      </div>
    </div>
  );
};