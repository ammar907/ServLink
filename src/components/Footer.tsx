import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <span className="text-black font-black text-xl">S</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">SERV<span className="text-brand-primary">LINK</span></span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Empowering Pakistan's workforce by connecting skilled professionals and students with local opportunities.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-brand-primary transition-all">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-brand-primary transition-all">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-brand-primary transition-all">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/search" className="hover:text-brand-primary transition-all">Browse Services</Link></li>
              <li><Link to="/about" className="hover:text-brand-primary transition-all">Our Story</Link></li>
              <li><Link to="/register" className="hover:text-brand-primary transition-all">Join as a Seller</Link></li>
              <li><Link to="/terms" className="hover:text-brand-primary transition-all">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Categories</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/search?category=Home Repair" className="hover:text-brand-primary transition-all">Home Repair</Link></li>
              <li><Link to="/search?category=Academic" className="hover:text-brand-primary transition-all">Academic Tutoring</Link></li>
              <li><Link to="/search?category=Creative" className="hover:text-brand-primary transition-all">Creative Services</Link></li>
              <li><Link to="/search?category=Technical" className="hover:text-brand-primary transition-all">Technical Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-brand-primary" />
                <span>+92 314 5432328</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-brand-primary" />
                <span>support@servlink.pk</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-brand-primary" />
                <span>Islamabad, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 ServLink Pakistan. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/terms" className="hover:text-white transition-all">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-all">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
