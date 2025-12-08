import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlaySquare, LogIn, LogOut } from 'lucide-react';
import { getCurrentUser } from '../services/authService';

interface NavbarProps {
  isAuth: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAuth, onLogout }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const user = getCurrentUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-500 hover:text-indigo-400 transition-colors">
          <PlaySquare className="w-8 h-8" />
          <span className="hidden sm:inline">DocuTube DKV ITS</span>
          <span className="sm:hidden">DocuTube</span>
        </Link>
        
        <div className="flex gap-2 items-center">
          <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isActive('/') 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Gallery
            </Link>
            
            {isAuth ? (
              <Link 
                to="/admin" 
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive('/admin') 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : (
              <Link 
                to="/login" 
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive('/login') 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          {isAuth && (
            <div className="flex items-center gap-3 ml-2 pl-2 border-l border-slate-800">
               {user?.photoURL ? (
                 <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-indigo-500/50" />
               ) : (
                 <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
                    {user?.displayName?.charAt(0) || 'U'}
                 </div>
               )}
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg border border-transparent hover:border-slate-800 transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
