
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, PlayCircle, Info, RefreshCw, XCircle, Users } from 'lucide-react';
import { loginWithGoogle } from '../services/authService';
import { isConfigured } from '../services/firebaseConfig';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');
  const [detailedError, setDetailedError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async (forceSwitch: boolean = false) => {
    setError('');
    setDetailedError('');
    setIsLoading(true);
    
    try {
      await loginWithGoogle(forceSwitch);
      onLoginSuccess();
      navigate('/admin');
    } catch (err: any) {
      console.error("Login Page Error Capture:", err);
      
      const code = err.code;
      const message = err.message || '';
      let friendlyMessage = 'Gagal login dengan Google.';
      let showRaw = true;

      // --- ERROR MAPPING LOGIC ---
      if (code === 'auth/popup-closed-by-user') {
        friendlyMessage = 'Login dibatalkan. Anda menutup jendela pop-up sebelum proses selesai.';
        showRaw = false; // User action, no need for debug info
      } 
      else if (code === 'auth/cancelled-popup-request') {
        friendlyMessage = 'Permintaan dibatalkan karena ada proses login lain yang sedang berjalan.';
        showRaw = false;
      } 
      else if (code === 'auth/popup-blocked') {
        friendlyMessage = 'Browser memblokir jendela login. Silakan izinkan pop-up (matikan AdBlock) untuk situs ini.';
        showRaw = false;
      } 
      else if (code === 'auth/network-request-failed') {
        friendlyMessage = 'Koneksi gagal. Periksa koneksi internet Anda atau coba lagi nanti.';
        showRaw = false; // Usually transient network issue
      } 
      else if (code === 'auth/unauthorized-domain') {
        friendlyMessage = `Domain "${window.location.hostname}" belum didaftarkan di Firebase Console.`;
        // Config issue, keep raw error for admin debugging
      } 
      else if (code === 'auth/operation-not-allowed') {
        friendlyMessage = 'Metode Login Google belum diaktifkan di Firebase Console (Authentication > Sign-in method).';
      } 
      else if (code === 'auth/invalid-api-key') {
        friendlyMessage = 'Konfigurasi API Key Firebase tidak valid.';
      }
      else if (message.includes('blocked')) {
         friendlyMessage = 'Akses API Key diblokir oleh Google Cloud. Cek "API Restrictions".';
      }

      setError(friendlyMessage);
      if (showRaw) {
        setDetailedError(`${code || 'UNKNOWN_ERROR'}: ${message}`);
      }
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
            {isConfigured ? 'System: Online' : 'System: Config Missing'}
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
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col gap-2 text-red-400 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-sm font-medium leading-relaxed">{error}</span>
            </div>
            {detailedError && (
              <div className="mt-2 pt-2 border-t border-red-500/20 text-[10px] font-mono opacity-80 break-words bg-black/20 p-2 rounded select-all">
                RAW ERROR: {detailedError}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {/* Main Login Button */}
          <button 
            onClick={() => handleGoogleLogin(false)}
            disabled={isLoading || !isConfigured}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
          >
            {isLoading ? (
               <RefreshCw className="w-5 h-5 animate-spin text-slate-600" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span>Sign in with Google</span>
              </>
            )}
          </button>
          
          {/* Switch Account Button */}
          <button 
            onClick={() => handleGoogleLogin(true)}
            disabled={isLoading || !isConfigured}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-4 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-sm"
          >
             <Users className="w-4 h-4" />
             <span>Gunakan Akun Lain</span>
          </button>
          
          <div className="flex items-start gap-2 p-3 bg-indigo-900/20 rounded-lg border border-indigo-500/20 mt-4">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-300 leading-relaxed">
              Jika jendela login tidak muncul, pastikan Anda tidak memblokir pop-up. Gunakan tombol "Gunakan Akun Lain" jika ingin berganti email.
            </p>
          </div>

          {!isConfigured && (
             <p className="text-center text-xs text-red-400 mt-2">
               Konfigurasi Firebase belum lengkap. Hubungi admin teknis.
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
