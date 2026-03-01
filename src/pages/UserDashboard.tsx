import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSelector } from 'react-redux';
import {
  Calendar, MapPin, Users, CreditCard, Download, 
  CheckCircle, Clock, XCircle, User, LogOut, Menu, X,
  ChevronRight, Filter, Search, Mail, Phone, Home, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button, StatCard, Badge } from '../components/ui';
import ChangePasswordModal from '../components/ChangePasswordModal';
import UpdateProfileModal from '../components/UpdateProfileModal';
import ProfileDropdown from '../components/ProfileDropdown';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import DashboardFooter from '../components/DashboardFooter';
import { apiGet, apiPost } from '../api/api';
import { toast } from 'react-toastify';

interface Booking {
  id: string;
  motelId: string;
  motelName: string;
  motelImage: string;
  location: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  adults: number;
  children: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  bookingDate: string;
  confirmationNumber: string;
}

type FilterType = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Capitalize first letter of string
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.currentUserData);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState({
    total_bookings: 0,
    upcoming_trips: 0,
    completed_trips: 0,
    total_spent: '$0.00'
  });

  // Fetch profile data from API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await apiGet('/auth/my-profile');
        if (res?.data?.success) {
          setProfileData(res.data.data);
          console.log('Profile Data:', res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch profile data', err);
      }
    };

    fetchProfileData();
  }, []);

  // Format date string to readable format
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'January 2024';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } catch {
      return 'January 2024';
    }
  };

  const userInfo = {
    name: profileData 
      ? capitalizeFirstLetter(`${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()) || 'Guest User'
      : capitalizeFirstLetter(user?.user?.username || 'Guest User'),
    email: profileData?.email || user?.user?.email || 'user@example.com',
    phone: profileData?.phone || user?.user?.phone || '+1 (555) 987-6543',
    memberSince: formatDate(profileData?.created_at),
    totalBookings: dashboardStats.total_bookings
  };

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [cancellationReasons, setCancellationReasons] = useState<string[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [showMotelDetailsModal, setShowMotelDetailsModal] = useState(false);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);

  // Fetch bookings function - made reusable so it can be called from multiple places
  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const res = await apiGet('/user/bookings');
      console.log('Bookings API Response:', res?.data?.data);
      
      if (res?.data?.success && Array.isArray(res.data.data)) {
        const transformed = res.data.data.map((b: any) => {
          console.log('Processing booking:', b.booking_id, 'with status:', b.status);
          
          // Parse check-in and check-out dates
          const checkIn = new Date(b.check_in).toISOString().split('T')[0];
          const checkOut = new Date(b.check_out).toISOString().split('T')[0];

          // Determine booking status based on status code
          // Status: 0 = pending, 1 = confirmed, 2 = cancelled
          let status: 'pending' | 'confirmed' | 'completed' | 'cancelled' = 'pending';
          if (b.status === 2 || b.status === '2') {
            status = 'cancelled';
            console.log('Booking', b.booking_id, 'marked as CANCELLED (status:', b.status, ')');
          } else if (new Date(checkOut) < new Date()) {
            status = 'completed';
            console.log('Booking', b.booking_id, 'marked as COMPLETED');
          } else if (b.status === 1 || b.status === '1') {
            status = 'confirmed';
            console.log('Booking', b.booking_id, 'marked as CONFIRMED (status:', b.status, ')');
          } else {
            status = 'pending';
            console.log('Booking', b.booking_id, 'marked as PENDING (status:', b.status, ')');
          }

          return {
            id: String(b.booking_id),
            motelId: String(b.booking_id),
            motelName: b.motel?.motel_name || 'Motel',
            motelImage: b.motel?.images?.[0] || '',
            location: b.motel?.locality_name || b.locality || '',
            checkIn,
            checkOut,
            rooms: Number(b.rooms) || 1,
            guests: (Number(b.adults) || 0) + (Number(b.children) || 0),
            adults: Number(b.adults) || 0,
            children: Number(b.children) || 0,
            totalAmount: Number(b.total_amount) || 0,
            status,
            bookingDate: checkIn,
            confirmationNumber: b.booking_reference || ''
          };
        });
        setBookings(transformed);
        console.log('Final Transformed Bookings:', transformed);
      }
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await apiGet('/user/dashboard-stats');
        if (res?.data?.success && res.data.stats) {
          setDashboardStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      }
    };

    fetchDashboardStats();
  }, []);

  // Fetch bookings from API - call on mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetch cancellation reasons from API
  useEffect(() => {
    const fetchCancellationReasons = async () => {
      try {
        const res = await apiGet('/user-booking/bookings/cancellation-reasons');
        console.log('Cancellation Reasons Response:', res);
        
        if (res?.data?.success && Array.isArray(res.data.reasons)) {
          setCancellationReasons(res.data.reasons);
          console.log('Fetched Reasons:', res.data.reasons);
        }
      } catch (err) {
        console.error('Failed to fetch cancellation reasons', err);
      }
    };

    fetchCancellationReasons();
  }, []);

  // Fallback hardcoded bookings if API fails
  const fallbackBookings: Booking[] = [
    {
      id: 'BK001',
      motelId: 'MT001',
      motelName: 'Sunrise Motel',
      motelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      location: 'Los Angeles, CA',
      checkIn: '2025-12-10',
      checkOut: '2025-12-12',
      rooms: 1,
      guests: 2,
      adults: 2,
      children: 0,
      totalAmount: 178,
      status: 'pending',
      bookingDate: '2025-12-03',
      confirmationNumber: 'MT-2025-001234'
    },
    {
      id: 'BK002',
      motelId: 'MT002',
      motelName: 'Ocean View Inn',
      motelImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
      location: 'San Diego, CA',
      checkIn: '2025-12-20',
      checkOut: '2025-12-23',
      rooms: 2,
      guests: 4,
      adults: 3,
      children: 1,
      totalAmount: 534,
      status: 'pending',
      bookingDate: '2025-12-01',
      confirmationNumber: 'MT-2025-001235'
    },
    {
      id: 'BK003',
      motelId: 'MT003',
      motelName: 'Mountain Lodge',
      motelImage: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400',
      location: 'Denver, CO',
      checkIn: '2025-11-15',
      checkOut: '2025-11-18',
      rooms: 1,
      guests: 2,
      adults: 2,
      children: 0,
      totalAmount: 267,
      status: 'completed',
      bookingDate: '2025-11-10',
      confirmationNumber: 'MT-2025-001233'
    },
    {
      id: 'BK004',
      motelId: 'MT004',
      motelName: 'Desert Oasis',
      motelImage: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
      location: 'Phoenix, AZ',
      checkIn: '2025-11-01',
      checkOut: '2025-11-03',
      rooms: 1,
      guests: 3,
      adults: 2,
      children: 1,
      totalAmount: 156,
      status: 'completed',
      bookingDate: '2025-10-28',
      confirmationNumber: 'MT-2025-001232'
    },
    {
      id: 'BK005',
      motelId: 'MT005',
      motelName: 'Lakeside Retreat',
      motelImage: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400',
      location: 'Seattle, WA',
      checkIn: '2025-10-10',
      checkOut: '2025-10-12',
      rooms: 1,
      guests: 2,
      adults: 2,
      children: 0,
      totalAmount: 198,
      status: 'cancelled',
      bookingDate: '2025-10-05',
      confirmationNumber: 'MT-2025-001231'
    }
  ];

  // Use API bookings if available (use fallback only during loading)
  const displayBookings = bookingsLoading ? fallbackBookings : bookings;

  const filteredBookings = displayBookings.filter(booking => {
    const matchesFilter = filterType === 'all' || booking.status === filterType;
    const matchesSearch = searchQuery === '' || 
                         booking.motelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.confirmationNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = [
    { 
      label: 'Total Bookings', 
      value: String(dashboardStats.total_bookings), 
      icon: Calendar, 
      color: 'from-cyan-500 to-blue-600' 
    },
    { 
      label: 'Upcoming Trips', 
      value: String(dashboardStats.upcoming_trips), 
      icon: Clock, 
      color: 'from-cyan-500 to-blue-600' 
    },
    { 
      label: 'Completed Trips', 
      value: String(dashboardStats.completed_trips), 
      icon: CheckCircle, 
      color: 'from-cyan-500 to-blue-600' 
    },
    { 
      label: 'Total Spent', 
      value: dashboardStats.total_spent, 
      icon: CreditCard, 
      color: 'from-cyan-500 to-blue-600' 
    }
  ];

  const filterButtons: { type: FilterType; label: string; count: number }[] = [
    { type: 'all', label: 'All Bookings', count: displayBookings.length },
    { type: 'pending', label: 'Pending', count: displayBookings.filter(b => b.status === 'pending').length },
    { type: 'confirmed', label: 'Confirmed', count: displayBookings.filter(b => b.status === 'confirmed').length },
    { type: 'completed', label: 'Completed', count: displayBookings.filter(b => b.status === 'completed').length },
    { type: 'cancelled', label: 'Cancelled', count: displayBookings.filter(b => b.status === 'cancelled').length }
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  const handleDownloadConfirmation = (bookingId: string) => {
    console.log('Download confirmation for:', bookingId);
    // In a real app, this would generate and download a PDF
  };

  const handleCancelBooking = (bookingId: string) => {
    setSelectedBookingForCancel(bookingId);
    setSelectedReason('');
    setOtherReason('');
    setShowCancelModal(true);
  };

  const handleConfirmCancellation = async () => {
    if (!selectedReason) {
      toast.error('Please select a cancellation reason');
      return;
    }

    const finalReason = selectedReason === 'Other (please specify)' ? otherReason : selectedReason;
    if (!finalReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      console.log('Cancelling booking:', selectedBookingForCancel, 'Reason:', finalReason);
      
      const res = await apiPost(`/user-booking/bookings/${selectedBookingForCancel}/cancel`, { 
        reason: finalReason 
      });
      
      console.log('Cancel API Response:', res);
      
      if (res?.data?.success) {
        toast.success(res.data.message || 'Booking cancelled successfully!');
        console.log('Cancellation successful, refetching bookings...');
        
        // Refetch bookings from API to get the updated status
        await fetchBookings();
        console.log('Bookings refetched after cancellation');
        
        // Close modal and reset form
        setShowCancelModal(false);
        setSelectedReason('');
        setOtherReason('');
        setSelectedBookingForCancel(null);
      } else {
        console.log('Cancellation failed, response:', res?.data);
        toast.error(res?.data?.message || 'Failed to cancel booking');
      }
    } catch (err: any) {
      console.error('Failed to cancel booking:', err);
      toast.error(err?.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBookingForDetails(booking);
    setShowMotelDetailsModal(true);
  };

  const handleUpdateProfile = (data: { name: string; email: string; phone: string }) => {
    console.log('Profile updated:', data);
    // In a real app, this would update the user profile in the database
    // For now, we just log it
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights;
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Navigation items for sidebar
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, onClick: () => navigate('/') },
    { id: 'trips', label: 'My Bookings', icon: Calendar, onClick: () => {} }
  ];

  // User section for sidebar
  const userSection = (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
        <User className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0 xl:block lg:hidden">
        <p className="font-semibold truncate text-xs">{userInfo.name}</p>
        <p className="text-xs text-white/70 truncate">{userInfo.email}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem="trips"
        navItems={navItems}
        onLogout={handleLogout}
        userSection={userSection}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-20 xl:ml-0 flex flex-col">
        {/* Header */}
        <DashboardHeader
          title={`Hi, ${userInfo.name.split(' ')[0]}!`}
          subtitle="Your bookings"
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName={userInfo.name}
          userEmail={userInfo.email}
          userRole="Guest"
          avatarIcon={<User className="w-5 h-5 text-white" />}
          avatarGradient="from-cyan-400 to-blue-500"
          onChangePassword={() => setShowChangePasswordModal(true)}
          onUpdateProfile={() => setShowUpdateProfileModal(true)}
          onLogout={handleLogout}
          rightContent={(
            <button
              onClick={() => navigate('/')}
              className="px-2 py-1 text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer whitespace-nowrap font-semibold shadow-md"
            >
              + New
            </button>
          )}
        />

        {/* Content Area */}
        <main className="flex-1 p-3 space-y-3">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Filters and Search - Combined in one row */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-3 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col gap-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              {/* Filter Buttons */}
              <div className="grid grid-cols-2 sm:flex gap-2">
                {filterButtons.map((filter) => (
                  <button
                    key={filter.type}
                    onClick={() => setFilterType(filter.type)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      filterType === filter.type
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bookings List */}
          <div className="space-y-3">
            {filteredBookings.length === 0 ? (
              <motion.div
                className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl shadow-lg p-8 sm:p-12 text-center border border-cyan-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  {searchQuery || filterType !== 'all' ? 'No bookings found' : 'Start Your Journey!'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery || filterType !== 'all' 
                    ? 'Try adjusting your filters or search to find your bookings' 
                    : 'Book your perfect motel and create unforgettable travel memories'}
                </p>
                {searchQuery || filterType !== 'all' ? (
                  <button
                    onClick={() => {
                      setFilterType('all');
                      setSearchQuery('');
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer font-semibold shadow-md text-xs"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/')}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer font-semibold shadow-md text-xs"
                  >
                    Browse Motels
                  </button>
                )}
              </motion.div>
            ) : (
              filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image - Hidden since API doesn't provide images */}
                    {/* <div className="sm:w-40 h-28 sm:h-auto flex-shrink-0">
                      <ImageWithFallback
                        src={booking.motelImage}
                        alt={booking.motelName}
                        className="w-full h-full object-cover"
                      />
                    </div> */}

                    {/* Content */}
                    <div className="flex-1 p-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-black truncate">{booking.motelName}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                              booking.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                              booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {booking.status === 'pending' ? 'Pending' :
                               booking.status === 'confirmed' ? 'Confirmed' :
                               booking.status === 'completed' ? 'Completed' : 'Cancelled'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 text-xs">
                            <MapPin className="w-3 h-3 text-cyan-600" />
                            <span>{booking.location}</span>
                            <span className="text-gray-400 mx-1">•</span>
                            <span className="text-gray-500">{booking.confirmationNumber}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-cyan-600">${booking.totalAmount}</p>
                        </div>
                      </div>

                      {/* Details Grid - Inline */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-cyan-600" />
                          <span className="font-semibold text-gray-900">{new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span>→</span>
                          <span className="font-semibold text-gray-900">{new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Home className="w-3 h-3 text-cyan-600" />
                          <span>{booking.rooms} Room{booking.rooms > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-600" />
                          <span>{calculateNights(booking.checkIn, booking.checkOut)} Night{calculateNights(booking.checkIn, booking.checkOut) > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-cyan-600" />
                          <span>{booking.adults} Adult{booking.adults > 1 ? 's' : ''} • {booking.children} Child{booking.children !== 1 ? 'ren' : ''}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {/* View motel details */}
                        <button
                          onClick={() => handleViewDetails(booking)}
                          className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer flex items-center justify-center gap-1 text-xs font-semibold"
                        >
                          Details
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        {/* Download PDF confirmation */}
                        {/* <button
                          onClick={() => handleDownloadConfirmation(booking.id)}
                          className="flex-1 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer flex items-center justify-center gap-1 text-xs font-semibold"
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </button> */}
                        {/* Cancel pending or confirmed bookings */}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="flex-1 px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors cursor-pointer flex items-center justify-center gap-1 text-xs font-semibold"
                          >
                            <XCircle className="w-3 h-3" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </main>

        {/* Footer */}
        <DashboardFooter />
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        userEmail={userInfo.email}
      />

      {/* Update Profile Modal */}
      <UpdateProfileModal
        isOpen={showUpdateProfileModal}
        onClose={() => setShowUpdateProfileModal(false)}
        userInfo={userInfo}
        onUpdate={handleUpdateProfile}
      />

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="bg-blue-500 px-6 py-8 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black">Cancel Booking</h2>
              </div>
              <p className="text-blue-100 text-sm">We'd like to know why you're cancelling</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Cancellation Reason Dropdown */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2.5">Select Reason</label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 text-sm font-medium transition-all appearance-none bg-white cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="" className="text-gray-500">Select a reason...</option>
                  {cancellationReasons.map((reason, idx) => (
                    <option key={idx} value={reason} className="text-gray-800">
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Other Reason Text Field */}
              {selectedReason === 'Other (please specify)' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-bold text-gray-800 mb-2.5">Additional Details</label>
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Please tell us more..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 text-sm resize-none h-24 font-medium placeholder:text-gray-400 transition-all"
                  />
                </motion.div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-xs text-blue-800 font-medium">
                  💡 <span className="ml-1">Your feedback helps us improve our service</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-100">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all font-bold text-sm"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancellation}
                disabled={!selectedReason}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none"
              >
                Confirm Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Motel Details Modal */}
      {showMotelDetailsModal && selectedBookingForDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowMotelDetailsModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 sticky top-0 z-10 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{selectedBookingForDetails.motelName}</h3>
                <p className="text-cyan-100 mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedBookingForDetails.location}
                </p>
              </div>
              <button
                onClick={() => setShowMotelDetailsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Motel Image */}
              {selectedBookingForDetails.motelImage && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={selectedBookingForDetails.motelImage}
                    alt={selectedBookingForDetails.motelName}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Booking Details */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4">Booking Information</h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Check-in</p>
                    <p className="text-gray-800 font-semibold">{new Date(selectedBookingForDetails.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Check-out</p>
                    <p className="text-gray-800 font-semibold">{new Date(selectedBookingForDetails.checkOut).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Rooms</p>
                    <p className="text-gray-800 font-semibold">{selectedBookingForDetails.rooms}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Guests</p>
                    <p className="text-gray-800 font-semibold">{selectedBookingForDetails.guests}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Total Amount</p>
                    <p className="text-gray-800 font-semibold">${selectedBookingForDetails.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Confirmation Number</p>
                    <p className="text-gray-800 font-semibold text-cyan-600">{selectedBookingForDetails.confirmationNumber}</p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4">Status</h4>
                <div className="flex items-center gap-2">
                  {selectedBookingForDetails.status === 'pending' && (
                    <>
                      <Clock className="w-5 h-5 text-orange-500" />
                      <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">Pending</span>
                    </>
                  )}
                  {selectedBookingForDetails.status === 'confirmed' && (
                    <>
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                      <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">Confirmed</span>
                    </>
                  )}
                  {selectedBookingForDetails.status === 'completed' && (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">Completed</span>
                    </>
                  )}
                  {selectedBookingForDetails.status === 'cancelled' && (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold">Cancelled</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {/* <button
                  onClick={() => navigate(`/motel/${selectedBookingForDetails.motelId}`)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold"
                >
                  View Full Motel Details
                </button> */}
                <button
                  onClick={() => setShowMotelDetailsModal(false)}
                  className="flex-1 py-2.5 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}