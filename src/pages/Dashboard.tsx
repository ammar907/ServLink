import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { LayoutDashboard, ShoppingBag, ListChecks, Star, Settings, Trash2, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile, isAdmin, isSeller } = useAuth();
  const [data, setData] = useState<any>({ services: [], bookings: [], allServices: [], allBookings: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const servicesSnap = await getDocs(collection(db, 'services'));
        const bookingsSnap = await getDocs(collection(db, 'bookings'));
        setData({
          allServices: servicesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          allBookings: bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        });
      } else if (isSeller) {
        const servicesQ = query(collection(db, 'services'), where('sellerId', '==', user?.uid), orderBy('createdAt', 'desc'));
        const bookingsQ = query(collection(db, 'bookings'), where('sellerId', '==', user?.uid), orderBy('createdAt', 'desc'));
        const [servicesS, bookingsS] = await Promise.all([getDocs(servicesQ), getDocs(bookingsQ)]);
        setData({
          services: servicesS.docs.map(d => ({ id: d.id, ...d.data() })),
          bookings: bookingsS.docs.map(d => ({ id: d.id, ...d.data() }))
        });
      } else {
        const bookingsQ = query(collection(db, 'bookings'), where('customerId', '==', user?.uid), orderBy('createdAt', 'desc'));
        const bookingsS = await getDocs(bookingsQ);
        setData({
          bookings: bookingsS.docs.map(d => ({ id: d.id, ...d.data() }))
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
      fetchData();
    } catch (e) {
      alert('Error updating status');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await deleteDoc(doc(db, 'services', id));
      fetchData();
    } catch (e) {
      alert('Error deleting service');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-primary">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="md:w-64 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-brand-primary text-black font-black' : 'hover:bg-white/5 text-gray-400'}`}>
            <LayoutDashboard size={20} /> Overview
          </button>
          {isSeller && (
            <button onClick={() => setActiveTab('services')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'services' ? 'bg-brand-primary text-black font-black' : 'hover:bg-white/5 text-gray-400'}`}>
              <ListChecks size={20} /> My Services
            </button>
          )}
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'bookings' ? 'bg-brand-primary text-black font-black' : 'hover:bg-white/5 text-gray-400'}`}>
            <ShoppingBag size={20} /> {isSeller ? 'Service Requests' : 'My Bookings'}
          </button>
          {isAdmin && (
            <>
              <div className="pt-4 pb-2 px-4 text-[10px] font-black uppercase text-brand-primary tracking-[0.2em]">Admin Tools</div>
              <button onClick={() => setActiveTab('all-services')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'all-services' ? 'bg-brand-primary text-black font-black' : 'hover:bg-white/5 text-gray-400'}`}>
                <Settings size={20} /> All Services
              </button>
              <button onClick={() => setActiveTab('all-bookings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'all-bookings' ? 'bg-brand-primary text-black font-black' : 'hover:bg-white/5 text-gray-400'}`}>
                <ShoppingBag size={20} /> All Bookings
              </button>
            </>
          )}
        </aside>

        {/* Content */}
        <main className="flex-1 space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-8 rounded-3xl">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Total Bookings</p>
                  <div className="text-4xl font-black text-brand-primary">{data.bookings?.length || data.allBookings?.length || 0}</div>
                </div>
                {isSeller && (
                  <div className="glass p-8 rounded-3xl">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Total Services</p>
                    <div className="text-4xl font-black text-brand-primary">{data.services?.length || 0}</div>
                  </div>
                )}
                <div className="glass p-8 rounded-3xl">
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Status</p>
                  <div className="text-xl font-black text-white">{profile?.role || 'User'} Member</div>
                </div>
              </div>

               <div className="glass p-8 rounded-3xl">
                <h3 className="text-xl font-black mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {(isSeller ? data.bookings : data.bookings).slice(0, 3).map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between p-4 glass rounded-xl border-white/5">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                           <Clock size={18} />
                         </div>
                         <div>
                            <p className="font-black">Booking for {b.serviceTitle}</p>
                            <p className="text-xs text-gray-500">Status: <span className="uppercase text-brand-primary">{b.status}</span></p>
                         </div>
                      </div>
                      <Link to="/dashboard" onClick={() => setActiveTab('bookings')} className="text-brand-primary text-xs font-bold uppercase hover:underline">Details</Link>
                    </div>
                  ))}
                  {(!isSeller && data.bookings?.length === 0) && <p className="text-gray-500 font-medium">No recent activity found.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black">My Services</h2>
                <Link to="/add-service" className="btn-primary py-2 text-sm uppercase tracking-wider">Add New</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.services.map((s: any) => (
                  <div key={s.id} className="glass rounded-2xl overflow-hidden group border border-white/5 flex">
                    <img src={s.images?.[0] || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300'} className="w-24 h-full object-cover" />
                    <div className="p-4 flex-grow">
                      <h4 className="font-black line-clamp-1">{s.title}</h4>
                      <p className="text-brand-primary font-bold text-sm mb-2">Rs. {s.price}</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleDeleteService(s.id)} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-black transition-all">
                          <Trash2 size={14} />
                        </button>
                        <Link to={`/service/${s.id}`} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-black transition-all">
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">{isSeller ? 'Incoming Requests' : 'My Bookings'}</h2>
              <div className="overflow-x-auto glass rounded-3xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 tracking-widest">Service</th>
                      <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 tracking-widest">{isSeller ? 'Customer' : 'Seller'}</th>
                      <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 tracking-widest">Date</th>
                      <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-black uppercase text-gray-500 tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bookings.map((b: any) => (
                      <tr key={b.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-black text-sm">{b.serviceTitle}</td>
                        <td className="px-6 py-4 text-sm font-medium">{isSeller ? b.customerName : 'Service Provider'}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{new Date(b.bookingDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${b.status === 'confirmed' ? 'bg-brand-primary/20 text-brand-primary' : b.status === 'pending' ? 'bg-yellow-400/20 text-yellow-500' : 'bg-gray-400/20 text-gray-400'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           {isSeller && b.status === 'pending' && (
                             <button onClick={() => handleUpdateBooking(b.id, 'confirmed')} className="text-brand-primary hover:underline text-xs font-black uppercase">Accept</button>
                           )}
                           {!isSeller && b.status === 'confirmed' && (
                             <span className="text-brand-primary text-xs font-black">Booked!</span>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

           {isAdmin && activeTab === 'all-services' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">All Marketplace Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.allServices.map((s: any) => (
                  <div key={s.id} className="glass p-4 rounded-2xl flex items-center justify-between border-white/5">
                    <div>
                      <p className="font-black text-sm">{s.title}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">BY: {s.sellerName} | {s.city}</p>
                    </div>
                    <button onClick={() => handleDeleteService(s.id)} className="text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
