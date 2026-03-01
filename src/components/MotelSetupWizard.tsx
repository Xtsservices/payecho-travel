import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Image, FileText, ChevronRight, ChevronLeft, Send, Upload, XCircle, Eye, CheckCircle2, Wifi, Coffee, Tv, ParkingCircle, UtensilsCrossed, Wind, Dumbbell, WashingMachine, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Modal } from './ui';
import { getMotelById, apiUploadFile, apiGet, apiDelete } from "../api/api";
import { toast } from "react-toastify";

interface MotelSetupWizardProps {
  onComplete: () => void;
  profileData: {
  id?: number;
  motel_name: string;
  owner_id: number;
  contact_email: string;
  contact_phone: string;
  country_id: string;
  state_id: string;
  city_id: string;
  locality_id?: number | string;
  locality_name?: string;
  address: string;
  zip_code: string;
  registration_type: string;
  rooms: string;
};

  onProfileUpdate: (data: any) => void;
  uploadedImages: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedDocs: Array<{ name: string; uploadDate: string; status: string }>;
  onDocUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AVAILABLE_AMENITIES = [
  { id: 'wifi', label: 'Free Wi-Fi', icon: Wifi },
  { id: 'parking', label: 'Free Parking', icon: ParkingCircle },
  { id: 'breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'tv', label: 'Cable TV', icon: Tv },
  { id: 'ac', label: 'Air Conditioning', icon: Wind },
  { id: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  { id: 'gym', label: 'Fitness Center', icon: Dumbbell },
  { id: 'laundry', label: 'Laundry Service', icon: WashingMachine },
];

export default function MotelSetupWizard({
  onComplete,
  profileData,
  onProfileUpdate,
  uploadedImages,
  onImageUpload,
  uploadedDocs,
  onDocUpload
}: MotelSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [localProfile, setLocalProfile] = useState(profileData);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [imageTypeOptions, setImageTypeOptions] = useState<string[]>(['King','Queen','Twin','Exterior','Lobby','Pool','Restaurant']);
  const [roomTypeOptions, setRoomTypeOptions] = useState<string[]>([]);
  const [fetchedImages, setFetchedImages] = useState<any[]>([]);
  const [fetchedDocs, setFetchedDocs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageForm, setImageForm] = useState<{
    file: File | null;
    image_type: string;
    room_type: string;
    caption: string;
    display_order: number;
    is_primary: boolean;
  }>({ file: null, image_type: 'King', room_type: '', caption: '', display_order: 1, is_primary: false });
  
  useEffect(() => {
  setLocalProfile(profileData);
}, [profileData]);

  // Fetch room types, images, and documents
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        setRoomTypeOptions(['Standard', 'Deluxe', 'Suite', 'Presidential']);
      } catch (err) {
        console.error('Failed to fetch room types', err);
      }
    };
    const fetchMotelImages = async () => {
      try {
        const res = await apiGet("/motel-images");
        if (res.data.success) {
          setFetchedImages(res.data.data || []);
        }
      } catch (error: any) {
        console.error("Failed to fetch images", error);
      }
    };
    const fetchMotelDocuments = async () => {
      try {
        const res = await apiGet("/motel-documents");
        const docs = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        setFetchedDocs(docs || []);
      } catch (err: any) {
        console.error("Failed to fetch documents", err);
      }
    };
    fetchRoomTypes();
    fetchMotelImages();
    fetchMotelDocuments();
  }, []);

