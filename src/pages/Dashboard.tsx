import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc, orderBy, limit, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  LayoutDashboard, ShoppingBag, PlusCircle, Settings, 
  ArrowRight, Calendar, User, Clock, CheckCircle2, ChevronRight,
  Sparkles, Ticket, DollarSign, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleUpdateStatus = async (bookingId: string, newStatus: string, additionalData = {}) => {
    setProcessingId(bookingId);
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...additionalData
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600';
      case 'pending': return 'bg-orange-100 text-orange-600';
      case 'pending_cod': return 'bg-yellow-100 text-yellow-700';
      case 'pending_voucher': return 'bg-brand/10 text-brand';
      case 'confirmed': return 'bg-blue-100 text-blue-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_cod': return 'Pending COD';
      case 'pending_voucher': return 'Pending Voucher';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  useEffect(() => {
    let unsubscribeBookingsC: () => void;
    let unsubscribeBookingsP: () => void;
    let unsubscribeServices: () => void;
    let unsubscribeCompleted: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          // Fetch profile with retry logic
          let profileFetched = false;
          let attempts = 0;
          let profileData = null;

          while (!profileFetched && attempts < 3) {
            const profileSnap = await getDoc(doc(db, 'users', u.uid));
            if (profileSnap.exists()) {
              profileData = profileSnap.data();
              setProfile(profileData);
              profileFetched = true;
            } else {
              attempts++;
              if (attempts < 3) await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          if (profileFetched && profileData) {
            // 1. Listen for Recent Bookings (Customer side)
            const cq = query(
              collection(db, 'bookings'),
              where('customerId', '==', u.uid),
              limit(50) // Fetch more then sort client-side
            );
            
            unsubscribeBookingsC = onSnapshot(cq, (snap) => {
              const customerList = snap.docs.map(d => ({ id: d.id, ...(d.data() as any), type: 'hired' }));
              setBookings(prev => {
                const others = prev.filter(b => b.type !== 'hired');
                return [...customerList, ...others].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 10);
              });
            }, (err) => handleFirestoreError(err, OperationType.GET, 'bookings (customer)'));

            // 2. Listen for Recent Bookings (Provider side)
            if (profileData.role === 'provider') {
              const pq = query(
                collection(db, 'bookings'),
                where('providerId', '==', u.uid),
                limit(50)
              );
              
              unsubscribeBookingsP = onSnapshot(pq, (snap) => {
                const providerList = snap.docs.map(d => ({ id: d.id, ...(d.data() as any), type: 'service' }));
                setBookings(prev => {
                  const others = prev.filter(b => b.type !== 'service');
                  return [...providerList, ...others].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 10);
                });
              }, (err) => handleFirestoreError(err, OperationType.GET, 'bookings (provider)'));

              // 3. Listen for My Services
              const sq = query(
                collection(db, 'services'),
                where('providerId', '==', u.uid)
              );
              unsubscribeServices = onSnapshot(sq, (snap) => {
                const sList = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
                sList.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setServices(sList);
              }, (err) => handleFirestoreError(err, OperationType.GET, 'services'));
            }

            // 4. Listen for Completed count
            const compQ = query(
              collection(db, 'bookings'),
              where(profileData.role === 'provider' ? 'providerId' : 'customerId', '==', u.uid),
              where('status', '==', 'completed')
            );
            unsubscribeCompleted = onSnapshot(compQ, (snap) => {
              setTotalCompleted(snap.size);
            }, (err) => handleFirestoreError(err, OperationType.GET, 'bookings (completed)'));

            setLoading(false);
          } else {
            console.warn("No profile found for user");
            setLoading(false);
          }
        } catch (err) {
          console.error("Dashboard primary fetch error:", err);
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeBookingsC) unsubscribeBookingsC();
      if (unsubscribeBookingsP) unsubscribeBookingsP();
      if (unsubscribeServices) unsubscribeServices();
      if (unsubscribeCompleted) unsubscribeCompleted();
    };
  }, [navigate]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bonjour, {profile?.name || 'User'}!</h1>
        <p className="text-gray-500 mt-2">Here's what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats & Spotlight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-brand mb-4">
                  <Calendar size={20} />
                </div>
                <div className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">Active Bookings</div>
              </div>
              <div className="text-4xl font-black text-gray-900">{bookings.length}</div>
            </div>

            {profile?.role === 'provider' ? (
              <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                    <ShoppingBag size={20} />
                  </div>
                  <div className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">Listed Services</div>
                </div>
                <div className="text-4xl font-black text-gray-900">{services.length}</div>
              </div>
            ) : (
              <div className="bg-brand p-8 rounded-[2rem] shadow-xl shadow-blue-200 text-white flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute -top-4 -right-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Sparkles size={100} />
                </div>
                <div className="text-blue-100 font-bold text-[10px] uppercase tracking-widest mb-1 relative z-10">Get Inspired</div>
                <div className="text-xl font-bold leading-tight relative z-10">Find Amazing Services</div>
                <Link to="/search" className="mt-4 flex items-center gap-1 text-xs font-black text-white hover:gap-2 transition-all relative z-10">
                  EXPLORE <ArrowRight size={14} />
                </Link>
              </div>
            )}

            <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4">
                  <CheckCircle2 size={20} />
                </div>
                <div className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">Completed</div>
              </div>
              <div className="text-4xl font-black text-gray-900">{totalCompleted}</div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Recent Appointments</h2>
              <Link to="/bookings" className="text-sm font-bold text-brand hover:underline">View All</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {bookings.length > 0 ? bookings.map((booking) => (
                <div key={booking.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-brand">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{booking.serviceTitle}</h4>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                          booking.type === 'service' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {booking.type === 'service' ? 'Providing' : 'Hiring'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{booking.date} at {booking.time}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                      <ChevronRight size={18} className="text-gray-300" />
                    </div>

                    {/* Action Buttons for Providers */}
                    {booking.type === 'service' && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <div className="flex gap-2">
                        {booking.paymentMethod === 'COD' && booking.status === 'pending_cod' && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.id, 'completed')}
                            disabled={processingId === booking.id}
                            className="text-[10px] font-black bg-brand text-white px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition-colors"
                          >
                            <DollarSign size={10} />
                            MARK PAID
                          </button>
                        )}
                        {booking.paymentMethod === 'Voucher' && booking.status === 'pending_voucher' && (
                          <button 
                            onClick={() => {
                              const code = prompt('Enter Customer Voucher Code:');
                              if (code === booking.voucherCode) {
                                handleUpdateStatus(booking.id, 'completed', { voucherVerified: true });
                                alert('Voucher Verified! Payment confirmed.');
                              } else if (code) {
                                alert('Invalid Voucher Code. Please try again.');
                              }
                            }}
                            disabled={processingId === booking.id}
                            className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-indigo-700 transition-colors"
                          >
                            <Ticket size={10} />
                            VERIFY VOUCHER
                          </button>
                        )}
                      </div>
                    )}

                    {/* Info for Customers */}
                    {booking.type === 'hired' && booking.paymentMethod === 'Voucher' && booking.status === 'pending_voucher' && (
                      <div className="flex flex-col items-end">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Your Voucher Code</div>
                        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-black border border-indigo-100 flex items-center gap-2">
                           <Ticket size={12} />
                           {booking.voucherCode}
                        </div>
                      </div>
                    )}
                    {booking.type === 'hired' && booking.paymentMethod === 'COD' && booking.status === 'pending_cod' && (
                      <div className="text-[9px] font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100 text-right">
                        PAY CASH ON VISIT
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-gray-400">
                  <Clock size={40} className="mx-auto mb-4 opacity-20" />
                  <p>You have no recent bookings.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {profile?.role === 'provider' && (
            <div className="bg-brand rounded-2xl p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Grow your business</h3>
                <p className="text-blue-100">Reach more customers by listing new services or updating existing ones.</p>
              </div>
              <Link to="/add-service" className="bg-white text-brand px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2 whitespace-nowrap">
                <PlusCircle size={20} />
                <span>List New Service</span>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl mx-auto mb-4 overflow-hidden">
               {profile?.avatar ? (
                 <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-300">
                   <User size={48} />
                 </div>
               )}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{profile?.name}</h3>
            <p className="text-gray-400 text-sm mb-4 capitalize">{profile?.role}</p>

            <Link to="/profile" className="block w-full py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors mb-2">
              Edit Profile
            </Link>
            <button 
              onClick={() => {
                const url = `${window.location.origin}/profile/${user.uid}`;
                navigator.clipboard.writeText(url);
                alert('Profile link copied to clipboard!');
              }}
              className="block w-full py-2 bg-gray-900 rounded-lg text-sm font-bold text-white hover:bg-gray-800 transition-colors"
            >
              Share Profile
            </button>
          </div>

          {/* My Services (Scrollable if provider) */}
          {profile?.role === 'provider' && (
             <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-50">
                 <h2 className="text-lg font-bold text-gray-900">My Listings</h2>
               </div>
               <div className="p-4 space-y-4">
                 {services.length > 0 ? services.map(service => (
                   <div key={service.id} className="flex gap-3 group">
                     <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                       <img src={service.images?.[0] || 'https://via.placeholder.com/150'} alt="Svc" className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-grow min-w-0">
                       <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-brand cursor-pointer">{service.title}</h4>
                       <p className="text-xs text-brand font-bold mt-1">Rs. {service.price}</p>
                     </div>
                   </div>
                 )) : (
                   <div className="py-8 text-center text-gray-400 text-sm">No services listed yet.</div>
                 )}
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
