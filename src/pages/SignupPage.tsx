import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, Eye, EyeOff, User, Phone } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { apiPostWithoutToken } from "../api/api";  
import { toast } from "react-toastify";
import { useDispatch } from 'react-redux';

export default function SignupPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.first_name)) {
      newErrors.first_name = 'First name should only contain letters';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.last_name)) {
      newErrors.last_name = 'Last name should only contain letters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      const isValidPhone = /^\+?1?\s*\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/.test(formData.phone.trim()) ||
                           (phoneDigits.length >= 10 && phoneDigits.length <= 15);
      if (!isValidPhone) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiPostWithoutToken("/auth/signup", {
        firstname: formData.first_name,
        lastname: formData.last_name,
        emailid: formData.email,
        mobile: formData.phone || null,
        password: formData.password,
        confirmpassword: formData.confirm_password,
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Signup failed");
        return;
      }

      const token = response.data.data?.token;
      if (token) {
        localStorage.setItem("accessToken", token);
        dispatch({
          type: "currentUserData",
          payload: response.data.data,
        });
      }

      toast.success(response.data.message || "Account created successfully!");
      
      // Clear form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: ''
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate("/user/dashboard");
      }, 1500);

    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to create account";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-40 right-10 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <motion.div 
          className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 sm:p-6 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-xl sm:text-2xl mb-1 font-black">Create Account</h1>
            <p className="text-xs sm:text-sm text-white/90">Join Tripways today</p>
          </div>

          {/* Form Container with Padding */}
          <div className="p-4 sm:p-6">
            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* First Name and Last Name Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                {/* First Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                <label className="block text-gray-900 text-xs font-semibold mb-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-3 py-2 bg-white border-2 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                      errors.first_name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                    }`}
                    placeholder="John"
                  />
                </div>
                {errors.first_name && <p className="text-red-500 text-xs mt-0.5">{errors.first_name}</p>}
                </motion.div>

                {/* Last Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-gray-900 text-xs font-semibold mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className={`w-full pl-10 pr-3 py-2 bg-white border-2 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                        errors.last_name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                      }`}
                      placeholder="Doe"
                    />
                  </div>
                  {errors.last_name && <p className="text-red-500 text-xs mt-0.5">{errors.last_name}</p>}
                </motion.div>
              </div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-gray-900 text-xs font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-3 py-2 bg-white border-2 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                      errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                    }`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
              </motion.div>

              {/* Phone (Optional) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-gray-900 text-xs font-semibold mb-1">Phone <span className="text-gray-400 text-xs">(Optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 bg-white border-2 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                      errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>}
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-gray-900 text-xs font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-10 py-2 bg-white border-2 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                      errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-0.5">{errors.password}</p>}
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-gray-900 text-xs font-semibold mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-10 py-2 bg-white border-2 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-all ${
                      errors.confirm_password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm_password && <p className="text-red-500 text-xs mt-0.5">{errors.confirm_password}</p>}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-4 rounded-lg font-black text-white shadow-lg cursor-pointer bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </motion.button>
            </form>

            {/* Footer */}
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-gray-600 text-xs">
                Already have an account?{' '}
                <Link 
                  to="/login"
                  className="text-orange-600 font-semibold hover:underline cursor-pointer"
                >
                  Sign In
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
