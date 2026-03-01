import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function DashboardFooter() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-cyan-900 text-white py-4 sm:py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Left Section */}
          <div className="text-center md:text-left">
            <p className="text-xs sm:text-sm text-white/80">
              © {currentYear} <span className="font-bold">MOTELTRIPS.COM</span>. All rights reserved.
            </p>
          </div>

          {/* Right Section - Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <motion.button
              onClick={() => navigate('/how-it-works')}
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              How It Works
            </motion.button>
            <span className="text-white/40">•</span>
            <motion.button
              onClick={() => navigate('/terms')}
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Terms & Conditions
            </motion.button>
            <span className="text-white/40 hidden sm:inline">•</span>
            <motion.button
              onClick={() => navigate('/privacy')}
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Privacy Policy
            </motion.button>
            <span className="text-white/40">•</span>
            {/* <motion.button
              onClick={() => navigate('/partner')}
              className="text-white/80 hover:text-white transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Partner with Us
            </motion.button> */}
          </div>
        </div>
      </div>
    </footer>
  );
}