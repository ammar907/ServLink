import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { User, MapPin, Star, ShieldCheck, Mail, Calendar, ArrowRight } from 'lucide-react';

export default function PublicProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const sellerSnap = await getDoc(doc(db, 'users', id!));
      if (sellerSnap.exists()) {
        setSeller(sellerSnap.data());
        
        const servicesQ = query(collection(db, 'services'), where('sellerId', '==', id));
        const servicesSnap = await getDocs(servicesQ);
        setServices(servicesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-primary text-xl font-black">Loading Portfolio...</div>;
  if (!seller) return <div className="min-h-screen flex items-center justify-center text-white">Seller not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Profile Sidebar */}
        <aside className="lg:w-80 h-fit glass p-8 rounded-[2.5rem] border-white/10 sticky top-24">
          <div className="text-center mb-8">
            <div className="w-32 h-32 rounded-[2rem] glass p-1 mx-auto mb-6 border-white/20 overflow-hidden">
               {seller.avatarUrl ? (
                 <img src={seller.avatarUrl} className="w-full h-full object-cover rounded-[1.8rem]" alt="p" />
               ) : (
                 <div className="w-full h-full rounded-[1.8rem] bg-white/5 flex items-center justify-center text-gray-500 font-black text-4xl">
                   {seller.fullName?.[0]}
                 </div>
               )}
            </div>
            <h1 className="text-2xl font-black">{seller.fullName}</h1>
            <p className="text-brand-primary text-xs font-black uppercase tracking-widest mt-1">Professional Seller</p>
          </div>

          <div className="space-y-6 pt-6 border-t border-white/5">
             <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
                <MapPin size={18} className="text-brand-primary" /> {seller.city}
             </div>
             <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
                <Calendar size={18} className="text-brand-primary" /> Joined {new Date(seller.createdAt).toLocaleDateString()}
             </div>
             <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
                <ShieldCheck size={18} className="text-emerald-500" /> Identity Verified
             </div>
             <div className="flex items-center gap-2">
                <div className="flex text-brand-primary">
                   {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span className="text-xs font-black text-gray-500">(24 Reviews)</span>
             </div>
          </div>

          <div className="mt-8 space-y-4">
             <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">About</h3>
             <p className="text-sm text-gray-400 leading-relaxed italic line-clamp-6">
                {seller.bio || "No professional bio provided yet."}
             </p>
          </div>

          <button className="btn-secondary w-full mt-10 py-3 text-xs uppercase tracking-widest">Contact Seller</button>
        </aside>

        {/* Portfolio Content */}
        <div className="flex-1 space-y-12">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-2">Service <span className="text-brand-primary">Portfolio</span></h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs italic">A showcase of skills and expertise</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass rounded-3xl overflow-hidden group border border-white/5 hover:border-brand-primary/50 transition-all flex flex-col"
              >
                <Link to={`/service/${service.id}`} className="block relative aspect-video overflow-hidden">
                  <img
                    src={service.images?.[0] || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600'}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-brand-dark/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-brand-primary uppercase">
                    {service.category}
                  </div>
                </Link>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-black mb-2 group-hover:text-brand-primary transition-colors">{service.title}</h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-2">{service.description}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-2xl font-black text-white">Rs. {service.price}</span>
                    <Link to={`/service/${service.id}`} className="w-10 h-10 glass border border-white/10 rounded-xl flex items-center justify-center hover:bg-brand-primary hover:text-black transition-all">
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {services.length === 0 && (
            <div className="py-20 text-center glass rounded-[3rem] border-dashed border-2 border-white/10">
              <p className="text-gray-500 font-black uppercase tracking-widest italic">No services listed yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
