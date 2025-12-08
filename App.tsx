import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { isAuthenticated, logout } from './services/authService';

function App() {
  const [isAuth, setIsAuth] = useState<boolean>(isAuthenticated());

  const handleLoginSuccess = () => {
    setIsAuth(true);
  };

  const handleLogout = () => {
    logout();
    setIsAuth(false);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
        <Navbar isAuth={isAuth} onLogout={handleLogout} />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/login" 
              element={
                !isAuth ? (
                  <LoginPage onLoginSuccess={handleLoginSuccess} />
                ) : (
                  <Navigate to="/admin" replace />
                )
              } 
            />
            <Route 
              path="/admin" 
              element={
                isAuth ? (
                  <AdminPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
          </Routes>
        </div>
        <footer className="py-8 border-t border-slate-900 mt-auto bg-slate-950">
          <div className="container mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm mb-2">&copy; {new Date().getFullYear()} DocuTube DKV ITS. All rights reserved.</p>
            <p className="text-slate-700 text-xs">created by dhani soenyoto</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;