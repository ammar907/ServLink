import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { UserProfile, ServiceListing, Booking } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';

type Tab = 'stats' | 'users' | 'services' | 'bookings';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({ users: 0, services: 0, bookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time stats
    const unsubUsers = onSnapshot(collection(db, 'users'), (s) => setStats(prev => ({ ...prev, users: s.size })));
    const unsubServices = onSnapshot(collection(db, 'services'), (s) => setStats(prev => ({ ...prev, services: s.size })));
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (s) => setStats(prev => ({ ...prev, bookings: s.size })));

    // Fetch full data
    fetchData();

    return () => {
      unsubUsers();
      unsubServices();
      unsubBookings();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [u, s, b] = await Promise.all([
      dbService.getAllUsers(),
      dbService.getServices(),
      dbService.getAllBookings()
    ]);
    setUsers(u);
    setServices(s);
    setBookings(b);
    setLoading(false);
  };

  const handleVerifyService = async (id: string, current: boolean) => {
    await dbService.updateService(id, { isVerified: !current });
    setServices(prev => prev.map(s => s.id === id ? { ...s, isVerified: !current } : s));
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Permanently delete this service listing?')) {
      await dbService.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (confirm('Permanently wipe this user node from the mainframe?')) {
      await dbService.deleteUser(uid);
      setUsers(prev => prev.filter(u => u.uid !== uid));
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[700px]">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="glass-card p-6 border border-white/10 sticky top-24 space-y-8">
           <div className="space-y-1">
              <h1 className="text-xl font-display font-black tracking-tighter neon-text">ADMIN CONTROL</h1>
              <p className="text-[10px] text-white/40 uppercase font-mono tracking-widest italic">System v1.0.4 - Full Override Active</p>
           </div>

           <nav className="space-y-1">
              <NavItem active={activeTab === 'stats'} icon={<BarChart3 size={18} />} label="Operational Stats" onClick={() => setActiveTab('stats')} />
              <NavItem active={activeTab === 'users'} icon={<Users size={18} />} label="User Integrity" onClick={() => setActiveTab('users')} />
              <NavItem active={activeTab === 'services'} icon={<Package size={18} />} label="Service Moderation" onClick={() => setActiveTab('services')} />
              <NavItem active={activeTab === 'bookings'} icon={<ShoppingCart size={18} />} label="Booking Monitor" onClick={() => setActiveTab('bookings')} />
           </nav>

           <div className="pt-8 border-t border-white/5">
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3">
                 <ShieldCheck className="text-red-500" size={20} />
                 <div>
                    <p className="text-[10px] font-black uppercase text-red-500 tracking-wider">Auth Status</p>
                    <p className="text-[9px] text-white/60 font-mono">LEVEL_4_CLEARANCE</p>
                 </div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div 
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Total User Nodes" value={stats.users} color="cyan" />
                  <StatCard label="Service Deployments" value={stats.services} color="purple" />
                  <StatCard label="Grid Transactions" value={stats.bookings} color="green" />
               </div>
               
               <div className="glass-card p-8 border border-white/10 space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white/60">System Log / Telemetry</h3>
                  <div className="space-y-3 font-mono text-[10px]">
                     <LogItem time="14:23:11" msg="User NODE_8823 achieved verified status." type="info" />
                     <LogItem time="14:25:45" msg="New Service Deployment: 'Expert AC Repair' in Sector_Lahore." type="success" />
                     <LogItem time="14:28:02" msg="Booking Transaction #9923 finalized via COD." type="info" />
                     <LogItem time="14:30:15" msg="Security Scan Complete: 0 breaches detected." type="success" />
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card border border-white/10 overflow-hidden"
            >
               <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="font-bold uppercase tracking-tighter text-xl">User Registry</h2>
                  <div className="flex gap-2">
                     <button className="p-2 hover:bg-white/5 rounded-lg text-white/40"><Filter size={16} /></button>
                     <button className="p-2 hover:bg-white/5 rounded-lg text-white/40"><Search size={16} /></button>
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-white/5 text-[10px] uppercase font-black text-white/40 tracking-widest">
                        <tr>
                           <th className="px-6 py-4">Node Profile</th>
                           <th className="px-6 py-4">Role / Sector</th>
                           <th className="px-6 py-4">Verification</th>
                           <th className="px-6 py-4 text-right">Operational Control</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                           <tr key={u.uid} className="hover:bg-white/5 transition-colors group">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                                       {u.profilePic ? <img src={u.profilePic} className="w-full h-full object-cover" /> : <Users size={14} className="m-auto mt-2" />}
                                    </div>
                                    <div>
                                       <p className="font-bold text-sm tracking-tight">{u.name}</p>
                                       <p className="text-[10px] text-white/40 font-mono lowercase">{u.email}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <p className="text-[10px] font-black uppercase text-cyber-cyan tracking-widest">{u.role}</p>
                                 <p className="text-[10px] text-white/40">{u.city}</p>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-green-400">
                                    <CheckCircle2 size={12} /> SECURE
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button onClick={() => handleDeleteUser(u.uid)} className="p-2 text-white/20 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          )}

          {activeTab === 'services' && (activeTab === 'services' && (
            <motion.div 
               key="services"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6"
            >
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map(s => (
                     <div key={s.id} className="glass-card border border-white/10 p-5 group border-beam flex gap-4">
                        <div className="w-24 h-24 rounded-xl bg-white/5 overflow-hidden shrink-0">
                           <img src={s.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                           <div className="flex justify-between items-start">
                              <h4 className="font-bold text-sm truncate">{s.title}</h4>
                              <span className="text-cyber-cyan font-mono text-[10px]">Rs.{s.price}</span>
                           </div>
                           <p className="text-[10px] text-white/40 line-clamp-2">{s.description}</p>
                           <div className="flex justify-between items-center pt-2">
                              <button 
                                 onClick={() => handleVerifyService(s.id, !!s.isVerified)}
                                 className={cn(
                                    "px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all",
                                    s.isVerified ? "bg-green-500 text-black" : "bg-white/5 text-white/30 border border-white/10 hover:bg-white/10"
                                 )}
                              >
                                 {s.isVerified ? 'VERIFIED' : 'PENDING APPROVAL'}
                              </button>
                              <button onClick={() => handleDeleteService(s.id)} className="text-white/20 hover:text-red-500 transition-colors">
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>
          ))}

          {activeTab === 'bookings' && (
             <motion.div 
                key="bookings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card border border-white/10 overflow-hidden"
             >
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-white/5 text-[10px] uppercase font-black text-white/40 tracking-widest">
                         <tr>
                            <th className="px-6 py-4">ID / Operation</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Value / Payment</th>
                            <th className="px-6 py-4">Node Link</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {bookings.map(b => (
                            <tr key={b.id} className="hover:bg-white/5 transition-colors">
                               <td className="px-6 py-4">
                                  <p className="font-mono text-[10px] text-cyber-cyan mb-1">{b.id.slice(0, 10)}</p>
                                  <p className="text-[10px] text-white/60">{b.date} • {b.time}</p>
                               </td>
                               <td className="px-6 py-4">
                                  <span className={cn(
                                     "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                     b.status === 'completed' ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30"
                                  )}>
                                     {b.status}
                                  </span>
                               </td>
                               <td className="px-6 py-4">
                                  <p className="text-[10px] font-bold text-cyber-cyan uppercase tracking-widest">NET_SETTLEMENT</p>
                                  <p className="text-[10px] text-white/40 font-mono italic">{b.paymentMethod}</p>
                               </td>
                               <td className="px-6 py-4">
                                  <div className="space-y-1">
                                     <p className="text-[9px] text-white/30 uppercase flex items-center gap-1"><ArrowRight size={8}/> C: {b.customerId.slice(0, 8)}</p>
                                     <p className="text-[9px] text-white/30 uppercase flex items-center gap-1"><ArrowRight size={8}/> S: {b.sellerId.slice(0, 8)}</p>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Internal Helper Components
function NavItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider",
        active ? "bg-white/10 text-cyber-cyan neon-glow-cyan-sm border-l-2 border-cyber-cyan" : "text-white/40 hover:bg-white/5 hover:text-white"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ label, value, color }: { label: string, value: number, color: 'cyan' | 'purple' | 'green' }) {
  const colorMap = {
    cyan: 'text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/5 neon-text',
    purple: 'text-cyber-purple border-cyber-purple/30 bg-cyber-purple/5 neon-text-purple',
    green: 'text-green-400 border-green-400/30 bg-green-400/5 neon-text-green'
  };

  return (
    <div className={cn("glass-card p-6 border rounded-3xl border-beam text-center space-y-2", colorMap[color])}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{label}</p>
      <p className="text-4xl font-display font-black">{value.toString().padStart(2, '0')}</p>
    </div>
  );
}

function LogItem({ time, msg, type }: { time: string, msg: string, type: 'info' | 'success' | 'warning' }) {
  return (
    <div className="flex gap-4 items-start opacity-70 hover:opacity-100 transition-opacity">
       <span className="text-white/20 shrink-0">[{time}]</span>
       <span className={cn(
          "shrink-0",
          type === 'success' ? "text-green-500" : type === 'warning' ? "text-red-500" : "text-cyber-cyan"
       )}>&gt; {type.toUpperCase()} :</span>
       <span className="text-white/60">{msg}</span>
    </div>
  );
}
