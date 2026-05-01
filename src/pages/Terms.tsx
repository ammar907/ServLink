import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

export default function Terms() {
  const sections = [
    {
      title: 'Introduction',
      icon: <FileText className="text-blue-500" size={24} />,
      content: 'Welcome to ServLink Pakistan. By using our platform, you agree to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern ServLink\'s relationship with you.'
    },
    {
      title: 'Provider Terms',
      icon: <CheckCircle className="text-green-500" size={24} />,
      content: 'As a service provider, you are responsible for the accuracy of your listings, the quality of your work, and maintaining professional standards. Service providers must provide valid identification for verification if requested.'
    },
    {
      title: 'Customer Terms',
      icon: <CheckCircle className="text-orange-500" size={24} />,
      content: 'Customers agree to pay the agreed-upon price for services rendered. Any disputes should be reported to our support team within 48 hours of service completion.'
    },
    {
      title: 'Privacy & Data',
      icon: <Lock className="text-purple-500" size={24} />,
      content: 'We take your privacy seriously. Your data is encrypted and only shared with verified parties during active bookings. We do not sell your personal information to third parties.'
    },
    {
      title: 'Safety Guidelines',
      icon: <Shield className="text-red-500" size={24} />,
      content: 'Always communicate through the platform. For home services, verify the provider\'s identity before granting access. ServLink is a facilitator and is not liable for direct quality of service issues, though we mediate disputes.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-black text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium">Last updated: April 2026. Please read these terms carefully before using our platform.</p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-6"
            >
              <div className="shrink-0 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                {section.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 text-sm">
            Questions? Contact our legal team at <span className="text-brand font-bold">legal@servlink.pk</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
