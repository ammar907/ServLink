import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import { User } from 'firebase/auth';
import { authService } from './services/auth';
import { dbService } from './services/db';
import { UserProfile, ServiceListing, Booking, Review } from './types';
import { AdminPanel } from './components/Admin/AdminPanel';
import { AdminLogin } from './components/Admin/AdminLogin';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  User as UserIcon, 
  Search, 
  PlusSquare, 
  LayoutDashboard, 
  Menu, 
  X, 
  Ghost, 
  Zap, 
  MapPin, 
  Star,
  Eye,
  Trash2,
  CheckCircle,
  MessageCircle,
  ShieldAlert,
  Github,
  Twitter,
  Instagram
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (authService.onAuthChange) {
      const currentUser = authService.onAuthChange((u) => {
        if (u) {
          dbService.getUserProfile(u.uid).then(setProfile);
        } else {
          setProfile(null);
        }
      });
    }
  };

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        const p = await dbService.getUserProfile(u.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin neon-glow-cyan"></div>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      <Router>
        <div className="min-h-screen bg-cyber-black text-white selection:bg-cyber-cyan selection:text-black">
          <div className="mesh-bg" />
          <Navbar />
          <main className="container mx-auto px-4 py-8 relative z-10">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/services/create" element={<ProtectedRoute role="seller"><CreateService /></ProtectedRoute>} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPanel /></ProtectedRoute>} />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

// --- Components ---

function Navbar() {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/10 px-4 py-3 mx-4 mt-4 border-beam">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-cyber-cyan rounded-full flex items-center justify-center neon-glow-cyan group-hover:scale-110 transition-transform duration-300">
             <span className="text-black font-black text-xs">SL</span>
          </div>
          <span className="font-display text-2xl font-bold tracking-tighter neon-text flicker">
            SERVLINK
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
          <Link to="/" className="hover:text-cyber-cyan transition-colors text-sm font-medium">Marketplace</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-cyber-cyan transition-colors text-sm font-medium">Dashboard</Link>
              {profile?.role === 'seller' && (
                <Link to="/services/create" className="flex items-center gap-1 text-cyber-cyan hover:opacity-80 text-sm font-medium">
                  <PlusSquare size={16} />
                  <span>List Service</span>
                </Link>
              )}
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="text-red-500 hover:text-red-400 text-sm font-medium">Admin</Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 hover:text-cyber-cyan group whitespace-nowrap">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-purple p-0.5 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                      {profile?.profilePic ? <img src={profile.profilePic} className="w-full h-full object-cover" /> : <UserIcon size={14} />}
                    </div>
                  </div>
                  <span className="text-sm font-medium">{profile?.name || 'User'}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:text-red-400 transition-colors"
                  id="btn-logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-cyber-cyan transition-colors text-sm font-medium">Login</Link>
              <Link to="/register" className="px-5 py-1.5 rounded-full glass-card border border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan hover:text-black text-xs font-black transition-all neon-glow-cyan uppercase tracking-wider">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full glass border-b border-white/10 p-4 space-y-4"
          >
            <Link to="/" onClick={() => setIsOpen(false)} className="block py-2">Marketplace</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block py-2">Dashboard</Link>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="block py-2">Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-400">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block py-2">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block py-2 text-cyber-cyan">Register</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="glass-card border-t border-white/10 mt-20 py-16 px-6 mx-4 rounded-t-3xl border-beam">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6 col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-cyber-cyan rounded-full flex items-center justify-center neon-glow-cyan">
                <span className="text-black font-black text-xs">SL</span>
              </div>
              <span className="font-display text-2xl font-bold tracking-tighter neon-text flicker">
                SERVLINK
              </span>
            </Link>
            <p className="text-white/40 max-w-sm text-xs leading-relaxed uppercase tracking-wider">
              Dominating the digital marketplace sector in Pakistan. Connecting the skilled elite with the demand nexus. Join the Cyber-Indus revolution today.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] uppercase font-black text-white/60 mb-6 tracking-widest">Digital Hubs</h4>
            <ul className="space-y-3 text-xs text-white/40">
              <li><Link to="/" className="hover:text-cyber-cyan transition-colors uppercase tracking-widest">Marketplace</Link></li>
              <li><Link to="/register" className="hover:text-cyber-cyan transition-colors uppercase tracking-widest">Operational IDs</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyber-cyan transition-colors uppercase tracking-widest">User Nexus</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] uppercase font-black text-white/60 mb-6 tracking-widest">Protocols</h4>
            <ul className="space-y-3 text-xs text-white/40">
              <li><a href="https://wa.me/923145432328" className="hover:text-cyber-cyan transition-colors flex items-center gap-2 uppercase tracking-widest"><MessageCircle size={14}/> Support Signal</a></li>
              <li><Link to="#" className="hover:text-cyber-cyan transition-colors uppercase tracking-widest">Privacy Layers</Link></li>
              <li><Link to="#" className="hover:text-cyber-cyan transition-colors uppercase tracking-widest">Master Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/20 font-mono tracking-widest">
          <p>© 2026 SERVLINK_OS V1.0.4. ALL DATA ENCRYPTED.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
             <Github size={14} className="hover:text-white cursor-pointer" />
             <Twitter size={14} className="hover:text-white cursor-pointer" />
             <Instagram size={14} className="hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'customer' | 'seller' | 'admin' }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  
  if (role && role === 'admin') {
    if (profile?.role !== 'admin') {
      return <Navigate to="/admin-login" />;
    }
    return <>{children}</>;
  }

  if (role && profile?.role !== role) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}

