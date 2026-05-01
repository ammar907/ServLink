import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { Upload, PlusCircle, CheckCircle2, ChevronLeft, Info, AlertCircle, GraduationCap, X } from 'lucide-react';
import { motion } from 'motion/react';

export default function AddService() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Cleaning',
    city: 'Karachi',
    serviceType: 'visiting',
    paymentMethod: 'COD'
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          const profileData = snap.data();
          if (profileData.role !== 'provider') {
            alert('Only service providers can list services. Please update your profile.');
            navigate('/dashboard');
          }
          setProfile(profileData);
        } else {
          console.error("Profile not found for provider in AddService fetch");
          setProfile({ role: 'provider', name: u.displayName || u.email?.split('@')[0] });
        }
        setFetchingProfile(false);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file as Blob));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (fetchingProfile) {
      alert('Loading your profile details... please wait a moment.');
      return;
    }

    if (!profile) {
      alert('We could not find your provider profile. Please ensure you have completed your profile setup.');
      navigate('/profile');
      return;
    }

    const price = Number(formData.price);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (formData.title.length < 5) {
        throw new Error('Title must be at least 5 characters long.');
      }
      if (formData.description.length < 20) {
        throw new Error('Description must be at least 20 characters long.');
      }

      // 1. Upload Images to Firebase Storage
      let imageUrls: string[] = [];
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const storageRef = ref(storage, `services/${user.uid}/${fileName}`);
          const snapshot = await uploadBytes(storageRef, file);
          return getDownloadURL(snapshot.ref);
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      // 2. Save to Firestore
      const path = 'services';
      const serviceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        city: formData.city,
        serviceType: formData.serviceType,
        paymentMethod: formData.paymentMethod,
        price: Number(formData.price),
        providerId: user.uid,
        providerName: profile.name || user.displayName || user.email?.split('@')[0] || 'Provider',
        createdAt: serverTimestamp(),
        images: imageUrls
      };

      const docRef = await addDoc(collection(db, path), serviceData);
      setSuccess(true);
      setTimeout(() => navigate(`/service/${docRef.id}`), 2000);
    } catch (err: any) {
      console.error("Service submission error:", err);
      let message = 'Error listing service. Please try again.';
      
      if (err.message && err.message.includes('{')) {
        try {
          const parsed = JSON.parse(err.message);
          message = parsed.error || message;
        } catch (pErr) {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      
      if (message.includes('insufficient permissions')) {
        message = 'You do not have permission to list services. Please ensure your profile is set to "Provider".';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Service Listed!</h2>
        <p className="text-gray-500">Your service is now live on our marketplace.</p>
        <p className="text-gray-400 text-sm mt-4">Redirecting to your service page...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-8 transition-colors text-sm font-bold uppercase tracking-wider"
      >
        <ChevronLeft size={18} />
        Back
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-brand p-8 md:p-12 text-white">
          <h1 className="text-3xl font-bold mb-2">List a New Service</h1>
          <p className="text-blue-100">Provide the details below to help customers find you.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex gap-3 items-center text-sm border border-red-100">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          {/* Basic Info */}
          <section className="space-y-6">
             <div className="flex items-center gap-2 text-brand mb-4">
               <Info size={20} />
               <h3 className="font-bold text-lg text-gray-900">Service Details</h3>
             </div>
             
             <div className="space-y-2">
               <label className="text-sm font-semibold text-gray-700">Service Title</label>
               <input 
                 type="text" 
                 required
                 value={formData.title}
                 onChange={(e) => setFormData({...formData, title: e.target.value})}
                 placeholder="e.g. Professional AC Repair & Gas Refill"
                 className="input-field" 
               />
               <p className="text-[10px] text-gray-400 uppercase tracking-wide">Write a catchy title that captures the core benefit</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Service Type</label>
                  <select 
                     value={formData.serviceType}
                     onChange={(e) => {
                       const val = e.target.value as 'visiting' | 'digital';
                       setFormData({
                         ...formData, 
                         serviceType: val,
                         paymentMethod: val === 'visiting' ? 'COD' : 'Voucher'
                       });
                     }}
                     className="input-field"
                  >
                    <option value="visiting">Visiting (Home Cleaning, Repair, etc.)</option>
                    <option value="digital">Digital (Files, Consultancy, etc.)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Payment Method</label>
                  <div className="input-field bg-gray-50 flex items-center gap-2 text-gray-500 cursor-not-allowed">
                    {formData.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Voucher Payment'}
                  </div>
                  <p className="text-[10px] text-gray-400">Payment method is fixed based on service type</p>
                </div>
              </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-sm font-semibold text-gray-700">Category</label>
                 <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input-field"
                 >
                   {['Cleaning', 'Repair', 'Tutoring', 'Delivery', 'IT Support', 'Design'].map(cat => (
                     <option key={cat} value={cat}>{cat}</option>
                   ))}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-semibold text-gray-700">Base Price (PKR)</label>
                <input 
                  type="number" 
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="1500"
                  className="input-field" 
                />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-sm font-semibold text-gray-700">Description</label>
               <textarea 
                 rows={6}
                 required
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
                 placeholder="Describe your service in detail..."
                 className="input-field resize-none" 
               />
             </div>
          </section>

          {/* Location & Options */}
          <section className="space-y-8 pt-10 border-t border-gray-100">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <label className="text-sm font-semibold text-gray-700">Service City</label>
                 <select 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="input-field"
                 >
                   {['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Multan', 'Peshawar'].map(city => (
                     <option key={city} value={city}>{city}</option>
                   ))}
                 </select>
               </div>
               
               <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700 block">Service Images</label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {previews.map((preview, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    
                    {previews.length < 8 && (
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-brand hover:bg-blue-50 transition-all cursor-pointer">
                        <Upload size={20} className="text-gray-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Add</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Upload images (up to 8).</p>
               </div>
             </div>
          </section>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-5 flex items-center justify-center gap-2 text-lg"
          >
            {loading ? 'Processing...' : 'Publish Service Listing'}
            <PlusCircle size={24} />
          </button>
        </form>
      </div>
    </div>
  );
}

