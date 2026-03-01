import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Upload, FileText, CheckCircle, XCircle, Calendar,
  LogOut, Menu, X, Settings, User, Image, DollarSign, TrendingUp,
  Eye, Clock, MapPin, Star, ChevronRight, ChevronLeft, Send, Lock,
  Wifi, Wind, Coffee, Waves, Heart, Pencil, Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button, IconButton, Input, TextArea, StatCard, Tab, Badge, FileUpload, Modal } from '../components/ui';
import MotelSetupWizard from '../components/MotelSetupWizard';
import ChangePasswordModal from '../components/ChangePasswordModal';
import ProfileDropdown from '../components/ProfileDropdown';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import DashboardFooter from '../components/DashboardFooter';
import logo from 'figma:asset/00d09e71b1640633d6e9a787381b574f41ce5e2c.png';
import { apiUploadFile, apiGet, apiDelete, getMotelById,apiPut, apiPost } from "../api/api";
import { toast } from "react-toastify";


type TabType = 'overview' | 'profile' | 'images' | 'documents' | 'reservations'| 'rooms' | 'amenities' | 'policies';

interface Reservation {
  id: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  amount: number;
  createdAt: string;
}
// 🔹 ADD HERE (ABOVE MotelDashboard)

const PolicyToggle = ({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="flex items-center gap-3 cursor-pointer select-none"
  >
    <CheckCircle
      className={`w-5 h-5 ${
        value ? "text-green-600" : "text-gray-400"
      }`}
    />
    <span className="text-sm font-medium">{label}</span>
  </div>
);
const AmenityToggle = ({
  label,
  value,
  onClick,
  Icon,
}: {
  label: string;
  value: boolean;
  onClick: () => void;
  Icon: any;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
      ${value ? "border-cyan-500 bg-cyan-50" : "border-gray-200 hover:border-cyan-400"}
    `}
  >
    <Icon className="w-5 h-5 text-cyan-600" />
    <span className="text-sm font-semibold">{label}</span>
    <CheckCircle
      className={`ml-auto w-5 h-5 ${value ? "text-green-600" : "text-gray-300"}`}
    />
  </div>
);


// 🔹 DO NOT EXPORT THIS


export default function MotelDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const savedTab = localStorage.getItem('motelDashboardActiveTab');
    return (savedTab as TabType) || 'overview';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const user = useSelector((state: any) => state.currentUserData);
  const motelId = user?.motel_id;
  console.log("Current User Data from Redux:", user);

  const [profileData, setProfileData] = useState(user);
  console.log("Profile Data:", profileData);

  // Fetch user profile from /auth/my-profile on mount and when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await apiGet('/auth/my-profile');
        console.log('Auth profile API response:', res);
        if (res?.data?.success && res.data?.data) {
          // Dispatch to Redux
          dispatch({
            type: 'currentUserData',
            payload: res.data.data
          });
          setProfileData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };
    
    // Always fetch to ensure fresh data after login or on mount
    fetchUserProfile();
  }, [dispatch]);

  // Sync profileData with Redux user changes
  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);
  const [motelProfile, setMotelProfile] = useState({
    motel_name: "",
    owner_id: 0,
    contact_email: "",
    contact_phone: "",
    country_id: "",
    state_id: "",
    city_id: "",
    address: "",
    zip_code: "",
    registration_type: "",
    rooms: ""
  });

  // Populate motelProfile from profileData when it's available
  useEffect(() => {
    if (profileData?.motel_details) {
      const motelDetails = profileData.motel_details;
      setMotelProfile({
        motel_name: motelDetails.motel_name || "",
        owner_id: motelDetails.owner_id || 0,
        contact_email: motelDetails.contact_email || "",
        contact_phone: motelDetails.contact_phone || "",
        country_id: motelDetails.country_name || motelDetails.country_id || "",
        state_id: motelDetails.state_name || motelDetails.state_id || "",
        city_id: motelDetails.city_name || motelDetails.city_id || "",
        address: motelDetails.address || "",
        zip_code: motelDetails.zip_code || "",
        registration_type: motelDetails.registration_type || "",
        rooms: motelDetails.rooms || ""
      } as any);
    }
  }, [profileData?.motel_details]);

  console.log("Motel Profile State:", motelProfile);

  // Save activeTab to localStorage
  useEffect(() => {
    localStorage.setItem('motelDashboardActiveTab', activeTab);
  }, [activeTab]);

  // derive approvalStatus from motel details (use approval_status where available)
  useEffect(() => {
    const raw = profileData?.motel_details?.approval_status ?? profileData?.motel_details?.status ?? (motelProfile as any)?.approval_status ?? (motelProfile as any)?.status;
    let mapped: 'approved' | 'pending' | 'rejected' = 'pending';
    if (raw === 1 || raw === '1' || String(raw).toLowerCase() === 'approved') mapped = 'approved';
    else if (raw === 2 || raw === '2' || String(raw).toLowerCase() === 'rejected') mapped = 'rejected';
    else mapped = 'pending';
    setApprovalStatus(mapped);
  }, [profileData, motelProfile]);

  const [uploadedImages, setUploadedImages] = useState<any[]>([
    'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7',
  ]);

  // Documents upload modal state
  const [showDocModal, setShowDocModal] = useState(false);
  const [docForm, setDocForm] = useState<{
    document: File | null;
    document_type: string;
    document_number: string;
    issued_by: string;
    issued_at: string; // yyyy-mm-dd
    expiry_at: string; // yyyy-mm-dd
  }>({ document: null, document_type: '', document_number: '', issued_by: '', issued_at: '', expiry_at: '' });

  // Image upload modal/form state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageForm, setImageForm] = useState<{
    file: File | null;
    image_type: string;
    room_type: string;
    caption: string;
    display_order: number;
    is_primary: boolean;
  }>({ file: null, image_type: 'King', room_type: '', caption: '', display_order: 1, is_primary: false });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageTypeOptions, setImageTypeOptions] = useState<string[]>(['King','Queen','Twin','Exterior','Lobby','Pool','Restaurant']);
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await apiGet('/motel-image-types');
        if (res?.data?.success && Array.isArray(res.data.data)) setImageTypeOptions(res.data.data);
      } catch (err) {
        // keep defaults
      }
    };
    fetchTypes();
  }, []);

  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editDocData, setEditDocData] = useState<any>(null);
  const [motelLogo, setMotelLogo] = useState<any>(null);
  const [policies, setPolicies] = useState({
  cancellation_policy: "",
  terms_and_conditions: "",
  is_smoking_allowed: false,
  is_couple_friendly: false,
  id_proof_required: false,
});
const [policySaving, setPolicySaving] = useState(false);
const [amenities, setAmenities] = useState({
  parking_available: false,
  wifi_available: false,
  ac_available: false,
  restaurant_available: false,
  swimming_pool: false,
  power_backup: false,
  cctv: false,
  room_service: false,
  laundry_service: false,
  pet_friendly: false,
});








  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationsRawData, setReservationsRawData] = useState<any[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showReservationDetailModal, setShowReservationDetailModal] = useState(false);
  const [reservationSearchQuery, setReservationSearchQuery] = useState('');
  const [reservationCheckInFilter, setReservationCheckInFilter] = useState('');
  const [reservationCheckOutFilter, setReservationCheckOutFilter] = useState('');
  const [reservationStatusFilter, setReservationStatusFilter] = useState<string | null>(null);

  // Fetch recent reservations from API
  useEffect(() => {
    const fetchRecentReservations = async () => {
      try {
        const res = await apiGet('/motelowner/recent-reservations');
        console.log('Reservations API response:', res);
        
        if (res?.data?.success && Array.isArray(res.data.data)) {
          // Store raw API data
          setReservationsRawData(res.data.data);
          
          const transformed = res.data.data.map((r: any) => {
            // Parse total_amount string to number (remove $ and parse)
            const amountStr = String(r.total_amount || '$0.00').replace(/[$,\s]/g, '').replace('k', '000');
            const amount = parseFloat(amountStr) || 0;

            // Parse check-in and check-out dates
            const checkIn = new Date(r.check_in).toISOString().split('T')[0];
            const checkOut = new Date(r.check_out).toISOString().split('T')[0];

            // Map status: 0 = pending, 1 = confirmed, 2 = cancelled
            let status: 'pending' | 'confirmed' | 'cancelled' = 'pending';
            if (r.status === 1) {
              status = 'confirmed';
            } else if (r.status === 2) {
              status = 'cancelled';
            }

            return {
              id: String(r.id),
              bookingReference: r.booking_reference || String(r.id),
              guestName: r.contact_name || 'Guest',
              guestEmail: r.contact_email || '',
              checkIn,
              checkOut,
              rooms: 1,
              guests: r.guests || 1,
              status,
              amount,
              createdAt: new Date().toISOString().split('T')[0]
            };
          });
          console.log('Transformed reservations:', transformed);
          setReservations(transformed);
        } else {
          console.log('No data in response or success is false');
        }
      } catch (err) {
        console.error('Failed to fetch recent reservations', err);
      }
    };

    fetchRecentReservations();
  }, []);

  const [dashboardStats, setDashboardStats] = useState({
    total_reservations: 0,
    pending_requests: 0,
    month_revenue: '$0.00',
    total_revenue: '$0.00'
  });

  const stats = [
    { label: 'Total Reservations', value: String(dashboardStats.total_reservations), icon: Calendar, color: 'from-cyan-500 to-blue-600' },
    { label: 'Pending Requests', value: String(dashboardStats.pending_requests), icon: Clock, color: 'from-cyan-500 to-blue-600' },
    { label: 'This Month Revenue', value: dashboardStats.month_revenue, icon: DollarSign, color: 'from-cyan-500 to-blue-600' },
    { label: 'Total Revenue', value: dashboardStats.total_revenue, icon: TrendingUp, color: 'from-cyan-500 to-blue-600' },
  ];

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await apiGet('/motelowner/dashboard-stats');
        if (res?.data?.success && res.data.data) {
          setDashboardStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      }
    };

    fetchDashboardStats();
  }, []);

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: TrendingUp },
    { id: 'profile' as TabType, label: 'Profile', icon: Building2 },
    { id: 'images' as TabType, label: 'Images', icon: Image },
    { id: 'documents' as TabType, label: 'Documents', icon: FileText },
    { id: 'reservations' as TabType, label: 'Reservations', icon: Calendar },
    { id: 'rooms' as TabType, label: 'Rooms', icon: Building2 },
    { id: 'amenities' as TabType, label: 'Amenities', icon: Star },
    { id: 'policies' as TabType, label: 'Policies', icon: FileText }


  ];
  const [selectedDoc, setSelectedDoc] = useState<any>(null);



  // Update Motel Profile API integration
  const handleProfileSave = async (updatedProfile: any) => {
    try {
      if (!motelId) {
        toast.error('Motel ID not found.');
        return;
      }
      const res = await apiPut(`/motels/${motelId}`, updatedProfile);
      if (res.data.success) {
        toast.success(res.data.message || 'Motel updated successfully.');
        setMotelProfile(res.data.motel);
      } else {
        toast.error(res.data.message || 'Failed to update motel.');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update motel.');
    }
  };

  // Optionally, you can call handleProfileSave from your profile form or MotelSetupWizard
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    handleProfileSave(motelProfile);
  };

  const handleImageUploadAPI = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await apiUploadFile(
        "/motel-images/upload",
        file,
        "image",
        {
          image_type: "King",                 // REQUIRED
          caption: "Spacious King Room",      // optional
          display_order: 1,                   // optional
          is_primary: uploadedImages.length === 0 // first image primary
        }
      );

      const image = res.data.data;

      // Update UI immediately
      setUploadedImages((prev) => [...prev, image]);

      toast.success("Image uploaded successfully");

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Image upload failed"
      );
    }
  };

  // submit image form; if keepOpen is true, keep modal open and reset file for next upload
  const handleImageFormSubmit = async (e?: React.FormEvent | null, keepOpen = false) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!imageForm.file) { toast.error('Please choose a file'); return; }
    if (!imageForm.image_type) { toast.error('Image type is required'); return; }
    if (!imageForm.room_type || String(imageForm.room_type).trim() === '') { toast.error('Room type is required'); return; }

    try {
      const res = await apiUploadFile('/motel-images/upload', imageForm.file, 'image', {
        image_type: imageForm.image_type,
        room_type: imageForm.room_type,
        caption: imageForm.caption,
        display_order: imageForm.display_order,
        is_primary: imageForm.is_primary ? 1 : 0,
        motel_id: motelId || (profileData?.user?.motel_details?.motel_id) || ''
      });

      const image = res.data.data;
      setUploadedImages(prev => [...prev, image]);
      toast.success('Image uploaded successfully');

      if (keepOpen) {
        // reset file and caption for next upload, keep other selections
        setImageForm(prev => ({ ...prev, file: null, caption: '' }));
        setShowImageModal(true);
        // focus file input so user can pick next file
        setTimeout(() => fileInputRef.current?.focus(), 80);
      } else {
        setShowImageModal(false);
        setImageForm({ file: null, image_type: 'King', room_type: '', caption: '', display_order: 1, is_primary: false });
      }
    } catch (err: any) {
      console.error('Upload failed', err);
      toast.error(err?.response?.data?.message || 'Image upload failed');
    }
  };
  const fetchMotelImages = async () => {
    try {
      const res = await apiGet("/motel-images");

      if (res.data.success) {
        setUploadedImages(res.data.data); // array of image objects
      }
    } catch (error: any) {
      console.error("Failed to fetch images", error);
      toast.error("Failed to load images");
    }
  };
  useEffect(() => {
    fetchMotelImages();
  }, []);
  const handleDeleteImage = async (id: number) => {
    if (!confirm("Do you want to delete this image?")) return;

    try {
      await apiDelete(`/motel-images/${id}`);

      toast.success("Image deleted successfully");

      // remove image from UI
      setUploadedImages((prev) =>
        prev.filter((img) => img.id !== id)
      );
    } catch (error: any) {
      console.error("Delete failed", error);
      toast.error("Failed to delete image");
    }
  };




  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      console.log('Uploading documents:', files);
    }
  };
  const fetchMotelLogo = async () => {
    try {
      const res = await apiGet("/motel-logo");

      if (res.data.success) {
        setMotelLogo(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch logo", error);
    }
  };
  useEffect(() => {
    fetchMotelLogo();
  }, []);
  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await apiUploadFile(
        "/motel-logo/upload",
        file,
        "logo"
      );

      toast.success("Logo uploaded successfully");
      setMotelLogo(res.data.data); // replace logo

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Logo upload failed"
      );
    }
  };
  const handleDeleteLogo = async () => {
    if (!confirm("Do you want to delete the logo?")) return;

    try {
      await apiDelete("/motel-logo");

      setMotelLogo(null);
      toast.success("Logo deleted successfully");

    } catch (error) {
      toast.error("Failed to delete logo");
    }
  };


  const handleReservationAction = async (id: string, action: 'confirm' | 'decline') => {
    try {
      console.log(`Attempting to ${action} booking with ID:`, id);
      
      if (action === 'confirm') {
        // Call approve booking API
        const res = await apiPut(`/user-booking/bookings/${id}/approve`, {});
        console.log(`API response for ${action}:`, res);
        
        if (res?.data?.success) {
          toast.success(res.data.message || 'Booking approved successfully!');
          
          // Update reservation status in the list
          setReservations(prev => 
            prev.map(r => r.id === id ? { ...r, status: 'confirmed' } : r)
          );
        } else {
          toast.error(res?.data?.message || 'Failed to approve booking');
        }
      } else if (action === 'decline') {
        // For decline, you may need a different endpoint
        console.log('Decline reservation:', id);
        toast.info('Decline feature to be implemented');
      }
    } catch (err: any) {
      console.error(`Failed to ${action} reservation:`, err);
      toast.error(err?.response?.data?.message || `Failed to ${action} booking`);
    }
  };

  const handleSendForApproval = () => {
    setApprovalStatus('pending');
    console.log('Sent for approval');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  // Capitalize first letter utility
  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Navigation items for sidebar
  const navItems = tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    onClick: () => setActiveTab(tab.id)
  }));

  // Rooms state & CRUD
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomFormOpen, setRoomFormOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [roomTypeOptions, setRoomTypeOptions] = useState<string[]>([]);
  const [bedTypeOptions, setBedTypeOptions] = useState<string[]>([]);
  const [roomForm, setRoomForm] = useState<any>({
    room_type: '',
    room_numbers: '', // comma separated
    description: '',
    bed_type: '',
    bed_count: 1,
    max_adults: 1,
    max_children: 0,
    max_occupancy: 1,
    base_price: 0,
    extra_adult_price: 0,
    extra_child_price: 0,
    floor_number: 1,
    min_stay_nights: 1,
    max_stay_nights: 30,
    advance_booking_days: 30,
    is_refundable: true,
    cancellation_hours: 24,
    amenities: '' // comma separated
  });

  const [editRoomForm, setEditRoomForm] = useState<any>({
    room_type: '',
    room_numbers: '',
    description: '',
    bed_type: '',
    bed_count: 1,
    max_adults: 1,
    max_children: 0,
    max_occupancy: 1,
    base_price: 0,
    extra_adult_price: 0,
    extra_child_price: 0,
    floor_number: 1,
    min_stay_nights: 1,
    max_stay_nights: 30,
    advance_booking_days: 30,
    is_refundable: true,
    cancellation_hours: 24,
    amenities: ''
  });

  const fetchRooms = async () => {
    try {
      const url = motelId ? `/rooms/motels/${motelId}/rooms` : '/rooms';
      const res = await apiGet(url);
      if (res?.data?.data) {
        const raw = Array.isArray(res.data.data) ? res.data.data : [res.data.data];

        const normalized = raw.map((r: any) => {
          const roomNumbers = Array.isArray(r.room_numbers)
            ? r.room_numbers
            : (r.all_room_numbers ? String(r.all_room_numbers).split(',').map((s: string) => s.trim()).filter(Boolean) : []);

          const amenities = Array.isArray(r.amenities)
            ? r.amenities
            : (typeof r.amenities === 'string' ? r.amenities.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

          return {
            ...r,
            room_numbers: roomNumbers,
            base_price: Number(r.base_price) || 0,
            extra_adult_price: Number(r.extra_adult_price) || 0,
            extra_child_price: Number(r.extra_child_price) || 0,
            is_refundable: r.is_refundable === 1 || r.is_refundable === true,
            amenities,
            total_rooms: r.total_rooms ?? r.actual_total_rooms ?? (roomNumbers ? roomNumbers.length : 0),
          };
        });

        setRooms(normalized);
      }
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [motelId]);

  // Fetch room type and bed type options
  const fetchRoomTypeOptions = async () => {
    try {
      const res = await apiGet('/room-name-options');
      if (res?.data?.data) setRoomTypeOptions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch room type options', err);
    }
  };

  const fetchBedTypeOptions = async () => {
    try {
      const res = await apiGet('/rooms/bed-types');
      if (res?.data?.data) setBedTypeOptions(res.data.data);
    } catch (err) {
      console.error('Failed to fetch bed type options', err);
    }
  };

  useEffect(() => {
    fetchRoomTypeOptions();
    fetchBedTypeOptions();
  }, []);

  const resetRoomForm = () => {
    setRoomForm({
      room_type: '',
      room_numbers: '',
      description: '',
      bed_type: '',
      bed_count: 1,
      max_adults: 1,
      max_children: 0,
      max_occupancy: 1,
      base_price: 0,
      extra_adult_price: 0,
      extra_child_price: 0,
      floor_number: 1,
      min_stay_nights: 1,
      max_stay_nights: 30,
      advance_booking_days: 30,
      is_refundable: true,
      cancellation_hours: 24,
      amenities: ''
    });
    setEditingRoom(null);
  };

  const handleSaveRoom = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      // Validate required fields
      if (!roomForm.room_type || String(roomForm.room_type).trim() === '') {
        toast.error('Room Type is required');
        return;
      }
      if (!roomForm.room_numbers || String(roomForm.room_numbers).trim() === '') {
        toast.error('Room Numbers are required');
        return;
      }
      if (!roomForm.bed_type || String(roomForm.bed_type).trim() === '') {
        toast.error('Bed Type is required');
        return;
      }
      if (!roomForm.base_price || Number(roomForm.base_price) <= 0) {
        toast.error('Base Price must be greater than 0');
        return;
      }
      if (!roomForm.max_occupancy || Number(roomForm.max_occupancy) <= 0) {
        toast.error('Max Occupancy must be greater than 0');
        return;
      }

      // normalize room_numbers and amenities into arrays and ensure numeric fields
      const roomNumbers = typeof roomForm.room_numbers === 'string'
        ? roomForm.room_numbers.split(',').map((s: string) => s.trim()).filter(Boolean)
        : Array.isArray(roomForm.room_numbers)
          ? roomForm.room_numbers
          : [];

      const amenitiesArr = typeof roomForm.amenities === 'string'
        ? roomForm.amenities.split(',').map((s: string) => s.trim()).filter(Boolean)
        : Array.isArray(roomForm.amenities)
          ? roomForm.amenities.map((s: string) => String(s).trim()).filter(Boolean)
          : [];

      const totalRoomsCount = Array.isArray(roomNumbers) ? roomNumbers.length : 0;

      const payload: any = {
        motelId: motelId || profileData?.motel_id || profileData?.motel_details?.motel_id || profileData?.user?.motel_id,
        room_type: String(roomForm.room_type || ''),
        room_numbers: roomNumbers,
        description: String(roomForm.description || ''),
        bed_type: String(roomForm.bed_type || ''),
        bed_count: Number(roomForm.bed_count) || 0,
        max_adults: Number(roomForm.max_adults) || 0,
        max_children: Number(roomForm.max_children) || 0,
        max_occupancy: Number(roomForm.max_occupancy) || 0,
        base_price: Number(roomForm.base_price) || 0,
        extra_adult_price: Number(roomForm.extra_adult_price) || 0,
        extra_child_price: Number(roomForm.extra_child_price) || 0,
        floor_number: Number(roomForm.floor_number) || 0,
        min_stay_nights: Number(roomForm.min_stay_nights) || 0,
        max_stay_nights: Number(roomForm.max_stay_nights) || 0,
        advance_booking_days: Number(roomForm.advance_booking_days) || 0,
        is_refundable: roomForm.is_refundable ? true : false,
        cancellation_hours: Number(roomForm.cancellation_hours) || 0,
        amenities: amenitiesArr,
      };

      if (editingRoom?.id) {
        const res = await apiPut(`/rooms/${editingRoom.id}`, payload);
        if (res?.data?.success) {
          toast.success(res.data.message || 'Room updated');
          // if API returned updated room object, update local list, otherwise refetch
          if (res.data.data && res.data.data.id) {
            setRooms(prev => prev.map(r => (r.id === res.data.data.id ? res.data.data : r)));
          } else {
            fetchRooms();
          }
          setRoomFormOpen(false);
          resetRoomForm();
        } else {
          toast.error(res?.data?.message || 'Failed to update room');
        }
      } else {
        // Validate motelId before API call
        if (!payload.motelId) {
          toast.error('Unable to identify motel. Please refresh and try again.');
          return;
        }
        const res = await apiPost('/rooms', payload);
        if (res?.data?.success) {
          toast.success('Room created');
          const created = res.data.data;
          if (created) {
            // Normalize created room so room_numbers and amenities are arrays and numeric fields are numbers
            let createdRoomNumbers: string[] = roomNumbers;
            try {
              if (Array.isArray(created.room_numbers)) createdRoomNumbers = created.room_numbers;
              else if (typeof created.room_numbers === 'string' && created.room_numbers.trim()) {
                // try JSON parse or comma-split
                try { createdRoomNumbers = JSON.parse(created.room_numbers); } catch { createdRoomNumbers = String(created.room_numbers).split(',').map((s: string) => s.trim()).filter(Boolean); }
              }
            } catch (e) { createdRoomNumbers = roomNumbers; }

            let createdAmenities: string[] = amenitiesArr;
            try {
              if (Array.isArray(created.amenities)) createdAmenities = created.amenities;
              else if (typeof created.amenities === 'string' && created.amenities.trim()) {
                try { createdAmenities = JSON.parse(created.amenities); } catch { createdAmenities = String(created.amenities).split(',').map((s: string) => s.trim()).filter(Boolean); }
              }
            } catch (e) { createdAmenities = amenitiesArr; }

            const normalizedCreated = {
              ...created,
              room_numbers: createdRoomNumbers,
              amenities: createdAmenities,
              base_price: Number(created.base_price) || Number(payload.base_price) || 0,
              extra_adult_price: Number(created.extra_adult_price) || Number(payload.extra_adult_price) || 0,
              extra_child_price: Number(created.extra_child_price) || Number(payload.extra_child_price) || 0,
              is_refundable: created.is_refundable === true || created.is_refundable === 1,
              total_rooms: created.total_rooms ?? createdRoomNumbers.length,
              available_rooms: created.available_rooms ?? createdRoomNumbers.length,
            };

            setRooms(prev => [normalizedCreated, ...prev]);
          } else {
            fetchRooms();
          }
          setRoomFormOpen(false);
          resetRoomForm();
        }
      }
    } catch (err: any) {
      console.error('Save room failed', err);
      toast.error(err?.response?.data?.message || 'Failed to save room');
    }
  };

  const handleEditRoom = (room: any) => {
    setEditingRoom(room);
    setEditRoomForm({
      ...room,
      room_numbers: Array.isArray(room.room_numbers) ? room.room_numbers.join(', ') : (room.room_numbers || ''),
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : (room.amenities || '')
    });
    setEditFormOpen(true);
  };

  const handleDeleteRoom = async (id: number) => {
    if (!confirm('Delete this room?')) return;
    try {
      const motelId = profileData?.motel_id || profileData?.motel_details?.motel_id || profileData?.user?.motel_id || profileData?.user?.motel_details?.motel_id;
      if (!motelId) {
        toast.error('Motel ID not found');
        return;
      }
      await apiDelete(`/rooms/motels/${motelId}/rooms/${id}`);
      toast.success('Room deleted');
      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Delete room failed', err);
      toast.error('Failed to delete room');
    }
  };

  const resetEditRoomForm = () => {
    setEditRoomForm({
      room_type: '',
      room_numbers: '',
      description: '',
      bed_type: '',
      bed_count: 1,
      max_adults: 1,
      max_children: 0,
      max_occupancy: 1,
      base_price: 0,
      extra_adult_price: 0,
      extra_child_price: 0,
      floor_number: 1,
      min_stay_nights: 1,
      max_stay_nights: 30,
      advance_booking_days: 30,
      is_refundable: true,
      cancellation_hours: 24,
      amenities: ''
    });
    setEditingRoom(null);
  };

  const handleUpdateRoom = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const roomId = editingRoom?.id || (editingRoom?.ids?.[0]);
    console.log('Update button clicked, editingRoom:', editingRoom, 'roomId:', roomId, 'editRoomForm:', editRoomForm);
    if (!roomId) {
      console.error('No roomId found');
      return;
    }

    try {
      // Validate required fields
      if (!editRoomForm.room_type || String(editRoomForm.room_type).trim() === '') {
        toast.error('Room Type is required');
        return;
      }
      if (!editRoomForm.room_numbers || String(editRoomForm.room_numbers).trim() === '') {
        toast.error('Room Numbers are required');
        return;
      }
      if (!editRoomForm.bed_type || String(editRoomForm.bed_type).trim() === '') {
        toast.error('Bed Type is required');
        return;
      }
      if (!editRoomForm.base_price || Number(editRoomForm.base_price) <= 0) {
        toast.error('Base Price must be greater than 0');
        return;
      }
      if (!editRoomForm.max_occupancy || Number(editRoomForm.max_occupancy) <= 0) {
        toast.error('Max Occupancy must be greater than 0');
        return;
      }

      const motelId = profileData?.motel_id || profileData?.motel_details?.motel_id || profileData?.user?.motel_id || profileData?.user?.motel_details?.motel_id;
      if (!motelId) {
        toast.error('Motel ID not found');
        return;
      }

      // Parse amenities
      const amenitiesArr = editRoomForm.amenities
        ? String(editRoomForm.amenities)
          .split(',')
          .map((a: string) => a.trim())
          .filter((a: string) => a)
        : [];

      const payload = {
        room_type: editRoomForm.room_type,
        room_numbers: editRoomForm.room_numbers,
        description: editRoomForm.description,
        bed_type: editRoomForm.bed_type,
        bed_count: Number(editRoomForm.bed_count) || 1,
        max_adults: Number(editRoomForm.max_adults) || 1,
        max_children: Number(editRoomForm.max_children) || 0,
        max_occupancy: Number(editRoomForm.max_occupancy) || 1,
        base_price: Number(editRoomForm.base_price) || 0,
        extra_adult_price: Number(editRoomForm.extra_adult_price) || 0,
        extra_child_price: Number(editRoomForm.extra_child_price) || 0,
        floor_number: Number(editRoomForm.floor_number) || 1,
        min_stay_nights: Number(editRoomForm.min_stay_nights) || 1,
        max_stay_nights: Number(editRoomForm.max_stay_nights) || 30,
        advance_booking_days: Number(editRoomForm.advance_booking_days) || 30,
        is_refundable: editRoomForm.is_refundable ? 1 : 0,
        cancellation_hours: Number(editRoomForm.cancellation_hours) || 0,
        amenities: amenitiesArr
      };

      console.log('About to call API PUT with:', {
        url: `/rooms/motels/${motelId}/rooms/${roomId}`,
        payload
      });
      const res = await apiPut(`/rooms/motels/${motelId}/rooms/${roomId}`, payload);
      console.log('API response:', res);
      if (res?.data?.success) {
        toast.success(res.data.message || 'Room updated successfully');
        if (res.data.data) {
          const responseRoom = res.data.data;
          const responseRoomId = responseRoom.id || responseRoom.ids?.[0];
          if (responseRoomId) {
            setRooms(prev => prev.map(r => (r.id === responseRoomId || r.ids?.[0] === responseRoomId ? responseRoom : r)));
          } else {
            fetchRooms();
          }
        } else {
          fetchRooms();
        }
        resetEditRoomForm();
        setEditFormOpen(false);
      }
    } catch (err: any) {
      console.error('Update room failed', err);
      toast.error(err?.response?.data?.message || 'Failed to update room');
    }
  };

  const handleDocUploadAPI = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await apiUploadFile(
        "/motel-documents/upload",
        file,
        "document",
        {
          document_type: "Business License",
          document_number: "BL-2024-123456",
          issued_by: "State Business Authority",
          // backend expects YYYY-MM-DD strings
          issued_at: "2024-01-15",
          expiry_at: "2025-12-31"
        }
      );

      // Add uploaded document to UI list
      setUploadedDocs((prev) => [
        ...prev,
        {
          id: response.data.data.id,
          name: response.data.data.file_name,
          uploadDate: new Date().toISOString().split("T")[0],
          status: "pending"
        }
      ]);

      toast.success("Document uploaded successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Document upload failed");
    }
  };

  const fetchDocumentById = async (id: number) => {
    try {
      const res = await apiGet(`/motel-documents/${id}`);
      const doc = res.data.data;

      if (!doc?.file_url) {
        toast.error("Document URL not found");
        return;
      }

      // OPEN THE DOCUMENT IN NEW TAB
      window.open(doc.file_url, "_blank");

    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load document");
    }
  };
  const fetchAllDocuments = async () => {
    try {
      const res = await apiGet("/motel-documents");

      // If API returns single object instead of array
      const docs = Array.isArray(res.data.data) ? res.data.data : [res.data.data];

      setUploadedDocs(docs);

    } catch (err: any) {
      console.error("Failed to fetch documents", err);
      toast.error("Failed to fetch documents");
    }
  };
  useEffect(() => {
    fetchAllDocuments();
  }, []);

  const handleDeleteDocument = async (id: number) => {
    if (!confirm("Do you really want to delete this document?")) return;

    try {
      await apiDelete(`/motel-documents/${id}`);

      toast.success("Document deleted successfully");

      // Remove document from UI list
      setUploadedDocs(prev => prev.filter(d => d.id !== id));

    } catch (error) {
      toast.error("Failed to delete document");
    }
  };
  const openEditModal = (doc: any) => {
    setEditDocData(doc);
    setEditModalOpen(true);
  };
  const handleUpdateDocument = async () => {
    try {
      const id = editDocData.id;

      // If there's a new file, send multipart via PUT; otherwise send JSON via PUT
      const normalizeDateString = (v: any) => {
        if (!v) return undefined;
        // if already in YYYY-MM-DD format
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
        // try to parse Date and format
        const d = new Date(String(v));
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          return `${yyyy}-${mm}-${dd}`;
        }
        return undefined;
      };

      const isValidDate = (s: string | undefined) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

      const issued_at_str = normalizeDateString(editDocData.issued_at);
      const expiry_at_str = normalizeDateString(editDocData.expiry_at);

      if (editDocData.newFile) {
        const formData = new FormData();
        formData.append('document', editDocData.newFile);
        formData.append('document_type', editDocData.document_type || '');
        formData.append('document_number', editDocData.document_number || '');
        formData.append('issued_by', editDocData.issued_by || '');
        if (isValidDate(issued_at_str)) formData.append('issued_at', issued_at_str as string);
        if (isValidDate(expiry_at_str)) formData.append('expiry_at', expiry_at_str as string);

        await apiPut(`/motel-documents/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        const payload: any = {
          document_type: editDocData.document_type,
          document_number: editDocData.document_number,
          issued_by: editDocData.issued_by,
        };
        if (isValidDate(issued_at_str)) payload.issued_at = issued_at_str;
        if (isValidDate(expiry_at_str)) payload.expiry_at = expiry_at_str;

        await apiPut(`/motel-documents/${id}`, payload);
      }

      toast.success('Document updated!');
      fetchAllDocuments();
      setEditModalOpen(false);

    } catch (error) {
      toast.error("Failed to update document");
    }
  };

 useEffect(() => {
  console.log("useEffect triggered, motelId:", user?.user?.motel_id);

  async function fetchMotel() {
    if (!user?.user?.motel_id) return;

    const res = await getMotelById(user.user.motel_id);
    console.log("Raw motel API response:", res);

    if (res?.success) {
      const m = res.motel_details;

      setMotelProfile({
        ...m,
        country_id: m.country_name ?? "",
        state_id: m.state_name ?? "",
        city_id: m.city_name ?? "",
      });
    }
  }

  fetchMotel();
}, [user]);


