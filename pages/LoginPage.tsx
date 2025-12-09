import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, PlayCircle } from 'lucide-react';
import { loginWithGoogle } from '../services/authService';
import { isConfigured } from '../services/firebaseConfig';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await loginWithGoogle();
      onLoginSuccess();
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Gagal login dengan Google.';
      
      // Error Handling Spesifik Firebase
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login dibatalkan (popup ditutup).';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = `Domain ini (${window.location.hostname}) belum diizinkan di Firebase Console > Auth > Settings > Authorized Domains.`;
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Login Google belum diaktifkan di Firebase Console.';
      } else if (err.message && err.message.includes('blocked')) {
        errorMessage = 'API Key diblokir di Google Cloud Console. Harap set API Restrictions ke "None" atau izinkan "Identity Toolkit API".';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        
        {/* Status Database */}
        <div className={`absolute top-0 left-0 w-full py-1 text-[10px] font-bold text-center tracking-widest uppercase ${
            isConfigured ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
            {isConfigured ? 'System: Online' : 'System: Config Error'}
        </div>

        <div className="text-center mb-8 mt-6">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
            <ShieldCheck className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Login Kontributor</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Masuk dengan akun Google untuk mengunggah atau mengedit karya film.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs leading-relaxed">{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading || !isConfigured}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Sign in with Google</span>
              </>
            )}
          </button>
          
          {!isConfigured && (
             <p className="text-center text-xs text-red-400 mt-2">
               Konfigurasi Firebase belum lengkap. Hubungi administrator.
             </p>
          )}
        </div>
          
        <div className="text-center text-xs text-slate-600 mt-8 border-t border-slate-800 pt-6">
           <div className="flex items-center justify-center gap-2 mb-2">
             <PlayCircle className="w-3 h-3" />
             <span>DocuTube DKV ITS 2025</span>
           </div>
           <p>Platform Screening & Arsip Digital</p>
        </div>
      </div>
    </div>
  );
};