// --- Page Modules ---

function Home() {
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', category: '', search: '' });

  const categories = ['Repairs', 'Digital', 'Cleaning', 'Education', 'Personal Care', 'Automotive', 'Legal'];

  useEffect(() => {
    fetchServices();
  }, [filters.city, filters.category]);

  const fetchServices = async () => {
    setLoading(true);
    const data = await dbService.getServices(filters.city || undefined, filters.category || undefined);
    setServices(data.filter(s => s.title.toLowerCase().includes(filters.search.toLowerCase())));
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-12"
    >
      {/* Hero Section */}
      <section className="relative h-[450px] rounded-3xl overflow-hidden glass-card border border-white/10 flex items-center px-8 md:px-16 border-beam">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <div className="relative z-20 max-w-2xl space-y-6">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl font-display font-bold leading-none tracking-tighter"
          >
            THE SERVICE <br />
            <span className="text-cyber-cyan neon-text flicker">NEXUS</span>
          </motion.h1>
          <p className="text-lg text-white/70 max-w-md">
            Connect with verified professionals in your city. The digital frontier for Pakistan's most skilled creators and technicians.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-cyber-cyan text-black font-black text-xs uppercase tracking-widest rounded-full hover:opacity-90 transition-all neon-glow-cyan" onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}>
              ENTER HUB
            </button>
            <Link to="/register" className="px-8 py-3 glass-card border border-cyber-purple/50 text-cyber-purple font-black text-xs uppercase tracking-widest rounded-full hover:bg-cyber-purple hover:text-black transition-all">
              SELL SKILLS
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-40 z-0 pointer-events-none">
           <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=2070" className="w-full h-full object-cover" alt="Cyberpunk City" referrerPolicy="no-referrer" />
        </div>
      </section>

      {/* Main Marketplace Area */}
      <div id="marketplace" className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Categories */}
        <aside className="w-full lg:w-64 space-y-6 shrink-0">
          <div className="glass-card p-6 border border-white/10 space-y-4">
             <h3 className="text-xs font-bold text-cyber-cyan uppercase tracking-widest">Categories</h3>
             <div className="space-y-1">
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                  className={cn("w-full flex items-center space-x-3 p-3 rounded-xl transition-all text-sm", !filters.category ? "bg-white/10 text-cyber-cyan border-l-2 border-cyber-cyan" : "hover:bg-white/5 text-white/60")}
                >
                   <Zap size={16} className={cn(!filters.category ? "category-icon" : "")} />
                   <span>All Hubs</span>
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                    className={cn("w-full flex items-center space-x-3 p-3 rounded-xl transition-all text-sm", filters.category === cat ? "bg-white/10 text-cyber-cyan border-l-2 border-cyber-cyan" : "hover:bg-white/5 text-white/60")}
                  >
                     <span className="category-icon text-lg">⚡</span>
                     <span>{cat}</span>
                  </button>
                ))}
             </div>
             
             <div className="p-4 rounded-xl bg-cyber-purple/10 border border-cyber-purple/30 mt-6 mt-auto">
               <p className="text-[10px] text-cyber-purple uppercase font-black mb-1">Seller Perk</p>
               <p className="text-xs text-white/80">Go Live and earn in 24 hours.</p>
               <Link to="/services/create" className="mt-3 block w-full py-2 bg-cyber-purple text-black rounded-lg text-xs font-black text-center uppercase tracking-wider">
                  REGISTER GIG
               </Link>
             </div>
          </div>
        </aside>

        {/* Content Section */}
        <section className="flex-1 space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card p-5 border border-white/10">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input 
                type="text" 
                placeholder="Search the nexus ( Islamabad, Lahore... )" 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-cyber-cyan/50 transition-all font-medium"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                id="search-input"
              />
            </div>
            <select 
              className="border border-white/10 rounded-full py-2.5 px-6 text-sm focus:outline-none focus:border-cyber-cyan/50 cursor-pointer"
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            >
              <option value="">All Cities</option>
              {['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Peshawar', 'Quetta', 'Multan'].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Featured Nexus <span className="text-cyber-cyan">• {filters.city || 'Pakistan'}</span></h2>
            <div className="text-[10px] uppercase font-black text-white/40 tracking-widest">Showing {services.length} results</div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="h-80 rounded-2xl glass-card animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div 
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/services/${service.id}`} className="group block glass-card p-4 border border-white/10 hover:border-cyber-cyan/30 transition-all duration-300 border-beam">
                    <div className="h-40 bg-white/5 rounded-xl mb-4 overflow-hidden relative">
                      <img 
                        src={service.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070'} 
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 bg-cyber-cyan text-black text-[10px] font-black rounded uppercase">
                        {service.isVerified ? 'VERIFIED' : 'PENDING'}
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white/80 border border-white/10">
                        {service.category}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg group-hover:text-cyber-cyan transition-colors line-clamp-1">{service.title}</h4>
                      <div className="flex items-center gap-1 text-white/40 text-xs font-medium">
                        <MapPin size={12} strokeWidth={3} />
                        <span>{service.city}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <div className="flex flex-col">
                        <span className="text-cyber-cyan font-display font-bold text-xl">Rs. {service.price}</span>
                        <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">{service.paymentType}</span>
                      </div>
                      <button className="px-5 py-1.5 bg-cyber-cyan text-black text-xs font-black rounded-lg neon-glow-cyan uppercase transition-transform group-hover:scale-105">
                        VIEW
                      </button>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {services.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-4">
                  <Ghost size={48} className="mx-auto text-white/20" />
                  <p className="text-white/40 font-medium">No signals found in this sector.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}

function Login() {
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
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return setError('Enter email first');
    try {
      await authService.resetPassword(email);
      alert('Password reset link sent to your email.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 border border-white/10 space-y-8 border-beam"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-display font-bold neon-text">WELCOME BACK</h2>
          <p className="text-white/60 text-sm">Reconnect with the ServLink nexus.</p>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-xs rounded-xl">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Email Identity</label>
            <input 
              type="email" 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="input-email"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Master Password</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="input-password"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-cyber-cyan text-black font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 disabled:opacity-50 neon-glow-cyan transition-all"
            id="btn-login"
          >
            {loading ? 'AUTHENTICATING...' : 'ENTER SYSTEM'}
          </button>
        </form>

        <div className="flex justify-between items-center text-xs">
          <button onClick={handleResetPassword} className="text-white/40 hover:text-cyber-cyan underline">Forgot Link?</button>
          <Link to="/register" className="text-cyber-cyan hover:underline font-bold">New User?</Link>
        </div>
      </motion.div>
    </div>
  );
}

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' as 'customer' | 'seller',
    city: 'Karachi'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await authService.register(formData.email, formData.password);
      await dbService.createUserProfile({
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        city: formData.city,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 border border-white/10 space-y-8 border-beam"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-display font-bold neon-text">NEW CONNECTION</h2>
          <p className="text-white/60 text-sm">Choose your operational path.</p>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 text-xs rounded-xl">{error}</div>}

        <div className="flex bg-white/5 p-1 rounded-xl">
          <button 
            type="button"
            className={cn("flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all tracking-wider", formData.role === 'customer' ? "bg-cyber-cyan text-black" : "text-white/40 hover:text-white")}
            onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
          >
            HIRE
          </button>
          <button 
            type="button"
            className={cn("flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all tracking-wider", formData.role === 'seller' ? "bg-cyber-purple text-black font-black" : "text-white/40 hover:text-white")}
            onClick={() => setFormData(prev => ({ ...prev, role: 'seller' }))}
          >
            WORK
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Public Name</label>
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Master Password</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">City Focus</label>
            <select 
              className="w-full border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            >
              {['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Peshawar', 'Quetta', 'Multan'].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={cn(
              "w-full py-3 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:opacity-90 disabled:opacity-50 transition-all",
              formData.role === 'customer' ? "bg-cyber-cyan neon-glow-cyan" : "bg-cyber-purple border-cyber-purple"
            )}
            id="btn-register"
          >
            {loading ? 'INITIALIZING...' : 'INITIALIZE PROFILE'}
          </button>
        </form>

        <p className="text-center text-xs text-white/40">
          Already verified? <Link to="/login" className="text-cyber-cyan font-bold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}

function Dashboard() {
  const { user, profile } = useAuth();
  const [myData, setMyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'customer') {
        dbService.getBookings(user.uid, 'customer').then(data => {
          setMyData(data);
          setLoading(false);
        });
      } else {
        dbService.getServices().then(all => {
           setMyData(all.filter(s => s.sellerId === user.uid));
           setLoading(false);
        });
      }
    }
  }, [user, profile]);

  if (loading) return <div>Synchronizing records...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold neon-text">NEXUS CONTROL</h1>
          <p className="text-white/60 text-sm">Welcome to your operational hub, {profile?.name}</p>
        </div>
        {profile?.role === 'seller' && (
          <Link to="/services/create" className="px-6 py-2 bg-cyber-cyan text-black font-black text-xs uppercase tracking-widest rounded-full neon-glow-cyan hover:scale-105 transition-all">
            DEPLOY GIG
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="glass-card p-8 border border-white/10 border-beam">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <LayoutDashboard size={20} className="text-cyber-cyan" />
            {profile?.role === 'customer' ? 'Operational Bookings' : 'Gigs Live on Grid'}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/5 text-[10px] font-black uppercase text-white/40 tracking-widest">
                <tr>
                  {profile?.role === 'customer' ? (
                    <>
                      <th className="pb-4">Booking ID</th>
                      <th className="pb-4">Timestamp</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Settlement</th>
                    </>
                  ) : (
                    <>
                      <th className="pb-4">Service</th>
                      <th className="pb-4">Hub</th>
                      <th className="pb-4">Valuation</th>
                      <th className="pb-4">Integrity</th>
                      <th className="pb-4">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myData.map((item) => (
                  <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                    {profile?.role === 'customer' ? (
                      <>
                        <td className="py-4 font-mono text-xs text-cyber-cyan">{item.id.slice(0, 8)}</td>
                        <td className="py-4 text-sm">{item.date} {item.time}</td>
                        <td className="py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                            item.status === 'completed' ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-500"
                          )}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 text-[10px] font-mono text-white/40 uppercase tracking-tighter">{item.paymentMethod}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 font-bold text-sm">{item.title}</td>
                        <td className="py-4 text-white/60 text-xs">{item.category}</td>
                        <td className="py-4 text-cyber-cyan font-bold text-sm">Rs. {item.price}</td>
                        <td className="py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                            item.isVerified ? "bg-cyan-500/20 text-cyan-400" : "bg-red-500/20 text-red-500"
                          )}>
                            {item.isVerified ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </td>
                        <td className="py-4">
                          <button 
                            onClick={async () => {
                              if (confirm('Decommission this listing from the grid?')) {
                                await dbService.deleteService(item.id);
                                setMyData(prev => prev.filter(i => i.id !== item.id));
                              }
                            }}
                            className="p-2 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {myData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-white/30 text-sm italic">No data streams detected.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CreateService() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: 'Repairs',
    description: '',
    price: 0,
    city: 'Karachi',
    paymentType: 'COD' as 'COD' | 'Voucher',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await dbService.createService({
        sellerId: user.uid,
        ...formData
      });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border border-white/10 space-y-8 border-beam"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold neon-text uppercase tracking-tighter">DEPLOY SERVICE</h1>
          <p className="text-white/60 text-sm">Configure your offering for the Marketplace nexus.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Service Title</label>
            <input 
              type="text" 
              required 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Category</label>
            <select 
              className="w-full border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            >
              {['Repairs', 'Digital', 'Cleaning', 'Education', 'Personal Care', 'Automotive', 'Legal'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
             <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Valuation (PKR)</label>
             <input 
              type="number" 
              required 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Operation City</label>
            <select 
              className="w-full border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            >
              {['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Peshawar', 'Quetta', 'Multan'].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Settlement Logic</label>
            <select 
              className="w-full border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
              value={formData.paymentType}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value as any }))}
            >
              <option value="COD">Cash on Delivery</option>
              <option value="Voucher">Digital Voucher</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Visual Asset Link (URL)</label>
            <div className="flex gap-2">
              <input 
                type="url" 
                placeholder="https://..." 
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              />
            </div>
            <p className="text-[10px] text-white/30 ml-2 italic tracking-tight">Direct image links recommended for profile verification.</p>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Core Description</label>
            <textarea 
              required 
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-cyber-cyan text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 disabled:opacity-50 neon-glow-cyan transition-all"
              id="btn-publish"
            >
              {loading ? 'TRANSMITTING DATA...' : 'ESTABLISH LINK ON GRID'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [service, setService] = useState<ServiceListing | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
       Promise.all([
          dbService.getServiceById(id),
          dbService.getReviews(id)
       ]).then(([s, r]) => {
          setService(s);
          setReviews(r);
          if (s) dbService.getUserProfile(s.sellerId).then(setSeller);
          setLoading(false);
       });
    }
  }, [id]);

  if (loading) return <div>Synchronizing service data...</div>;
  if (!service) return <div>Service not found in the grid.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="aspect-video rounded-3xl overflow-hidden glass-card border border-white/10 border-beam">
            <img 
              src={service.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070'} 
              className="w-full h-full object-cover"
              alt={service.title}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex gap-4">
             {reviews.length > 0 && (
                <div className="glass-card px-4 py-2 flex items-center gap-2 border border-white/5">
                  <Star className="text-yellow-400 fill-yellow-400" size={16} />
                  <span className="font-bold">{(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}</span>
                  <span className="text-white/40 text-xs">({reviews.length} feedback)</span>
                </div>
             )}
             <div className="glass-card px-4 py-2 flex items-center gap-2 border border-white/5">
                <MapPin className="text-cyber-cyan" size={16} />
                <span className="text-sm font-medium">{service.city}</span>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-cyber-purple/20 text-cyber-purple text-[10px] font-black rounded border border-cyber-purple/30 uppercase tracking-widest">{service.category}</span>
              {service.isVerified && <span className="px-2 py-1 bg-cyber-cyan/20 text-cyber-cyan text-[10px] font-black rounded border border-cyber-cyan/30 uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10}/> Verified</span>}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight neon-text">{service.title}</h1>
            <p className="text-white/70 text-lg leading-relaxed">{service.description}</p>
          </div>

          <div className="glass-card p-6 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 border-beam">
             <div className="space-y-1 text-center md:text-left">
                <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">DEPLOYMENT COST</p>
                <p className="text-4xl font-display font-bold text-cyber-cyan">Rs. {service.price}</p>
             </div>
             {profile?.role === 'customer' || !user ? (
               <button 
                onClick={() => user ? setBookingModal(true) : navigate('/login')}
                className="w-full md:w-auto px-12 py-4 bg-cyber-cyan text-black font-black text-xs uppercase tracking-widest rounded-2xl neon-glow-cyan hover:scale-105 transition-all"
               >
                 RESERVE SLOT
               </button>
             ) : (
               <div className="text-white/40 italic text-sm">Preview mode for Sellers</div>
             )}
          </div>

          <div className="flex items-center gap-4 p-4 glass-card border border-white/5">
             <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 border border-cyber-cyan/30 p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                   {seller?.profilePic ? <img src={seller.profilePic} className="w-full h-full object-cover" /> : <UserIcon className="text-white/50" />}
                </div>
             </div>
             <div>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-wider">Provider</p>
                <p className="font-bold text-sm tracking-tight">{seller?.name || 'Loading...'}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Reviews Feed */}
      <section className="space-y-6">
         <h2 className="text-2xl font-display font-bold">FEEDBACK LOOP</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(review => (
               <div key={review.id} className="glass-card p-6 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                     <p className="font-bold text-sm">{review.customerName}</p>
                     <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => (
                           <Star key={star} size={10} className={cn(star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-white/10")} />
                        ))}
                     </div>
                  </div>
                  <p className="text-white/60 text-xs italic">"{review.comment}"</p>
               </div>
            ))}
            {reviews.length === 0 && <p className="text-white/30 italic text-sm">No feedback signals detected.</p>}
         </div>
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {bookingModal && service && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg glass-card p-8 border border-cyber-cyan/30 space-y-8 overflow-hidden border-beam"
            >
              <div className="absolute top-0 right-0 p-4">
                 <button onClick={() => setBookingModal(false)} className="text-white/40 hover:text-white"><X/></button>
              </div>
              
              <div className="space-y-2">
                 <h3 className="text-3xl font-display font-bold neon-text">CONFIRM BOOKING</h3>
                 <p className="text-white/60 text-sm">Finalize your request with {seller?.name}</p>
              </div>

              <BookingForm service={service} sellerId={service.sellerId} onComplete={() => {
                 setBookingModal(false);
                 navigate('/dashboard');
              }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BookingForm({ service, sellerId, onComplete }: { service: ServiceListing, sellerId: string, onComplete: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    paymentMethod: service.paymentType === 'COD' ? 'Cash on Delivery' : 'Digital Voucher'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const voucherCode = service.paymentType === 'Voucher' ? Math.random().toString(36).substring(2, 10).toUpperCase() : '';
      await dbService.createBooking({
        customerId: user.uid,
        sellerId: sellerId,
        serviceId: service.id,
        date: formData.date,
        time: formData.time,
        paymentMethod: formData.paymentMethod,
        voucherCode
      });
      if (voucherCode) {
         alert(`Voucher Generated: ${voucherCode}`);
      }
      onComplete();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-1">
            <label className="text-xs text-white/40 ml-2">Preferred Date</label>
            <input 
              type="date" 
              required 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
         </div>
         <div className="space-y-1">
            <label className="text-xs text-white/40 ml-2">Arrival Window</label>
            <input 
              type="time" 
              required 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            />
         </div>
      </div>
      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
         <div className="flex justify-between items-center text-sm">
            <span className="text-white/40">Total Settlement</span>
            <span className="font-bold text-cyber-cyan">Rs. {service.price}</span>
         </div>
         <div className="flex justify-between items-center text-sm">
            <span className="text-white/40">Protocol</span>
            <span className="font-bold text-cyber-purple">{formData.paymentMethod}</span>
         </div>
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 bg-cyber-cyan text-black font-bold rounded-2xl neon-glow-cyan hover:opacity-90 disabled:opacity-50 transition-all font-display uppercase tracking-widest"
      >
        {loading ? 'Transmitting...' : 'Initiate Protocol'}
      </button>
    </form>
  );
}

function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    city: '',
    address: '',
    profilePic: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        city: profile.city || '',
        address: profile.address || '',
        profilePic: profile.profilePic || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setSuccess(false);
    try {
      await dbService.updateUserProfile(user.uid, formData);
      await refreshProfile();
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border border-white/10 space-y-8 border-beam"
      >
        <div>
          <h1 className="text-4xl font-display font-bold neon-text uppercase tracking-tighter">DATA PROFILE</h1>
          <p className="text-white/40 text-xs font-mono uppercase tracking-widest">{profile?.role} NODE: {user?.uid.slice(0, 12)}</p>
        </div>

        {success && <div className="p-3 bg-cyber-cyan/10 border border-cyber-cyan/50 text-cyber-cyan rounded-xl text-center text-[10px] font-black uppercase tracking-widest">Protocol updated successfully.</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-center border-b border-white/5 pb-8">
             <div className="w-32 h-32 rounded-full overflow-hidden glass-card border flex items-center justify-center shrink-0 border-beam">
                {formData.profilePic ? (
                  <img src={formData.profilePic} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={48} className="text-white/20" />
                )}
             </div>
             <div className="flex-1 w-full space-y-1">
                <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Avatar URL Stream</label>
                <input 
                  type="url" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
                  value={formData.profilePic}
                  onChange={(e) => setFormData(prev => ({ ...prev, profilePic: e.target.value }))}
                  placeholder="https://..."
                />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Public Alias</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Sector Location</label>
                <select 
                  className="w-full border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                >
                  {['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Peshawar', 'Quetta', 'Multan'].map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
             </div>
             <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Geographic Address</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
             </div>
             <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] uppercase font-black text-white/40 ml-2 tracking-widest">Node Bio / Specifications</label>
                <textarea 
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyber-cyan/50 text-sm"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />
             </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-cyber-purple text-black font-black text-xs uppercase tracking-widest rounded-2xl neon-glow-purple hover:scale-[1.01] transition-all"
            id="btn-update-profile"
          >
            {loading ? 'DYSYNCING...' : 'SYNC TO MAIN TERMINAL'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
