import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { Menu, X, User, LogOut, Search, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile, isAdmin, isSeller } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                <span className="text-black font-black text-xl">S</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">SERV<span className="text-brand-primary">LINK</span></span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/search" className="text-gray-300 hover:text-brand-primary transition-colors flex items-center gap-2">
              <Search size={18} /> Search
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-brand-primary transition-colors">About</Link>
            <Link to="/contact" className="text-gray-300 hover:text-brand-primary transition-colors">Contact</Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                {isSeller && (
                  <Link to="/add-service" className="text-brand-primary hover:text-brand-primary/80 transition-colors flex items-center gap-2">
                    <PlusCircle size={18} /> Add Service
                  </Link>
                )}
                <div className="h-6 w-px bg-white/10" />
                <Link to="/dashboard" className="text-gray-300 hover:text-brand-primary transition-colors flex items-center gap-2">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <div className="relative group">
                  <button className="w-10 h-10 rounded-full bg-brand-surface border border-white/10 flex items-center justify-center hover:border-brand-primary transition-all overflow-hidden">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="p" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-gray-400" />
                    )}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 glass rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-white/5 transition-colors">My Profile</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-white/5 text-red-400 transition-colors flex items-center gap-2">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-300 hover:text-white font-medium">Login</Link>
                <Link to="/register" className="btn-primary py-2 px-5 text-sm uppercase tracking-wider">Join Now</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link to="/search" onClick={() => setIsOpen(false)} className="block text-lg font-medium">Search Services</Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className="block text-lg font-medium">About</Link>
              <Link to="/contact" onClick={() => setIsOpen(false)} className="block text-lg font-medium">Contact Us</Link>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-lg font-medium">Dashboard</Link>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="block text-lg font-medium">Profile</Link>
                  <button onClick={handleLogout} className="w-full text-left text-lg font-medium text-red-400">Logout</button>
                </>
              ) : (
                <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="text-center font-medium">Login</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
