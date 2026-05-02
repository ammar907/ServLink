import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { PlusCircle, Image as ImageIcon, MapPin, Tag, CreditCard, AlertCircle } from 'lucide-react';

export default function AddService() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    city: '',
    price: '',
    paymentMethod: 'COD',
    imageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      await addDoc(collection(db, 'services'), {
        ...formData,
        price: Number(formData.price),
        sellerId: user.uid,
        sellerName: profile?.fullName || 'Anonymous',
        images: formData.imageUrl ? [formData.imageUrl] : [],
        verified: true, // Auto-verify for demo purposes, usually needs admin review
        createdAt: new Date().toISOString()
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to list service');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Electrician', 'Plumber', 'Tutor', 'Developer', 'Designer', 'Writer', 'Home Repair', 'Academic', 'Creative', 'Technical'];
  const cities = ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Faisalabad', 'Peshawar', 'Multan'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 md:p-12 rounded-[2.5rem] border border-white/10"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary">
            <PlusCircle size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">List a Service</h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Reach thousands of customers</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 glass border-red-500/50 flex items-center gap-3 text-red-400 text-sm rounded-xl">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Service Title</label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Professional Home Electrician with 5 years experience"
              className="input-field h-14 text-lg"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Category</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <select
                  required
                  className="input-field pl-12 h-14 appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <select
                  required
                  className="input-field pl-12 h-14 appearance-none"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                >
                  <option value="">Select City</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Description</label>
            <textarea
              required
              rows={4}
              placeholder="Describe what you offer in detail..."
              className="input-field py-4 min-h-[120px] resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Pricing (Rs.)</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="number"
                  required
                  min="100"
                  placeholder="500"
                  className="input-field pl-12 h-14"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Payment Type</label>
              <div className="flex p-1 h-14 glass rounded-lg gap-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                  className={`flex-1 rounded-md text-sm font-black uppercase tracking-wider transition-all ${formData.paymentMethod === 'COD' ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  COD
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'Voucher' })}
                  className={`flex-1 rounded-md text-sm font-black uppercase tracking-wider transition-all ${formData.paymentMethod === 'Voucher' ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  Voucher
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">Service Image URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                className="input-field pl-12 h-14"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2">Tip: Use high quality images to attract more bookings.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-16 text-lg uppercase tracking-widest disabled:opacity-50 mt-4 shadow-xl"
          >
            {loading ? 'Publishing Service...' : 'List Service Now'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
