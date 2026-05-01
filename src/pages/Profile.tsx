import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, Phone, Mail, MapPin, Camera, Save, ChevronLeft, UserCircle2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    avatar: '',
    city: 'Karachi'
  });
  
  const [role, setRole] = useState('customer');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) {
            const data = snap.data();
            setRole(data.role || 'customer');
            setFormData({
              name: data.name || '',
              phone: data.phone || '',
              bio: data.bio || '',
              avatar: data.avatar || '',
              city: data.city || 'Karachi'
            });
          }
        } catch (err) {
          console.error("Profile fetch error:", err);
        }
        setLoading(false);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updateData: any = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar.trim(),
        city: formData.city,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'users', user.uid), updateData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Profile update error:", err);
      let message = "Failed to update profile.";
      if (err.message && err.message.includes('{')) {
        try {
          const parsed = JSON.parse(err.message);
          message = parsed.error || message;
        } catch (pErr) {
          message = err.message;
        }
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-8 transition-colors text-sm font-bold uppercase tracking-wider"
      >
        <ChevronLeft size={18} />
        Dashboard
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="relative h-48 bg-brand overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <div className="w-32 h-32 bg-white rounded-3xl p-1 shadow-2xl relative group">
              <div className="w-full h-full bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center text-gray-300">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle2 size={64} />
                )}
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-brand text-white rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Camera size={16} />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="pt-24 pb-12 px-8 md:px-12 space-y-10">
          <div className="text-center mb-10">
             <h1 className="text-3xl font-extrabold text-gray-900">Your Profile</h1>
             <p className="text-gray-500 mt-2">Manage your public information and settings.</p>
          </div>

          {success && (
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl flex gap-3 items-center text-sm font-bold border border-green-100">
              <CheckCircle2 size={18} />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex gap-3 items-center text-sm border border-red-100">
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-gray-900">Current Account Type: <span className="text-brand uppercase">{role}</span></h4>
              <p className="text-xs text-blue-600 font-medium">
                {role === 'customer' 
                  ? 'As a customer, you can only hire services. Upgrade to work/provide services too.'
                  : 'As a provider, you can both hire services and offer your own expertise.'}
              </p>
            </div>
            {role === 'customer' && (
              <button 
                type="button"
                onClick={() => setRole('provider')}
                className="bg-brand text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand/20 whitespace-nowrap"
              >
                Upgrade to Provider
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field pl-12" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input-field pl-12" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  disabled
                  value={user?.email || ''}
                  className="input-field pl-12 bg-gray-50 text-gray-400 cursor-not-allowed" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Your City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                   value={formData.city}
                   onChange={(e) => setFormData({...formData, city: e.target.value})}
                   className="input-field pl-12"
                >
                   {['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Peshawar'].map(city => (
                     <option key={city} value={city}>{city}</option>
                   ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">About Me / Bio</label>
            <textarea 
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Tell others about yourself..."
              className="input-field resize-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Avatar Image URL</label>
            <input 
              type="url" 
              value={formData.avatar}
              onChange={(e) => setFormData({...formData, avatar: e.target.value})}
              placeholder="https://..."
              className="input-field" 
            />
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-10 py-4 shadow-lg shadow-brand/20 active:scale-95 transition-all"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
