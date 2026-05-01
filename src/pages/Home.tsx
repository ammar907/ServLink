import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, MapPin, Star, Shield, Zap, Heart, CheckCircle, ArrowRight } from 'lucide-react';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const categories = [
  { name: 'Cleaning', icon: '🧹', color: 'bg-blue-50 text-blue-600' },
  { name: 'Repair', icon: '🛠️', color: 'bg-orange-50 text-orange-600' },
  { name: 'Delivery', icon: '📦', color: 'bg-green-50 text-green-600' },
  { name: 'Tutoring', icon: '🎓', color: 'bg-purple-50 text-purple-600' },
  { name: 'IT Support', icon: '💻', color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Design', icon: '🎨', color: 'bg-pink-50 text-pink-600' },
];

const features = [
  { 
    title: 'Trusted Professionals', 
    desc: 'Every provider is verified for quality and reliability.',
    icon: Shield 
  },
  { 
    title: 'Fast & Reliable', 
    desc: 'Get your work done on time, every time.',
    icon: Zap 
  },
  { 
    title: 'Pure Local', 
    desc: 'Support small businesses and talent in your area.',
    icon: Heart 
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [trendingServices, setTrendingServices] = useState<any[]>([]);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const servicesRef = collection(db, 'services');
        
        // Fetch trending
        const trendingQuery = query(servicesRef, orderBy('createdAt', 'desc'), limit(2));
        const trendingSnap = await getDocs(trendingQuery);
        const trendingData = trendingSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch featured
        const featuredQuery = query(servicesRef, orderBy('createdAt', 'desc'), limit(3));
        const featuredSnap = await getDocs(featuredQuery);
        const featuredData = featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const staticServices = [
          {
            id: 'mock-1',
            title: 'Professional Home Cleaning & Sanitization',
            description: 'Deep cleaning services for apartments and houses. We use eco-friendly products and ensure 100% satisfaction.',
            price: 2500,
            category: 'Cleaning',
            city: 'Karachi',
            providerId: 'demo-pro-1',
            providerName: 'CleanHome Pro',
            images: ['https://images.unsplash.com/photo-1627905646269-7f03bd0c8c4a?w=800&auto=format&q=80'],
            createdAt: { toDate: () => new Date() }
          },
          {
            id: 'mock-2',
            title: 'Mathematics & Physics Advanced Tutoring',
            description: 'One-on-one sessions for O/A Levels and University entrance exams. Specialized in Calculus and Mechanics.',
            price: 1500,
            category: 'Tutoring',
            city: 'Lahore',
            providerId: 'demo-pro-2',
            providerName: 'Elite Academic',
            images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&q=80'],
            createdAt: { toDate: () => new Date() }
          }
        ];
        
        const mock3 = {
          id: 'mock-3',
          title: 'Deep Car Detailing & Interior Cleaning',
          description: 'Give your car a showroom shine with our professional detailing services. We use premium wax and interior cleaners.',
          price: 5000,
          category: 'Cleaning',
          city: 'Islamabad',
          providerId: 'demo-pro-3',
          providerName: 'AutoGlow',
          images: ['https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&q=80'],
          createdAt: { toDate: () => new Date() }
        };

        // Merge real data with mocks to ensure sections are always populated
        setTrendingServices([...trendingData, ...staticServices].slice(0, 4));
        setFeaturedServices([...featuredData, ...staticServices, mock3].slice(0, 6));
        
        setLoading(false);
      } catch (error) {
        console.error("Fetch services error:", error);
        // On error, still show mocks
        const staticDefaults = [
          {
            id: 'mock-1',
            title: 'Professional Home Cleaning & Sanitization',
            description: 'Deep cleaning services for apartments and houses.',
            price: 2500,
            category: 'Cleaning',
            city: 'Karachi',
            images: ['https://images.unsplash.com/photo-1627905646269-7f03bd0c8c4a?w=800&auto=format&q=80'],
            providerName: 'CleanHome Pro',
            createdAt: { toDate: () => new Date() }
          },
          {
            id: 'mock-2',
            title: 'Mathematics & Physics Advanced Tutoring',
            description: 'One-on-one sessions for O/A Levels.',
            price: 1500,
            category: 'Tutoring',
            city: 'Lahore',
            images: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&q=80'],
            providerName: 'Elite Academic',
            createdAt: { toDate: () => new Date() }
          }
        ];
        setTrendingServices(staticDefaults);
        setFeaturedServices([...staticDefaults, {
          id: 'mock-3',
          title: 'Deep Car Detailing',
          description: 'Premium wax and interior cleaners.',
          price: 5000,
          category: 'Cleaning',
          city: 'Islamabad',
          images: ['https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&q=80'],
          providerName: 'AutoGlow',
          createdAt: { toDate: () => new Date() }
        }]);
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6"
          >
            Find the best local services for <br/>
            <span className="text-brand">Your Daily Needs.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto"
          >
            Connecting Pakistani residents with trusted local service providers for everything from repairs to professional assistance.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="search-container max-w-2xl mx-auto mb-12 flex-col md:flex-row h-auto"
          >
            <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-gray-100 min-h-[60px]">
              <MapPin className="text-gray-400 mr-2" size={18} />
              <select 
                className="w-full py-3 bg-transparent outline-none text-sm text-slate-700 appearance-none"
                onChange={(e) => navigate(`/search?city=${e.target.value}`)}
              >
                <option value="">Select City</option>
                <option value="Karachi">Karachi</option>
                <option value="Lahore">Lahore</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Faisalabad">Faisalabad</option>
              </select>
            </div>
            <div className="flex-[1.5] flex items-center px-4 min-h-[60px]">
              <Search className="text-gray-400 mr-2" size={18} />
              <input 
                type="text" 
                placeholder="What service do you need today?" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/search?q=${(e.target as HTMLInputElement).value}`);
                  }
                }}
                className="w-full py-3 bg-transparent outline-none text-sm text-slate-700"
              />
            </div>
            <button 
              onClick={() => {
                const input = document.querySelector('input[placeholder="What service do you need today?"]') as HTMLInputElement;
                navigate(`/search?q=${input?.value || ''}`);
              }}
              className="btn-primary py-3.5 px-8 m-1 whitespace-nowrap text-sm"
            >
              Search Now
            </button>
          </motion.div>

          {/* Stats Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mb-8"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-800">15k+</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Verified Providers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-800">50+</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Service Categories</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-800">4.9/5</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Average Rating</span>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-orange-50/50 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-slate-800">Popular Categories</h2>
          <Link to="/search" className="text-brand text-xs font-bold uppercase tracking-wider hover:underline">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/search?category=${cat.name}`)}
              className={`p-6 rounded-3xl border border-opacity-20 flex flex-col items-center transition-all cursor-pointer ${cat.color.replace('text-', 'border-')}`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-xs font-bold uppercase tracking-wide">{cat.name}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works Alternative Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Featured Service Card (Place-holding typical UI pattern) */}
          <div className="card p-8 bg-white overflow-hidden">
            <h3 className="font-bold text-xl text-slate-800 mb-6">Trending Near You</h3>
            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-gray-100 rounded-2xl w-full"></div>
                  ))}
                </div>
              ) : trendingServices.length > 0 ? (
                trendingServices.map((service) => (
                  <button 
                    key={service.id} 
                    onClick={() => navigate(`/service/${service.id}`)}
                    className="w-full flex gap-4 items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer text-left"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                      <img 
                        src={service.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?w=200&auto=format'} 
                        alt={service.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-slate-900 line-clamp-1">{service.title}</h4>
                      <p className="text-xs text-slate-500">starting from Rs. {service.price}</p>
                    </div>
                    <div className="text-orange-400 font-bold text-sm whitespace-nowrap">★ 4.8</div>
                  </button>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No services found near you yet.
                </div>
              )}
            </div>
          </div>

          {/* How it Works Blue Block */}
          <div className="bg-brand p-10 rounded-[2.5rem] relative overflow-hidden shadow-xl shadow-blue-200">
            <div className="relative z-10">
              <h3 className="font-bold text-2xl text-white mb-8">How it Works</h3>
              <div className="space-y-8">
                {[
                  { step: '1', title: 'Find a Service', desc: 'Browse verified providers in your area.' },
                  { step: '2', title: 'Book instantly', desc: 'Schedule at your convenience with fixed pricing.' },
                  { step: '3', title: 'Get it done', desc: 'Pay securely after the work is completed.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-5">
                    <div className="w-9 h-9 rounded-full bg-blue-400/30 flex items-center justify-center text-white font-bold border border-white/20 shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-white font-bold text-base leading-none mb-1">{item.title}</p>
                      <p className="text-blue-100 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Services</h2>
            <p className="text-gray-500">Pick of the week from our best providers</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
             [1, 2, 3].map(i => (
              <div key={i} className="card h-[400px] animate-pulse bg-gray-50"></div>
             ))
          ) : featuredServices.length > 0 ? (
            featuredServices.map((service) => (
              <div 
                key={service.id} 
                className="card group cursor-pointer"
                onClick={() => navigate(`/service/${service.id}`)}
              >
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img 
                    src={service.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?w=500&auto=format'} 
                    alt={service.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand line-clamp-1 max-w-[120px]">
                      {service.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{service.title}</h3>
                    <div className="flex items-center text-orange-400 gap-1 text-sm font-bold">
                      <Star size={16} fill="currentColor" />
                      <span>4.9</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-4 gap-1">
                    <MapPin size={14} />
                    <span className="line-clamp-1">{service.city}, Pakistan</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-brand">
                        {service.providerName?.substring(0, 2).toUpperCase() || 'P'}
                      </div>
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">{service.providerName}</span>
                    </div>
                    <div className="text-brand font-bold text-sm">
                      Rs. {service.price}/hr
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-slate-400">
              No services found. <Link to="/add-service" className="text-brand font-bold">Be the first to add one!</Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand rounded-3xl p-12 text-white overflow-hidden relative shadow-xl shadow-blue-200">
          <div className="max-w-2xl relative z-10">
            <h2 className="text-4xl font-bold mb-6 italic tracking-tight">Built for the local community, by the local community.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {features.map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                    <f.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{f.title}</h4>
                    <p className="text-blue-100 text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/register" className="inline-block bg-white text-brand font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
              Become a Partner Today
            </Link>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
             <CheckCircle className="w-96 h-96" />
          </div>
        </div>
      </section>
    </div>
  );
}
