import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Phone, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { Upload, X } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer' as 'customer' | 'provider',
    city: 'Karachi'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Validation
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        city: formData.city,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Show success message briefly
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      let message = 'Registration failed. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please login instead.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak.';
      } else if (err.message && err.message.includes('{')) {
        try {
          const parsed = JSON.parse(err.message);
          message = parsed.error || message;
        } catch (pErr) {
          message = err.message;
        }
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-gray-50 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      >
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-xl">SL</div>
              <span className="text-2xl font-bold tracking-tight text-gray-900">ServLink</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-2">Join Pakistan's fastest growing service community</p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl flex gap-3 items-center text-sm font-bold border border-green-100">
              <CheckCircle size={18} />
              <span>Registration Successful! Redirecting to Dashboard...</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex gap-3 items-center text-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 font-semibold">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    id="regName"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ahmed Ali"
                    className="input-field pl-12" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Member</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="tel" 
                    id="regPhone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="0300 1234567"
                    className="input-field pl-12" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    id="regEmail"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@example.com"
                    className="input-field pl-12" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Your City</label>
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="password" 
                  id="regPassword"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="input-field pl-12" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700 block text-center">I want to join as a:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData({...formData, role: 'customer'})}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.role === 'customer' ? 'border-brand bg-blue-50 text-brand' : 'border-gray-100 hover:border-gray-200 text-gray-500'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.role === 'customer' ? 'bg-brand text-white' : 'bg-gray-100'}`}>
                    <CheckCircle size={16} />
                  </div>
                  <span className="font-bold">Customer</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">I only want to hire</span>
                </div>
                <div 
                  onClick={() => setFormData({...formData, role: 'provider'})}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.role === 'provider' ? 'border-brand bg-blue-50 text-brand' : 'border-gray-100 hover:border-gray-200 text-gray-500'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.role === 'provider' ? 'bg-brand text-white' : 'bg-gray-100'}`}>
                    <CheckCircle size={16} />
                  </div>
                  <span className="font-bold">Provider</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-60">I want to provide & hire</span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              id="submitBtn"
              disabled={loading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              <UserPlus size={18} />
            </button>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-gray-100 space-y-4">
            <p className="text-sm text-gray-500">
              Already have an account? <Link to="/login" className="text-brand font-bold">Log in</Link>
            </p>
            <p className="text-[10px] text-gray-400 max-w-xs mx-auto">
              By creating an account, you agree to our <Link to="/terms" className="text-brand hover:underline">Terms & Conditions</Link> and Privacy Policy.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
