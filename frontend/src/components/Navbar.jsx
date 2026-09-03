import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Flame,
  LayoutDashboard,
  Dumbbell,
  History,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-[#070b13]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#070b13] rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                Aegis<span className="text-cyan-400 font-black">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 rounded-full">
                Trainer
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/')
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/dashboard')
                      ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <Link
                  to="/exercises"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/exercises')
                      ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Dumbbell className="w-4 h-4" />
                  Exercises
                </Link>

                <Link
                  to="/history"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/history')
                      ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                </Link>
              </>
            )}
          </div>

          {/* User Profile / Auth CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/exercises"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:from-cyan-400 hover:to-emerald-400 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Workout
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'Athlete'}</p>
                    <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[110px]">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0c121e] px-4 pt-2 pb-6 space-y-2 animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/exercises"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                Exercises
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                History
              </Link>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-slate-200 bg-slate-800 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-slate-950 bg-cyan-400 rounded-lg"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
