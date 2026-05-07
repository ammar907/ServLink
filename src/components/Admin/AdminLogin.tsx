import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth';
import { dbService } from '../../services/db';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await authService.login(email, password);
      // Explicitly check Firestore for admin role before allowing entry
      const profile = await dbService.getUserProfile(user.uid);
      
      if (!profile || profile.role !== 'admin') {
        const errorMsg = 'ACCESS DENIED: Insufficient privilege level. Admin rights required.';
        console.error(errorMsg);
        await authService.logout();
        setError(errorMsg);
        return;
      }
      
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-10 border border-red-500/30 space-y-8 border-beam">
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/50 neon-glow-red">
               <ShieldCheck className="text-red-500" size={32} />
            </div>
            <h1 className="text-3xl font-display font-black tracking-tighter neon-text-red">ADMIN GATEWAY</h1>
            <p className="text-white/40 text-[10px] uppercase font-mono tracking-widest leading-loose">
              Restricted Sector. Full authorization required for system override.
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 rounded-xl"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest flex items-center gap-2">
                <Lock size={10} /> Operator Identity
              </label>
              <input 
                type="email" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 focus:outline-none focus:border-red-500/50 text-sm font-mono transition-all"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL_HASH"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest flex items-center gap-2">
                <Lock size={10} /> Access Key
              </label>
              <input 
                type="password" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 focus:outline-none focus:border-red-500/50 text-sm font-mono transition-all"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-red-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-red-500 disabled:opacity-50 neon-glow-red transition-all transform hover:scale-[1.02] active:scale-95"
            >
              {loading ? 'VALIDATING...' : 'INITIATE OVERRIDE'}
            </button>
          </form>

          <Link to="/" className="block text-center text-white/20 hover:text-white text-[10px] uppercase font-black tracking-widest transition-colors">
            Return to Core Marketplace
          </Link>
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-[9px] text-white/10 font-mono tracking-[0.3em] uppercase">
             Encrypted Protocol ServLink_OS v1.0.4.56
           </p>
        </div>
      </motion.div>
    </div>
  );
}
