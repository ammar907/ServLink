import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  User, MapPin, Star, GraduationCap, 
  Mail, Phone, BookOpen, Clock, 
  ChevronLeft, ExternalLink, Calendar,
  ShieldCheck, Award, Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export default function PublicProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [gigs, setGigs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        const userSnap = await getDoc(doc(db, 'users', userId));
        if (userSnap.exists()) {
          setProfile(userSnap.data());
          
          // Fetch their services
          const q = query(
            collection(db, 'services'),
            where('providerId', '==', userId),
            orderBy('createdAt', 'desc')
          );
          const gigSnap = await getDocs(q);
          setGigs(gigSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          const serviceIds = gigSnap.docs.map(d => d.id);
          if (serviceIds.length > 0) {
            // We'll just fetch a few recent reviews for the profile
            const reviewQuery = query(
              collection(db, 'reviews'),
              where('serviceId', 'in', serviceIds.slice(0, 10)),
              orderBy('createdAt', 'desc'),
              limit(10)
            );
            const reviewSnap = await getDocs(reviewQuery);
            setReviews(reviewSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          }
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '4.9'; 

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
    </div>
  );

  if (!profile) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
      <Link to="/" className="text-brand font-bold mt-4 block underline">Go to Home</Link>
    </div>
  );

  return (
    <div className="pb-20">
      {/* Cover Backdrop */}
      <div className="h-64 bg-gradient-to-r from-brand to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Sparkles size={100} className="absolute -top-10 -right-10 text-white" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar: Profile Info */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200 border border-gray-50 p-8 text-center"
            >
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 bg-gray-100 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl mx-auto">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-brand">
                      <User size={64} />
                    </div>
                  )}
                </div>
              </div>

              <h1 className="text-2xl font-black text-gray-900 mb-1">{profile.name}</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{profile.role}</p>
              
              <div className="space-y-4 pt-6 border-t border-gray-50 text-left">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin size={18} className="text-gray-400" />
                  <span className="font-medium">{profile.city || 'Karachi'}, Pakistan</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock size={18} className="text-gray-400" />
                  <span className="font-medium">Joined {profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-4">
                 <div className="text-center">
                    <div className="text-xl font-black text-gray-900">{gigs.length}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Active Gigs</div>
                 </div>
                 <div className="text-center">
                    <div className="text-xl font-black text-gray-900">{avgRating}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Rating</div>
                 </div>
              </div>
            </motion.div>

            <div className="bg-white rounded-[2.5rem] border border-gray-50 p-8 shadow-xl shadow-gray-100">
               <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                 <Award size={20} className="text-brand" />
                 Specialties
               </h3>
               <div className="flex flex-wrap gap-2">
                 {Array.from(new Set(gigs.map(g => g.category))).map(cat => (
                   <span key={cat} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-[10px] font-black rounded-lg uppercase tracking-wider">{cat}</span>
                 ))}
               </div>
            </div>
          </div>

            {/* Main Content: Bio, Gigs & Reviews */}
          <div className="lg:col-span-2 space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-50"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-6">About {profile.name.split(' ')[0]}</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                {profile.bio || `${profile.name} is a dedicated service provider specializing in ${gigs[0]?.category || 'various services'}.`}
              </p>
            </motion.div>

            {/* Reviews list */}
            {reviews.length > 0 && (
              <div className="space-y-8">
                <h2 className="text-3xl font-black text-gray-900 px-4">Latest Feedback</h2>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-[2rem] p-6 border border-gray-50 shadow-lg shadow-gray-100/50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400">
                            {review.authorName?.[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{review.authorName}</h4>
                            <div className="flex text-orange-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={i < review.rating ? 0 : 2} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                          {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm font-medium italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div className="flex justify-between items-center px-4">
                <h2 className="text-3xl font-black text-gray-900">Active Gigs</h2>
                <div className="text-brand font-black text-sm uppercase tracking-widest">{gigs.length} Services</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {gigs.map((gig) => (
                  <motion.div
                    key={gig.id}
                    whileHover={{ y: -8 }}
                    onClick={() => navigate(`/service/${gig.id}`)}
                    className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-100 group cursor-pointer"
                  >
                    <div className="aspect-[16/10] relative overflow-hidden">
                      <img src={gig.images?.[0] || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400'} alt={gig.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl font-black text-brand text-xs">
                        Rs. {gig.price}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-black text-gray-900 text-lg mb-4 line-clamp-2 leading-tight group-hover:text-brand transition-colors">{gig.title}</h3>
                      <div className="flex justify-between items-center text-sm">
                         <div className="flex items-center gap-1 text-orange-400 font-black">
                           <Star size={14} fill="currentColor" />
                           4.8
                         </div>
                         <div className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                           {gig.category}
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
