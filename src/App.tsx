import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, User, PlusCircle, BookOpen, LayoutDashboard, 
  Settings, LogOut, Menu, X, GraduationCap, Info, Mail,
  Calendar, Home as HomeIcon, MapPin, Star
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, getFirestoreStatus } from './lib/firebase';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import SearchPage from './pages/Search';
import Dashboard from './pages/Dashboard';
import AddService from './pages/AddService';
import ServiceDetail from './pages/ServiceDetail';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import About from './pages/About';
import Bookings from './pages/Bookings';
import Contact from './pages/Contact';
import PostRequest from './pages/PostRequest';
import Terms from './pages/Terms';

const Navbar = ({ user, role }: { user: any, role: string | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Mail },
  ];

  return (
    <nav className="fixed w-full bg-white border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3">
              <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-100">S</div>
              <span className="text-2xl font-extrabold tracking-tight text-brand">ServLink</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-semibold transition-all duration-200 ${
                    location.pathname === link.path 
                      ? 'text-brand' 
                      : 'text-slate-500 hover:text-brand'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-gray-500 hover:text-brand p-2 transition-colors" title="Dashboard">
                  <LayoutDashboard size={20} />
                </Link>
                <Link to="/bookings" className="text-gray-500 hover:text-brand p-2 transition-colors" title="My Bookings">
                  <Calendar size={20} />
                </Link>
                <Link to="/profile" className="text-gray-500 hover:text-brand p-2 transition-colors" title="Profile">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 p-2 transition-colors" title="Logout">
                  <LogOut size={20} />
                </button>
                {role === 'provider' && (
                  <Link to="/add-service" className="btn-primary flex items-center gap-2">
                    <PlusCircle size={18} />
                    <span>List Service</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-brand">Log in</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-brand hover:bg-gray-50 outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="pt-2 pb-3 space-y-1 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block pl-3 pr-4 py-2 text-base font-medium border-l-4 ${
                    location.pathname === link.path
                      ? 'bg-blue-50 border-brand text-brand'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 border-l-4 border-transparent hover:bg-gray-50 tracking-wide">Dashboard</Link>
                  <Link to="/bookings" onClick={() => setIsOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 border-l-4 border-transparent hover:bg-gray-50">My Bookings</Link>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 border-l-4 border-transparent hover:bg-gray-50">Profile</Link>
                  <button onClick={handleLogout} className="w-full text-left block pl-3 pr-4 py-2 text-base font-medium text-red-500 border-l-4 border-transparent hover:bg-red-50">Log Out</button>
                </>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500">Log in</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-brand">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = ({ role }: { role: string | null }) => (
  <footer className="bg-gray-50 border-t border-gray-100 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold">SL</div>
            <span className="text-xl font-bold tracking-tight text-gray-900">ServLink</span>
          </div>
          <p className="text-gray-500 max-w-sm mb-6">
            Connecting Pakistan's local talent with people who need work done. From daily chores to professional home services.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Platform</h3>
          <ul className="space-y-3">
            <li><Link to="/search" className="text-gray-500 hover:text-brand text-sm">Find Services</Link></li>
            {role !== 'provider' && (
              <li><Link to="/add-service" className="text-gray-500 hover:text-brand text-sm">Become a Provider</Link></li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Company</h3>
          <ul className="space-y-3">
            <li><Link to="/about" className="text-gray-500 hover:text-brand text-sm">About Us</Link></li>
            <li><Link to="/contact" className="text-gray-500 hover:text-brand text-sm">Contact Support</Link></li>
            <li><Link to="/terms" className="text-gray-500 hover:text-brand text-sm">Terms & Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <p className="text-gray-400 text-sm">© {new Date().getFullYear()} ServLink Pakistan. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isDbOnline, setIsDbOnline] = useState(true);

  useEffect(() => {
    // Check DB status every few seconds
    const checkDb = () => {
      setIsDbOnline(getFirestoreStatus());
    };
    checkDb();
    const interval = setInterval(checkDb, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Attempt to fetch profile with a small retry logic for new registrations
        let profileFetched = false;
        let attempts = 0;
        
        while (!profileFetched && attempts < 3) {
          try {
            const snap = await getDoc(doc(db, 'users', u.uid));
            if (snap.exists()) {
              setRole(snap.data().role);
              profileFetched = true;
            } else {
              attempts++;
              if (attempts < 3) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
              }
            }
          } catch (err) {
            console.error("Auth role fetch error:", err);
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (!profileFetched) {
          setRole(null);
        }
      } else {
        setRole(null);
      }
    });
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {!isDbOnline && (
          <div className="bg-red-500 text-white text-[10px] sm:text-xs font-bold py-1 px-4 text-center sticky top-0 z-[100] animate-pulse">
            Database connection issues detected. Please check your internet or refresh the page.
          </div>
        )}
        <Navbar user={user} role={role} />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-service" element={<AddService />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<PublicProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/post-request" element={<PostRequest />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </main>
        <Footer role={role} />
      </div>
    </Router>
  );
}
