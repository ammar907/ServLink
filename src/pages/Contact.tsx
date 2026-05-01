import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleStartChat = () => {
    // Standard Pakistan phone format for WhatsApp
    const phone = '923145432328';
    const text = encodeURIComponent('Hi Student Hub team, I need help with...');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        createdAt: serverTimestamp()
      });

      setSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      console.error("Contact form error:", err);
      let message = "Failed to send message. Please try again.";
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
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <section className="bg-brand py-20 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            How can we help?
          </motion.h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Our team is here to support students and providers alike. Drop us a line anytime.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-8">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-brand rounded-lg flex items-center justify-center shrink-0"><Phone size={20}/></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Call Us</h4>
                    <p className="text-gray-500 text-sm">+92 314 5432328</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-brand rounded-lg flex items-center justify-center shrink-0"><Mail size={20}/></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Us</h4>
                    <p className="text-gray-500 text-sm">support@servlink.pk</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-brand rounded-lg flex items-center justify-center shrink-0"><MapPin size={20}/></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Visit Us</h4>
                    <p className="text-gray-500 text-sm">H-8, Islamabad, Pakistan</p>
                  </div>
                </div>
              </div>
              <div className="mt-12 p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-brand font-bold mb-2">
                  <MessageCircle size={18} />
                  <span>Live Chat</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Chat with our agents instantly between 9AM - 9PM.</p>
                <button 
                  onClick={handleStartChat}
                  className="w-full bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} className="text-brand" />
                  Start Chat
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100 h-full">
              {sent ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                    <Send size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Message Sent!</h2>
                  <p className="text-gray-500 max-w-sm">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setSent(false)}
                    className="btn-primary"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Send us a message</h3>
                  <p className="text-gray-500 mb-10">We'd love to hear from you. Please fill out the form below.</p>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex gap-3 items-center text-sm border border-red-100">
                      <Send size={18} className="rotate-45" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Your Name</label>
                        <input 
                          type="text" 
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Juan Dela Cruz"
                          className="input-field" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                          type="email" 
                          id="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="juan@example.com"
                          className="input-field" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Subject</label>
                      <input 
                        type="text" 
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        placeholder="How can we help?"
                        className="input-field" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Message</label>
                      <textarea 
                        rows={6}
                        id="message"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Tell us more about your inquiry..."
                        className="input-field resize-none" 
                      />
                    </div>
                    <button 
                      type="submit" 
                      id="submitBtn"
                      disabled={loading}
                      className="btn-primary w-full md:w-auto px-10 py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                      <Send size={18} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
