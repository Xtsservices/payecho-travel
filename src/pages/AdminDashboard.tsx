import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Building2, Calendar, CheckCircle, DollarSign, TrendingUp,
  Users, Shield, Key, Database, Menu, X, Eye, Check, XCircle,
  Mail, Phone, MapPin, FileText, Image as ImageIcon, Settings,
  Plus, Pencil, Trash2, CheckSquare, Download, ChevronDown
} from 'lucide-react';
import { Button, IconButton, Input, Select, Modal, StatCard, Tab, Badge, Avatar } from '../components/ui';
import { toast } from 'react-toastify';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import MasterDataPage from './MasterDataPage';
import ChangePasswordModal from '../components/ChangePasswordModal';
import ProfileDropdown from '../components/ProfileDropdown';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardHeader from '../components/DashboardHeader';
import DashboardFooter from '../components/DashboardFooter';
import ConfirmDialog from '../components/ConfirmDialog';
import logo from 'figma:asset/00d09e71b1640633d6e9a787381b574f41ce5e2c.png';
import PrivilegesScreen from './PrivilegesScreen';
import { apiGet,apiPost,apiPut,apiDelete,apiPatch, apiGetWithoutToken} from "../api/api";



type TabType = 'overview' | 'motels' | 'bookings' | 'users' | 'roles' | 'permissions' | 'masters' | 'features' | 'privileges';

interface Motel {
  id: string;
  name: string;
  owner: string;
  ownerEmail: string;
  ownerPhone: string;
  location: string;
  address: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  rooms: number;
  pricePerNight: number;
  submittedDate: string;
  images: string[];
  documents: Array<{
    name: string;
    uploadDate: string;
    status: 'verified' | 'pending';
  }>;
}

interface Booking {
  id: string;
  motelName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
}

interface Role {
  id: string;
  name: string;
  description: string;
  users?: number;
}

interface ApiRole {
  id: number;
  name: string;
  description: string;
  status: number;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

interface Permission {
  id: string;
  name: string;
  module: string;
  description: string;
  role: string;
  privileges: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
    download: boolean;
  };
}

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  status?: 'active' | 'inactive';
  joinedDate?: string;
  lastActive?: string;
}

interface ApiUser {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  role?: string | null;
  status: number;
  created_at?: number;
  updated_at?: number;
  joiningDate?: string;
  lastActive?: string;
}
// API Motel List Item
interface ApiMotel {
  id: number;
  motel_name: string;
  contact_email: string;
  contact_phone: string;
  address_line1: string;
  address_line2: string;
  zip_code: string;
  registration_type: string;
  rooms: string;
  status: number;
  approval_status: number;
  locality_id?: number;
  locality_name?: string;
  address?: string;
}


