import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <Link to="/" className="font-bold text-2xl flex items-center gap-1 group">
          <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors">&lt;</span>
          <span className="text-white">Pass</span>
          <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors">OP/&gt;</span>
        </Link>

        {/* Right Side */}
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <span className="text-emerald-400 text-sm font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <span className="text-slate-300 text-sm">{user?.name || user?.email}</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-lg px-4 py-2 transition-all duration-200 cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold rounded-lg px-4 py-2 transition-all duration-200"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;