import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search as SearchIcon, Filter, MapPin, Star, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || 'All',
    category: searchParams.get('category') || 'All',
    priceRange: 'All'
  });

  const [sortBy, setSortBy] = useState('Featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // Sync category and city filters if searchParams change
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const cityParam = searchParams.get('city');
    setFilters(prev => ({ 
      ...prev, 
      category: categoryParam || prev.category,
      city: cityParam || prev.city
    }));
    setSearchInput(searchParams.get('q') || '');
  }, [searchParams]);

  const cities = ['All', 'Karachi', 'Lahore', 'Islamabad', 'Faisalabad'];
  const categories = ['All', 'Cleaning', 'Repair', 'Tutoring', 'Delivery', 'IT Support', 'Design'];
  const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest'];

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'services'));
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
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
          },
          {
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
          }
        ];

        // Client-side filtering for simplicity in this demo
        let filtered = [...data, ...staticServices].filter((s: any) => {
          const matchCity = filters.city === 'All' || s.city === filters.city;
          const matchCat = filters.category === 'All' || s.category === filters.category;
          const matchSearch = !searchParams.get('q') || 
                            s.title.toLowerCase().includes(searchParams.get('q')!.toLowerCase());
          
          let matchPrice = true;
          if (filters.priceRange === 'Under Rs. 1000') matchPrice = s.price < 1000;
          else if (filters.priceRange === 'Rs. 1000 - 5000') matchPrice = s.price >= 1000 && s.price <= 5000;
          else if (filters.priceRange === 'Over Rs. 5000') matchPrice = s.price > 5000;

          return matchCity && matchCat && matchSearch && matchPrice;
        });

        // Apply Sorting
        if (sortBy === 'Price: Low to High') {
          filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'Price: High to Low') {
          filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === 'Newest') {
          filtered.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        }

        setServices(filtered);
      } catch (err) {
        console.error("Search error:", err);
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
        setServices(staticDefaults);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [searchParams, filters, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Filter size={20} className="text-brand" />
              <span>Filters</span>
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">City</label>
                <div className="flex flex-wrap gap-2">
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={() => setFilters({...filters, city})}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        filters.city === city 
                          ? 'bg-brand text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Category</label>
                <select 
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="text-sm font-semibold text-gray-700">Price Range</label>
                <div className="space-y-2">
                  {['All', 'Under Rs. 1000', 'Rs. 1000 - 5000', 'Over Rs. 5000'].map(range => (
                    <label key={range} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${filters.priceRange === range ? 'bg-brand border-brand' : 'border-gray-300'}`}>
                        {filters.priceRange === range && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <input 
                        type="radio" 
                        className="hidden" 
                        name="price" 
                        checked={filters.priceRange === range}
                        onChange={() => setFilters({...filters, priceRange: range})}
                      />
                      <span className="text-sm text-gray-500 group-hover:text-gray-900 transition-colors">{range}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <h4 className="font-bold text-gray-900 mb-2">Need Custom Help?</h4>
            <p className="text-sm text-gray-500 mb-4">Post a request and let providers find you.</p>
            <Link 
              to="/post-request" 
              className="w-full py-2.5 bg-white text-brand border border-brand/20 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center hover:bg-white/50 transition-colors"
            >
              Post a Request
            </Link>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-grow space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {loading ? 'Finding services...' : `${services.length} ${services.length === 1 ? 'service' : 'services'} available`}
            </h1>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('q', searchInput);
                      setSearchParams(newParams);
                    }
                  }}
                  placeholder="Search again..." 
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand w-full"
                />
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl"
                >
                  <span>Sort by: {sortBy}</span>
                  <ChevronDown size={16} />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 overflow-hidden">
                    {sortOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${sortBy === option ? 'text-brand font-bold' : 'text-gray-600'}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-gray-50 h-80 rounded-2xl"></div>
              ))
            ) : services.length > 0 ? (
              services.map((service) => (
                <motion.div
                  layout
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card h-full"
                >
                  <Link to={`/service/${service.id}`} className="block relative group">
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img 
                        src={service.images?.[0] || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500'} 
                        alt="Service" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{service.category}</span>
                      <div className="flex items-center text-orange-400 gap-1 text-xs font-bold">
                        <Star size={12} fill="currentColor" />
                        <span>4.8</span>
                      </div>
                    </div>
                    <Link to={`/service/${service.id}`} className="block">
                      <h3 className="font-bold text-gray-900 hover:text-brand transition-colors line-clamp-2 min-h-[3rem] text-lg leading-tight">
                        {service.title}
                      </h3>
                    </Link>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-brand font-black text-lg">
                        Rs. {service.price.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                        <MapPin size={12} />
                        <span>{service.city}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon size={40} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No services found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your filters or search keywords.</p>
                <button 
                  onClick={() => setFilters({ city: 'All', category: 'All', priceRange: 'All' })}
                  className="text-brand font-bold"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
