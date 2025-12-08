import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { loginWithGoogle } from '../services/authService';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      onLoginSuccess();
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Pastikan popup tidak diblokir.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
            <Lock className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Login Anggota</h1>
          <p className="text-slate-400 mt-2">Masuk dengan akun Google untuk berpartisipasi</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold py-3 px-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            )}
            <span>Masuk dengan Google</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform opacity-50" />
          </button>
          
          <div className="text-center text-xs text-slate-500 mt-4">
            <p>Gunakan akun institusi (DKV ITS) atau akun pribadi.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