export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profileData = useSelector((state: any) => state.currentUserData);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedMotel, setSelectedMotel] = useState<any>(null);
  const [showMotelViewModal, setShowMotelViewModal] = useState(false);
  const [motelViewLoading, setMotelViewLoading] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [editingPermissionId, setEditingPermissionId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<string | null>(null);
  const [newPermission, setNewPermission] = useState({
    name: '',
    role: '',
    module: [] as string[],
    description: '',
    privileges: {
      create: false,
      read: false,
      update: false,
      delete: false,
      approve: false,
      download: false
    }
  });
  const [newUser, setNewUser] = useState({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  status: "active",
});
  const [userErrors, setUserErrors] = useState<{
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
}>({});
const [showEditUserModal, setShowEditUserModal] = useState(false);
const [editUserErrors, setEditUserErrors] = useState<{
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}>({});
const [editUser, setEditUser] = useState<ApiUser | null>(null);

const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
const [userToDelete, setUserToDelete] = useState<ApiUser | null>(null);
const [motels, setMotels] = useState<ApiMotel[]>([]);
const [motelLoading, setMotelLoading] = useState(false);
const [showRejectModal, setShowRejectModal] = useState(false);
const [rejectReason, setRejectReason] = useState("");
const [rejectMotelId, setRejectMotelId] = useState<number | null>(null);
const [motelApprovalFilter, setMotelApprovalFilter] = useState<number | null>(null);
const [selectedDocument, setSelectedDocument] = useState<any>(null);
const [showDocumentViewer, setShowDocumentViewer] = useState(false);
const [motelSearchQuery, setMotelSearchQuery] = useState('');
const [bookingSearchQuery, setBookingSearchQuery] = useState('');
const bookingSearchInputRef = useRef<HTMLInputElement>(null);
const [bookingCheckInFilter, setBookingCheckInFilter] = useState('');
const [bookingCheckOutFilter, setBookingCheckOutFilter] = useState('');
const [userSearchQuery, setUserSearchQuery] = useState('');
const [userStatusFilter, setUserStatusFilter] = useState<number | null>(null);
const [userRoleFilter, setUserRoleFilter] = useState<string | null>(null);
const [bookings, setBookings] = useState<any[]>([]);
const [bookingsLoading, setBookingsLoading] = useState(false);
const [bookingCurrentPage, setBookingCurrentPage] = useState(1);
const [bookingItemsPerPage] = useState(10);
const [userCurrentPage, setUserCurrentPage] = useState(1);
const [userItemsPerPage] = useState(10);
const [motelCurrentPage, setMotelCurrentPage] = useState(1);
const [motelItemsPerPage] = useState(10);
const [adminProfile, setAdminProfile] = useState<any>(null);
const [adminProfileLoading, setAdminProfileLoading] = useState(false);
const [showProfileModal, setShowProfileModal] = useState(false);
const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const featuresDropdown = document.getElementById('features-dropdown');
      if (featuresDropdown && !featuresDropdown.contains(event.target as Node)) {
        setFeaturesDropdownOpen(false);
      }
    };
    
    if (featuresDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [featuresDropdownOpen]);

  // Fetch profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setAdminProfileLoading(true);
        const res = await apiGet('/auth/my-profile');
        if (res.data.success && res.data.data) {
          setAdminProfile(res.data.data);
        }
      } catch (error: any) {
        console.error('Failed to fetch profile', error);
        toast.error('Failed to load profile');
      } finally {
        setAdminProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setBookingsLoading(true);
        const res = await apiGet('/user-booking/admin/bookings');
        if (res.data.success && res.data.bookings) {
          setBookings(res.data.bookings);
        }
      } catch (error: any) {
        console.error('Failed to fetch bookings', error);
        toast.error('Failed to load bookings');
      } finally {
        setBookingsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // // Mock data
  // const motels: Motel[] = [
  //   { 
  //     id: '1', 
  //     name: 'Sunrise Motel', 
  //     owner: 'John Doe',
  //     ownerEmail: 'john@sunrisemotel.com',
  //     ownerPhone: '+1 (555) 123-4567',
  //     location: 'Los Angeles, CA', 
  //     address: '123 Main Street, Los Angeles, CA 90001',
  //     description: 'A comfortable and affordable motel in the heart of Los Angeles with modern amenities and excellent service.',
  //     status: 'pending', 
  //     rooms: 25, 
  //     pricePerNight: 89,
  //     submittedDate: '2025-12-01',
  //     images: [
  //       'https://images.unsplash.com/photo-1566073771259-6a8506099945',
  //       'https://images.unsplash.com/photo-1582719508461-905c673771fd',
  //       'https://images.unsplash.com/photo-1584132967334-10e028bd69f7',
  //     ],
  //     documents: [
  //       { name: 'Business License.pdf', uploadDate: '2025-11-15', status: 'verified' },
  //       { name: 'Tax Registration.pdf', uploadDate: '2025-11-15', status: 'verified' },
  //       { name: 'Property Insurance.pdf', uploadDate: '2025-11-20', status: 'pending' },
  //     ]
  //   },
  //   { 
  //     id: '2', 
  //     name: 'Ocean View Inn', 
  //     owner: 'Jane Smith',
  //     ownerEmail: 'jane@oceanview.com',
  //     ownerPhone: '+1 (555) 987-6543',
  //     location: 'Miami, FL', 
  //     address: '456 Beach Blvd, Miami, FL 33139',
  //     description: 'Beachfront motel with stunning ocean views and direct beach access.',
  //     status: 'approved', 
  //     rooms: 40, 
  //     pricePerNight: 129,
  //     submittedDate: '2025-11-28',
  //     images: [
  //       'https://images.unsplash.com/photo-1566073771259-6a8506099945',
  //       'https://images.unsplash.com/photo-1582719508461-905c673771fd',
  //     ],
  //     documents: [
  //       { name: 'Business License.pdf', uploadDate: '2025-11-10', status: 'verified' },
  //       { name: 'Tax Registration.pdf', uploadDate: '2025-11-10', status: 'verified' },
  //     ]
  //   },
  //   { 
  //     id: '3', 
  //     name: 'Mountain Lodge', 
  //     owner: 'Bob Wilson',
  //     ownerEmail: 'bob@mountainlodge.com',
  //     ownerPhone: '+1 (555) 456-7890',
  //     location: 'Denver, CO', 
  //     address: '789 Mountain Rd, Denver, CO 80202',
  //     description: 'Cozy mountain retreat perfect for nature lovers and ski enthusiasts.',
  //     status: 'pending', 
  //     rooms: 30, 
  //     pricePerNight: 99,
  //     submittedDate: '2025-12-02',
  //     images: [
  //       'https://images.unsplash.com/photo-1566073771259-6a8506099945',
  //     ],
  //     documents: [
  //       { name: 'Business License.pdf', uploadDate: '2025-11-25', status: 'pending' },
  //     ]
  //   },
  // ];

  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [roleErrors, setRoleErrors] = useState<{ name?: string; description?: string }>({});

  // Features state
  interface Feature { id: number; name: string; code: string; parent_id?: number | null; status: number; created_at?: string }
  const [features, setFeatures] = useState<Feature[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState<{ name: string; code: string; parent_id?: number | null; status: number }>({ name: '', code: '', parent_id: null, status: 1 });
  const [editingFeatureId, setEditingFeatureId] = useState<number | null>(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [featureErrors, setFeatureErrors] = useState<{ name?: string; code?: string }>({});
const getApprovalStatusLabel = (status: number) => {
  if (status === 1) return "Approved";
  if (status === 2) return "Rejected";
  return "Pending";
};

const getApprovalStatusClass = (status: number) => {
  if (status === 1) return "bg-green-100 text-green-700";
  if (status === 2) return "bg-red-100 text-red-700";
  return "bg-orange-100 text-orange-700";
};


  
  // Fetch roles when Roles tab becomes active
  const fetchRoles = async () => {
  try {
    const res = await apiGet("/roles");

    // 🔥 FIXED: Normalize response shape safely
    const list =
      Array.isArray(res.data)
        ? res.data
        : res.data?.data
        ? res.data.data
        : [];

    setRoles(list);
  } catch (err) {
    console.error("Failed to fetch roles:", err);
    alert("Failed to load roles");
  }
};

  useEffect(() => {
    localStorage.setItem('adminDashboardActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await apiGet('/user/profile');
        if (res?.data) {
          dispatch({
            type: 'currentUserData',
            payload: res.data
          });
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };
    
    // Only fetch if profileData is not already loaded
    if (!profileData) {
      fetchUserProfile();
    }
  }, [profileData, dispatch]);

  useEffect(() => {
    if (activeTab === 'roles') fetchRoles();
    if (activeTab === 'permissions') {
      fetchPermissions();
      fetchRoles();
    }
  }, [activeTab]);

  // Fetch features when Features tab becomes active
  const fetchFeatures = async () => {
  try {
    const res = await apiGet("/features");
    const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
    setFeatures(list);
  } catch (err) {
    console.error("Failed to fetch features:", err);
    alert("Failed to load features");
  }
};

  // Fetch available features from allFeatures endpoint
  const fetchAvailableFeatures = async () => {
    try {
      const res = await apiGet("/features/allFeatures");
      const featuresList = res?.data?.data || res?.data?.Features || res?.data || [];
      const featureNames = Array.isArray(featuresList) 
        ? featuresList.map((f: any) => f.name || f)
        : [];
      setAvailableFeatures(featureNames);
    } catch (err) {
      console.error("Failed to fetch available features:", err);
    }
  };

  useEffect(() => {
    if (activeTab === 'features' || activeTab === 'permissions') {
      fetchFeatures();
      if (activeTab === 'features') {
        fetchAvailableFeatures();
      }
    }
  }, [activeTab]);

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionRoleFilter, setPermissionRoleFilter] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      const res = await apiGet('/permissions');
      const payload = res?.data;
      let listRaw: any[] = [];

      // Handle new API structure (grouped by role with features)
      if (payload?.permissions && Array.isArray(payload.permissions)) {
        // Flatten the nested structure
        listRaw = payload.permissions.flatMap((roleGroup: any) =>
          (roleGroup.features || []).map((feature: any) => ({
            ...feature,
            role_id: roleGroup.role_id,
            role_name: roleGroup.role_name
          }))
        );
      } else if (Array.isArray(payload)) {
        listRaw = payload;
      } else if (Array.isArray(res.data)) {
        listRaw = res.data;
      } else {
        listRaw = payload?.data ?? [];
      }

      const mapped = (listRaw || []).map((p: any) => {
        let privArr: string[] = [];
        try {
          if (typeof p.privileges === 'string') {
            privArr = JSON.parse(p.privileges);
          } else if (Array.isArray(p.privileges)) {
            privArr = p.privileges;
          }
        } catch (err) {
          const s = String(p.privileges || '');
          privArr = s.replace(/\\/g, '').replace(/\[|\]|"/g, '').split(',').map((x: string) => x.trim()).filter(Boolean);
        }

        const privObj = {
          create: privArr.includes('Create'),
          read: privArr.includes('Read'),
          update: privArr.includes('Update'),
          delete: privArr.includes('Delete'),
          approve: privArr.includes('Approve'),
          reject: privArr.includes('Reject')
        };

        const roleName = (p.role_name || roles.find(r => r.id === p.role_id)?.name) ?? String(p.role_id ?? p.role ?? '');

        return {
          id: String(p.id || `${p.role_id}-${p.feature}`),
          name: p.name ?? p.permission_name ?? '',
          module: p.feature ?? p.module ?? '',
          description: p.description ?? '',
          role: roleName,
          privileges: privObj
        } as unknown as Permission;
      });

      setPermissions(mapped);
    } catch (err) {
      console.error('Failed to fetch permissions', err);
      toast.error('Failed to load permissions');
    }
  };

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [showUserView, setShowUserView] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const res = await apiGet('/admin/dashboard-stats');
      if (res.data.success) {
        setDashboardStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch stats when overview tab becomes active
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  const stats = dashboardStats ? [
    { label: 'Total Motels', value: String(dashboardStats.total_motels), icon: Building2, color: 'from-cyan-500 to-blue-600' },
    { label: 'Pending Approvals', value: String(dashboardStats.pending_approvals), icon: CheckCircle, color: 'from-orange-500 to-red-500' },
    { label: 'Total Bookings', value: String(dashboardStats.total_bookings), icon: Calendar, color: 'from-green-500 to-emerald-600' },
    { label: 'Revenue', value: dashboardStats.revenue, icon: DollarSign, color: 'from-purple-500 to-pink-500' },
  ] : [
    { label: 'Total Motels', value: '0', icon: Building2, color: 'from-cyan-500 to-blue-600' },
    { label: 'Pending Approvals', value: '0', icon: CheckCircle, color: 'from-orange-500 to-red-500' },
    { label: 'Total Bookings', value: '0', icon: Calendar, color: 'from-green-500 to-emerald-600' },
    { label: 'Revenue', value: '$0.00', icon: DollarSign, color: 'from-purple-500 to-pink-500' },
  ];

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: TrendingUp },
    { id: 'motels' as TabType, label: 'Motels', icon: Building2 },
    { id: 'bookings' as TabType, label: 'Bookings', icon: Calendar },
    { id: 'users' as TabType, label: 'Users', icon: Users },
    { id: 'roles' as TabType, label: 'Roles', icon: Shield },
    { id: 'features' as TabType, label: 'Features', icon: Plus },
    { id: 'privileges' as TabType, label: 'Privileges', icon: Key },
    { id: 'permissions' as TabType, label: 'Permissions', icon: FileText },
    { id: 'masters' as TabType, label: 'Master Data', icon: Database },
  ];

  // const handleApproveMotel = (motelId: string) => {
  //   console.log('Approved:', motelId);
  //   setShowMotelViewModal(false);
  //   setSelectedMotel(null);
  // };

  // const handleRejectMotel = (motelId: string) => {
  //   console.log('Rejected:', motelId);
  //   setShowMotelViewModal(false);
  //   setSelectedMotel(null);
  // };

 const handleViewMotel = async (motelId: number) => {
  try {
    setMotelViewLoading(true);
    const res = await apiGet(`/motels/${motelId}`);
    
    // Safely extract motel details from various possible API response structures
    const motelDetails = res.data?.motel_details || res.data?.data || res.data;
    
    if (!motelDetails) {
      console.error('No motel details in API response:', res.data);
      toast.error('Failed to load motel details - Invalid data');
      return;
    }
    
    // Ensure amenities is an object, not a string
    if (typeof motelDetails.amenities === 'string') {
      try {
        motelDetails.amenities = JSON.parse(motelDetails.amenities);
      } catch (e) {
        console.warn('Failed to parse amenities:', e);
        motelDetails.amenities = {};
      }
    }
    
    // Ensure images and documents are arrays
    if (!Array.isArray(motelDetails.images)) {
      motelDetails.images = [];
    }
    if (!Array.isArray(motelDetails.documents)) {
      motelDetails.documents = [];
    }
    
    // Ensure rooms is a number, not an array or object
    if (typeof motelDetails.rooms !== 'number') {
      if (Array.isArray(motelDetails.rooms)) {
        // If rooms is an array of room objects, get the length
        motelDetails.rooms = motelDetails.rooms.length;
      } else if (typeof motelDetails.rooms === 'string') {
        // If rooms is a string, convert to number
        motelDetails.rooms = parseInt(motelDetails.rooms, 10) || 0;
      } else {
        // Otherwise default to 0
        motelDetails.rooms = 0;
      }
    }
    
    setSelectedMotel(motelDetails);
    setShowMotelViewModal(true);
  } catch (err: any) {
    console.error('Error loading motel details:', err);
    const errorMsg = err?.response?.data?.message || 'Failed to load motel details';
    toast.error(errorMsg);
  } finally {
    setMotelViewLoading(false);
  }
};



  const handleLogout = () => {
    navigate('/login');
  };

  const getAuthToken = () => {
    return (
      localStorage.getItem('accessToken') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('jwt') ||
      null
    );
  };
const fetchUsers = async () => {
  try {
    const res = await apiGet("/users");
    const data =
      Array.isArray(res.data) ? res.data :
      res.data?.data ?? res.data ?? [];

    setUsers(data);
  } catch (err) {
    console.error("Failed to fetch users:", err);
  }
};
  // Fetch users when Users tab becomes active
  useEffect(() => {

    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  // Permission handlers
  const handleEditPermission = (permission: Permission) => {
    setEditingPermissionId(permission.id);
    setNewPermission({
      name: permission.name,
      role: permission.role,
      module: typeof permission.module === 'string' 
        ? permission.module.split(',').map(m => m.trim()) 
        : Array.isArray(permission.module) 
        ? permission.module 
        : [permission.module],
      description: permission.description,
      privileges: { ...permission.privileges }
    });
    setShowPermissionModal(true);
  };

  const handleDeletePermission = (permissionId: string) => {
    setPermissionToDelete(permissionId);
    setShowDeleteConfirm(true);
  };

  const confirmDeletePermission = () => {
    const doDelete = async () => {
      if (!permissionToDelete) return;
      const id = permissionToDelete;
      try {
        const res = await apiDelete(`/permissions/${id}`);
        const body = res?.data;
        if (body && body.success) {
          setPermissions(permissions.filter(p => p.id !== id));
          toast.success(body.message || 'Permission deleted');
        } else {
          toast.error(body?.message || 'Failed to delete permission');
        }
      } catch (err) {
        console.error('Failed to delete permission', err);
        toast.error('Failed to delete permission');
      } finally {
        setPermissionToDelete(null);
        setShowDeleteConfirm(false);
      }
    };

    doDelete();
  };

  const handleSavePermission = async () => {
    if (!newPermission.name || !newPermission.role || newPermission.module.length === 0) {
      alert('Please fill in all required fields and select at least one feature');
      return;
    }

    // Build privileges array from boolean flags
    const privMap: Record<string, string> = {
      create: 'Create',
      read: 'Read',
      update: 'Update',
      delete: 'Delete',
      approve: 'Approve',
      reject: 'Reject'
    };

    const privileges: string[] = Object.entries(newPermission.privileges)
      .filter(([k, v]) => v)
      .map(([k]) => privMap[k]);

    // Try to find role id from roles list (roles fetched elsewhere)
    const matchedRole = roles.find(r => (r.name && r.name.toString() === newPermission.role.toString()) || r.id?.toString() === newPermission.role.toString());
    const role_id = matchedRole ? matchedRole.id : Number(newPermission.role) || 1;

    const currentUserId = profileData?.id || profileData?.user_id || 1;

    const payload = {
      name: newPermission.name,
      role_id,
      feature: newPermission.module.join(','),
      privileges,
      description: newPermission.description,
      status: 1,
      created_by: currentUserId,
      updated_by: currentUserId
    };

    try {
      if (editingPermissionId) {
        // PUT to backend
        try {
          const res = await apiPut(`/permissions/${editingPermissionId}`, payload);
          const body = res?.data;
          if (body && body.success) {
            toast.success(body.message || 'Permission updated');
            // update local list with new values
            setPermissions(prev => prev.map(p => p.id === editingPermissionId ? ({ ...p, name: newPermission.name, role: newPermission.role, module: newPermission.module.join(','), description: newPermission.description, privileges: newPermission.privileges }) : p));
          } else {
            toast.error(body?.message || 'Failed to update permission');
          }
        } catch (err) {
          console.error('Failed to update permission', err);
          toast.error('Failed to update permission');
        }
      } else {
        // POST to backend
        const res = await apiPost('/permissions', payload);
        const body = res?.data;
        if (body && body.success) {
          toast.success(body.message || 'Permission created');
          // If backend returns created object, append it, otherwise append local representation
          const created = body.data ?? null;
          const newPerm: Permission = {
            id: created?.id?.toString() ?? (permissions.length + 1).toString(),
            name: newPermission.name,
            module: newPermission.module.join(','),
            description: newPermission.description,
            role: newPermission.role,
            privileges: { ...newPermission.privileges }
          };
          setPermissions(prev => [...prev, newPerm]);
        } else {
          toast.error(body?.message || 'Failed to create permission');
        }
      }
    } catch (err: any) {
      console.error('Failed to save permission', err);
      toast.error(err?.message || 'Failed to save permission');
    } finally {
      // Reset and close
      setShowPermissionModal(false);
      setEditingPermissionId(null);
      setNewPermission({
        name: '',
        role: '',
        module: [],
        description: '',
        privileges: {
          create: false,
          read: false,
          update: false,
          delete: false,
          approve: false,
          download: false
        }
      });
    }
  };

  const handleCancelPermission = () => {
    setShowPermissionModal(false);
    setEditingPermissionId(null);
    setNewPermission({
      name: '',
      role: '',
      module: [],
      description: '',
      privileges: {
        create: false,
        read: false,
        update: false,
        delete: false,
        approve: false,
        download: false
      }
    });
  };

  // Navigation items for sidebar
  const navItems = tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    icon: tab.icon,
    onClick: () => setActiveTab(tab.id)
  }));
  const validateUserForm = (isEdit: boolean = false) => {
  const errors: typeof userErrors = {};

  if (!newUser.first_name.trim()) {
    errors.first_name = "First name is required";
  } else if (!/^[a-zA-Z\s]+$/.test(newUser.first_name)) {
    errors.first_name = "First name should only contain alphabets";
  }

  if (!newUser.last_name.trim()) {
    errors.last_name = "Last name is required";
  } else if (!/^[a-zA-Z\s]+$/.test(newUser.last_name)) {
    errors.last_name = "Last name should only contain alphabets";
  }

  if (!newUser.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (newUser.phone) {
    const phoneDigits = newUser.phone.replace(/\D/g, '');
    const isValidPhone = /^\+?1?\s*\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/.test(newUser.phone.trim()) ||
                         (phoneDigits.length >= 10 && phoneDigits.length <= 15);
    if (!isValidPhone) {
      errors.phone = "Please enter a valid phone number (US format: +1 (555) 123-4567 or 10-15 digits)";
    }
  }

  if (!isEdit) {
    if (!newUser.password) {
      errors.password = "Password is required";
    } else if (newUser.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
  }

  setUserErrors(errors);
  return Object.keys(errors).length === 0;
};
 const handleCreateUser = async () => {
    if (!validateUserForm(false)) {
    return; // Stop if validation fails
  }
  try {
    const payload = {
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      phone: newUser.phone,
      password: newUser.password,
      status: newUser.status === "active" ? 1 : 0,
    };

    const res = await apiPost("/users", payload);

    alert("User created successfully!");
    setShowUserModal(false);

    fetchUsers(); // refresh list

    setNewUser({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
      status: "active",
    });
  } catch (err: any) {
    alert(err?.response?.data?.message || "Failed to create user");
    console.log(err);
  }
};
const validateEditUserForm = () => {
  const errors: typeof editUserErrors = {};

  if (editUser && !editUser.first_name.trim()) {
    errors.first_name = "First name is required";
  } else if (editUser && !/^[a-zA-Z\s]+$/.test(editUser.first_name)) {
    errors.first_name = "First name should only contain alphabets";
  }
  
  if (editUser && !editUser.last_name.trim()) {
    errors.last_name = "Last name is required";
  } else if (editUser && !/^[a-zA-Z\s]+$/.test(editUser.last_name)) {
    errors.last_name = "Last name should only contain alphabets";
  }
  
  if (editUser && !editUser.email.trim()) {
    errors.email = "Email is required";
  } else if (editUser && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editUser.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  if (editUser && editUser.phone) {
    const phoneDigits = editUser.phone.replace(/\D/g, '');
    const isValidPhone = /^\+?1?\s*\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/.test(editUser.phone.trim()) ||
                         (phoneDigits.length >= 10 && phoneDigits.length <= 15);
    if (!isValidPhone) {
      errors.phone = "Please enter a valid phone number (US format: +1 (555) 123-4567 or 10-15 digits)";
    }
  }

  setEditUserErrors(errors);
  return Object.keys(errors).length === 0;
};
const handleUpdateUser = async () => {
  if (!editUser) return; // <-- ⭐ FIX
  if (!validateEditUserForm()) {
    return;
  }
  try {
    const payload = {
      first_name: editUser.first_name,
      last_name: editUser.last_name,
      email: editUser.email,
      phone: editUser.phone,
      status: editUser.status,
    };

    await apiPut(`/users/${editUser.id}`, payload);

    alert("User updated successfully");
    setShowEditUserModal(false);

    fetchUsers();  // works now
  } catch (err: any) {
    alert(err?.response?.data?.message || "Failed to update user");
    console.error(err);
  }
};

const handleDeleteUser = async () => {
  if (!userToDelete) return;

  try {
    // Use deactivate endpoint (admin) instead of hard delete
    const res = await apiPatch(`/users/${userToDelete.id}/deactivate`);
    if (res?.data?.success || res?.status === 200) {
      alert(res.data?.message || 'User deactivated successfully');
      fetchUsers();
    } else {
      alert(res?.data?.message || `Request returned status ${res?.status}`);
    }
  } catch (err: any) {
    console.error('Deactivate user error:', err?.response ?? err);
    alert(err?.response?.data?.message || err?.message || 'Failed to deactivate user');
  }

  setShowDeleteUserConfirm(false);
};


 const handleCreateRole = async () => {
  try {
    // validate
    const validateRoleForm = () => {
      const errors: typeof roleErrors = {};
      if (!newRole.name || !newRole.name.trim()) errors.name = 'Role name is required';
      if (newRole.description && newRole.description.length > 500) errors.description = 'Description is too long';
      setRoleErrors(errors);
      return Object.keys(errors).length === 0;
    };

    if (!validateRoleForm()) return;

    const payload = {
      name: newRole.name,
      description: newRole.description,
    };

    try {
      if (editingRoleId) {
        await apiPut(`/roles/${editingRoleId}`, payload);
        toast.success("Role updated successfully!");
      } else {
        await apiPost("/roles", payload);
        toast.success("Role created successfully!");
      }

      setShowRoleModal(false);
      setNewRole({ name: "", description: "" });
      setEditingRoleId(null);
      setRoleErrors({});

      fetchRoles(); // refresh list
    } catch (err: any) {
      console.error(err);
      const data = err?.response?.data;

      // If backend provided field errors, show them inline
      if (data?.errors && typeof data.errors === 'object') {
        const fieldErrors: typeof roleErrors = {};
        // data.errors may be { name: ['msg'], description: ['msg'] }
        Object.keys(data.errors).forEach((k) => {
          const val = data.errors[k];
          fieldErrors[k as keyof typeof fieldErrors] = Array.isArray(val) ? val.join(' ') : String(val);
        });
        setRoleErrors(fieldErrors);
        // also show a toast summary
        const summary = Object.values(fieldErrors).join(' ');
        toast.error(summary || 'Validation failed');
      } else if (data?.message) {
        toast.error(data.message);
      } else {
        toast.error('Failed to save role');
      }
    }
  } catch (err: any) {
    // outer catch left for safety - handled above
    console.error(err);
    toast.error(err?.response?.data?.message || "Failed to save role");
  }
};


  const handleEditRole = (role: ApiRole) => {
  setEditingRoleId(role.id);
  setNewRole({
    name: role.name,
    description: role.description || "",
  });
  setShowRoleModal(true);
};


  const handleDeleteRole = async (id: number) => {
  try {
    await apiDelete(`/roles/${id}`);
    alert("Role deleted successfully");
    fetchRoles(); // refresh
  } catch (err) {
    console.error(err);
    alert("Failed to delete role");
  }
};
const fetchMotels = async () => {
  try {
    setMotelLoading(true);

    const res = await apiGet("/motels");
    console.log("MOTELS API:", res.data);

    const list = res.data?.motels ?? [];
    setMotels(list);

  } catch (err) {
    console.error("Failed to fetch motels", err);
    alert("Failed to load motels");
  } finally {
    setMotelLoading(false);
  }
};
useEffect(() => {
  if (activeTab === "motels") {
    fetchMotels();
  }
}, [activeTab]);
useEffect(() => {
  if (selectedMotel?.images) {
    console.log("IMAGES:", selectedMotel.images);
  }
}, [selectedMotel]);
const handleApproveMotel = async (motelId: number) => {
  try {
    await apiPatch(`/admin/motels/${motelId}/approve`);

    alert("Motel approved successfully");

    // 🔥 Refresh table
    fetchMotels();

    // Close modal if open
    setShowMotelViewModal(false);
    setSelectedMotel(null);
  } catch (err: any) {
    alert(err?.response?.data?.message || "Failed to approve motel");
    console.error(err);
  }
};
const submitRejectMotel = async () => {
  if (!rejectReason.trim()) {
    alert("Rejection reason is required");
    return;
  }

  try {
    await apiPatch(`/admin/motels/${rejectMotelId}/reject`, {
      reason: rejectReason.trim(),
    });

    alert("Motel rejected successfully");

    setShowRejectModal(false);
    setRejectReason("");
    setRejectMotelId(null);
    fetchMotels();
  } catch (err) {
    console.error(err);
    alert("Failed to reject motel");
  }
};




  return (
    <div className="min-h-screen bg-gray-50 flex">
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
          title="Admin Dashboard"
          subtitle="Super Administrator"
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userName={adminProfile?.first_name ? `${adminProfile.first_name} ${adminProfile.last_name}` : profileData?.user?.first_name || 'Admin User'}
          userEmail={adminProfile?.email || profileData?.user?.email || 'admin@moteltrips.com'}
          userRole="Super Administrator"
          avatarIcon={<Shield className="w-5 h-5 text-white" />}
          avatarGradient="from-purple-500 to-pink-500"
          onChangePassword={() => setShowChangePasswordModal(true)}
          onUpdateProfile={() => setShowProfileModal(true)}
          onLogout={handleLogout}
        />

        {/* Content Area */}
        <main className="p-6 flex-1">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <StatCard
                      key={stat.label}
                      label={stat.label}
                      value={stat.value}
                      change={stat.change}
                      icon={stat.icon}
                      color={stat.color}
                      delay={index * 0.1}
                    />
                  ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                  className="bg-white rounded-2xl shadow-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-xl font-black mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Approve Motels', icon: CheckCircle, action: () => setActiveTab('motels') },
                      { label: 'View Bookings', icon: Calendar, action: () => setActiveTab('bookings') },
                      { label: 'Manage Roles', icon: Shield, action: () => setActiveTab('roles') },
                      { label: 'Settings', icon: Settings, action: () => {} },
                    ].map((action, index) => (
                      <motion.button
                        key={action.label}
                        onClick={action.action}
                        className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition-all cursor-pointer"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <action.icon className="w-8 h-8 text-cyan-600" />
                        <span className="text-sm font-semibold text-center">{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Motels Tab */}
            {activeTab === 'motels' && (
              <motion.div
                key="motels"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black">Motel Management</h2>
                </div>

                {/* Search Section */}
                <div className="mb-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Search by motel name or location..."
                      value={motelSearchQuery}
                      onChange={(e) => {
                        setMotelSearchQuery(e.target.value);
                        setMotelCurrentPage(1);
                      }}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Filter Section */}
                <div className="mb-6 flex gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      setMotelApprovalFilter(null);
                      setMotelCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      motelApprovalFilter === null
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Motels ({motels.length})
                  </button>
                  <button
                    onClick={() => {
                      setMotelApprovalFilter(0);
                      setMotelCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      motelApprovalFilter === 0
                        ? 'bg-orange-100 text-orange-700 border-2 border-orange-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Pending ({motels.filter(m => m.approval_status === 0).length})
                  </button>
                  <button
                    onClick={() => {
                      setMotelApprovalFilter(1);
                      setMotelCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      motelApprovalFilter === 1
                        ? 'bg-green-100 text-green-700 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Approved ({motels.filter(m => m.approval_status === 1).length})
                  </button>
                  <button
                    onClick={() => {
                      setMotelApprovalFilter(2);
                      setMotelCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      motelApprovalFilter === 2
                        ? 'bg-red-100 text-red-700 border-2 border-red-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Rejected ({motels.filter(m => m.approval_status === 2).length})
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-black text-gray-700">ID</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Motel Name</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Owner</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Location</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Rooms</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filteredMotels = motels.filter(motel => {
                          const statusMatch = motelApprovalFilter === null ? true : motel.approval_status === motelApprovalFilter;
                          const searchLower = motelSearchQuery.toLowerCase();
                          const searchMatch = 
                            motel.motel_name.toLowerCase().includes(searchLower) ||
                            (motel.locality_name && motel.locality_name.toLowerCase().includes(searchLower)) ||
                            (motel.address && motel.address.toLowerCase().includes(searchLower)) ||
                            (motel.address_line1 && motel.address_line1.toLowerCase().includes(searchLower));
                          return statusMatch && searchMatch;
                        });

                        const startIndex = (motelCurrentPage - 1) * motelItemsPerPage;
                        const endIndex = startIndex + motelItemsPerPage;
                        const paginatedMotels = filteredMotels.slice(startIndex, endIndex);

                        return paginatedMotels.map((motel, index) => (
                          <motion.tr
                            key={motel.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <td className="py-3 px-4 font-semibold text-gray-900">
                              {motel.id}
                            </td>
                            <td className="py-3 px-4 font-semibold">
                              {motel.motel_name}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {motel.contact_email}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {motel.locality_name ?? motel.address ?? motel.address_line1 ?? ''}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {motel.rooms}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  motel.approval_status === 1
                                    ? "bg-green-100 text-green-700"
                                    : motel.approval_status === 2
                                    ? "bg-red-100 text-red-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {motel.approval_status === 1
                                  ? "Approved"
                                  : motel.approval_status === 2
                                  ? "Rejected"
                                  : "Pending"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <IconButton
                                  icon={Eye}
                                  variant="primary"
                                  ariaLabel="View motel"
                                  onClick={() => handleViewMotel(motel.id)}
                                />
                                {motel.approval_status === 0 && (
                                  <>
                                    <IconButton
                                      icon={CheckCircle}
                                      variant="success"
                                      ariaLabel="Approve motel"
                                      onClick={() => handleApproveMotel(motel.id)}
                                    />
                                    <IconButton
                                      icon={XCircle}
                                      variant="danger"
                                      ariaLabel="Reject motel"
                                      onClick={() => {
                                        setRejectMotelId(motel.id);
                                        setRejectReason("");
                                        setShowRejectModal(true);
                                      }}
                                    />
                                  </>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ));
                      })()}
                      {motels.filter(motel => {
                        const statusMatch = motelApprovalFilter === null ? true : motel.approval_status === motelApprovalFilter;
                        const searchLower = motelSearchQuery.toLowerCase();
                        const searchMatch = 
                          motel.motel_name.toLowerCase().includes(searchLower) ||
                          (motel.locality_name && motel.locality_name.toLowerCase().includes(searchLower)) ||
                          (motel.address && motel.address.toLowerCase().includes(searchLower)) ||
                          (motel.address_line1 && motel.address_line1.toLowerCase().includes(searchLower));
                        return statusMatch && searchMatch;
                      }).length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 px-4 text-center text-gray-500">
                            {motelSearchQuery ? 'No motels found matching your search' : 'No motels available'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Motel Pagination */}
                {(() => {
                  const filteredMotels = motels.filter(motel => {
                    const statusMatch = motelApprovalFilter === null ? true : motel.approval_status === motelApprovalFilter;
                    const searchLower = motelSearchQuery.toLowerCase();
                    const searchMatch = 
                      motel.motel_name.toLowerCase().includes(searchLower) ||
                      (motel.locality_name && motel.locality_name.toLowerCase().includes(searchLower)) ||
                      (motel.address && motel.address.toLowerCase().includes(searchLower)) ||
                      (motel.address_line1 && motel.address_line1.toLowerCase().includes(searchLower));
                    return statusMatch && searchMatch;
                  });
                  const totalPages = Math.ceil(filteredMotels.length / motelItemsPerPage);
                  
                  if (filteredMotels.length === 0 || totalPages <= 1) return null;
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-lg p-6 mt-4 border-t-4 border-cyan-500"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Showing {Math.min((motelCurrentPage - 1) * motelItemsPerPage + 1, filteredMotels.length)} to {Math.min(motelCurrentPage * motelItemsPerPage, filteredMotels.length)} of {filteredMotels.length} motels
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setMotelCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={motelCurrentPage === 1}
                            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                              motelCurrentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                            }`}
                          >
                            ← Prev
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setMotelCurrentPage(page)}
                              className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                                motelCurrentPage === page
                                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setMotelCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={motelCurrentPage === totalPages}
                            className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                              motelCurrentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                            }`}
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </motion.div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <motion.div
                key="bookings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-2xl font-black mb-6">All Bookings</h2>
                
                {/* Search and Filter Section */}
                <div className="mb-6 flex gap-3 flex-wrap items-end">
                  <input
                    ref={bookingSearchInputRef}
                    type="text"
                    placeholder="Search by reference ID, motel name, or guest name..."
                    value={bookingSearchQuery}
                    onChange={(e) => setBookingSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      // Prevent any default form submission
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    className="flex-1 min-w-xs px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                  
                  <input
                    type="date"
                    placeholder="Check-in date from"
                    value={bookingCheckInFilter}
                    onChange={(e) => setBookingCheckInFilter(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                  
                  <input
                    type="date"
                    placeholder="Check-out date to"
                    value={bookingCheckOutFilter}
                    onChange={(e) => setBookingCheckOutFilter(e.target.value)}
                    min={bookingCheckInFilter || undefined}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                  
                  {(bookingCheckInFilter || bookingCheckOutFilter) && (
                    <button
                      onClick={() => {
                        setBookingCheckInFilter('');
                        setBookingCheckOutFilter('');
                        setBookingCurrentPage(1);
                        }}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all"
                      >
                        Clear Dates
                      </button>
                    )}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-black text-gray-700">ID</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Reference ID</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Motel</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Guest</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Check-in</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Check-out</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-black text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingsLoading ? (
                        <tr>
                          <td colSpan={8} className="py-8 px-4 text-center text-gray-500">
                            Loading bookings...
                          </td>
                        </tr>
                      ) : bookings.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 px-4 text-center text-gray-500">
                            No bookings found
                          </td>
                        </tr>
                      ) : (() => {
                        const filteredBookings = bookings.filter(booking => {
                          const searchLower = bookingSearchQuery.toLowerCase().trim();
                          
                          // If search is empty, show all
                          if (!searchLower) {
                            return true;
                          }
                          
                          const referenceMatch = (booking.reference || '').toLowerCase().includes(searchLower);
                          const motelMatch = (booking.motel || '').toLowerCase().includes(searchLower);
                          const guestMatch = (booking.guest || '').toLowerCase().includes(searchLower);
                          const searchMatches = referenceMatch || motelMatch || guestMatch;
                          
                          // Date filter logic
                          let dateMatches = true;
                          if (bookingCheckInFilter || bookingCheckOutFilter) {
                            // Parse booking dates properly
                            const bookingCheckInDate = new Date(booking.checkIn);
                            const bookingCheckOutDate = new Date(booking.checkOut);
                            const bookingCheckInStr = bookingCheckInDate.getFullYear() + '-' + 
                              String(bookingCheckInDate.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(bookingCheckInDate.getDate()).padStart(2, '0');
                            const bookingCheckOutStr = bookingCheckOutDate.getFullYear() + '-' + 
                              String(bookingCheckOutDate.getMonth() + 1).padStart(2, '0') + '-' + 
                              String(bookingCheckOutDate.getDate()).padStart(2, '0');
                            
                            if (bookingCheckInFilter && bookingCheckOutFilter) {
                              // If both filters set, check if booking dates overlap with range
                              dateMatches = bookingCheckInStr >= bookingCheckInFilter && bookingCheckOutStr <= bookingCheckOutFilter;
                            } else if (bookingCheckInFilter) {
                              // Check if booking check-in is on or after the filter date
                              dateMatches = bookingCheckInStr >= bookingCheckInFilter;
                            } else if (bookingCheckOutFilter) {
                              // Check if booking check-out is on or before the filter date
                              dateMatches = bookingCheckOutStr <= bookingCheckOutFilter;
                            }
                          }
                          
                          return searchMatches && dateMatches;
                        });
                        
                        const totalPages = Math.ceil(filteredBookings.length / bookingItemsPerPage);
                        const startIndex = (bookingCurrentPage - 1) * bookingItemsPerPage;
                        const endIndex = startIndex + bookingItemsPerPage;
                        const paginatedBookings = filteredBookings.slice(startIndex, endIndex);
                        
                        if (bookingCurrentPage > totalPages && totalPages > 0) {
                          setBookingCurrentPage(1);
                        }
                        
                        if (filteredBookings.length === 0) {
                          return (
                            <tr>
                              <td colSpan={8} className="py-8 px-4 text-center text-gray-500">
                                {bookingSearchQuery ? 'No bookings found matching your search' : 'No bookings available'}
                              </td>
                            </tr>
                          );
                        }
                        
                        return paginatedBookings.map((booking, index) => {
                          const statusColor = booking.status === 1 ? 'bg-green-100 text-green-700' :
                                            booking.status === 0 ? 'bg-orange-100 text-orange-700' :
                                            'bg-red-100 text-red-700';
                          return (
                            <motion.tr
                              key={booking.id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <td className="py-3 px-4 font-semibold text-gray-900">{booking.id}</td>
                              <td className="py-3 px-4 font-semibold text-cyan-600">{booking.reference}</td>
                              <td className="py-3 px-4">{booking.motel.charAt(0).toUpperCase() + booking.motel.slice(1)}</td>
                              <td className="py-3 px-4 text-gray-600">{booking.guest}</td>
                              <td className="py-3 px-4 text-gray-600">{booking.checkIn}</td>
                              <td className="py-3 px-4 text-gray-600">{booking.checkOut}</td>
                              <td className="py-3 px-4 font-semibold">{booking.amount}</td>
                              <td className="py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                                  {booking.statusLabel}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Booking Pagination */}
            {activeTab === 'bookings' && (() => {
              const filteredBookings = bookings.filter(booking => {
                const searchLower = bookingSearchQuery.toLowerCase().trim();
                
                // If search is empty, show all
                if (!searchLower) {
                  return true;
                }
                
                const referenceMatch = (booking.reference || '').toLowerCase().includes(searchLower);
                const motelMatch = (booking.motel || '').toLowerCase().includes(searchLower);
                const guestMatch = (booking.guest || '').toLowerCase().includes(searchLower);
                const searchMatches = referenceMatch || motelMatch || guestMatch;
                
                // Date filter logic
                let dateMatches = true;
                if (bookingCheckInFilter || bookingCheckOutFilter) {
                  // Parse booking dates properly
                  const bookingCheckInDate = new Date(booking.checkIn);
                  const bookingCheckOutDate = new Date(booking.checkOut);
                  const bookingCheckInStr = bookingCheckInDate.getFullYear() + '-' + 
                    String(bookingCheckInDate.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(bookingCheckInDate.getDate()).padStart(2, '0');
                  const bookingCheckOutStr = bookingCheckOutDate.getFullYear() + '-' + 
                    String(bookingCheckOutDate.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(bookingCheckOutDate.getDate()).padStart(2, '0');
                  
                  if (bookingCheckInFilter && bookingCheckOutFilter) {
                    dateMatches = bookingCheckInStr >= bookingCheckInFilter && bookingCheckOutStr <= bookingCheckOutFilter;
                  } else if (bookingCheckInFilter) {
                    dateMatches = bookingCheckInStr >= bookingCheckInFilter;
                  } else if (bookingCheckOutFilter) {
                    dateMatches = bookingCheckOutStr <= bookingCheckOutFilter;
                  }
                }
                
                return searchMatches && dateMatches;
              });
              const totalPages = Math.ceil(filteredBookings.length / bookingItemsPerPage);
              
              if (filteredBookings.length === 0 || totalPages <= 1) return null;
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6 mt-4 border-t-4 border-cyan-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 font-medium">
                      Showing {Math.min((bookingCurrentPage - 1) * bookingItemsPerPage + 1, filteredBookings.length)} to {Math.min(bookingCurrentPage * bookingItemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setBookingCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={bookingCurrentPage === 1}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          bookingCurrentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setBookingCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            bookingCurrentPage === page
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setBookingCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={bookingCurrentPage === totalPages}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          bookingCurrentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                {/* <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black">User Management</h2>
                  <Button onClick={() => setShowUserModal(true)} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    + Create User
                  </Button>
                </div> */}

                {/* Search and Filter Section */}
                <div className="mb-6 flex gap-3 flex-wrap items-end">
                  <input
                    type="text"
                    placeholder="Search by name or role..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="flex-1 min-w-xs px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                  
                  <button
                    onClick={() => setUserStatusFilter(null)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      userStatusFilter === null
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Users
                  </button>
                  
                  <button
                    onClick={() => setUserStatusFilter(1)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      userStatusFilter === 1
                        ? 'bg-green-100 text-green-700 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Active
                  </button>
                  
                  <button
                    onClick={() => setUserStatusFilter(0)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      userStatusFilter === 0
                        ? 'bg-gray-100 text-gray-700 border-2 border-gray-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                    Inactive
                  </button>

                  <select
                    value={userRoleFilter || ''}
                    onChange={(e) => setUserRoleFilter(e.target.value || null)}
                    className="px-4 py-2 rounded-lg font-semibold border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 transition-all cursor-pointer"
                  >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="motelowner">Motel Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                  
                  {userSearchQuery && (
                    <button
                      onClick={() => {
                        setUserSearchQuery('');
                      }}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all"
                    >
                      Clear Search
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left font-black">S.No</th>
                        <th className="py-3 px-4 text-left font-black">Name</th>
                        <th className="py-3 px-4 text-left font-black">Email</th>
                        <th className="py-3 px-4 text-left font-black">Role</th>
                        <th className="py-3 px-4 text-left font-black">Status</th>
                        <th className="py-3 px-4 text-left font-black">Last Login</th>
                        <th className="py-3 px-4 text-left font-black">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filteredUsers = users.filter(user => {
                          const searchLower = userSearchQuery.toLowerCase();
                          // Search in first_name, last_name, name, email, and role
                          const nameMatch = 
                            (user.first_name || '').toLowerCase().includes(searchLower) ||
                            (user.last_name || '').toLowerCase().includes(searchLower) ||
                            (user.name || '').toLowerCase().includes(searchLower) ||
                            (`${user.first_name || ''} ${user.last_name || ''}`.trim()).toLowerCase().includes(searchLower);
                          const emailMatch = (user.email || '').toLowerCase().includes(searchLower);
                          const roleMatch = (user.role || '').toLowerCase().includes(searchLower);
                          const searchMatches = nameMatch || emailMatch || roleMatch;
                          
                          const statusMatch = userStatusFilter === null ? true : user.status === userStatusFilter;
                          
                          const roleFilterMatch = userRoleFilter === null ? true : user.role === userRoleFilter;
                          
                          return searchMatches && statusMatch && roleFilterMatch;
                        });
                        
                        // Pagination logic
                        const totalPages = Math.ceil(filteredUsers.length / userItemsPerPage);
                        const startIndex = (userCurrentPage - 1) * userItemsPerPage;
                        const endIndex = startIndex + userItemsPerPage;
                        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
                        
                        // Reset to page 1 if current page exceeds total pages
                        if (userCurrentPage > totalPages && totalPages > 0) {
                          setUserCurrentPage(1);
                        }
                        
                        if (filteredUsers.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="py-8 px-4 text-center text-gray-500">
                                {userSearchQuery ? 'No users found matching your search' : 'No users available'}
                              </td>
                            </tr>
                          );
                        }
                        
                        return paginatedUsers.map((user, index) => {
                        const displayName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A';
                        const statusActive = user.status === 1;
                        const lastLogin = user.last_login 
                          ? new Date(user.last_login * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '-';
                        const roleDisplay = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A';
                        return (
                        <motion.tr
                          key={user.id.toString()}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="py-3 px-4 font-semibold text-center text-gray-700">{startIndex + index + 1}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold">{displayName}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                              {roleDisplay}
                            </span>
                          </td>
                          <td className="py-3 px-4 flex items-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {statusActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{lastLogin}</td>
    <td className="py-3 px-4">
  <div className="flex gap-2">
    <IconButton
      icon={Eye}
      variant="primary"
      ariaLabel="View user"
      onClick={() => {
        setSelectedUser(user);
        setShowUserView(true);
      }}
    />

    <IconButton
      icon={Pencil}
      variant="warning"
      ariaLabel="Edit user"
      onClick={() => {
        setEditUser(user);
        setShowEditUserModal(true);
      }}
    />

    <IconButton
      icon={Trash2}
      variant="danger"
      ariaLabel="Delete user"
      onClick={() => {
        setUserToDelete(user);
        setShowDeleteUserConfirm(true);
      }}
    />
  </div>
</td>


                        </motion.tr>
                        );
                      });
                      })()}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* User Pagination */}
            {activeTab === 'users' && (() => {
              const filteredUsers = users.filter(user => {
                const searchLower = userSearchQuery.toLowerCase();
                const nameMatch = 
                  (user.first_name || '').toLowerCase().includes(searchLower) ||
                  (user.last_name || '').toLowerCase().includes(searchLower) ||
                  (user.name || '').toLowerCase().includes(searchLower) ||
                  (`${user.first_name || ''} ${user.last_name || ''}`.trim()).toLowerCase().includes(searchLower);
                const emailMatch = (user.email || '').toLowerCase().includes(searchLower);
                const roleMatch = (user.role || '').toLowerCase().includes(searchLower);
                const searchMatches = nameMatch || emailMatch || roleMatch;
                
                const statusMatch = userStatusFilter === null ? true : user.status === userStatusFilter;
                const roleFilterMatch = userRoleFilter === null ? true : user.role === userRoleFilter;
                
                return searchMatches && statusMatch && roleFilterMatch;
              });
              const totalPages = Math.ceil(filteredUsers.length / userItemsPerPage);
              
              if (filteredUsers.length === 0 || totalPages <= 1) return null;
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6 mt-4 border-t-4 border-cyan-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {Math.min((userCurrentPage - 1) * userItemsPerPage + 1, filteredUsers.length)} to {Math.min(userCurrentPage * userItemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={userCurrentPage === 1}
                        className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                          userCurrentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                        }`}
                      >
                        ← Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setUserCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                            userCurrentPage === page
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={userCurrentPage === totalPages}
                        className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                          userCurrentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
                        }`}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Roles Tab */}
            {activeTab === 'roles' && (
              <motion.div
                key="roles"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black">Role Management</h2>
                  <Button onClick={() => setShowRoleModal(true)} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    + Create Role
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roles.map((role, index) => (
                    <motion.div
                      key={role.id}
                      className="border-2 border-gray-200 rounded-xl p-4 hover:border-cyan-500 hover:shadow-md transition-all"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
  <IconButton
    icon={Pencil}
    variant="warning"
    ariaLabel="Edit role"
    onClick={() => handleEditRole(role as ApiRole)}
  />

  <IconButton
    icon={Trash2}
    variant="danger"
    ariaLabel="Delete role"
    onClick={() => {
      if (confirm(`Are you sure you want to deactivate role "${role.name}"?`)) {
        handleDeleteRole(role.id);
      }
    }}
  />
</div>

                      </div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-black mb-1">{role.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${role.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {role.status === 1 ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{role.created_at ? new Date(role.created_at).toLocaleDateString() : '-'}</span>
                          </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <motion.div
                key="features"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black">Feature Management</h2>
                  <Button onClick={() => { setShowFeatureModal(true); setEditingFeatureId(null); setNewFeature({ name: '', code: '', parent_id: null, status: 1 }); }} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    + Add Feature
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left font-black">Name</th>
                        {/* <th className="py-3 px-4 text-left font-black">Code</th> */}
                        {/* <th className="py-3 px-4 text-left font-black">Parent</th> */}
                        <th className="py-3 px-4 text-left font-black">Status</th>
                        <th className="py-3 px-4 text-left font-black">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((f, idx) => (
                        <motion.tr
                          key={f.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <td className="py-3 px-4 font-semibold">{f.name}</td>
                          {/* <td className="py-3 px-4 text-gray-600">{f.code}</td> */}
                          {/* <td className="py-3 px-4 text-gray-600">{f.parent_id ?? '-'}</td> */}
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${f.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {f.status === 1 ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <IconButton icon={Pencil} variant="secondary" ariaLabel="Edit feature" onClick={() => { setEditingFeatureId(f.id); setNewFeature({ name: f.name, code: f.code, parent_id: f.parent_id ?? null, status: f.status }); setShowFeatureModal(true); }} />
                              <IconButton icon={Trash2} variant="danger" ariaLabel="Delete feature" onClick={async () => {
                                try {
                                     await apiDelete(`/features/${f.id}`);
                                     alert("Feature deleted");
                                     fetchFeatures();  // reload list
                                     } catch (err) {
                                     console.error("Failed to delete feature", err);
                                     alert("Failed to delete feature");
                                    }
                              }} />
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
              <motion.div
                key="permissions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-6 gap-4">
                  <h2 className="text-2xl font-black">Permission Management</h2>
                  <div className="flex items-center gap-3">
                    {/* Filter by Role */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-gray-700 whitespace-nowrap">Filter by Role:</label>
                      <select
                        value={permissionRoleFilter || ''}
                        onChange={(e) => setPermissionRoleFilter(e.target.value || null)}
                        className="w-full md:w-40 px-3 py-1.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="">All Roles</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button onClick={() => setShowPermissionModal(true)} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white h-fit">
                      + Create Permission
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {permissions
                    .filter(permission => !permissionRoleFilter || permission.role === permissionRoleFilter)
                    .map((permission, index) => (
                    <motion.div
                      key={permission.id}
                      className="border-2 border-gray-200 rounded-2xl p-5 hover:border-cyan-500 hover:shadow-md transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Left Section - Icon & Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Key className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-black text-lg">{permission.name}</h3>
                              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-semibold">
                                {permission.module}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{permission.description}</p>
                            
                            {/* Role Badge */}
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-cyan-600" />
                              <span className="text-xs font-semibold text-cyan-600">
                                Role: {permission.role}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Privileges */}
                        <div className="lg:w-80">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                            Privileges
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { key: 'create', label: 'Create', Icon: Plus },
                              { key: 'read', label: 'Read', Icon: Eye },
                              { key: 'update', label: 'Update', Icon: Pencil },
                              { key: 'delete', label: 'Delete', Icon: Trash2 },
                              { key: 'approve', label: 'Approve', Icon: CheckSquare },
                              { key: 'reject', label: 'Reject', Icon: X },
                            ].map((privilege) => {
                              const isActive = permission.privileges[privilege.key as keyof typeof permission.privileges];
                              return (
                                <div
                                  key={privilege.key}
                                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${
                                    isActive ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500'
                                  }`}
                                  title={`${privilege.label}: ${isActive ? 'Enabled' : 'Disabled'}`}
                                >
                                  <privilege.Icon className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">{privilege.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                        <button
                          className="px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors text-sm font-semibold cursor-pointer flex items-center gap-2"
                          onClick={() => handleEditPermission(permission)}
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold cursor-pointer flex items-center gap-2"
                          onClick={() => handleDeletePermission(permission.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Master Data Tab */}
            {activeTab === 'masters' && (
              <motion.div
                key="masters"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <MasterDataPage />
              </motion.div>
            )}
            {activeTab === "privileges" && (
              <motion.div
                key="masters"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PrivilegesScreen  />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <DashboardFooter />
      </div>

      {/* Motel View Modal - FIXED VERSION */}
<AnimatePresence>
  {showMotelViewModal && selectedMotel && (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        setShowMotelViewModal(false);
        setSelectedMotel(null);
      }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] my-8 overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading State */}
        {motelViewLoading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-cyan-600 animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading motel details...</p>
            </div>
          </div>
        )}

        {/* Scrollable Container */}
        {!motelViewLoading && selectedMotel && (
          <>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <div className="p-6 pb-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 pb-6 border-b-2 border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-3xl font-black mb-2">{selectedMotel.motel_name}</h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">
  {selectedMotel.city_name}, {selectedMotel.state_name}, {selectedMotel.country_name}
</span>

                </div>
              </div>
              <div className="flex items-center gap-3">
     <span
  className={`px-4 py-2 rounded-full text-sm font-bold ${
    getApprovalStatusClass(selectedMotel.approval_status)
  }`}
>
  {getApprovalStatusLabel(selectedMotel.approval_status)}
</span>


                <button
                  onClick={() => {
                    setShowMotelViewModal(false);
                    setSelectedMotel(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <div>
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-cyan-600" />
                    Motel Information
                  </h3>
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 space-y-4">
                    <div className="grid md:grid-cols-1 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Rooms</p>
                        <p className="text-2xl font-bold">{typeof selectedMotel.rooms === 'number' ? selectedMotel.rooms : 0}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Full Address</p>
                      <p className="font-semibold">{[
                        selectedMotel.address_line1,
                        selectedMotel.address_line2,
                        selectedMotel.city_name,
                        selectedMotel.state_name,
                        selectedMotel.country_name,
                        selectedMotel.zip_code
                      ].filter(Boolean).join(', ') || 'Address not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="text-gray-700 leading-relaxed">{selectedMotel.about || selectedMotel.description || 'No description provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Owner Info */}
                <div>
                  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-cyan-600" />
                    Owner Information
                  </h3>
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Owner Name</p>
                      <p className="text-xl font-bold">{(selectedMotel.owner_first_name || '') && (selectedMotel.owner_last_name || '') ? `${selectedMotel.owner_first_name} ${selectedMotel.owner_last_name}` : 'Owner name not provided'}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Mail className="w-4 h-4" /> Email
                        </p>
                        <p className="font-semibold text-cyan-600 break-all">{selectedMotel.owner_email || 'Email not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone className="w-4 h-4" /> Phone
                        </p>
                        <p className="font-semibold">{selectedMotel.owner_phone || 'Phone not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Amenities */}
<div>
  <h3 className="text-xl font-black mb-4 flex items-center gap-2">
    <CheckSquare className="w-6 h-6 text-cyan-600" />
    Amenities
  </h3>

  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {[
      { key: "parking_available", label: "Parking" },
      { key: "wifi_available", label: "Wi-Fi" },
      { key: "ac_available", label: "Air Conditioning" },
      { key: "restaurant_available", label: "Restaurant" },
      { key: "swimming_pool", label: "Swimming Pool" },
      { key: "power_backup", label: "Power Backup" },
      { key: "cctv", label: "CCTV" },
      { key: "room_service", label: "Room Service" },
      { key: "laundry_service", label: "Laundry Service" },
      { key: "pet_friendly", label: "Pet Friendly" },
    ].map((amenity) => {
      const isAvailable = selectedMotel.amenities?.[amenity.key] === 1;

      return (
        <div
          key={amenity.key}
          className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2
            ${isAvailable
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-400"
            }`}
        >
          {isAvailable ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {amenity.label}
        </div>
      );
    })}
  </div>
</div>


{/* Property Images */}
{selectedMotel.images?.length > 0 && (
  <div>
    <h3 className="text-xl font-black mb-4 flex items-center gap-2">
      <ImageIcon className="w-6 h-6 text-cyan-600" />
      Property Images ({selectedMotel.images.length})
    </h3>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {selectedMotel.images.map((img: any, idx: number) => (
        <div
          key={idx}
          className="border rounded-xl overflow-hidden bg-white shadow-sm"
        >
          <img
            src={typeof img === 'string' ? img : img.file_url}
            alt=""
            className="w-full h-48 object-cover bg-gray-100"
          />
          <div className="p-2 text-center text-sm text-gray-600">
            {typeof img === 'string' ? 'Motel Image' : (img.caption || 'Image')}
          </div>
        </div>
      ))}
    </div>
  </div>
)}


                {/* Documents */}
                {/* Documents */}
{selectedMotel.documents?.length > 0 && (
  <div>
    <h3 className="text-xl font-black mb-4 flex items-center gap-2">
      <FileText className="w-6 h-6 text-cyan-600" />
      Documents
    </h3>

    <div className="space-y-3">
      {selectedMotel.documents.map((doc: any) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-4 border rounded-xl bg-gray-50"
        >
          <div>
            <p className="font-bold">{doc.document_type}</p>
            <p className="text-sm text-gray-600">{doc.document_number}</p>
          </div>

          <IconButton
            icon={Eye}
            variant="primary"
            ariaLabel="View document"
            onClick={() => {
              window.open(doc.file_url, '_blank');
            }}
          />
        </div>
      ))}
    </div>
  </div>
)}

              </div>

              {/* Right Column - Sticky Actions */}
              {/* <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                  <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-2xl p-6">
                    <h3 className="text-xl font-black mb-6">Quick Actions</h3>
                    
                    <div className="space-y-4 mb-6 text-sm">
                      <div className="flex justify-between">
                        <span className="text-cyan-100">Submitted</span>
                        <span className="font-bold">{selectedMotel.submittedDate || selectedMotel.created_at || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-100">Documents</span>
                        <span className="font-bold">
                          {selectedMotel.documents && selectedMotel.documents.length > 0 ? (
                            <>
                              {selectedMotel.documents.filter((d: any) => d.verification_status === 1 || d.status === 'verified').length}/
                              {selectedMotel.documents.length} Verified
                            </>
                          ) : (
                            '0 documents'
                          )}
                        </span>
                      </div>
                    </div>

                    {selectedMotel.approval_status === 0 && (
                      <div className="space-y-3">
                        <Button
                          variant="success"
                          size="lg"
                          fullWidth
                          icon={CheckCircle}
                          onClick={() => handleApproveMotel(selectedMotel.id)}
                          className="font-bold"
                        >
                          Approve Motel
                        </Button>
                        <Button
                          variant="danger"
                          size="lg"
                          fullWidth
                          icon={XCircle}
                          onClick={() => handleRejectMotel(selectedMotel.id)}
                          className="font-bold"
                        >
                          Reject Motel
                        </Button>
                      </div>
                    )}

                    {selectedMotel.approval_status === 1 && (
                      <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 mx-auto mb-3 text-green-300" />
                        <p className="text-lg font-bold">Already Approved</p>
                      </div>
                    )}

                    {selectedMotel.approval_status === 2 && (
                      <div className="text-center py-8">
                        <XCircle className="w-16 h-16 mx-auto mb-3 text-red-300" />
                        <p className="text-lg font-bold">Already Rejected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div> */}

            </div>
          </div>
        </div>

        {/* Fixed Bottom Close Bar */}
        <div className="border-t-2 border-gray-200 bg-gray-50 px-6 py-4 flex justify-end">
          <Button
            onClick={() => {
              setShowMotelViewModal(false);
              setSelectedMotel(null);
            }}
            variant="outline"
            size="lg"
          >
            Close
          </Button>
        </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )}

  {/* Document Viewer Modal */}
  {showDocumentViewer && selectedDocument && (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        setShowDocumentViewer(false);
        setSelectedDocument(null);
      }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-black">{selectedDocument.document_type}</h2>
            <p className="text-gray-600">Document ID: {selectedDocument.document_number}</p>
          </div>
          <button
            onClick={() => {
              setShowDocumentViewer(false);
              setSelectedDocument(null);
            }}
            className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
          {selectedDocument.file_url ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              {selectedDocument.file_url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={selectedDocument.file_url}
                  className="w-full h-full border-0"
                  title={selectedDocument.document_type}
                />
              ) : selectedDocument.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={selectedDocument.file_url}
                  alt={selectedDocument.document_type}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">{selectedDocument.file_url.split('/').pop()}</p>
                  <a
                    href={selectedDocument.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors inline-block"
                  >
                    Open in New Tab
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600">No document URL available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              selectedDocument.verification_status === 1
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}>
              {selectedDocument.verification_status === 1 ? "✓ Verified" : "◉ Pending"}
            </span>
          </div>
          <div className="flex gap-2">
            <a
              href={selectedDocument.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg text-sm font-semibold hover:bg-cyan-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
            <button
              onClick={() => {
                setShowDocumentViewer(false);
                setSelectedDocument(null);
              }}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}

  {showRejectModal && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md">
      <h3 className="text-xl font-bold mb-4">Reject Motel</h3>

      <textarea
        className="w-full border p-3 rounded mb-4"
        rows={4}
        placeholder="Enter rejection reason"
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
      />

      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 border rounded"
          onClick={() => setShowRejectModal(false)}
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={submitRejectMotel}
        >
          Reject
        </button>
      </div>
    </div>
  </div>
)}

</AnimatePresence>

      {/* Create Role Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowRoleModal(false); setEditingRoleId(null); }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-black mb-4">{editingRoleId ? 'Edit Role' : 'Create New Role'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Role Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g., Content Manager"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  {roleErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{roleErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 resize-none"
                    rows={3}
                    placeholder="Describe the role responsibilities..."
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  />
                  {roleErrors.description && (
                    <p className="text-red-500 text-xs mt-1">{roleErrors.description}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => { setShowRoleModal(false); setEditingRoleId(null); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleCreateRole}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                  >
                    {editingRoleId ? 'Update Role' : 'Create Role'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Feature Modal */}
      <AnimatePresence>
        {showFeatureModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowFeatureModal(false); setEditingFeatureId(null); }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-black mb-4">{editingFeatureId ? 'Edit Feature' : 'Create New Feature'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Name <span className="text-red-500">*</span></label>
                  <select
                    value={newFeature.name}
                    onChange={(e) => {
                      setNewFeature({ ...newFeature, name: e.target.value });
                      setFeatureErrors({ ...featureErrors, name: undefined });
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="">Select a feature...</option>
                    {availableFeatures.map((feature) => (
                      <option key={feature} value={feature}>
                        {feature}
                      </option>
                    ))}
                  </select>
                  {featureErrors.name && <p className="text-sm text-red-600 mt-1">{featureErrors.name}</p>}
                </div>

                {false && (
                  <>
                    {/* Code field - commented out */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Code <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="e.g., F001"
                        value={newFeature.code}
                        onChange={(e) => {
                          setNewFeature({ ...newFeature, code: e.target.value });
                          setFeatureErrors({ ...featureErrors, code: undefined });
                        }}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                      {featureErrors.code && <p className="text-sm text-red-600 mt-1">{featureErrors.code}</p>}
                    </div>

                    {/* Parent field - commented out */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Parent</label>
                      <select
                        value={newFeature.parent_id ?? ''}
                        onChange={(e) => setNewFeature({ ...newFeature, parent_id: e.target.value ? Number(e.target.value) : null })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="">None</option>
                        {features.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" fullWidth onClick={() => { setShowFeatureModal(false); setEditingFeatureId(null); setFeatureErrors({}); }}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                    onClick={async () => {
                      // Client-side validation
                      const errors: { name?: string; code?: string } = {};
                      if (!newFeature.name || newFeature.name.trim().length < 1) errors.name = 'Name is required';
                      setFeatureErrors(errors);
                      if (Object.keys(errors).length) return;

                      const payload = {
                        name: newFeature.name,
                        status: newFeature.status,
                      };

                      try {
                        if (editingFeatureId) {
                          await apiPut(`/features/${editingFeatureId}`, payload);
                          toast.success('Feature updated successfully!');
                        } else {
                          await apiPost('/features', payload);
                          toast.success('Feature created successfully!');
                        }

                        setShowFeatureModal(false);
                        setEditingFeatureId(null);
                        setFeatureErrors({});
                        fetchFeatures(); // reload list

                      } catch (err: any) {
                        console.error('Failed to save feature:', err);
                        const data = err?.response?.data;
                        if (data?.errors) {
                          const parsed: any = {};
                          Object.keys(data.errors).forEach((k) => {
                            parsed[k] = Array.isArray(data.errors[k]) ? data.errors[k][0] : data.errors[k];
                          });
                          setFeatureErrors(parsed);
                          const summary = Object.values(parsed).join('. ');
                          toast.error(summary || data.message || 'Validation failed');
                        } else {
                          toast.error(data?.message || 'Failed to save feature');
                        }
                      }
                    }}
                  >
                    {editingFeatureId ? 'Update Feature' : 'Create Feature'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Permission Modal - FIXED SCROLL & HEIGHT */}
<AnimatePresence>
  {showPermissionModal && (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleCancelPermission}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] my-8 overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-2 scrollbar-thin scrollbar-thumb-gray-400">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-2xl font-black">
              {editingPermissionId ? 'Edit Permission' : 'Create New Permission'}
            </h3>
            <button
              onClick={handleCancelPermission}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Role *</label>
              <select
                value={newPermission.role}
                onChange={(e) => setNewPermission({ ...newPermission, role: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="">Select a role...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Selection - Dropdown with Checkboxes */}
            <div id="features-dropdown">
              <label className="block text-sm font-bold text-gray-700 mb-2">Features *</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFeaturesDropdownOpen(!featuresDropdownOpen)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl text-left flex justify-between items-center hover:border-gray-300 transition-colors"
                >
                  <span className={newPermission.module.length > 0 ? "font-semibold text-gray-700" : "text-gray-500"}>
                    {newPermission.module.length > 0 
                      ? `${newPermission.module.length} feature${newPermission.module.length !== 1 ? 's' : ''} selected`
                      : "Select features"}
                  </span>
                  <ChevronDown size={18} className={`transition-transform ${featuresDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Content */}
                {featuresDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 border-2 border-gray-200 rounded-xl bg-white z-50 shadow-lg">
                    <div className="space-y-2 p-4 max-h-64 overflow-y-auto">
                      {features.length > 0 ? (
                        <>
                          {/* Select All Option */}
                          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors border-b-2 border-gray-100 pb-3">
                            <input
                              type="checkbox"
                              checked={features.length > 0 && newPermission.module.length === features.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewPermission({
                                    ...newPermission,
                                    module: features.map(f => f.name)
                                  });
                                } else {
                                  setNewPermission({
                                    ...newPermission,
                                    module: []
                                  });
                                }
                              }}
                              className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                            />
                            <span className="font-bold text-gray-800">Select All</span>
                          </label>

                          {/* Feature Items */}
                          {features.map(feature => (
                            <label key={feature.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                              <input
                                type="checkbox"
                                checked={newPermission.module.includes(feature.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewPermission({
                                      ...newPermission,
                                      module: [...newPermission.module, feature.name]
                                    });
                                  } else {
                                    setNewPermission({
                                      ...newPermission,
                                      module: newPermission.module.filter(f => f !== feature.name)
                                    });
                                  }
                                }}
                                className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                              />
                              <span className="font-semibold text-gray-700">{feature.name}</span>
                            </label>
                          ))}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">No features available</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Permission Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Permission Name *</label>
              <Input
                type="text"
                placeholder="e.g., Manage Bookings"
                value={newPermission.name}
                onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
              />
            </div>

            {/* Privileges Grid */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4">Privileges *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'create', label: 'Create', Icon: Plus },
                  { key: 'read', label: 'Read', Icon: Eye },
                  { key: 'update', label: 'Update', Icon: Pencil },
                  { key: 'delete', label: 'Delete', Icon: Trash2 },
                  { key: 'approve', label: 'Approve', Icon: CheckSquare },
                  { key: 'reject', label: 'Reject', Icon: X },
                ].map((privilege) => (
                  <label
                    key={privilege.key}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      newPermission.privileges[privilege.key as keyof typeof newPermission.privileges]
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-transparent text-white shadow-lg'
                        : 'border-gray-200 hover:border-cyan-500 hover:bg-cyan-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={newPermission.privileges[privilege.key as keyof typeof newPermission.privileges]}
                      onChange={(e) =>
                        setNewPermission({
                          ...newPermission,
                          privileges: {
                            ...newPermission.privileges,
                            [privilege.key]: e.target.checked,
                          },
                        })
                      }
                      className="w-5 h-5 rounded text-cyan-600 focus:ring-cyan-500"
                    />
                    <div className="flex items-center gap-2">
                      <privilege.Icon className="w-5 h-5" />
                      <span className="font-bold">{privilege.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                value={newPermission.description}
                onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 resize-none"
                rows={3}
                placeholder="Describe what this permission allows..."
              />
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons at Bottom */}
        <div className="border-t-2 border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancelPermission}>
            Cancel
          </Button>
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700" onClick={handleSavePermission}>
            {editingPermissionId ? 'Update Permission' : 'Create Permission'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      {/* Create User Modal */}
<AnimatePresence>
  {showUserModal && (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowUserModal(false)}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] my-8 overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-2 scrollbar-thin scrollbar-thumb-gray-400">
          <div className="pb-6 mb-2 border-b-2 border-gray-200">
            <h3 className="text-2xl font-black">Create New User</h3>
          </div>
          <div className="space-y-4">

            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., John"
                value={newUser.first_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, first_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {userErrors.first_name && (
               <p className="text-red-500 text-xs mt-1">{userErrors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., Doe"
                value={newUser.last_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, last_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {userErrors.last_name && (
               <p className="text-red-500 text-xs mt-1">{userErrors.last_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                placeholder="e.g., john@example.com"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {userErrors.email && <p className="text-red-500 text-xs mt-1">{userErrors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-2">Phone Number</label>
              <input
                type="text"
                placeholder="e.g., +1 (555) 123-4567 or 9876543210"
                value={newUser.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                  setNewUser({ ...newUser, phone: value });
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {userErrors.phone && (
               <p className="text-red-500 text-xs mt-1">{userErrors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2">Password <span className="text-red-500">*</span></label>
              <input
                type="password"
                placeholder="Enter password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {userErrors.password && (
               <p className="text-red-500 text-xs mt-1">{userErrors.password}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold mb-2">Status <span className="text-red-500">*</span></label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={newUser.status === "active"}
                    onChange={() => setNewUser({ ...newUser, status: "active" })}
                    className="w-4 h-4 text-cyan-600"
                  />
                  <span>Active</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={newUser.status === "inactive"}
                    onChange={() => setNewUser({ ...newUser, status: "inactive" })}
                    className="w-4 h-4 text-gray-600"
                  />
                  <span>Inactive</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="border-t-2 border-gray-200 bg-gray-50 px-6 py-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowUserModal(false)}
          >
            Cancel
          </Button>

          <Button
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
            onClick={handleCreateUser}
          >
            Create User
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
<AnimatePresence>
  {showEditUserModal && editUser && (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowEditUserModal(false)}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] my-8 overflow-hidden flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-2 scrollbar-thin scrollbar-thumb-gray-400">
          <div className="pb-6 mb-2 border-b-2 border-gray-200">
            <h3 className="text-2xl font-black">Edit User</h3>
          </div>

          <div className="space-y-4">

            <div>
              <label className="block text-sm font-semibold mb-2">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={editUser.first_name}
                onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {editUserErrors.first_name && (
               <p className="text-red-500 text-xs mt-1">{editUserErrors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={editUser.last_name}
                onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {editUserErrors.last_name && (
               <p className="text-red-500 text-xs mt-1">{editUserErrors.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {editUserErrors.email && (
               <p className="text-red-500 text-xs mt-1">{editUserErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Phone</label>
              <input
                type="text"
                value={editUser.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                  setEditUser({ ...editUser, phone: value });
                }}
                placeholder="e.g., +1 (555) 123-4567 or 9876543210"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {editUserErrors.phone && (
               <p className="text-red-500 text-xs mt-1">{editUserErrors.phone}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold mb-2">Status <span className="text-red-500">*</span></label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="statusEdit"
                    checked={editUser.status === 1}
                    onChange={() => setEditUser({ ...editUser, status: 1 })}
                  />
                  <span>Active</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="statusEdit"
                    checked={editUser.status === 0}
                    onChange={() => setEditUser({ ...editUser, status: 0 })}
                  />
                  <span>Inactive</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="border-t-2 border-gray-200 bg-gray-50 px-6 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setShowEditUserModal(false)}>
            Cancel
          </Button>

          <Button
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
            onClick={handleUpdateUser}
          >
            Save Changes
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


      {/* View User Modal */}
      <AnimatePresence>
        {showUserView && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUserView(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-black">User Details</h3>
                <IconButton icon={X} variant="secondary" ariaLabel="Close" onClick={() => setShowUserView(false)} />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-semibold">{selectedUser.first_name} {selectedUser.last_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-semibold">{selectedUser.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-semibold">{selectedUser.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-semibold">{selectedUser.status === 1 ? 'Active' : 'Inactive'}</div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 justify-end">
                <Button variant="outline" onClick={() => setShowUserView(false)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        userEmail="admin@moteltrips.com"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeletePermission}
        title="Delete Permission"
        message="Are you sure you want to delete this permission? This action cannot be undone and may affect users with this permission."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      <ConfirmDialog
        isOpen={showDeleteUserConfirm}
        onClose={() => setShowDeleteUserConfirm(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

{showProfileModal && (
  <motion.div
    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setShowProfileModal(false)}
  >
    <motion.div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
      initial={{ scale: 0.9, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 50 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Profile Details</h2>
          <p className="text-gray-600 text-sm">Super Administrator</p>
        </div>
        <button
          onClick={() => setShowProfileModal(false)}
          className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {adminProfileLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-cyan-600 animate-spin"></div>
          </div>
        ) : adminProfile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">First Name</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{adminProfile.first_name || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Name</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{adminProfile.last_name || '-'}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{adminProfile.email || '-'}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{adminProfile.phone || '-'}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{adminProfile.role || 'Admin'}</p>
            </div>

            {adminProfile.created_at && (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Member Since</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {new Date(adminProfile.created_at * 1000).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-600">No profile information available</p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-200 bg-gray-50 px-6 py-4 flex justify-end">
        <button
          onClick={() => setShowProfileModal(false)}
          className="px-6 py-2 bg-cyan-600 text-white rounded-lg text-sm font-semibold hover:bg-cyan-700 transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  </motion.div>
)}

    </div>
  );
}