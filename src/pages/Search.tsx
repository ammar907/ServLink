import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search as SearchIcon, MapPin, Filter, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const cityParam = searchParams.get('city') || '';

  useEffect(() => {
    fetchServices();
  }, [searchParams]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const servicesRef = collection(db, 'services');
      let q = query(servicesRef, orderBy('createdAt', 'desc'));

      if (categoryParam) {
        q = query(servicesRef, where('category', '==', categoryParam), orderBy('createdAt', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      let results: any[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter by query and city in-memory if needed (Firestore limited on multiple filters without indexes)
      if (queryParam) {
        results = results.filter(s => 
          s.title?.toLowerCase().includes(queryParam.toLowerCase()) || 
          s.description?.toLowerCase().includes(queryParam.toLowerCase())
        );
      }
      if (cityParam) {
        results = results.filter(s => s.city?.toLowerCase() === cityParam.toLowerCase());
      }

      setServices(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Electrician', 'Plumber', 'Tutor', 'Developer', 'Designer', 'Writer', 'Home Repair', 'Academic', 'Creative', 'Technical'];
  const cities = ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Faisalabad', 'Peshawar', 'Multan'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`md:w-64 space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">Categories</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSearchParams({ q: queryParam, city: cityParam })}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-all ${!categoryParam ? 'bg-brand-primary text-black' : 'hover:bg-white/5 text-gray-400'}`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSearchParams({ q: queryParam, category: cat, city: cityParam })}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-all ${categoryParam === cat ? 'bg-brand-primary text-black' : 'hover:bg-white/5 text-gray-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">Locations</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSearchParams({ q: queryParam, category: categoryParam })}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-all ${!cityParam ? 'bg-brand-primary text-black' : 'hover:bg-white/5 text-gray-400'}`}
              >
                All Pakistan
              </button>
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => setSearchParams({ q: queryParam, category: categoryParam, city: city })}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-all ${cityParam === city ? 'bg-brand-primary text-black' : 'hover:bg-white/5 text-gray-400'}`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search for services..."
                className="input-field pl-12 h-14"
                value={queryParam}
                onChange={(e) => setSearchParams({ q: e.target.value, category: categoryParam, city: cityParam })}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden btn-secondary h-14 w-full flex items-center justify-center gap-2"
            >
              <Filter size={18} /> Filters
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass h-[400px] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                  Showing {services.length} results
                </p>
                <div className="flex items-center gap-2 text-xs font-black text-gray-500">
                  <SlidersHorizontal size={14} /> SORT BY: LATEST
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {services.map((service) => (
                    <motion.div
                      key={service.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="glass rounded-2xl overflow-hidden group border border-white/5 hover:border-brand-primary/50 transition-all flex flex-col"
                    >
                      <Link to={`/service/${service.id}`} className="block relative aspect-video overflow-hidden">
                        <img
                          src={service.images?.[0] || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800'}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-2 left-2 flex gap-1">
                           <div className="bg-brand-dark/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-brand-primary uppercase">
                            {service.category}
                          </div>
                          <div className="bg-brand-dark/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-blue-400 uppercase flex items-center gap-1">
                            <MapPin size={10} /> {service.city}
                          </div>
                        </div>
                      </Link>
                      <div className="p-5 flex-grow flex flex-col">
                        <Link to={`/service/${service.id}`} className="text-lg font-black mb-1 hover:text-brand-primary transition-colors line-clamp-1">
                          {service.title}
                        </Link>
                        <p className="text-gray-500 text-xs font-bold mb-3">By {service.sellerName}</p>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-brand-primary font-black text-xl">Rs. {service.price}</span>
                          <Link to={`/service/${service.id}`} className="btn-primary py-2 px-4 text-xs font-black uppercase tracking-widest">
                            Book Now
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {services.length === 0 && (
                <div className="py-20 text-center glass rounded-3xl border-dashed border-2 border-white/10">
                  <p className="text-gray-500 font-bold uppercase tracking-widest mb-4">No services found matching your criteria.</p>
                  <button onClick={() => setSearchParams({})} className="text-brand-primary hover:underline font-bold">Clear all filters</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
