import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Send, CheckCircle2, ChevronLeft, Info, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function PostRequest() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Cleaning',
    city: 'Karachi',
    budget: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        }
      } else {
        navigate('/login?redirect=/post-request');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'requests'), {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : null,
        customerId: user.uid,
        customerName: profile.name,
        status: 'open',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Cleaning', 'Repair', 'Tutoring', 'Delivery', 'IT Support', 'Design', 'Other'];
  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Multan', 'Peshawar'];

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-xl border border-blue-50 flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Posted!</h2>
          <p className="text-gray-500 mb-8">Your request has been published. Providers will be able to see it and contact you soon.</p>
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="h-full bg-brand"
            />
          </div>
          <p className="text-xs text-brand font-bold uppercase mt-4 tracking-widest">Redirecting to Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-brand transition-colors mb-8 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold">Go Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Post a Request</h1>
            <p className="text-gray-500">Tell us what you need and we'll help you find the right expert.</p>
          </div>

          <form onSubmit={handleSubmit} className="card p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">What do you need help with?</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Need a math tutor for 10th grade"
                  className="input-field" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Detailed Description</label>
                <textarea 
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your requirements in detail. What's the specific task? Any special instructions?"
                  className="input-field resize-none" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input-field appearance-none cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Location (City)</label>
                  <select 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="input-field appearance-none cursor-pointer"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Budget (Rs. ) - Optional</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Rs.</span>
                    <input 
                      type="number" 
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      placeholder="5000"
                      className="input-field pl-12" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Deadline (Optional)</label>
                  <input 
                    type="date" 
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="input-field cursor-pointer" 
                  />
                </div>
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
            <div className="relative z-10">
              <Sparkles className="mb-4 text-blue-200" size={32} />
              <h3 className="text-xl font-bold mb-4">Why post a request?</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-1.5 shrink-0" />
                  <span>Get custom quotes from multiple verified providers.</span>
                </li>
                <li className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-1.5 shrink-0" />
                  <span>Save time by letting the experts reach out to you.</span>
                </li>
                <li className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-1.5 shrink-0" />
                  <span>Perfect for unique or complex tasks that need specialized help.</span>
                </li>
              </ul>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>

          <div className="bg-orange-50 border border-orange-100 p-8 rounded-[2rem]">
            <div className="flex items-center gap-3 text-orange-600 mb-4">
              <Info size={20} />
              <h4 className="font-bold">Good to know</h4>
            </div>
            <p className="text-sm text-orange-800 leading-relaxed">
              Be as specific as possible in your description. Mention clear goals and any constraints. This helps providers give you accurate estimates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
