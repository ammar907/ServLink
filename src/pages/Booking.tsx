import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Calendar, Clock, CreditCard, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function Booking() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      getDoc(doc(db, 'services', id)).then(snap => {
        if (snap.exists()) setService({ id: snap.id, ...snap.data() });
        setLoading(false);
      });
    }
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !service) return;

    setSubmitting(true);
    setError('');
    
    try {
      const voucherCode = service.paymentMethod === 'Voucher' 
        ? 'SL-' + Math.random().toString(36).substring(2, 8).toUpperCase()
        : '';

      await addDoc(collection(db, 'bookings'), {
        serviceId: service.id,
        serviceTitle: service.title,
        customerId: user.uid,
        customerName: profile?.fullName || 'User',
        sellerId: service.sellerId,
        sellerName: service.sellerName,
        bookingDate: bookingData.date,
        appointmentTime: bookingData.time,
        notes: bookingData.notes,
        status: 'pending',
        paymentMethod: service.paymentMethod,
        voucherCode,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to complete booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-primary">Preparing Booking...</div>;
  if (!service) return <div className="min-h-screen flex items-center justify-center text-white">Service not found</div>;

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass p-12 rounded-[3rem] text-center max-w-lg w-full border border-brand-primary/30"
        >
          <div className="w-20 h-20 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-brand-primary/50">
            <CheckCircle className="text-brand-primary" size={48} />
          </div>
          <h1 className="text-4xl font-black mb-4">Booking Successful!</h1>
          <p className="text-gray-400 font-medium mb-8">
            Your request has been sent to <span className="text-white font-bold">{service.sellerName}</span>. 
            Redirecting to your dashboard...
          </p>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: '100%' }} 
              transition={{ duration: 3 }}
              className="h-full bg-brand-primary shadow-[0_0_10px_#10b981]"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight">Confirm <span className="text-brand-primary">Booking</span></h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Almost there! Complete your details.</p>
          </div>

          <div className="glass p-6 rounded-2xl border-white/5 flex gap-4">
            <img src={service.images?.[0]} className="w-20 h-20 object-cover rounded-xl" alt="s" />
            <div>
              <h3 className="font-black line-clamp-1">{service.title}</h3>
              <p className="text-brand-primary font-bold">Rs. {service.price}</p>
              <div className="mt-2 text-[10px] text-gray-500 font-black uppercase tracking-widest">Provider: {service.sellerName}</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-black text-sm uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <CreditCard size={16} className="text-brand-primary" /> Payment Information
            </h4>
            <div className="glass p-6 rounded-2xl border-white/10 bg-brand-primary/5">
              <p className="font-black text-white text-lg mb-2">{service.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Voucher Payment'}</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                {service.paymentMethod === 'COD' 
                  ? 'You will pay the service provider in cash once the work is completed to your satisfaction.' 
                  : 'A secure voucher code will be generated for you. Share this code with the provider only after the service is done.'}
              </p>
            </div>
          </div>
        </div>

        <motion.form 
          onSubmit={handleBooking}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-8 rounded-[2.5rem] border-white/10 space-y-6"
        >
          {error && (
            <div className="mb-4 p-4 glass border-red-500/50 flex items-center gap-3 text-red-400 text-sm rounded-xl">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500">Pick a Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="date" 
                required 
                className="input-field pl-12 h-14 appearance-none text-white" 
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500">Pick a Time</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="time" 
                required 
                className="input-field pl-12 h-14 appearance-none" 
                value={bookingData.time}
                onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500">Additional Notes</label>
            <textarea 
              rows={3} 
              className="input-field py-4 min-h-[100px] resize-none" 
              placeholder="Any specific instructions? (e.g. Bring a ladder, call before coming)"
              value={bookingData.notes}
              onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center text-gray-400 font-bold">
              <span>Subtotal</span>
              <span>Rs. {service.price}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400 font-bold">
              <span>Service Fee</span>
              <span>Rs. 0</span>
            </div>
            <div className="flex justify-between items-center text-xl font-black text-white">
              <span>Total</span>
              <span className="text-brand-primary">Rs. {service.price}</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="btn-primary w-full h-16 text-lg uppercase tracking-widest disabled:opacity-50 mt-4 group"
          >
            {submitting ? 'Processing...' : (
              <span className="flex items-center gap-2">
                Confirm Booking <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
