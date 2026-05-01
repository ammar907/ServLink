import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  Calendar, Clock, CheckCircle2, XCircle, 
  ChevronRight, AlertCircle, ShoppingBag, 
  MessageSquare, User, Ticket, DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Bookings() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const navigate = useNavigate();

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
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        // Determine role to fetch correct bookings
        const profileSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', u.uid)));
        if (!profileSnap.empty) {
          setRole(profileSnap.docs[0].data().role);
        }
        fetchBookings(u.uid, profileSnap.docs[0].exists() ? profileSnap.docs[0].data().role : 'customer');
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchBookings = async (uid: string, currentRole: string) => {
    setLoading(true);
    try {
      const field = currentRole === 'customer' ? 'customerId' : 'providerId';
      const q = query(
        collection(db, 'bookings'),
        where(field, '==', uid)
        // orderBy removed to avoid index requirements
      );
      const snap = await getDocs(q);
      const bList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      bList.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setBookings(bList);
    } catch (err) {
      console.error("Fetch bookings error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, status: string, additionalData = {}) => {
    setProcessingId(bookingId);
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { 
        status,
        ...additionalData
      });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status, ...additionalData } : b));
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-gray-500 mt-2">Manage your {role === 'customer' ? 'requests' : 'tasks'} and schedules.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
           <button 
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${role === 'customer' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setRole('customer'); fetchBookings(user.uid, 'customer'); }}
           >
             As Customer
           </button>
           <button 
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${role === 'provider' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setRole('provider'); fetchBookings(user.uid, 'provider'); }}
           >
             As Provider
           </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-gray-100 h-32 rounded-2xl"></div>)}
        </div>
      ) : bookings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <motion.div
              layout
              key={booking.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-6"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-brand shrink-0">
                <ShoppingBag size={28} />
              </div>

              <div className="flex-grow space-y-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${getStatusStyle(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                  <span className="text-gray-200">•</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">ID: {booking.id.slice(-6)}</span>
                  {booking.paymentMethod && (
                    <>
                      <span className="text-gray-200">•</span>
                      <span className="text-[10px] text-brand font-black uppercase tracking-tight">{booking.paymentMethod}</span>
                    </>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{booking.serviceTitle}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{booking.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{role === 'customer' ? 'Provider' : 'Customer'}: {role === 'customer' ? booking.providerId.slice(0, 5) + '...' : booking.customerName}</span>
                  </div>
                  
                  {booking.paymentMethod === 'Voucher' && booking.voucherCode && (
                    <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-black">
                      <Ticket size={12} />
                      VOUCHER: {booking.voucherCode}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-3 pt-6 md:pt-0 border-t md:border-t-0 border-gray-50">
                {role === 'provider' && (booking.status === 'pending' || booking.status === 'pending_cod' || booking.status === 'pending_voucher') && (
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <button 
                        onClick={() => updateStatus(booking.id, 'confirmed')}
                        disabled={processingId === booking.id}
                        className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle2 size={16} />
                        Confirm
                      </button>
                    )}
                    {booking.paymentMethod === 'COD' && booking.status === 'pending_cod' && (
                      <button 
                        onClick={() => updateStatus(booking.id, 'completed')}
                        disabled={processingId === booking.id}
                        className="px-4 py-2 bg-brand text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <DollarSign size={16} />
                        Mark Completed (Cash Collected)
                      </button>
                    )}
                    {booking.paymentMethod === 'Voucher' && booking.status === 'pending_voucher' && (
                      <button 
                        onClick={() => {
                          const code = prompt('Enter Customer Voucher Code:');
                          if (code === booking.voucherCode) {
                            updateStatus(booking.id, 'completed', { voucherVerified: true });
                            alert('Voucher Verified! Payment confirmed.');
                          } else if (code) {
                            alert('Invalid Voucher Code.');
                          }
                        }}
                        disabled={processingId === booking.id}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        <Ticket size={16} />
                        Verify Voucher & Complete
                      </button>
                    )}
                    <button 
                      onClick={() => updateStatus(booking.id, 'cancelled')}
                      disabled={processingId === booking.id}
                      className="px-4 py-2 bg-red-50 text-red-500 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                      <XCircle size={16} />
                      Decline
                    </button>
                  </div>
                )}
                {role === 'customer' && (booking.status === 'pending' || booking.status.startsWith('pending_')) && (
                  <button 
                    onClick={() => updateStatus(booking.id, 'cancelled')}
                    disabled={processingId === booking.id}
                    className="px-4 py-2 bg-gray-50 text-gray-500 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel Request
                  </button>
                )}
                {booking.status === 'confirmed' && (
                  <button 
                    onClick={() => updateStatus(booking.id, 'completed')}
                    disabled={processingId === booking.id}
                    className="px-4 py-2 bg-brand text-white text-sm font-bold rounded-lg hover:bg-brand/90 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
                <button className="p-2 text-gray-400 hover:text-brand transition-colors">
                  <MessageSquare size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center space-y-6 bg-white border border-dashed border-gray-200 rounded-3xl">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar size={40} className="text-gray-200" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">No appointments found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">When you book a service or receive a request, they will appear here.</p>
          </div>
          <Link to="/search" className="btn-primary inline-block">Explore Services</Link>
        </div>
      )}
    </div>
  );
}
