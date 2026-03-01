import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, LogOut, ChevronDown, Settings } from 'lucide-react';

interface ProfileDropdownProps {
  userName: string;
  userEmail: string;
  userRole: string;
  avatarIcon: React.ReactNode;
  avatarGradient: string;
  onChangePassword: () => void;
  onUpdateProfile: () => void;
  onLogout: () => void;
}

export default function ProfileDropdown({
  userName,
  userEmail,
  userRole,
  avatarIcon,
  avatarGradient,
  onChangePassword,
  onUpdateProfile,
  onLogout
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      action: () => {
        onUpdateProfile();
        setIsOpen(false);
      },
      color: 'hover:bg-cyan-50 hover:text-cyan-700'
    },
    {
      icon: Lock,
      label: 'Change Password',
      action: () => {
        onChangePassword();
        setIsOpen(false);
      },
      color: 'hover:bg-blue-50 hover:text-blue-700'
    },
    {
      icon: LogOut,
      label: 'Logout',
      action: () => {
        onLogout();
        setIsOpen(false);
      },
      color: 'hover:bg-red-50 hover:text-red-700',
      isDanger: true
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* User Info (hidden on small screens) */}
        <div className="hidden md:block text-right">
          <p className="font-semibold text-sm">{userName}</p>
          <p className="text-xs text-gray-600">{userEmail}</p>
        </div>

        {/* Avatar */}
        <div className={`w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br ${avatarGradient} rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-lg`}>
          {avatarIcon}
        </div>

        {/* Dropdown Indicator */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="hidden sm:block"
        >
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* User Info Header */}
            <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm`}>
                  {avatarIcon}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate">{userName}</p>
                  <p className="text-xs text-white/90 truncate">{userEmail}</p>
                  <p className="text-xs text-white/80 mt-0.5">{userRole}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    item.isDanger ? 'text-red-600' : 'text-gray-700'
                  } ${item.color}`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">{item.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Keyboard Hint */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Click outside to close
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
