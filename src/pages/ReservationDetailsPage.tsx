import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { CreditCard, Banknote, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { apiPost } from '../api/api';
import { toast } from 'react-toastify';

// Helper to parse price from various formats
const parsePrice = (price: any): number => {
  if (price === null || price === undefined) return 0;
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    let cleaned = price.replace(/[$,\s]/g, '');
    if (cleaned.toLowerCase().endsWith('k')) {
      cleaned = cleaned.slice(0, -1);
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed * 1000;
    }
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export default function ReservationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCheckIn = location.state?.checkIn ?? '2024-12-23';
  const selectedCheckOut = location.state?.checkOut ?? '2024-12-24';
  const nights = location.state?.nights ?? 1;
  const guests = Number(location.state?.guests ?? 1);
  const rooms = location.state?.rooms ?? [{ roomType: 'standard', count: 1 }];
  const totalAmount = parsePrice(location.state?.totalAmount ?? 100);
  
  console.log("ReservationDetailsPage - State received:", {
    checkIn: selectedCheckIn,
    checkOut: selectedCheckOut,
    nights,
    guests,
    rooms,
    totalAmount,
    idParam: id
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    specialRequests: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'motel'>('motel');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [bookingResponse, setBookingResponse] = useState<any>(null);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneDigits = phone.replace(/\D/g, '');
    return phoneDigits.length === 10;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    // First Name - Only alphabets and spaces
    if (name === 'firstName') {
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }

    // Last Name - Only alphabets and spaces
    if (name === 'lastName') {
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }

    // Phone - Only digits, limit to 10
    if (name === 'phone') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};

    // Validate First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name should contain only alphabets';
    }

    // Validate Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name should contain only alphabets';
    }

    // Validate Phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    // Validate Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        motelId: Number(id),
        checkIn: selectedCheckIn,
        checkOut: selectedCheckOut,
        nights,
        rooms,
        guests,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        specialRequests: formData.specialRequests,
        paymentMethod: paymentMethod.toUpperCase(),
        totalAmount
      };

      console.log('Booking payload:', payload);

      const res = await apiPost('/user-booking/bookings', payload);
      
      if (res?.data?.success) {
        console.log('Booking response:', res.data);
        toast.success(res.data.message || 'Booking submitted successfully!');
        setBookingResponse(res.data.data);
        setSubmitted(true);
      } else {
        toast.error(res?.data?.message || 'Failed to submit booking');
      }
    } catch (err: any) {
      console.error('Booking failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to submit booking');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-cyan-50 to-blue-50">
        <motion.div 
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center flex flex-col items-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl mb-3 font-black">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-4 text-sm">
              Thank you for your reservation. A confirmation email has been sent to <span className="font-semibold text-cyan-600">{formData.email}</span>
            </p>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-4 mb-6 border-2 border-cyan-200 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-xs text-gray-600 mb-1.5">Booking Reference</div>
            <motion.div 
              className="text-2xl font-black text-cyan-600 mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              {bookingResponse?.bookingReference || 'MT-' + Math.random().toString(36).substr(2, 9).toUpperCase()}
            </motion.div>

            {/* Motel Details */}
            {bookingResponse?.motel && (
              <div className="space-y-2 pt-4 border-t border-cyan-200">
                <div>
                  <p className="text-xs text-gray-600">Motel</p>
                  <p className="font-semibold text-gray-800">{bookingResponse.motel.motel_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Address</p>
                  <p className="font-semibold text-gray-800">{bookingResponse.motel.address}, {bookingResponse.motel.zip_code}</p>
                </div>
              </div>
            )}

            {/* Booking Summary */}
            {bookingResponse?.summary && (
              <div className="space-y-2 pt-4 border-t border-cyan-200">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-600">Check-in</p>
                    <p className="font-semibold text-gray-800">{bookingResponse.summary.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Check-out</p>
                    <p className="font-semibold text-gray-800">{bookingResponse.summary.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Nights</p>
                    <p className="font-semibold text-gray-800">{bookingResponse.summary.nights}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Guests</p>
                    <p className="font-semibold text-gray-800">{bookingResponse.summary.guests}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-cyan-100">
                  <p className="text-xs text-gray-600">Total Amount</p>
                  <p className="font-black text-cyan-600 text-lg">${bookingResponse.summary.totalAmount}</p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg font-semibold cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Home
          </motion.button>

          <motion.div
            className="mt-4 pt-4 border-t"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-xs text-gray-500">
              Check your email for complete booking details
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <motion.div 
        className="bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white py-6 px-6 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h1 
            className="text-3xl mb-2 font-black"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Guest Information & Payment
          </motion.h1>
          <motion.p 
            className="text-base text-blue-100"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Complete your reservation details
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-4">
          {/* Guest Information Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Personal Details */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl mb-3 font-black">Personal Details</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-semibold">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                      errors.firstName 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                        : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-100'
                    }`}
                    placeholder="Enter your first name"
                    maxLength={50}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.firstName}</p>
                  )}
                  {/* <p className="text-xs text-gray-500 mt-1">Alphabets only</p> */}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-semibold">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                      errors.lastName 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                        : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-100'
                    }`}
                    placeholder="Enter your last name"
                    maxLength={50}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.lastName}</p>
                  )}
                  {/* <p className="text-xs text-gray-500 mt-1">Alphabets only</p> */}
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl mb-3 font-black">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-semibold">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                      errors.phone 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                        : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-100'
                    }`}
                    placeholder="Enter your phone number"
                    maxLength={10}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.phone}</p>
                  )}
                  {/* <p className="text-xs text-gray-500 mt-1">10 digits only ({formData.phone.length}/10)</p> */}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5 font-semibold">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                      errors.email 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                        : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-100'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Confirmation will be sent to this email</p>
                </div>
              </div>
            </motion.div>

            {/* Special Requests */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-xl mb-3 font-black">Special Requests</h2>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all"
                placeholder="Enter any special requests or requirements (e.g., late check-in, ground floor room)"
              />
            </motion.div>

            {/* Payment Method */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl mb-3 font-black">Payment Method</h2>
              <div className="space-y-2">
                {[
                  // { value: 'online', icon: CreditCard, title: 'Pay Online', desc: 'Secure online payment' },
                  { value: 'motel', icon: Banknote, title: 'Pay at Motel', desc: 'Cash or card on arrival' }
                ].map((method, index) => (
                  <motion.label 
                    key={method.value}
                    className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === method.value 
                        ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'motel')}
                      className="w-4 h-4 text-cyan-600 cursor-pointer"
                    />
                    <method.icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-semibold text-sm">{method.title}</div>
                      <div className="text-xs text-gray-600">{method.desc}</div>
                    </div>
                  </motion.label>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 text-white rounded-2xl shadow-2xl p-4 sticky top-20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-xl mb-4 font-black">Booking Summary</h2>
              
              <div className="space-y-2 mb-4 pb-4 border-b border-white/20">
                <motion.div 
                  className="flex justify-between text-xs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-blue-200">Room(s)</span>
                  <span className="font-semibold">{rooms.length > 0 ? `${rooms.length} Room${rooms.length > 1 ? 's' : ''}` : 'N/A'}</span>
                </motion.div>
                <motion.div 
                  className="flex justify-between text-xs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <span className="text-blue-200">Guests</span>
                  <span className="font-semibold">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                </motion.div>
                <motion.div 
                  className="flex justify-between text-xs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <span className="text-blue-200">Nights</span>
                  <span className="font-semibold">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                </motion.div>
                <motion.div 
                  className="flex justify-between text-xs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <span className="text-blue-200">Check-in</span>
                  <span className="font-semibold">{selectedCheckIn}</span>
                </motion.div>
                <motion.div 
                  className="flex justify-between text-xs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <span className="text-blue-200">Check-out</span>
                  <span className="font-semibold">{selectedCheckOut}</span>
                </motion.div>
              </div>

              <div className="space-y-1.5 mb-4 pb-4 border-b border-white/20">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-200">Room Charges</span>
                  <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <motion.div 
                className="flex justify-between items-center mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 }}
              >
                <span className="text-lg">Total</span>
                <div className="text-right">
                  <motion.div 
                    className="text-3xl font-black"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    ${totalAmount.toFixed(2)}
                  </motion.div>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl transition-all mb-3 font-black shadow-lg ${
                  isLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-blue-50 cursor-pointer'
                }`}
                whileHover={isLoading ? {} : { scale: 1.02, y: -2 }}
                whileTap={isLoading ? {} : { scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Complete Booking'
                )}
              </motion.button>

              <p className="text-xs text-blue-200 text-center leading-tight">
                By completing this booking, you agree to our Terms & Conditions and Privacy Policy
              </p>
            </motion.div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}