import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-neon-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">Go<span className="text-primary">To</span></span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Your trusted ride-sharing partner for seamless, safe, and affordable travel.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {['About Us', 'How It Works', 'Safety', 'Support'].map(link => (
                <li key={link}>
                  <a href="#" className="text-white/40 hover:text-primary text-sm transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Services</h3>
            <ul className="space-y-2.5">
              {['Book a Ride', 'Self Drive', 'Parcel Delivery', 'Business'].map(link => (
                <li key={link}>
                  <a href="#" className="text-white/40 hover:text-primary text-sm transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/40 text-sm">
                <Phone size={14} className="text-primary shrink-0" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-white/40 text-sm">
                <Mail size={14} className="text-primary shrink-0" />
                support@gotocab.in
              </li>
              <li className="flex items-center gap-2 text-white/40 text-sm">
                <MapPin size={14} className="text-primary shrink-0" />
                Bengaluru, India
              </li>
            </ul>
            {/* Social */}
            <div className="flex gap-2 mt-5">
              {[Facebook, Twitter, Instagram].map((Icon, idx) => (
                <a key={idx} href="#" className="w-9 h-9 rounded-xl bg-surface-2/50 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/30 transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-white/25 text-xs">© 2026 GoTo Cab. All rights reserved.</p>
          <div className="flex gap-5">
            {['Privacy Policy', 'Terms of Service', 'Cookies'].map(link => (
              <a key={link} href="#" className="text-white/25 hover:text-white/50 text-xs transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
