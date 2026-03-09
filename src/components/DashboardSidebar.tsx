import { motion } from 'motion/react';
import { X, LogOut, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import logo from 'figma:asset/00d09e71b1640633d6e9a787381b574f41ce5e2c.png';
import logo from '../assets/trip.png';

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
        className={`bg-gradient-to-b from-orange-100 via-orange-200 to-orange-300 text-gray-800 fixed lg:sticky top-0 h-screen z-50 transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 lg:w-20 xl:w-64`}
      >
        {/* Logo Header */}
        <div className="p-3 flex items-center justify-between border-b border-orange-400/40">
          <img 
            src={logo} 
            alt="Tripways Logo" 
            className="h-7 cursor-pointer block xl:block lg:hidden" 
            onClick={() => navigate('/')}
          />
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-orange-400/30 rounded-lg transition-colors cursor-pointer lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Section (optional) */}
        {userSection && (
          <div className="p-3 border-b border-orange-400/40">
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
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg text-white border border-orange-400'
                  : 'hover:bg-orange-400/30 text-gray-800'
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
        <div className="absolute bottom-0 w-full p-3 border-t border-orange-400/40">
          <motion.button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-orange-400/30 transition-all cursor-pointer text-gray-800"
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