console.log("Local Profile:", localProfile);

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
        is_primary: imageForm.is_primary ? 1 : 0
      });

      if (res?.data?.success) {
        const image = res.data.data;
        setFetchedImages(prev => [...prev, image]);
        toast.success('Image uploaded successfully');
        if (keepOpen) {
          setImageForm(prev => ({ ...prev, file: null, caption: '', display_order: prev.display_order + 1 }));
          setTimeout(() => fileInputRef.current?.focus(), 80);
        } else {
          setShowImageModal(false);
          setImageForm({ file: null, image_type: 'King', room_type: '', caption: '', display_order: 1, is_primary: false });
        }
      }
    } catch (err: any) {
      console.error('Upload failed', err);
      toast.error(err?.response?.data?.message || 'Image upload failed');
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm('Do you want to delete this image?')) return;
    try {
      await apiDelete(`/motel-images/${id}`);
      setFetchedImages(prev => prev.filter(img => img.id !== id));
      toast.success('Image deleted successfully');
    } catch (error: any) {
      console.error('Delete failed', error);
      toast.error('Failed to delete image');
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const res = await apiUploadFile(
          '/motel-documents/upload',
          file,
          'document',
          {
            document_type: 'Business License',
            document_number: `DOC-${Date.now()}-${i + 1}`,
            issued_by: 'Motel Owner',
            issued_at: new Date().toISOString().split('T')[0],
            expiry_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
          }
        );
        if (res?.data?.success) {
          const doc = res.data.data;
          setFetchedDocs(prev => [...prev, doc]);
          toast.success(`Document ${i + 1} uploaded successfully`);
        }
      } catch (err: any) {
        console.error('Document upload failed', err);
        toast.error(err?.response?.data?.message || 'Document upload failed');
      }
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!confirm('Do you want to delete this document?')) return;
    try {
      await apiDelete(`/motel-documents/${id}`);
      setFetchedDocs(prev => prev.filter(doc => doc.id !== id));
      toast.success('Document deleted successfully');
    } catch (error: any) {
      console.error('Delete failed', error);
      toast.error('Failed to delete document');
    }
  };
  const steps = [
    { number: 1, title: 'Profile Information', icon: Building2, description: 'Enter your motel details' },
    { number: 2, title: 'Upload Images', icon: Image, description: 'Add photos of your property' },
    { number: 3, title: 'Tax Documents', icon: FileText, description: 'Upload required documents' }
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      onProfileUpdate(localProfile);
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onComplete();
  };

  const isStepValid = () => {
    if (currentStep === 1) {
  if (!localProfile) return false;

  return (
    !!localProfile.motel_name &&
    !!localProfile.contact_email &&
    !!localProfile.contact_phone &&
    !!localProfile.registration_type &&
    !!localProfile.rooms &&
    !!localProfile.country_id &&
    !!localProfile.state_id &&
    !!localProfile.city_id &&
    !!localProfile.address &&
    !!localProfile.zip_code
  );
}

    if (currentStep === 2) {
      return fetchedImages.length >= 3;
    }
    if (currentStep === 3) {
      return fetchedDocs.length >= 1;
    }
    return false;
  };
  useEffect(() => {
  setLocalProfile(profileData);
}, [profileData]);


  return (<>
    <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep === step.number
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg scale-110'
                      : currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: currentStep === step.number ? 1.1 : 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep > step.number ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </motion.div>
                <p className={`mt-2 text-xs sm:text-sm font-semibold text-center hidden sm:block ${
                  currentStep === step.number ? 'text-cyan-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded transition-all ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Mobile Step Title */}
        <div className="sm:hidden text-center">
          <h3 className="font-black">{steps[currentStep - 1].title}</h3>
          <p className="text-sm text-gray-600">{steps[currentStep - 1].description}</p>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Profile Information */}
{currentStep === 1 && (
  <motion.div
    key="step1"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4"
  >
    <div className="mb-6 hidden sm:block">
      <h2 className="text-2xl font-black text-gray-900">Motel Information</h2>
      <p className="text-gray-600 mt-1">Enter your motel details to proceed</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Motel Name */}
      <div>
        <label className="block text-sm font-semibold mb-2">Motel Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={localProfile?.motel_name}
          onChange={(e) => setLocalProfile({ ...localProfile, motel_name: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500"
          placeholder="Enter motel name"
        />
      </div>

      {/* Contact Email */}
      <div>
        <label className="block text-sm font-semibold mb-2">Contact Email <span className="text-red-500">*</span></label>
        <input
          type="email"
          value={localProfile?.contact_email}
          onChange={(e) => setLocalProfile({ ...localProfile, contact_email: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500"
          placeholder="Email address"
        />
      </div>

      {/* Contact Phone */}
      <div>
        <label className="block text-sm font-semibold mb-2">Contact Phone <span className="text-red-500">*</span></label>
        <input
          type="tel"
          value={localProfile?.contact_phone}
          onChange={(e) => setLocalProfile({ ...localProfile, contact_phone: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500"
          placeholder="Phone number"
        />
      </div>

      {/* Registration Type */}
      <div>
        <label className="block text-sm font-semibold mb-2">Registration Type <span className="text-red-500">*</span></label>
        <select
          value={localProfile?.registration_type}
          onChange={(e) => setLocalProfile({ ...localProfile, registration_type: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-cyan-500"
        >
          <option value="">Select Type</option>
          <option value="Motel">Motel</option>
          <option value="Hotel">Hotel</option>
          <option value="Resort">Resort</option>
        </select>
      </div>

      {/* Rooms */}
      <div>
        <label className="block text-sm font-semibold mb-2">Rooms <span className="text-red-500">*</span></label>
        <select
          value={localProfile?.rooms}
          onChange={(e) => setLocalProfile({ ...localProfile, rooms: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-cyan-500"
        >
          <option value="">Select Rooms</option>
          <option value="1-25">1–25</option>
          <option value="26-50">26–50</option>
          <option value="51-100">51–100</option>
          <option value="100+">100+</option>
        </select>
      </div>

      {/* Country (TEXT INPUT) */}
      <div>
        <label className="block text-sm font-semibold mb-2">Country <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={localProfile?.country_id || ''}
          onChange={(e) => setLocalProfile({ ...localProfile, country_id: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500"
          placeholder="Enter country name"
        />
      </div>

      {/* State (TEXT INPUT) */}
      <div>
        <label className="block text-sm font-semibold mb-2">State <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={localProfile?.state_id || ''}
          onChange={(e) => setLocalProfile({ ...localProfile, state_id: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500"
          placeholder="State"
        />
      </div>

      {/* City (TEXT INPUT) */}
      <div>
        <label className="block text-sm font-semibold mb-2">City <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={localProfile?.city_id || ''}
          onChange={(e) => setLocalProfile({ ...localProfile, city_id: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500"
          placeholder="City"
        />
      </div>
    </div>

    {/* Locality (prefilled name if available) */}
    <div>
      <label className="block text-sm font-semibold mb-2">Locality</label>
      <input
        type="text"
        value={(localProfile as any)?.locality_name ?? ((localProfile as any)?.locality_id ?? '')}
        onChange={(e) => setLocalProfile({ ...localProfile, locality_name: e.target.value })}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500"
        placeholder="Locality name"
      />
    </div>

    {/* Address */}
    <div>
      <label className="block text-sm font-semibold mb-2">Address <span className="text-red-500">*</span></label>
      <input
        type="text"
        value={(localProfile as any)?.address || ''}
        onChange={(e) => setLocalProfile({ ...localProfile, address: e.target.value })}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500"
        placeholder="Street address, apartment, building, etc."
      />
    </div>

    {/* Zip Code */}
    <div>
      <label className="block text-sm font-semibold mb-2">Zip Code <span className="text-red-500">*</span></label>
      <input
        type="text"
        value={localProfile?.zip_code}
        onChange={(e) => setLocalProfile({ ...localProfile, zip_code: e.target.value })}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500"
        placeholder="ZIP Code"
      />
    </div>

  </motion.div>
)}


        {/* Step 2: Upload Images */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6 hidden sm:block">
              <h2 className="text-2xl font-black text-gray-900">Upload Images</h2>
              <p className="text-gray-600 mt-1">Add at least 3 high-quality photos of your property</p>
            </div>

            <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Image className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-cyan-900 mb-1">Image Guidelines</p>
                  <ul className="text-cyan-800 space-y-1 text-xs">
                    <li>• Upload at least 3 images (recommended: 5-10)</li>
                    <li>• Use high-resolution images (minimum 1200x800px)</li>
                    <li>• Show exterior, rooms, amenities, and facilities</li>
                    <li>• Accepted formats: JPG, PNG, WEBP</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fetchedImages.map((img, index) => (
                <motion.div
                  key={img.id || index}
                  className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ImageWithFallback
                    src={img.file_url || img}
                    alt={img.caption || `Motel image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-2 right-2 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
                  >
                    <XCircle className="w-5 h-5 text-white" />
                  </button>
                  {img.is_primary && (
                    <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </span>
                  )}
                </motion.div>
              ))}

              {/* Upload placeholder */}
              <button
                type="button"
                onClick={() => setShowImageModal(true)}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-all group"
              >
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-cyan-600 transition-colors mb-2" />
                <span className="text-sm text-gray-500 group-hover:text-cyan-600 transition-colors font-semibold">Add Images</span>
                <span className="text-xs text-gray-400 mt-1">Click to browse</span>
              </button>
            </div>

            <p className="text-sm text-gray-600 text-center mt-4">
              {fetchedImages.length} {fetchedImages.length === 1 ? 'image' : 'images'} uploaded
              {fetchedImages.length < 3 && ` • ${3 - fetchedImages.length} more required`}
            </p>
          </motion.div>
        )}

        {/* Image Upload Modal */}
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 sticky top-0">
                <h3 className="text-xl font-bold">Upload Image</h3>
              </div>

              <form onSubmit={(e) => handleImageFormSubmit(e, false)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image File <span className="text-red-500">*</span></label>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={e => setImageForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg p-2 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Type <span className="text-red-500">*</span></label>
                  <select 
                    value={imageForm.image_type} 
                    onChange={e => setImageForm(prev => ({ ...prev, image_type: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select image type</option>
                    {imageTypeOptions.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Type <span className="text-red-500">*</span></label>
                  <select 
                    value={imageForm.room_type} 
                    onChange={e => setImageForm(prev => ({ ...prev, room_type: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select room type</option>
                    {roomTypeOptions.length ? roomTypeOptions.map(rt => (<option key={rt} value={rt}>{rt}</option>)) : <option value="">No room types</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                  <input 
                    value={imageForm.caption} 
                    onChange={e => setImageForm(prev => ({ ...prev, caption: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Optional caption"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                    <input 
                      type="number" 
                      value={imageForm.display_order} 
                      onChange={e => setImageForm(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={imageForm.is_primary} 
                        onChange={e => setImageForm(prev => ({ ...prev, is_primary: e.target.checked }))}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Is Primary</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={() => setShowImageModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={(e) => handleImageFormSubmit(null, true)}
                    className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Upload & Add Another
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Step 3: Tax Documents */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-6 hidden sm:block">
              <h2 className="text-2xl font-black text-gray-900">Tax Documents</h2>
              <p className="text-gray-600 mt-1">Upload required legal and tax documents</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 mb-1">Required Documents</p>
                  <ul className="text-blue-800 space-y-1 text-xs">
                    <li>• Business License / Registration Certificate</li>
                    <li>• Tax Identification Number (TIN)</li>
                    <li>• Property Insurance Documents</li>
                    <li>• Owner ID Proof (Government issued)</li>
                    <li>• Accepted formats: PDF, DOC, DOCX (Max 5MB each)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {fetchedDocs.map((doc, index) => (
                <motion.div
                  key={doc.id || index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-cyan-500 transition-all group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{doc.file_name || `Document ${index + 1}`}</h3>
                      <p className="text-sm text-gray-600">Uploaded: {new Date(doc.created_at).toISOString().split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <span className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-orange-100 text-orange-700">
                      ⏳ Pending
                    </span>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Upload Document Button */}
              <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-all group">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleDocUpload}
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-gray-400 group-hover:text-cyan-600 transition-colors mb-2" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors">Upload Documents</span>
                <span className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 5MB</span>
              </label>
            </div>

            <p className="text-sm text-gray-600 text-center mt-4">
              {fetchedDocs.length} {fetchedDocs.length === 1 ? 'document' : 'documents'} uploaded
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
        <motion.button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 cursor-pointer'
          }`}
          whileHover={currentStep > 1 ? { scale: 1.02 } : {}}
          whileTap={currentStep > 1 ? { scale: 0.98 } : {}}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Previous</span>
        </motion.button>

        <div className="flex items-center gap-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`h-2 rounded-full transition-all ${
                step.number === currentStep ? 'w-8 bg-cyan-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentStep < 3 ? (
          <motion.button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              isStepValid()
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={isStepValid() ? { scale: 1.02 } : {}}
            whileTap={isStepValid() ? { scale: 0.98 } : {}}
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        ) : (
          <motion.button
            onClick={() => setConfirmOpen(true)}
            disabled={!isStepValid()}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              isStepValid()
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 cursor-pointer shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={isStepValid() ? { scale: 1.05 } : {}}
            whileTap={isStepValid() ? { scale: 0.98 } : {}}
          >
            <Send className="w-5 h-5" />
            <span>Submit for Approval</span>
          </motion.button>
        )}
      </div>
    </div>
    {/* Confirmation Modal */}
    <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Submit for Approval" size="sm">
      <div className="space-y-4">
        <p>Are you sure you want to submit your motel for admin approval? Once submitted, admins will review your profile and documents.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
          <button
            onClick={() => {
              setConfirmOpen(false);
              handleSubmit();
              toast.success('Submitted for approval');
            }}
            disabled={!isStepValid()}
            className={`px-4 py-2 rounded ${isStepValid() ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-400'}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  </>);
}