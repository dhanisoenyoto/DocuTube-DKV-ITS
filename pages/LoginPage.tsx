import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, ArrowRight, WifiOff, Cloud } from 'lucide-react';
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
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      onLoginSuccess();
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/invalid-api-key') {
         setError('Konfigurasi Firebase (Project ID/Auth Domain) salah atau belum diisi di kode.');
      } else {
         setError(err.message || 'Login gagal. Coba lagi atau periksa koneksi internet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        
        {/* Status Indicator Badge */}
        <div className={`absolute top-0 left-0 w-full py-1 text-[10px] font-bold text-center tracking-widest uppercase ${
            isConfigured ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
        }`}>
            {isConfigured ? 'Server Online' : 'Local / Demo Mode'}
        </div>

        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
            <Lock className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Login Anggota</h1>
          <p className="text-slate-400 mt-2">
            {isConfigured 
              ? "Masuk dengan akun Google untuk akses cloud." 
              : "Masuk Mode Demo (Data tersimpan di browser)."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!isConfigured && (
           <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3 text-yellow-200/80">
              <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold mb-1">Status: Offline / Lokal</p>
                <p>Project ID Firebase belum diatur di <code>firebaseConfig.ts</code>. Anda akan masuk sebagai "Demo User". Video hanya tersimpan di perangkat ini.</p>
              </div>
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
            ) : isConfigured ? (
               <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            ) : (
               <Cloud className="w-5 h-5 text-slate-600" />
            )}
            <span>
              {isConfigured ? 'Masuk dengan Google' : 'Masuk (Mode Demo)'}
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform opacity-50" />
          </button>
          
          <div className="text-center text-xs text-slate-500 mt-4">
            <p>DocuTube DKV ITS &copy; 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};