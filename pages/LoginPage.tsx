import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { loginWithGoogle } from '../services/authService';
import { isConfigured, firebaseConfig } from '../services/firebaseConfig';

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
      console.error(err);
      let errorMessage = 'Gagal masuk dengan Google.';
      
      // Error Handling Spesifik untuk User
      if (err.code === 'auth/unauthorized-domain') {
        errorMessage = `Domain ini belum diizinkan. Mohon tambahkan "dokumenter2025.online" ke menu Authentication > Settings > Authorized Domains di Project Firebase: ${firebaseConfig.projectId}`;
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login dibatalkan oleh pengguna.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Login Google belum diaktifkan di Firebase Console. Masuk ke Authentication > Sign-in method > Enable Google.';
      } else if (err.code === 'auth/identity-toolkit-api-has-not-been-used-in-project' || err.message.includes('identity-toolkit')) {
        errorMessage = 'API Identity Toolkit belum aktif. Buka Google Cloud Console untuk project ini dan Enable "Identity Toolkit API".';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        
        {/* Status Indicator */}
        <div className={`absolute top-0 left-0 w-full py-1 text-[10px] font-bold text-center tracking-widest uppercase ${
            isConfigured ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
            {isConfigured ? `Connected: ${firebaseConfig.projectId}` : 'Config Missing'}
        </div>

        <div className="text-center mb-10 mt-6">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700 hover:scale-105 transition-transform">
            <ShieldCheck className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Masuk dengan akun Google untuk mengelola galeri.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 text-left">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs leading-relaxed font-mono break-words w-full">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading || !isConfigured}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {isLoading ? (
               <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            ) : (
               <>
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                    <path fill="#EA4335" d="M12 4.81c1.62 0 3.1.56 4.23 1.64l3.18-3.18C17.45 1.51 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                 </svg>
                 <span>Sign in with Google</span>
               </>
            )}
          </button>
          
          {!isConfigured && (
            <p className="text-center text-xs text-red-400 mt-2">
              Konfigurasi Firebase belum lengkap. Cek file services/firebaseConfig.ts
            </p>
          )}
        </div>
          
        <div className="text-center text-xs text-slate-600 mt-8">
          <p>DocuTube DKV ITS &copy; 2025</p>
        </div>
      </div>
    </div>
  );
};