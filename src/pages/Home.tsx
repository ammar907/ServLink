import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Zap, Star, Shield, Users, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getFeaturedServices } from '../lib/utils';

export default function Home() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getFeaturedServices().then(setFeatured);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    { name: 'Electrician', icon: <Zap size={24} />, count: '250+', color: 'text-yellow-400' },
    { name: 'Plumber', icon: <Shield size={24} />, count: '180+', color: 'text-blue-400' },
    { name: 'Tutor', icon: <Users size={24} />, count: '320+', color: 'text-emerald-400' },
    { name: 'Developer', icon: <Star size={24} />, count: '150+', color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
              Empowering <span className="text-brand-primary">Pakistan's</span> <br />
              Skilled Workforce
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Connecting professional electricians, plumbers, and talented university students with customers in your neighborhood.
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
              <input
                type="text"
                placeholder="What service are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 glass rounded-2xl px-8 pr-16 text-lg focus:ring-2 focus:ring-brand-primary outline-none transition-all shadow-2xl"
              />
              <button type="submit" className="absolute right-3 top-3 bottom-3 w-12 bg-brand-primary rounded-xl flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all">
                <Search size={22} />
              </button>
            </form>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500 font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                Real-time Bookings
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Verified Sellers
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                Secure Payments
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black tracking-tight">Popular <span className="text-brand-primary">Categories</span></h2>
          <Link to="/search" className="text-gray-400 hover:text-white flex items-center gap-2 group font-bold">
            View All <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-8 rounded-3xl group hover:border-brand-primary transition-all cursor-pointer text-center relative overflow-hidden"
              onClick={() => navigate(`/search?category=${cat.name}`)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`${cat.color} mb-4 flex justify-center group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <h3 className="text-xl font-black mb-1">{cat.name}</h3>
              <p className="text-gray-500 font-bold">{cat.count} listings</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="glass mx-4 sm:mx-8 md:mx-auto max-w-7xl rounded-3xl py-16 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] -mr-32 -mt-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative z-10">
          <div>
            <div className="text-5xl font-black text-brand-primary mb-2">10k+</div>
            <div className="text-gray-400 font-bold uppercase tracking-wider">Completed Jobs</div>
          </div>
          <div>
            <div className="text-5xl font-black text-brand-primary mb-2">4.9/5</div>
            <div className="text-gray-400 font-bold uppercase tracking-wider">User Satisfaction</div>
          </div>
          <div>
            <div className="text-5xl font-black text-brand-primary mb-2">500+</div>
            <div className="text-gray-400 font-bold uppercase tracking-wider">Verified Pros</div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black tracking-tight">Featured <span className="text-brand-primary">Services</span></h2>
          <Link to="/search" className="text-brand-primary hover:underline font-bold">Browse All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {featured.length > 0 ? (
            featured.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass rounded-2xl overflow-hidden group border border-white/5 hover:border-brand-primary/50 transition-all flex flex-col"
              >
                <Link to={`/service/${service.id}`} className="block relative aspect-video overflow-hidden">
                  <img
                    src={service.images?.[0] || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800'}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-brand-dark/80 backdrop-blur-md px-2 py-1 rounded text-xs font-black text-brand-primary uppercase">
                    {service.category}
                  </div>
                </Link>
                <div className="p-5 flex-grow flex flex-col">
                  <Link to={`/service/${service.id}`} className="text-lg font-black mb-2 hover:text-brand-primary transition-colors line-clamp-1">
                    {service.title}
                  </Link>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 uppercase font-bold block">Starting at</span>
                      <span className="text-brand-primary font-black text-xl">Rs. {service.price}</span>
                    </div>
                    <Link to={`/service/${service.id}`} className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-brand-primary hover:text-black transition-all">
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
             <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed border-2 border-white/10">
               <p className="text-gray-500 font-bold uppercase tracking-widest italic">No services listed yet. Be the first!</p>
             </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[40px] overflow-hidden">
          <div className="absolute inset-0 bg-brand-primary/10 backdrop-blur-3xl" />
          <div className="relative z-10 py-20 px-8 text-center flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to start earning?</h2>
            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto font-medium">
              Join thousands of skilled professionals and students who are building their micro-businesses on ServLink.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary py-4 px-10 text-lg">Become a Seller</Link>
              <Link to="/about" className="btn-secondary py-4 px-10 text-lg">Learn More</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
