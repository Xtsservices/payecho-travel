import { motion } from 'motion/react';
import { X, LogOut, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import logo from 'figma:asset/00d09e71b1640633d6e9a787381b574f41ce5e2c.png';
import logo from '../assets/logo.png';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
}

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  navItems: NavItem[];
  onLogout: () => void;
  userSection?: React.ReactNode;
}

export default function DashboardSidebar({
  isOpen,
  onClose,
  activeItem,
  navItems,
  onLogout,
  userSection
}: DashboardSidebarProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`bg-gradient-to-b from-gray-900 via-blue-900 to-cyan-900 text-white fixed lg:sticky top-0 h-screen z-50 transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 lg:w-20 xl:w-64`}
      >
        {/* Logo Header */}
        <div className="p-3 flex items-center justify-between border-b border-white/10">
          <img 
            src={logo} 
            alt="MotelTrips Logo" 
            className="h-7 cursor-pointer block xl:block lg:hidden" 
            onClick={() => navigate('/')}
          />
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Section (optional) */}
        {userSection && (
          <div className="p-3 border-b border-white/10">
            {userSection}
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => {
                item.onClick?.();
                onClose();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                activeItem === item.id
                  ? 'bg-white/20 shadow-lg'
                  : 'hover:bg-white/10'
              }`}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold text-xs xl:block lg:hidden">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-3 border-t border-white/10">
          <motion.button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-all cursor-pointer"
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold text-xs xl:block lg:hidden">Logout</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}
