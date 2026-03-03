import { Mail, Phone, MapPin, Facebook, X, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/trip.png';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="md:col-span-2">
            <img src={logo} alt="Tripways.com" className="h-16 w-auto mb-3" />
            <p className="text-gray-400 text-sm leading-relaxed font-light">
              Your trusted companion for finding the perfect motel for your journey. 
              We connect travelers with comfortable, affordable accommodations nationwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-sm tracking-tight text-orange-400">Quick Links</h3>
            <ul className="space-y-1.5 text-gray-400 text-sm">
              {[
                { name: 'Partner with Us', href: '/partner' },
                { name: 'How It Works', href: '/how-it-works' },
                { name: 'Terms & Conditions', href: '/terms' },
                { name: 'Privacy Policy', href: '/privacy' }
              ].map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="hover:text-orange-400 transition-colors duration-200 font-light">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm tracking-tight text-orange-400">Contact Us</h3>
            <ul className="space-y-2 text-gray-400 font-light text-sm">
              <li className="mb-3 pb-2 border-b border-gray-700">
                <p className="text-white font-semibold">Tripways LLC</p>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-orange-400" />
                <span>77996 84747</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-orange-400" />
                <span> support@tripways.in</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-3 h-3 mt-1 text-orange-400 flex-shrink-0" />
                <span className="leading-relaxed">
                  Flat no: 401, Plot no HIG 115, INTURI CHAMBERS, 6th Phase,
                  KPHB Colony, Kukatpally, Hyderabad-500085
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6">
          {/* Social Media Links */}
          <div className="flex justify-center gap-4 mb-6">
            {[
              { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
              { icon: X, href: 'https://twitter.com', label: 'Twitter' },
              { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
              { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
              { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' }
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-700 transition-all hover:scale-110"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5 text-white" />
              </a>
            ))}
          </div>
          
          <p className="text-center text-gray-500 font-light text-sm">&copy; {new Date().getFullYear()} Tripways.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}