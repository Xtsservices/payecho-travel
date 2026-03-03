import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/trip.png';
import { motion } from 'motion/react';
import { Search, Home, LogIn, User } from 'lucide-react';

export default function Header() {
  const location = useLocation();

  return (
    <motion.header 
      className="bg-white/95 backdrop-blur-sm text-slate-900 py-3 px-6 sticky top-0 z-50 shadow-sm border-b border-gray-100"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Tripways.com" 
            className="h-12 transition-transform duration-300 hover:scale-105"
          />
        </Link>
        
        <nav className="flex items-center gap-2">
          <Link to="/">
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 cursor-pointer">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </div>
          </Link>
          {/* <Link to="/search">
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors duration-200 cursor-pointer">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </div>
          </Link> */}
          <Link to="/signup">
            <motion.div 
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 shadow-md border-2 border-orange-400 cursor-pointer font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Up</span>
            </motion.div>
          </Link>
          <Link to="/login">
            <motion.div 
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 shadow-md border-2 border-orange-400 cursor-pointer font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </motion.div>
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
