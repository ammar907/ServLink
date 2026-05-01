import React from 'react';
import { motion } from 'motion/react';
import { Target, Users, ShieldCheck, HeartPulse } from 'lucide-react';

export default function About() {
  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6"
          >
            Empowering Pakistan's Local Ecosystem
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            ServLink is more than just a marketplace. We are a community-driven platform connecting reliability with opportunity.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Founded in 2024, ServLink was born out of a simple observation: finding trusted help for local tasks in Pakistan was harder than it should be. 
              Whether it's a student looking for a side hustle or a homeowner needing a reliable plumber, the "trust gap" was real.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              We set out to build a platform that bridges this gap through transparency, verification, and a commitment to local talent.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-brand rounded-xl flex items-center justify-center mb-4"><Target size={24}/></div>
              <h4 className="font-bold text-gray-900 mb-1">Impact</h4>
              <p className="text-xs text-gray-500">Creating jobs for thousands across Pakistan.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4"><ShieldCheck size={24}/></div>
              <h4 className="font-bold text-gray-900 mb-1">Trust</h4>
              <p className="text-xs text-gray-500">Rigorous verification process for all providers.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4"><Users size={24}/></div>
              <h4 className="font-bold text-gray-900 mb-1">Community</h4>
              <p className="text-xs text-gray-500">Fostering a network of support.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-4"><HeartPulse size={24}/></div>
              <h4 className="font-bold text-gray-900 mb-1">Excellence</h4>
              <p className="text-xs text-gray-500">Commitment to the highest service standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Meet the Visionaries</h2>
          <p className="text-gray-500 font-medium mb-16 max-w-2xl mx-auto">The minds architecting the future of community services in Pakistan.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { name: 'Ammar Zia', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&q=80' },
              { name: 'Sadaqat Ali', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&q=80' },
              { name: 'Abdul Rehman Ali', role: 'Tech Lead', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&q=80' }
            ].map((member, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden mb-6 relative shadow-2xl shadow-gray-200 border-4 border-white">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8">
                    <div className="flex gap-4">
                       <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand cursor-pointer hover:bg-brand hover:text-white transition-colors">
                         <Target size={18} />
                       </div>
                    </div>
                  </div>
                </div>
                <h4 className="font-black text-2xl text-gray-900 mb-1">{member.name}</h4>
                <p className="text-brand font-bold text-sm uppercase tracking-widest">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
