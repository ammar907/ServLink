import { motion } from 'motion/react';
import { Target, Eye, Users, Award, ShieldCheck, Heart } from 'lucide-react';

export default function About() {
  const team = [
    { name: 'Ammar Zia', role: 'Chief Architect', bio: 'Visionary behind the ServLink infrastructure.' },
    { name: 'Sadaqat Ali', role: 'Security Head', bio: 'Expert in system integrity and user protection.' },
    { name: 'Abdul Rehman Ali', role: 'Product Lead', bio: 'Driving the user experience in the Pakistani market.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-32">
      {/* Vision Intro */}
      <section className="text-center space-y-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
            Empowering <span className="text-brand-primary">Local</span> Talent
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed font-medium">
            ServLink is not just a platform; it's a movement to digitize Pakistan's skilled labor market. We connect traditional masters of trade with the digital age.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="glass p-12 rounded-[3rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[80px] -mr-16 -mt-16 group-hover:bg-brand-primary/20 transition-all" />
          <Target className="text-brand-primary mb-8" size={64} />
          <h3 className="text-4xl font-black mb-6">Our Mission</h3>
          <p className="text-gray-400 text-lg leading-relaxed font-medium">
            To provide every skilled worker in Pakistan—from the electrician in Lahore to the student tutor in Islamabad—a professional digital presence and access to a massive customer base.
          </p>
        </div>
        <div className="glass p-12 rounded-[3rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 blur-[80px] -mr-16 -mt-16 group-hover:bg-blue-400/20 transition-all" />
          <Eye className="text-blue-400 mb-8" size={64} />
          <h3 className="text-4xl font-black mb-6">Our Vision</h3>
          <p className="text-gray-400 text-lg leading-relaxed font-medium">
            Becoming the standard for trust and quality in the Pakistani service marketplace, fostering economic Independence for the youth and skilled labor.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="space-y-16">
        <div className="text-center">
          <h2 className="text-4xl font-black mb-4">The <span className="text-brand-primary">Visionaries</span></h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest">Building the future of service commerce</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {team.map((member, idx) => (
             <motion.div 
               key={member.name}
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.1 }}
               className="glass p-8 rounded-[2.5rem] text-center hover:border-brand-primary transition-all"
             >
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-primary text-4xl font-black border border-white/5 shadow-xl shadow-brand-primary/5">
                  {member.name[0]}
                </div>
                <h4 className="text-2xl font-black mb-1">{member.name}</h4>
                <p className="text-brand-primary text-xs font-black uppercase tracking-widest mb-4">{member.role}</p>
                <p className="text-gray-400 text-sm font-medium">{member.bio}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Values */}
      <section className="glass rounded-[40px] p-12 md:p-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-primary/5 backdrop-blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
           <div className="space-y-4">
              <ShieldCheck className="text-brand-primary" size={32} />
              <h4 className="text-xl font-black uppercase">Trust First</h4>
              <p className="text-gray-400 text-sm font-medium">Rigorous verification for all sellers to ensure quality and safety for our users.</p>
           </div>
           <div className="space-y-4">
              <Award className="text-brand-primary" size={32} />
              <h4 className="text-xl font-black uppercase">Excellence</h4>
              <p className="text-gray-400 text-sm font-medium">We strive for pixel-perfection in our tech and service delivery across Pakistan.</p>
           </div>
           <div className="space-y-4">
              <Heart className="text-brand-primary" size={32} />
              <h4 className="text-xl font-black uppercase">Community</h4>
              <p className="text-gray-400 text-sm font-medium">A platform built by the community, for the community. We support local growth.</p>
           </div>
        </div>
      </section>
    </div>
  );
}