console.log("Motel Profile Data:", motelProfile);
useEffect(() => {
  async function fetchPolicies() {
    try {
      const res = await apiGet("/motel-policies");

      console.log("Policies API raw response:", res.data);

      if (res.data.success && res.data.data) {
        const p = res.data.data;

        setPolicies({
          cancellation_policy: p.cancellation_policy || "",
          terms_and_conditions: p.terms_and_conditions || "",
          is_smoking_allowed: p.is_smoking_allowed === 1,
          is_couple_friendly: p.is_couple_friendly === 1,
          id_proof_required: p.id_proof_required === 1,
        });
      }
    } catch (error) {
      console.error("Failed to fetch policies", error);
      toast.error("Failed to load motel policies");
    }
  }

  fetchPolicies();
}, []);
const handleUpdatePolicies = async () => {
  try {
    setPolicySaving(true);

    const payload = {
      cancellation_policy: policies.cancellation_policy,
      terms_and_conditions: policies.terms_and_conditions,
      is_smoking_allowed: policies.is_smoking_allowed,
      is_couple_friendly: policies.is_couple_friendly,
      id_proof_required: policies.id_proof_required,
    };

    await apiPut("/motel-policies", payload);

    toast.success("Policies updated successfully");
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message || "Failed to update policies"
    );
  } finally {
    setPolicySaving(false);
  }
};
useEffect(() => {
  async function fetchAmenities() {
    try {
      const res = await apiGet("/motel-amenities");

      console.log("Amenities API response:", res.data);

      if (res.data.success && res.data.data) {
        const a = res.data.data;

        setAmenities({
          parking_available: a.parking_available === 1,
          wifi_available: a.wifi_available === 1,
          ac_available: a.ac_available === 1,
          restaurant_available: a.restaurant_available === 1,
          swimming_pool: a.swimming_pool === 1,
          power_backup: a.power_backup === 1,
          cctv: a.cctv === 1,
          room_service: a.room_service === 1,
          laundry_service: a.laundry_service === 1,
          pet_friendly: a.pet_friendly === 1,
        });
      }
    } catch (error) {
      console.error("Failed to fetch amenities", error);
      toast.error("Failed to load amenities");
    }
  }

  fetchAmenities();
}, []);

