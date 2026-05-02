import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { User, MapPin, Phone, Mail, FileText, Camera, CheckCircle, AlertCircle, Save } from 'lucide-react';

export default function Profile() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    address: profile?.address || '',
    bio: profile?.bio || '',
    avatarUrl: profile?.avatarUrl || ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[3rem] overflow-hidden border border-white/10"
      >
        <div className="h-48 bg-gradient-to-r from-brand-primary/20 via-brand-secondary/20 to-brand-primary/20 relative">
           <div className="absolute -bottom-16 left-12">
              <div className="w-32 h-32 rounded-[2rem] glass p-1 border-white/20">
                <div className="w-full h-full rounded-[1.8rem] bg-brand-surface overflow-hidden flex items-center justify-center border border-white/5 relative group cursor-pointer">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} className="w-full h-full object-cover" alt="p" />
                  ) : (
                    <User size={40} className="text-gray-600" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
              </div>
           </div>
        </div>

        <div className="pt-24 px-8 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <h1 className="text-3xl font-black tracking-tight">{profile?.fullName}</h1>
              <p className="text-brand-primary font-black uppercase tracking-[0.2em] text-[10px] bg-brand-primary/10 inline-block px-3 py-1 rounded-full mt-2">
                {profile?.role} Account
              </p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })} className="btn-secondary py-2 text-sm">Security Settings</button>
            </div>
          </div>

          {success && (
            <div className="mb-8 p-4 glass border-brand-primary/50 flex items-center gap-3 text-brand-primary text-sm rounded-xl">
              <CheckCircle size={18} /> Profile updated successfully!
            </div>
          )}
          {error && (
            <div className="mb-8 p-4 glass border-red-500/50 flex items-center gap-3 text-red-400 text-sm rounded-xl">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                required
                className="input-field h-14"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                <Phone size={14} /> Phone Number
              </label>
              <input
                type="tel"
                className="input-field h-14"
                placeholder="+92 3XX XXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                <Mail size={14} /> Email (Read Only)
              </label>
              <input
                type="email"
                disabled
                className="input-field h-14 opacity-50 cursor-not-allowed"
                value={profile?.email}
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                <MapPin size={14} /> City
              </label>
              <input
                type="text"
                className="input-field h-14"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                <Camera size={14} /> Avatar Image URL
              </label>
              <input
                type="url"
                className="input-field h-14"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                <FileText size={14} /> Professional Bio / About
              </label>
              <textarea
                rows={4}
                className="input-field py-4 min-h-[120px] resize-none"
                placeholder="Tell us about yourself and your skills..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-16 text-lg uppercase tracking-widest"
              >
                {loading ? 'Saving...' : (
                  <span className="flex items-center gap-2">
                    <Save size={20} /> Save Changes
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
