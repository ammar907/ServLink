import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Star, MapPin, Share2, Heart, ShieldCheck, 
  Clock, Calendar, User, MessageCircle, AlertCircle,
  CheckCircle2, ChevronLeft, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeImage, setActiveImage] = useState(0);

  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServiceAndReviews = async () => {
      try {
        if (!id) return;
        
        // Handle Mocks
        if (id.startsWith('mock-')) {
          const mocks: any = {
            'mock-1': {
              id: 'mock-1',
              title: 'Professional Home Cleaning & Sanitization',
              description: 'Deep cleaning services for apartments and houses. We use eco-friendly products and ensure 100% satisfaction. Our team is trained to handle delicate surfaces and high-touch areas with care. Includes kitchen, bathrooms, bedrooms, and living spaces.',
              price: 2500,
              category: 'Cleaning',
              city: 'Karachi',
              providerId: 'demo-pro-1',
              providerName: 'CleanHome Pro',
              images: [
                'https://images.unsplash.com/photo-1627905646269-7f03bd0c8c4a?w=800&auto=format&q=80',
                'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&q=80'
              ],
              serviceType: 'visiting',
              paymentMethod: 'COD',
              createdAt: { toDate: () => new Date() }
            },
            'mock-2': {
              id: 'mock-2',
              title: 'Mathematics & Physics Advanced Tutoring',
              description: 'One-on-one sessions for O/A Levels and University entrance exams. Specialized in Calculus, Mechanics, and Electromagnetism. With over 5 years of experience, we help students achieve A* results through tailored problem-solving techniques.',
              price: 1500,
              category: 'Tutoring',
              city: 'Lahore',
              providerId: 'demo-pro-2',
              providerName: 'Elite Academic',
              images: [
                'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&q=80',
                'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&q=80'
              ],
              serviceType: 'digital',
              paymentMethod: 'Voucher',
              createdAt: { toDate: () => new Date() }
            },
            'mock-3': {
              id: 'mock-3',
              title: 'Deep Car Detailing & Interior Cleaning',
              description: 'Give your car a showroom shine with our professional detailing services. We use premium wax and interior cleaners. Our process includes power washing, clay bar treatment, hand waxing, and deep interior vacuuming and shampooing. We pay attention to every corner to ensure your vehicle looks as good as new.',
              price: 5000,
              category: 'Cleaning',
              city: 'Islamabad',
              providerId: 'demo-pro-3',
              providerName: 'AutoGlow',
              images: [
                'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&q=80',
                'https://images.unsplash.com/photo-1601362840469-51e4d8d59085?w=800&auto=format&q=80'
              ],
              serviceType: 'visiting',
              paymentMethod: 'COD',
              createdAt: { toDate: () => new Date() }
            }
          };
          
          if (mocks[id]) {
            setService(mocks[id]);
            setLoading(false);
            return;
          }
        }

        const snap = await getDoc(doc(db, 'services', id));
        if (snap.exists()) {
          setService({ id: snap.id, ...snap.data() });
        }

        // Fetch reviews
        const q = query(collection(db, 'reviews'), where('serviceId', '==', id), orderBy('createdAt', 'desc'));
        const reviewSnap = await getDocs(q);
        setReviews(reviewSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (err) {
        // Only log, don't crash if reviews fail (might be missing index or empty)
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      if (u) {
        const pSnap = await getDoc(doc(db, 'users', u.uid));
        setUserProfile(pSnap.data());
      }
    });

    fetchServiceAndReviews();
    return () => unsubscribe();
  }, [id]);

  const handleBookNow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setBookingLoading(true);
    try {
      const customerName = userProfile?.name || 'Customer';
      
      // Determine initial status and generate voucher if needed
      let initialStatus = 'pending';
      let voucherData: any = {};
      
      if (service.paymentMethod === 'COD') {
        initialStatus = 'pending_cod';
      } else if (service.paymentMethod === 'Voucher') {
        initialStatus = 'pending_voucher';
        // Generate a 8-character unique alphanumeric voucher code
        const code = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        voucherData = {
          voucherCode: code,
          voucherVerified: false
        };
      }

      const path = 'bookings';
      try {
        await addDoc(collection(db, path), {
          serviceId: service.id,
          serviceTitle: service.title,
          customerId: currentUser.uid,
          customerName: customerName,
          providerId: service.providerId,
          status: initialStatus,
          paymentMethod: service.paymentMethod,
          date: bookingDate,
          time: bookingTime,
          ...voucherData,
          createdAt: serverTimestamp()
        });
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.CREATE, path);
      }
      
      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        navigate('/bookings');
      }, 2000);
    } catch (err) {
      console.error(err);
      if (!(err instanceof Error && err.message.includes('{'))) {
        alert('Failed to book. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !id) return;

    setSubmittingReview(true);
    try {
      const path = 'reviews';
      const reviewData = {
        serviceId: id,
        authorId: currentUser.uid,
        authorName: userProfile?.name || 'Anonymous',
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: serverTimestamp()
      };

      try {
        const docRef = await addDoc(collection(db, path), reviewData);
        setReviews([{ id: docRef.id, ...reviewData, createdAt: new Date() }, ...reviews]);
        setNewReview({ rating: 5, comment: '' });
        alert('Review posted successfully!');
      } catch (dbErr) {
        handleFirestoreError(dbErr, OperationType.CREATE, path);
      }
    } catch (err) {
      console.error(err);
      if (!(err instanceof Error && err.message.includes('{'))) {
        alert('Could not post review. Ensure you are not the provider.');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
    </div>
  );

  if (!service) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-900">Service not found</h2>
      <Link to="/search" className="text-brand font-bold mt-4 block">Back to Search</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-8 transition-colors text-sm font-bold uppercase tracking-wider"
      >
        <ChevronLeft size={18} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden shadow-sm relative group">
              <img 
                src={service.images?.[activeImage] || service.images?.[0] || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200'} 
                alt={service.title} 
                className="w-full h-full object-cover"
              />
              {service.studentOnly && (
                <div className="absolute top-6 left-6 bg-orange-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-xl uppercase tracking-widest flex items-center gap-2">
                  🎓 Student Provider
                </div>
              )}
            </div>
            
            {service.images && service.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {service.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-24 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === idx ? 'border-brand scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-50 text-brand text-xs font-bold rounded-full uppercase tracking-widest">{service.category}</span>
              <div className="flex items-center text-orange-400 gap-1 text-sm font-bold">
                <Star size={18} fill="currentColor" />
                <span>{avgRating} ({reviews.length} Reviews)</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{service.title}</h1>
            
            <div className="flex items-center gap-4 text-gray-500 mb-8">
              <div className="flex items-center gap-1">
                <MapPin size={18} />
                <span>{service.city}, Pakistan</span>
              </div>
              <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Clock size={18} />
                <span>Responds in 1h</span>
              </div>
            </div>

            <div className="prose prose-blue max-w-none">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Service Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>
            </div>

            <div className="mt-12 p-8 bg-gray-50 rounded-3xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Why book with this provider?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-500 shadow-sm"><ShieldCheck size={20}/></div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">Background Checked</h5>
                    <p className="text-gray-500 text-xs">Identity and documents verified.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm"><CheckCircle2 size={20}/></div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">Quality Guaranteed</h5>
                    <p className="text-gray-500 text-xs">Full refund if not satisfied.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-gray-900">Customer Reviews</h3>
                {currentUser && currentUser.uid !== service.providerId && (
                  <button 
                    onClick={() => {
                      const el = document.getElementById('review-form');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-brand font-bold text-sm hover:underline"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl p-10 text-center border-2 border-dashed border-gray-100">
                  <Star size={32} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-500 font-medium">No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <motion.div 
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand font-black">
                            {review.authorName?.[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{review.authorName}</h4>
                            <div className="flex text-orange-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-black text-gray-300">
                          {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Review Form */}
              {currentUser && currentUser.uid !== service.providerId && (
                <div id="review-form" className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100/50">
                  <h4 className="text-xl font-black text-gray-900 mb-2">Share your feedback</h4>
                  <p className="text-gray-500 text-sm mb-6">Tell others what you think about this service.</p>
                  
                  <form onSubmit={handleAddReview} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Your Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: num })}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                              newReview.rating >= num ? 'bg-orange-400 text-white' : 'bg-white text-gray-300'
                            }`}
                          >
                            <Star size={20} fill="currentColor" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Review Text</label>
                      <textarea
                        required
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="What was your experience like? Did the provider arrive on time? Was the quality good?"
                        className="input-field min-h-[120px] py-4"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={submittingReview}
                      className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                    >
                      {submittingReview ? 'Posting...' : (
                        <>
                          <Send size={18} />
                          Post Review
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl p-8">
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-black text-gray-900">Rs. {service.price.toLocaleString()}</span>
                <span className="text-gray-400 text-sm font-medium">/ service</span>
              </div>
              
              <div className="space-y-4 mb-8">
                 <button 
                  onClick={() => setShowBookingModal(true)}
                  className="btn-primary w-full py-4 text-center font-bold text-lg shadow-lg shadow-brand/20 active:scale-95 transition-transform"
                 >
                   Book Appointment
                 </button>
                 <button className="w-full py-4 border border-gray-200 rounded-xl font-bold text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                   <MessageCircle size={20} />
                   Contact Provider
                 </button>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50">
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Service Fee</span>
                   <span className="text-gray-900 font-medium">Rs. 50</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-500">Total Estimate</span>
                   <span className="text-gray-900 font-bold">Rs. {(service.price + 50).toLocaleString()}</span>
                 </div>
              </div>
            </div>

            {/* Provider Mini Card */}
            <Link to={`/profile/${service.providerId}`} className="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-4 hover:border-brand transition-all group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-brand text-2xl font-black group-hover:scale-110 transition-transform">
                {service.providerName?.[0]}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 group-hover:text-brand transition-colors">{service.providerName}</h4>
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 mt-1">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   <span>Verified Provider</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10"
            >
              {bookingSuccess ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Success!</h2>
                  <p className="text-gray-500">You've successfully booked this service. You can track it in your dashboard.</p>
                </div>
              ) : (
                <div className="p-8 md:p-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Schedule Service</h3>
                  <p className="text-gray-500 mb-8">When would you like {service.providerName} to come?</p>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Select Date</label>
                      <input 
                        type="date" 
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="input-field" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Preferred Time</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '8:00 PM'].map(time => (
                          <button
                            key={time}
                            onClick={() => setBookingTime(time)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                              bookingTime === time 
                                ? 'bg-brand border-brand text-white' 
                                : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100/50 space-y-3">
                      <div className="flex gap-3 text-sm text-brand font-bold uppercase tracking-wider">
                        <ShieldCheck size={18} />
                        Payment Instructions
                      </div>
                      {service.paymentMethod === 'COD' ? (
                        <p className="text-sm text-blue-800 leading-relaxed">
                          This is a <b>Visiting Service</b>. Please pay the provider in cash once the service is performed at your location.
                        </p>
                      ) : (
                        <p className="text-sm text-blue-800 leading-relaxed">
                          This is a <b>Digital Service</b>. After booking, a voucher will be generated. Pay via JazzCash/EasyPaisa to the provider to get your delivery.
                        </p>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setShowBookingModal(false)}
                        className="flex-grow py-4 border border-gray-200 rounded-xl font-bold text-gray-600"
                      >
                        Cancel
                      </button>
                      <button 
                        disabled={!bookingDate || !bookingTime || bookingLoading}
                        onClick={handleBookNow}
                        className="flex-[2] btn-primary py-4 disabled:opacity-50"
                      >
                        {bookingLoading ? 'Booking...' : `Confirm Booking`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
