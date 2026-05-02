import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'motion/react';
import { MapPin, Tag, Star, Clock, ShieldCheck, Mail, Phone, MessageSquare, ArrowRight, Info } from 'lucide-react';

export default function ServiceDetails() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const serviceSnap = await getDoc(doc(db, 'services', id!));
      if (serviceSnap.exists()) {
        const sData = serviceSnap.data();
        setService({ id: serviceSnap.id, ...sData });
        
        const sellerSnap = await getDoc(doc(db, 'users', sData.sellerId));
        if (sellerSnap.exists()) setSeller(sellerSnap.data());

        const reviewsQ = query(collection(db, 'reviews'), where('serviceId', '==', id));
        const reviewsSnap = await getDocs(reviewsQ);
        setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-primary">Loading Service Details...</div>;
  if (!service) return <div className="min-h-screen flex items-center justify-center text-white">Service not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Side: Service Details */}
        <div className="flex-1 space-y-12">
          <section className="space-y-6">
            <div className="flex gap-2">
              <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">{service.category}</span>
              <span className="bg-blue-400/10 text-blue-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1"><MapPin size={12} /> {service.city}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">{service.title}</h1>
            
            <div className="flex items-center gap-4 py-4 border-y border-white/5">
               <Link to={`/seller/${seller?.uid}`} className="flex items-center gap-3 hover:text-brand-primary transition-colors">
                 <div className="w-12 h-12 rounded-full glass overflow-hidden border border-white/10">
                   {seller?.avatarUrl ? <img src={seller.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-white/5 text-xl">{seller?.fullName?.[0]}</div>}
                 </div>
                 <div>
                   <p className="font-black">{seller?.fullName}</p>
                   <div className="flex items-center gap-1 text-xs text-brand-primary">
                     <Star size={12} fill="currentColor" />
                     <Star size={12} fill="currentColor" />
                     <Star size={12} fill="currentColor" />
                     <Star size={12} fill="currentColor" />
                     <Star size={12} fill="currentColor" />
                     <span className="text-gray-500 font-bold ml-1">(5.0)</span>
                   </div>
                 </div>
               </Link>
               <div className="h-10 w-px bg-white/10 hidden sm:block" />
               <div className="hidden sm:flex flex-col">
                 <span className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Member Since</span>
                 <span className="text-sm font-bold">{new Date(seller?.createdAt).getFullYear()}</span>
               </div>
            </div>

            <div className="aspect-video w-full rounded-3xl overflow-hidden glass border border-white/10">
              <img src={service.images?.[0] || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200'} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-black">About this service</h3>
              <p className="text-gray-400 leading-relaxed text-lg whitespace-pre-wrap">{service.description}</p>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="space-y-8 pt-12 border-t border-white/5">
             <h3 className="text-3xl font-black">Customer Reviews</h3>
             <div className="space-y-6">
                {reviews.length > 0 ? reviews.map(r => (
                  <div key={r.id} className="glass p-6 rounded-2xl border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-brand-primary">{r.customerName?.[0]}</div>
                        <span className="font-black">{r.customerName}</span>
                      </div>
                      <div className="flex text-brand-primary">
                        {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                      </div>
                    </div>
                    <p className="text-gray-400 font-medium italic">"{r.comment}"</p>
                  </div>
                )) : (
                  <div className="text-center py-10 glass rounded-3xl border-dashed border-2 border-white/10">
                    <p className="text-gray-500 font-bold uppercase tracking-widest italic">No reviews yet. Be the first to book!</p>
                  </div>
                )}
             </div>
          </section>
        </div>

        {/* Right Side: Booking Card */}
        <aside className="lg:w-96">
          <div className="glass p-8 rounded-[2.5rem] border-white/10 sticky top-24 shadow-2xl space-y-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[60px] -mr-16 -mt-16" />
            
            <div className="flex justify-between items-end relative z-10">
              <div>
                <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Standard Package</span>
                <h4 className="text-4xl font-black text-white">Rs. {service.price}</h4>
              </div>
              <div className="text-right">
                 <span className="text-[10px] text-brand-primary font-black uppercase bg-brand-primary/10 px-2 py-1 rounded">Best Price</span>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
               <div className="flex items-center gap-3 text-gray-300 font-bold text-sm">
                 <Clock size={18} className="text-brand-primary" /> 24-48 Hours Response
               </div>
               <div className="flex items-center gap-3 text-gray-300 font-bold text-sm">
                 <ShieldCheck size={18} className="text-brand-primary" /> Service Guarantee
               </div>
               <div className="flex items-center gap-3 text-gray-300 font-bold text-sm">
                  <CreditCardIcon size={18} className="text-brand-primary" /> Payment: {service.paymentMethod}
               </div>
            </div>

            <Link to={`/book/${service.id}`} className="btn-primary w-full h-16 text-lg uppercase tracking-widest relative z-10 shadow-xl shadow-brand-primary/20">
              Continue to Booking <ArrowRight size={20} />
            </Link>

            <div className="pt-4 text-center">
              <button disabled className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                <Info size={12} /> Satisfaction Guaranteed
              </button>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-4">
              <h5 className="font-black text-sm uppercase tracking-widest text-gray-500">Seller Highlights</h5>
              <div className="flex flex-col gap-3">
                 <div className="flex items-center gap-3 text-xs font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><MessageSquare size={16} /></div>
                   Fluent in Urdu & English
                 </div>
                 <div className="flex items-center gap-3 text-xs font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                   <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><ShieldCheck size={16} /></div>
                   Identity Verified
                 </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CreditCardIcon({ ...props }) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
