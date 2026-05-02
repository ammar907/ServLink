import { Phone, Mail, MapPin, CheckCircle, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Contact() {
  const handleWhatsApp = () => {
    window.open('https://wa.me/923145432328', '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-6xl font-black mb-6">Get in <span className="text-brand-primary">Touch</span></h1>
        <p className="text-gray-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed italic">
          We're here to help you build your digital micro-business or find the perfect service pro.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-10 rounded-[3rem] text-center space-y-6 group hover:scale-[1.02] transition-all"
        >
          <div className="w-20 h-20 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center mx-auto text-brand-primary group-hover:bg-brand-primary transition-all group-hover:text-black">
            <Phone size={32} />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight">Call Us</h3>
          <p className="text-gray-400 font-bold">+92 314 5432328</p>
          <p className="text-gray-500 text-sm uppercase font-black tracking-widest">Mon - Fri, 9am - 6pm</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-10 rounded-[3rem] text-center space-y-6 group hover:scale-[1.02] transition-all"
        >
          <div className="w-20 h-20 bg-blue-400/10 rounded-[2rem] flex items-center justify-center mx-auto text-blue-400 group-hover:bg-blue-400 transition-all group-hover:text-black">
            <Mail size={32} />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight">Email Us</h3>
          <p className="text-gray-400 font-bold text-lg">support@servlink.pk</p>
          <p className="text-gray-500 text-sm uppercase font-black tracking-widest">Response in 24 Hours</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-10 rounded-[3rem] text-center space-y-6 group hover:scale-[1.02] transition-all"
        >
          <div className="w-20 h-20 bg-emerald-400/10 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-400 group-hover:bg-emerald-400 transition-all group-hover:text-black">
            <MapPin size={32} />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight">Visit Us</h3>
          <p className="text-gray-400 font-bold">Islamabad, Pakistan</p>
          <p className="text-gray-500 text-sm uppercase font-black tracking-widest">DHA Phase 2</p>
        </motion.div>
      </div>

      <div className="mt-24 glass rounded-[4rem] p-12 md:p-20 overflow-hidden relative border-dashed border-2 border-brand-primary/20">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[100px] -mr-32 -mt-32" />
         <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div className="max-w-xl text-center md:text-left">
               <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter">Need Immediate Support?</h2>
               <p className="text-xl text-gray-400 font-medium leading-relaxed">
                  Our live chat team is ready to assist you on WhatsApp. Whether you're stuck on a booking or need seller help, we've got you.
               </p>
            </div>
            <button 
              onClick={handleWhatsApp}
              className="btn-primary py-5 px-12 text-xl shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:shadow-brand-primary/30"
            >
              <MessageCircle size={24} /> Chat on WhatsApp
            </button>
         </div>
      </div>
    </div>
  );
}