const [amenitySaving, setAmenitySaving] = useState(false);

const handleUpdateAmenities = async () => {
  try {
    setAmenitySaving(true);

    const payload = {
      parking_available: amenities.parking_available ? 1 : 0,
      wifi_available: amenities.wifi_available ? 1 : 0,
      ac_available: amenities.ac_available ? 1 : 0,
      restaurant_available: amenities.restaurant_available ? 1 : 0,
      swimming_pool: amenities.swimming_pool ? 1 : 0,
      power_backup: amenities.power_backup ? 1 : 0,
      cctv: amenities.cctv ? 1 : 0,
      room_service: amenities.room_service ? 1 : 0,
      laundry_service: amenities.laundry_service ? 1 : 0,
      pet_friendly: amenities.pet_friendly ? 1 : 0,
    };

    await apiPut("/motel-amenities", payload);

    toast.success("Amenities updated successfully");
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message || "Failed to update amenities"
    );
  } finally {
    setAmenitySaving(false);
  }
};



  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItem={activeTab}
        navItems={navItems}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <DashboardHeader
          title={capitalizeFirstLetter(profileData?.motel_details?.motel_name || 'Motel Dashboard')}
          subtitle="Motel Owner Dashboard"
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName={capitalizeFirstLetter(profileData?.first_name ? `${profileData.first_name} ${profileData.last_name}` : 'Motel Owner')}
          userEmail={profileData?.email}
          userRole="Motel Owner"
          avatarImage={motelLogo?.file_url}
          avatarIcon={!motelLogo && <Building2 className="w-5 h-5 text-white" />}
          avatarGradient="from-cyan-500 to-blue-600"
          onChangePassword={() => setShowChangePasswordModal(true)}
          onUpdateProfile={() => setActiveTab('profile')}
          onLogout={handleLogout}
          rightContent={(
            <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                approvalStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
              }`}>
              {approvalStatus === 'approved' ? '✓ Approved' :
                approvalStatus === 'pending' ? '⏳ Pending' :
                  '✗ Rejected'}
            </div>
          )}
        />

        {/* Content Area */}
        <main className="p-4 sm:p-6 flex-1">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
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

                {/* Quick Actions */}
                <motion.div
                  className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-lg sm:text-xl font-black mb-3 sm:mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    {[
                      { label: 'Update Profile', icon: Settings, action: () => setActiveTab('profile') },
                      { label: 'Upload Images', icon: Image, action: () => setActiveTab('images') },
                      { label: 'Upload Docs', icon: FileText, action: () => setActiveTab('documents') },
                      { label: 'View Reservations', icon: Calendar, action: () => setActiveTab('reservations') },
                    ].map((action, index) => (
                      <motion.button
                        key={action.label}
                        onClick={action.action}
                        className="flex flex-col items-center gap-2 p-3 sm:p-4 border-2 border-gray-200 rounded-lg lg:rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition-all cursor-pointer"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <action.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-cyan-600" />
                        <span className="text-xs sm:text-sm font-semibold text-center">{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Recent Reservations */}
                <motion.div
                  className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-lg sm:text-xl font-black mb-3 sm:mb-4">Recent Reservations</h2>
                  <div className="space-y-2 sm:space-y-3">
                    {reservations.slice(0, 3).map((res, index) => (
                      <motion.div
                        key={res.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 p-3 border-2 border-gray-200 rounded-lg lg:rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <div>
                          <p className="font-semibold text-sm sm:text-base">{res.guestName}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{res.checkIn} → {res.checkOut}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${res.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            res.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                          }`}>
                          {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-gray-50 rounded-xl border border-gray-300 p-4 mb-6">
                  <h3 className="font-semibold mb-4 text-gray-800">Motel Logo</h3>

                  {motelLogo ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={motelLogo.file_url}
                        alt="Motel Logo"
                        className="w-24 h-24 object-contain border border-gray-300 rounded bg-white"
                      />

                      <button
                        onClick={handleDeleteLogo}
                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-700 shadow"
                      >
                        Delete Logo
                      </button>
                    </div>
                  ) : (
                    <label className="inline-block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />

                      <span className="inline-block px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-700 shadow">
                        Upload Logo
                      </span>
                    </label>
                  )}
                </div>

                <MotelSetupWizard
                  profileData={motelProfile}
                  onProfileUpdate={setMotelProfile}
                  uploadedImages={uploadedImages.map(img => img.file_url)}
                  uploadedDocs={uploadedDocs}
                  onImageUpload={handleImageUploadAPI}
                  onDocUpload={handleDocUpload}
                  onComplete={handleSendForApproval}
                />
                <div className="mt-4">
                  <Button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="bg-red-500 text-white hover:bg-red-600"
                  >
                    Change Password
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <motion.div
                key="images"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-black">Motel Images</h2>
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg lg:rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Upload Image</span>
                  </button>
                  
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {uploadedImages.map((img) => (
                    <motion.div
                      key={img.id}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200"
                    >
                      <ImageWithFallback
                        src={img.file_url}
                        alt={img.caption || "Motel Image"}
                        className="w-full h-full object-cover"
                      />

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="
    absolute top-2 right-2
    z-50
    w-9 h-9
    flex items-center justify-center
    rounded-full
    bg-red-500
    hover:bg-red-600
    shadow-lg
  "
                      >
                        <XCircle className="w-5 h-5 text-white" />
                      </button>


                      {/* Primary badge */}
                      {img.is_primary && (
                        <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </span>
                      )}
                    </motion.div>
                  ))}



                  {/* upload placeholder removed - use Upload Image button above */}
                </div>
              </motion.div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-black">Tax Documents</h2>
                  <button
                    onClick={() => setShowDocModal(true)}
                    className="px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg lg:rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Upload Document</span>
                  </button>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {uploadedDocs.map((doc, index) => (
                    <motion.div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 border-2 border-gray-200 rounded-lg lg:rounded-xl hover:border-cyan-500 transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {doc.file_name}
                          </h3>

                          <p className="text-xs sm:text-sm text-gray-600">
                            Type: {doc.document_type}
                          </p>

                          <p className="text-xs sm:text-sm text-gray-500">
                            Uploaded: {new Date(doc.created_at * 1000).toLocaleDateString()}
                          </p>
                        </div>

                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
                        {/* <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${doc.status === 'verified' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                          {doc.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                        </span> */}
                        <button
                          onClick={() => fetchDocumentById(doc.id)}  // call API here
                          className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(doc)}
                          className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>


                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Document Upload Modal */}
                <Modal isOpen={showDocModal} onClose={() => setShowDocModal(false)} title="Upload Document" size="md">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!docForm.document) { toast.error('Please select a document file'); return; }
                    if (!docForm.document_type) { toast.error('Document type is required'); return; }

                    // backend expects YYYY-MM-DD strings for dates
                    const isValidDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

                    if (docForm.issued_at && !isValidDate(docForm.issued_at)) { toast.error('Invalid Issued At date. Use YYYY-MM-DD'); return; }
                    if (docForm.expiry_at && !isValidDate(docForm.expiry_at)) { toast.error('Invalid Expiry At date. Use YYYY-MM-DD'); return; }

                    try {
                      const res = await apiUploadFile('/motel-documents/upload', docForm.document, 'document', {
                        document_type: docForm.document_type,
                        document_number: docForm.document_number,
                        issued_by: docForm.issued_by,
                        // pass date strings directly
                        issued_at: docForm.issued_at || '',
                        expiry_at: docForm.expiry_at || '',
                        motel_id: motelId || (profileData?.user?.motel_details?.motel_id) || ''
                      });

                      const d = res.data.data;
                      setUploadedDocs(prev => [d, ...prev]);
                      toast.success(res?.data?.message || 'Document uploaded successfully');
                      setShowDocModal(false);
                      setDocForm({ document: null, document_type: '', document_number: '', issued_by: '', issued_at: '', expiry_at: '' });
                    } catch (err: any) {
                      console.error('Document upload failed', err);
                      toast.error(err?.response?.data?.message || 'Document upload failed');
                    }
                  }} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Document File</label>
                      <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e => setDocForm(prev => ({ ...prev, document: e.target.files?.[0] || null }))} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Document Type <span className="text-red-500">*</span></label>
                      <input value={docForm.document_type} onChange={e => setDocForm(prev => ({ ...prev, document_type: e.target.value }))} className="p-2 border rounded w-full" placeholder="e.g. Business License" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
                        <input value={docForm.document_number} onChange={e => setDocForm(prev => ({ ...prev, document_number: e.target.value }))} className="p-2 border rounded w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issued By</label>
                        <input value={docForm.issued_by} onChange={e => setDocForm(prev => ({ ...prev, issued_by: e.target.value }))} className="p-2 border rounded w-full" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issued At</label>
                        <input type="date" value={docForm.issued_at} onChange={e => setDocForm(prev => ({ ...prev, issued_at: e.target.value }))} className="p-2 border rounded w-full" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry At</label>
                        <input type="date" value={docForm.expiry_at} onChange={e => setDocForm(prev => ({ ...prev, expiry_at: e.target.value }))} className="p-2 border rounded w-full" />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 rounded border">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-cyan-500 text-white rounded">Upload Document</button>
                    </div>
                  </form>
                </Modal>
              </motion.div>
            )}

            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
              <motion.div
                key="reservations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100"
              >
                <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">Manage Reservations</h2>

                {/* Search Bar */}
                <div className="mb-6 flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Search by Reference ID or Guest name..."
                    value={reservationSearchQuery}
                    onChange={(e) => setReservationSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                  {reservationSearchQuery && (
                    <button
                      onClick={() => setReservationSearchQuery('')}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Date and Status Filters */}
                <div className="mb-6 flex flex-wrap gap-3 items-center">
                  <input
                    type="date"
                    value={reservationCheckInFilter}
                    onChange={(e) => {
                      setReservationCheckInFilter(e.target.value);
                      // If check-out is set and is earlier than check-in, clear it
                      if (reservationCheckOutFilter && e.target.value > reservationCheckOutFilter) {
                        setReservationCheckOutFilter('');
                      }
                    }}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
                    placeholder="Check-in from"
                  />
                  <input
                    type="date"
                    value={reservationCheckOutFilter}
                    onChange={(e) => setReservationCheckOutFilter(e.target.value)}
                    min={reservationCheckInFilter}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors"
                    placeholder="Check-out to"
                  />

                  {(reservationCheckInFilter || reservationCheckOutFilter) && (
                    <button
                      onClick={() => {
                        setReservationCheckInFilter('');
                        setReservationCheckOutFilter('');
                      }}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all"
                    >
                      Clear Dates
                    </button>
                  )}

                  <button
                    onClick={() => setReservationStatusFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      reservationStatusFilter === 'pending'
                        ? 'bg-orange-100 text-orange-700 border-2 border-orange-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Pending
                  </button>

                  <button
                    onClick={() => setReservationStatusFilter('confirmed')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      reservationStatusFilter === 'confirmed'
                        ? 'bg-green-100 text-green-700 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Confirmed
                  </button>

                  <button
                    onClick={() => setReservationStatusFilter('cancelled')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      reservationStatusFilter === 'cancelled'
                        ? 'bg-red-100 text-red-700 border-2 border-red-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Cancelled
                  </button>

                  <button
                    onClick={() => setReservationStatusFilter(null)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      reservationStatusFilter === null
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Statuses
                  </button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-black text-gray-700">Reference ID</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Guest</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Check-in</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Check-out</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Rooms</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filteredReservations = reservations.filter(reservation => {
                          const searchLower = reservationSearchQuery.toLowerCase();
                          const referenceMatch = reservation.bookingReference.toLowerCase().includes(searchLower);
                          const guestMatch = reservation.guestName.toLowerCase().includes(searchLower);
                          const searchMatches = referenceMatch || guestMatch;

                          // Status filter
                          const statusMatch = reservationStatusFilter === null ? true : reservation.status === reservationStatusFilter;

                          // Date filter logic
                          let dateMatches = true;
                          if (reservationCheckInFilter || reservationCheckOutFilter) {
                            const reservationCheckIn = reservation.checkIn;
                            const reservationCheckOut = reservation.checkOut;
                            
                            if (reservationCheckInFilter && reservationCheckOutFilter) {
                              dateMatches = reservationCheckIn >= reservationCheckInFilter && reservationCheckOut <= reservationCheckOutFilter;
                            } else if (reservationCheckInFilter) {
                              dateMatches = reservationCheckIn >= reservationCheckInFilter;
                            } else if (reservationCheckOutFilter) {
                              dateMatches = reservationCheckOut <= reservationCheckOutFilter;
                            }
                          }

                          return searchMatches && statusMatch && dateMatches;
                        });

                        return filteredReservations.length > 0 ? filteredReservations.map((reservation, index) => (
                        <motion.tr
                          key={reservation.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <td className="py-3 px-4 font-semibold text-cyan-600">{reservation.bookingReference}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold">{reservation.guestName}</p>
                              <p className="text-xs text-gray-600">{reservation.guestEmail}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{reservation.checkIn}</td>
                          <td className="py-3 px-4 text-gray-600">{reservation.checkOut}</td>
                          <td className="py-3 px-4 text-gray-600">{reservation.rooms}</td>
                          <td className="py-3 px-4 font-semibold">${reservation.amount}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${reservation.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                reservation.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                  reservation.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                              }`}>
                              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => {
                                  const rawReservation = reservationsRawData.find((r: any) => String(r.id) === reservation.id);
                                  setSelectedReservation(rawReservation);
                                  setShowReservationDetailModal(true);
                                }}
                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {reservation.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleReservationAction(reservation.id, 'confirm')}
                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReservationAction(reservation.id, 'decline')}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )) : (
                        <tr>
                          <td colSpan={8} className="py-6 px-4 text-center text-gray-600">
                            No reservations found matching your search.
                          </td>
                        </tr>
                      );
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-3">
                  {(() => {
                    const filteredReservations = reservations.filter(reservation => {
                      const searchLower = reservationSearchQuery.toLowerCase();
                      const referenceMatch = reservation.bookingReference.toLowerCase().includes(searchLower);
                      const guestMatch = reservation.guestName.toLowerCase().includes(searchLower);
                      const searchMatches = referenceMatch || guestMatch;

                      // Status filter
                      const statusMatch = reservationStatusFilter === null ? true : reservation.status === reservationStatusFilter;

                      // Date filter logic
                      let dateMatches = true;
                      if (reservationCheckInFilter || reservationCheckOutFilter) {
                        const reservationCheckIn = reservation.checkIn;
                        const reservationCheckOut = reservation.checkOut;
                        
                        if (reservationCheckInFilter && reservationCheckOutFilter) {
                          dateMatches = reservationCheckIn >= reservationCheckInFilter && reservationCheckOut <= reservationCheckOutFilter;
                        } else if (reservationCheckInFilter) {
                          dateMatches = reservationCheckIn >= reservationCheckInFilter;
                        } else if (reservationCheckOutFilter) {
                          dateMatches = reservationCheckOut <= reservationCheckOutFilter;
                        }
                      }

                      return searchMatches && statusMatch && dateMatches;
                    });

                    return filteredReservations.length > 0 ? filteredReservations.map((reservation, index) => (
                    <motion.div
                      key={reservation.id}
                      className="border-2 border-gray-200 rounded-xl p-4 space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-cyan-600 text-sm">{reservation.bookingReference}</p>
                          <p className="font-semibold">{reservation.guestName}</p>
                          <p className="text-xs text-gray-600">{reservation.guestEmail}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${reservation.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            reservation.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                              reservation.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                          }`}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-600">Check-in</p>
                          <p className="font-semibold">{reservation.checkIn}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Check-out</p>
                          <p className="font-semibold">{reservation.checkOut}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Rooms</p>
                          <p className="font-semibold">{reservation.rooms}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Amount</p>
                          <p className="font-semibold">${reservation.amount}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            const rawReservation = reservationsRawData.find((r: any) => String(r.id) === reservation.id);
                            setSelectedReservation(rawReservation);
                            setShowReservationDetailModal(true);
                          }}
                          className="flex-1 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm font-semibold"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        {reservation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReservationAction(reservation.id, 'confirm')}
                              className="flex-1 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm font-semibold"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Confirm
                            </button>
                            <button
                              onClick={() => handleReservationAction(reservation.id, 'decline')}
                              className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm font-semibold"
                            >
                              <XCircle className="w-4 h-4" />
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )) : (
                    <div className="py-8 px-4 text-center text-gray-600">
                      No reservations found matching your search.
                    </div>
                  );
                  })()}
                </div>
              </motion.div>
            )}

            {/* Reservation Details Modal */}
            {showReservationDetailModal && selectedReservation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={() => setShowReservationDetailModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">Reservation Details</h3>
                        <p className="text-cyan-100 mt-1">Reference: {selectedReservation.booking_reference}</p>
                      </div>
                      <button
                        onClick={() => setShowReservationDetailModal(false)}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 space-y-6">
                    {/* Guest Information */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-cyan-600" />
                        Guest Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Guest Name</p>
                          <p className="text-gray-800 font-semibold">{selectedReservation.contact_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Email</p>
                          <p className="text-gray-800 font-semibold">{selectedReservation.contact_email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Phone</p>
                          <p className="text-gray-800 font-semibold">{selectedReservation.contact_phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Number of Guests</p>
                          <p className="text-gray-800 font-semibold">{selectedReservation.guests || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-cyan-600" />
                        Booking Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Check-in</p>
                          <p className="text-gray-800 font-semibold">{new Date(selectedReservation.check_in).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Check-out</p>
                          <p className="text-gray-800 font-semibold">{new Date(selectedReservation.check_out).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Number of Nights</p>
                          <p className="text-gray-800 font-semibold">{selectedReservation.nights || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 font-semibold">Booking Date</p>
                          <p className="text-gray-800 font-semibold">{new Date(selectedReservation.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {selectedReservation.special_requests && (
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Send className="w-5 h-5 text-cyan-600" />
                          Special Requests
                        </h4>
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                          <p className="text-gray-800">{selectedReservation.special_requests}</p>
                        </div>
                      </div>
                    )}

                    {/* Amount Details */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-cyan-600" />
                        Payment Details
                      </h4>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-700 font-semibold">Total Amount:</p>
                          <p className="text-2xl font-bold text-green-600">{selectedReservation.total_amount || '$0.00'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4">Status</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          selectedReservation.status === 1 ? 'bg-green-100 text-green-700' :
                          selectedReservation.status === 2 ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {selectedReservation.status === 1 ? 'Confirmed' :
                           selectedReservation.status === 2 ? 'Cancelled' :
                           'Pending'}
                        </span>
                      </div>
                      {selectedReservation.cancellation_reason && (
                        <div className="mt-3 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                          <p className="text-sm text-gray-700"><span className="font-semibold">Cancellation Reason:</span> {selectedReservation.cancellation_reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      {selectedReservation.status === 0 && (
                        <>
                          <button
                            onClick={() => {
                              handleReservationAction(String(selectedReservation.id), 'confirm');
                              setShowReservationDetailModal(false);
                            }}
                            className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Confirm Booking
                          </button>
                          <button
                            onClick={() => {
                              handleReservationAction(String(selectedReservation.id), 'decline');
                              setShowReservationDetailModal(false);
                            }}
                            className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Decline Booking
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setShowReservationDetailModal(false)}
                        className="flex-1 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Rooms Tab */}
            {/* Image Upload Modal */}
            <Modal isOpen={showImageModal} onClose={() => setShowImageModal(false)} title="Upload Image" size="md">
              <form onSubmit={(e) => handleImageFormSubmit(e, false)} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image File</label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={e => setImageForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image name <span className="text-red-500">*</span></label>
                  <select value={imageForm.image_type} onChange={e => setImageForm(prev => ({ ...prev, image_type: e.target.value }))} className="p-2 border rounded w-full">
                    <option value="">Select image type</option>
                    {imageTypeOptions.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type <span className="text-red-500">*</span></label>
                  <select value={imageForm.room_type} onChange={e => setImageForm(prev => ({ ...prev, room_type: e.target.value }))} className="p-2 border rounded w-full">
                    <option value="">Select room type</option>
                    {roomTypeOptions.length ? roomTypeOptions.map(rt => (<option key={rt} value={rt}>{rt}</option>)) : <option value="">No room types</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                  <input value={imageForm.caption} onChange={e => setImageForm(prev => ({ ...prev, caption: e.target.value }))} className="p-2 border rounded w-full" placeholder="Optional caption" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input type="number" value={imageForm.display_order} onChange={e => setImageForm(prev => ({ ...prev, display_order: Number(e.target.value) }))} className="p-2 border rounded w-full" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={imageForm.is_primary} onChange={e => setImageForm(prev => ({ ...prev, is_primary: e.target.checked }))} />
                      <span className="text-sm">Is Primary</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowImageModal(false)} className="px-4 py-2 rounded border">Cancel</button>
                  <button type="button" onClick={(e) => handleImageFormSubmit(null, true)} className="px-4 py-2 bg-slate-500 text-white rounded">Upload & Add Another</button>
                  <button type="submit" className="px-4 py-2 bg-cyan-500 text-white rounded">Upload</button>
                </div>
              </form>
            </Modal>
            {activeTab === 'rooms' && (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-black">Manage Rooms</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setRoomFormOpen(!roomFormOpen); if (!roomFormOpen) resetRoomForm(); }}
                      className="px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                    >
                      {roomFormOpen ? 'Close' : 'Add Room'}
                    </button>
                  </div>
                </div>

                <Modal isOpen={roomFormOpen} onClose={() => setRoomFormOpen(false)} title={editingRoom ? 'Edit Room' : 'Add Room'} size="xl">
                  <form onSubmit={handleSaveRoom} className="space-y-3 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="room_type" className="block text-sm font-medium text-gray-700 mb-1">Room Type <span className="text-red-500">*</span></label>
                        <select id="room_type" value={roomForm.room_type} onChange={e => setRoomForm({...roomForm, room_type: e.target.value})} className="p-2 border rounded w-full">
                          <option value="">Select room type</option>
                          {roomTypeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="room_numbers" className="block text-sm font-medium text-gray-700 mb-1">Room Numbers <span className="text-red-500">*</span></label>
                        <input id="room_numbers" value={roomForm.room_numbers} onChange={e => setRoomForm({...roomForm, room_numbers: e.target.value})} placeholder="e.g. 201, 202" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="bed_type" className="block text-sm font-medium text-gray-700 mb-1">Bed Type <span className="text-red-500">*</span></label>
                        <select id="bed_type" value={roomForm.bed_type} onChange={e => setRoomForm({...roomForm, bed_type: e.target.value})} className="p-2 border rounded w-full">
                          <option value="">Select bed type</option>
                          {bedTypeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="bed_count" className="block text-sm font-medium text-gray-700 mb-1">Bed Count</label>
                        <input id="bed_count" type="number" value={roomForm.bed_count} onChange={e => setRoomForm({...roomForm, bed_count: Number(e.target.value)})} placeholder="1" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">Base Price <span className="text-red-500">*</span></label>
                        <input id="base_price" type="number" value={roomForm.base_price} onChange={e => setRoomForm({...roomForm, base_price: Number(e.target.value)})} placeholder="150.00" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                        <input id="amenities" value={roomForm.amenities} onChange={e => setRoomForm({...roomForm, amenities: e.target.value})} placeholder="WiFi, TV, Air Conditioning" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="extra_adult_price" className="block text-sm font-medium text-gray-700 mb-1">Extra Adult Price</label>
                        <input id="extra_adult_price" type="number" value={roomForm.extra_adult_price} onChange={e => setRoomForm({...roomForm, extra_adult_price: Number(e.target.value)})} placeholder="25.00" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="extra_child_price" className="block text-sm font-medium text-gray-700 mb-1">Extra Child Price</label>
                        <input id="extra_child_price" type="number" value={roomForm.extra_child_price} onChange={e => setRoomForm({...roomForm, extra_child_price: Number(e.target.value)})} placeholder="15.00" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="max_adults" className="block text-sm font-medium text-gray-700 mb-1">Max Adults</label>
                        <input id="max_adults" type="number" value={roomForm.max_adults} onChange={e => setRoomForm({...roomForm, max_adults: Number(e.target.value)})} placeholder="2" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="max_children" className="block text-sm font-medium text-gray-700 mb-1">Max Children</label>
                        <input id="max_children" type="number" value={roomForm.max_children} onChange={e => setRoomForm({...roomForm, max_children: Number(e.target.value)})} placeholder="2" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="max_occupancy" className="block text-sm font-medium text-gray-700 mb-1">Max Occupancy <span className="text-red-500">*</span></label>
                        <input id="max_occupancy" type="number" value={roomForm.max_occupancy} onChange={e => setRoomForm({...roomForm, max_occupancy: Number(e.target.value)})} placeholder="4" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="floor_number" className="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
                        <input id="floor_number" type="number" value={roomForm.floor_number} onChange={e => setRoomForm({...roomForm, floor_number: Number(e.target.value)})} placeholder="2" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="min_stay_nights" className="block text-sm font-medium text-gray-700 mb-1">Min Stay Nights</label>
                        <input id="min_stay_nights" type="number" value={roomForm.min_stay_nights} onChange={e => setRoomForm({...roomForm, min_stay_nights: Number(e.target.value)})} placeholder="1" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="max_stay_nights" className="block text-sm font-medium text-gray-700 mb-1">Max Stay Nights</label>
                        <input id="max_stay_nights" type="number" value={roomForm.max_stay_nights} onChange={e => setRoomForm({...roomForm, max_stay_nights: Number(e.target.value)})} placeholder="30" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="advance_booking_days" className="block text-sm font-medium text-gray-700 mb-1">Advance Booking Days</label>
                        <input id="advance_booking_days" type="number" value={roomForm.advance_booking_days} onChange={e => setRoomForm({...roomForm, advance_booking_days: Number(e.target.value)})} placeholder="100" className="p-2 border rounded w-full" />
                      </div>

                      <div className="md:col-span-1 flex items-center gap-3">
                        <input id="is_refundable" type="checkbox" checked={!!roomForm.is_refundable} onChange={e => setRoomForm({...roomForm, is_refundable: e.target.checked})} className="w-4 h-4" />
                        <label htmlFor="is_refundable" className="text-sm font-medium text-gray-700">Is Refundable</label>
                      </div>

                      <div>
                        <label htmlFor="cancellation_hours" className="block text-sm font-medium text-gray-700 mb-1">Cancellation Hours</label>
                        <input id="cancellation_hours" type="number" value={roomForm.cancellation_hours} onChange={e => setRoomForm({...roomForm, cancellation_hours: Number(e.target.value)})} placeholder="24" className="p-2 border rounded w-full" />
                      </div>

                      <div className="md:col-span-3">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="description" value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})} placeholder="Spacious king room with city view and modern amenities" className="p-2 border rounded w-full" rows={3} />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => { resetRoomForm(); setRoomFormOpen(false); }} className="px-4 py-2 rounded border">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-cyan-500 text-white rounded">{editingRoom ? 'Update Room' : 'Create Room'}</button>
                    </div>
                  </form>
                </Modal>

                {/* Edit Room Modal */}
                <Modal isOpen={editFormOpen} onClose={() => { resetEditRoomForm(); setEditFormOpen(false); }} title="Edit Room" size="xl">
                  <form onSubmit={handleUpdateRoom} className="space-y-3 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="edit_room_type" className="block text-sm font-medium text-gray-700 mb-1">Room Type <span className="text-red-500">*</span></label>
                        <select id="edit_room_type" value={editRoomForm.room_type} onChange={e => setEditRoomForm({...editRoomForm, room_type: e.target.value})} className="p-2 border rounded w-full">
                          <option value="">Select room type</option>
                          {roomTypeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="edit_room_numbers" className="block text-sm font-medium text-gray-700 mb-1">Room Numbers <span className="text-red-500">*</span></label>
                        <input id="edit_room_numbers" value={editRoomForm.room_numbers} onChange={e => setEditRoomForm({...editRoomForm, room_numbers: e.target.value})} placeholder="e.g. 201, 202" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="edit_bed_type" className="block text-sm font-medium text-gray-700 mb-1">Bed Type <span className="text-red-500">*</span></label>
                        <select id="edit_bed_type" value={editRoomForm.bed_type} onChange={e => setEditRoomForm({...editRoomForm, bed_type: e.target.value})} className="p-2 border rounded w-full">
                          <option value="">Select bed type</option>
                          {bedTypeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="edit_bed_count" className="block text-sm font-medium text-gray-700 mb-1">Bed Count</label>
                        <input id="edit_bed_count" type="number" value={editRoomForm.bed_count} onChange={e => setEditRoomForm({...editRoomForm, bed_count: Number(e.target.value)})} placeholder="1" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="edit_base_price" className="block text-sm font-medium text-gray-700 mb-1">Base Price <span className="text-red-500">*</span></label>
                        <input id="edit_base_price" type="number" value={editRoomForm.base_price} onChange={e => setEditRoomForm({...editRoomForm, base_price: Number(e.target.value)})} placeholder="150.00" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="edit_amenities" className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
                        <input id="edit_amenities" value={editRoomForm.amenities} onChange={e => setEditRoomForm({...editRoomForm, amenities: e.target.value})} placeholder="WiFi, TV, Air Conditioning" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="edit_extra_adult_price" className="block text-sm font-medium text-gray-700 mb-1">Extra Adult Price</label>
                        <input id="edit_extra_adult_price" type="number" value={editRoomForm.extra_adult_price} onChange={e => setEditRoomForm({...editRoomForm, extra_adult_price: Number(e.target.value)})} placeholder="25.00" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="edit_extra_child_price" className="block text-sm font-medium text-gray-700 mb-1">Extra Child Price</label>
                        <input id="edit_extra_child_price" type="number" value={editRoomForm.extra_child_price} onChange={e => setEditRoomForm({...editRoomForm, extra_child_price: Number(e.target.value)})} placeholder="15.00" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="edit_max_adults" className="block text-sm font-medium text-gray-700 mb-1">Max Adults</label>
                        <input id="edit_max_adults" type="number" value={editRoomForm.max_adults} onChange={e => setEditRoomForm({...editRoomForm, max_adults: Number(e.target.value)})} placeholder="2" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="edit_max_children" className="block text-sm font-medium text-gray-700 mb-1">Max Children</label>
                        <input id="edit_max_children" type="number" value={editRoomForm.max_children} onChange={e => setEditRoomForm({...editRoomForm, max_children: Number(e.target.value)})} placeholder="2" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="edit_max_occupancy" className="block text-sm font-medium text-gray-700 mb-1">Max Occupancy <span className="text-red-500">*</span></label>
                        <input id="edit_max_occupancy" type="number" value={editRoomForm.max_occupancy} onChange={e => setEditRoomForm({...editRoomForm, max_occupancy: Number(e.target.value)})} placeholder="4" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="edit_floor_number" className="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
                        <input id="edit_floor_number" type="number" value={editRoomForm.floor_number} onChange={e => setEditRoomForm({...editRoomForm, floor_number: Number(e.target.value)})} placeholder="2" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="edit_min_stay_nights" className="block text-sm font-medium text-gray-700 mb-1">Min Stay Nights</label>
                        <input id="edit_min_stay_nights" type="number" value={editRoomForm.min_stay_nights} onChange={e => setEditRoomForm({...editRoomForm, min_stay_nights: Number(e.target.value)})} placeholder="1" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="edit_max_stay_nights" className="block text-sm font-medium text-gray-700 mb-1">Max Stay Nights</label>
                        <input id="edit_max_stay_nights" type="number" value={editRoomForm.max_stay_nights} onChange={e => setEditRoomForm({...editRoomForm, max_stay_nights: Number(e.target.value)})} placeholder="30" className="p-2 border rounded w-full" />
                      </div>

                      <div>
                        <label htmlFor="edit_advance_booking_days" className="block text-sm font-medium text-gray-700 mb-1">Advance Booking Days</label>
                        <input id="edit_advance_booking_days" type="number" value={editRoomForm.advance_booking_days} onChange={e => setEditRoomForm({...editRoomForm, advance_booking_days: Number(e.target.value)})} placeholder="100" className="p-2 border rounded w-full" />
                      </div>

                      <div className="md:col-span-1 flex items-center gap-3">
                        <input id="edit_is_refundable" type="checkbox" checked={!!editRoomForm.is_refundable} onChange={e => setEditRoomForm({...editRoomForm, is_refundable: e.target.checked})} className="w-4 h-4" />
                        <label htmlFor="edit_is_refundable" className="text-sm font-medium text-gray-700">Is Refundable</label>
                      </div>

                      <div>
                        <label htmlFor="edit_cancellation_hours" className="block text-sm font-medium text-gray-700 mb-1">Cancellation Hours</label>
                        <input id="edit_cancellation_hours" type="number" value={editRoomForm.cancellation_hours} onChange={e => setEditRoomForm({...editRoomForm, cancellation_hours: Number(e.target.value)})} placeholder="24" className="p-2 border rounded w-full" />
                      </div>

                      <div className="md:col-span-3">
                        <label htmlFor="edit_description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="edit_description" value={editRoomForm.description} onChange={e => setEditRoomForm({...editRoomForm, description: e.target.value})} placeholder="Spacious king room with city view and modern amenities" className="p-2 border rounded w-full" rows={3} />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button type="button" onClick={() => { resetEditRoomForm(); setEditFormOpen(false); }} className="px-4 py-2 rounded border">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-cyan-500 text-white rounded">Update Room</button>
                    </div>
                  </form>
                </Modal>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-black text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Available Rooms</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Max Occupancy</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Price</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Amenities</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((r, idx) => (
                        <tr key={r.id || idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold">{r.room_type}</td>
                          <td className="py-3 px-4">{r.available_rooms || 0}</td>
                          <td className="py-3 px-4">{r.max_occupancy}</td>
                          <td className="py-3 px-4">${r.base_price}</td>
                          <td className="py-3 px-4">{Array.isArray(r.amenities) ? r.amenities.join(', ') : r.amenities}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button onClick={() => handleEditRoom(r)} className="p-2 hover:bg-gray-100 rounded"><Pencil className="w-4 h-4 text-blue-600" /></button>
                              <button onClick={() => handleDeleteRoom(r.id)} className="p-2 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-600" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
            {/* Amenities Tab */}
{activeTab === "amenities" && (
  <motion.div
    key="amenities"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
  >
    <h2 className="text-2xl font-black mb-6">Amenities</h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AmenityToggle
        label="Free Parking"
        value={amenities.parking_available}
        Icon={MapPin}
        onClick={() =>
          setAmenities(a => ({ ...a, parking_available: !a.parking_available }))
        }
      />

      <AmenityToggle
        label="Free Wi-Fi"
        value={amenities.wifi_available}
        Icon={Wifi}
        onClick={() =>
          setAmenities(a => ({ ...a, wifi_available: !a.wifi_available }))
        }
      />

      <AmenityToggle
        label="Air Conditioning"
        value={amenities.ac_available}
        Icon={Wind}
        onClick={() =>
          setAmenities(a => ({ ...a, ac_available: !a.ac_available }))
        }
      />

      <AmenityToggle
        label="Restaurant"
        value={amenities.restaurant_available}
        Icon={Coffee}
        onClick={() =>
          setAmenities(a => ({ ...a, restaurant_available: !a.restaurant_available }))
        }
      />

      <AmenityToggle
        label="Swimming Pool"
        value={amenities.swimming_pool}
        Icon={Waves}
        onClick={() =>
          setAmenities(a => ({ ...a, swimming_pool: !a.swimming_pool }))
        }
      />

      <AmenityToggle
        label="Power Backup"
        value={amenities.power_backup}
        Icon={Lock}
        onClick={() =>
          setAmenities(a => ({ ...a, power_backup: !a.power_backup }))
        }
      />

      <AmenityToggle
        label="CCTV"
        value={amenities.cctv}
        Icon={Eye}
        onClick={() =>
          setAmenities(a => ({ ...a, cctv: !a.cctv }))
        }
      />

      <AmenityToggle
        label="Room Service"
        value={amenities.room_service}
        Icon={Star}
        onClick={() =>
          setAmenities(a => ({ ...a, room_service: !a.room_service }))
        }
      />

      <AmenityToggle
        label="Laundry Service"
        value={amenities.laundry_service}
        Icon={Trash2}
        onClick={() =>
          setAmenities(a => ({ ...a, laundry_service: !a.laundry_service }))
        }
      />

      <AmenityToggle
        label="Pet Friendly"
        value={amenities.pet_friendly}
        Icon={Heart}
        onClick={() =>
          setAmenities(a => ({ ...a, pet_friendly: !a.pet_friendly }))
        }
      />
    </div>

    {/* Save button (API later) */}
    <div className="mt-6 text-right">
      <Button
  onClick={handleUpdateAmenities}
  disabled={amenitySaving}
  className="bg-cyan-500 text-white hover:bg-cyan-700"
>
  {amenitySaving ? "Saving..." : "Save Amenities"}
</Button>

    </div>
  </motion.div>
)}

            {/* Policies Tab */}
 {activeTab === "policies" && (
  <motion.div
    key="policies"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
  >
    <h2 className="text-2xl font-black mb-6">Motel Policies</h2>

    {/* Cancellation Policy */}
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1">
        Cancellation Policy
      </label>
      <textarea
        value={policies.cancellation_policy}
        onChange={(e) =>
          setPolicies({ ...policies, cancellation_policy: e.target.value })
        }
        rows={3}
        className="w-full border rounded-lg p-2 text-sm"
      />
    </div>

    {/* Terms & Conditions */}
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-1">
        Terms & Conditions
      </label>
      <textarea
        value={policies.terms_and_conditions}
        onChange={(e) =>
          setPolicies({ ...policies, terms_and_conditions: e.target.value })
        }
        rows={4}
        className="w-full border rounded-lg p-2 text-sm"
      />
    </div>

    {/* Policy Toggles */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <PolicyToggle
        label="Smoking Allowed"
        value={policies.is_smoking_allowed}
        onClick={() =>
          setPolicies({
            ...policies,
            is_smoking_allowed: policies.is_smoking_allowed ? 0 : 1,
          })
        }
      />

      <PolicyToggle
        label="Couple Friendly"
        value={policies.is_couple_friendly}
        onClick={() =>
          setPolicies({
            ...policies,
            is_couple_friendly: policies.is_couple_friendly ? 0 : 1,
          })
        }
      />

      <PolicyToggle
        label="ID Proof Required"
        value={policies.id_proof_required}
        onClick={() =>
          setPolicies({
            ...policies,
            id_proof_required: policies.id_proof_required ? 0 : 1,
          })
        }
      />
    </div>

    {/* Update Button */}
    <div className="text-right">
      <Button
        onClick={handleUpdatePolicies}
        disabled={policySaving}
        className="bg-cyan-500 text-white hover:bg-cyan-700"
      >
        {policySaving ? "Updating..." : "Update Policies"}
      </Button>
    </div>
  </motion.div>
)}




          </AnimatePresence>
        </main>

        {/* Footer */}
        <DashboardFooter />
      </div>
      {/* Edit Document Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4 shadow-xl">

            <h2 className="text-xl font-bold mb-2">Edit Document</h2>

            {/* Document Number */}
            <Input
              label="Document Number"
              value={editDocData.document_number}
              onChange={(e) =>
                setEditDocData({ ...editDocData, document_number: e.target.value })
              }
            />

            {/* Issued By */}
            <Input
              label="Issued By"
              value={editDocData.issued_by}
              onChange={(e) =>
                setEditDocData({ ...editDocData, issued_by: e.target.value })
              }
            />
            <div>
              <label className="text-sm font-semibold">Issued At</label>
              <input
                type="date"
                className="border p-2 rounded w-full"
                value={editDocData.issued_at}
                onChange={(e) =>
                  setEditDocData({ ...editDocData, issued_at: e.target.value })
                }
              />
            </div>
            <Input
              label="Document Type"
              value={editDocData.document_type}
              onChange={(e) =>
                setEditDocData({ ...editDocData, document_type: e.target.value })
              }
            />



            {/* Expiry Date */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Expiry Date</label>
              <input
                type="date"
                className="border p-2 rounded w-full"
                value={editDocData.expiry_at}
                onChange={(e) =>
                  setEditDocData({ ...editDocData, expiry_at: e.target.value })
                }
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Upload New File (optional)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="border p-2 rounded w-full"
                onChange={(e) =>
                  setEditDocData({ ...editDocData, newFile: e.target.files?.[0] })
                }
              />

              {editDocData.newFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {editDocData.newFile.name}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateDocument}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>

          </div>
        </div>
      )}




      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        userEmail={profileData?.email}
      />
    </div>
  );
}