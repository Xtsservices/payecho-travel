import { Menu, LucideIcon } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  userName: string;
  userEmail: string;
  userRole: string;
  avatarIcon: React.ReactNode;
  avatarGradient: string;
  onChangePassword: () => void;
  onUpdateProfile?: () => void;
  onLogout: () => void;
  rightContent?: React.ReactNode;
}

export default function DashboardHeader({
  title,
  subtitle,
  onMenuClick,
  userName,
  userEmail,
  userRole,
  avatarIcon,
  avatarGradient,
  onChangePassword,
  onUpdateProfile,
  onLogout,
  rightContent
}: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 px-3 sm:px-4 py-2 border-b border-gray-200">
      <div className="flex items-center justify-between gap-2">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer flex-shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black text-orange-600">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-600 hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightContent}
          <ProfileDropdown
            userName={userName}
            userEmail={userEmail}
            userRole={userRole}
            avatarIcon={avatarIcon}
            avatarGradient={avatarGradient}
            onChangePassword={onChangePassword}
            onUpdateProfile={onUpdateProfile}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
}
