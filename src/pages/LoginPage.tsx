import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, Eye, EyeOff, Building2, Shield, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import logo from 'figma:asset/00d09e71b1640633d6e9a787381b574f41ce5e2c.png';
import { apiPostWithoutToken } from "../api/api";  
import { toast } from "react-toastify";
import { useDispatch } from 'react-redux';


type UserRole = 'admin' | 'motel' | 'user';
type LoginMode = 'user' | 'business';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginMode, setLoginMode] = useState<LoginMode>('user');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const roles = [
    { value: 'admin' as UserRole, label: 'Admin', icon: Shield, color: 'from-purple-500 to-pink-500' },
    { value: 'motel' as UserRole, label: 'Motel Owner', icon: Building2, color: 'from-orange-500 to-red-600' },
    { value: 'user' as UserRole, label: 'User', icon: User, color: 'from-orange-500 to-red-600' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await apiPostWithoutToken("/auth/login", {
      email: formData.email,
      password: formData.password,
    });
console.log("Login response:", response.data);
    if (!response.data.success) {
      toast.error(response.data.message || "Login failed");
      return;
    }

    const token = response.data.data.token;
    localStorage.setItem("accessToken", token);
    //current user data store in redux
    dispatch({
      type: "currentUserData",
      payload: response.data.data,
    });

    toast.success("Login successful!");

    // Always force user login when guest mode is selected
    const user = response.data.data.user;

if (user.redirectTo) {
  navigate(user.redirectTo);
} else {
  navigate("/user/bookings");
}


  } catch (err: any) {
    toast.error("Invalid credentials");
  }
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 sm:p-8 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </motion.div>
            <h1 className="text-2xl sm:text-3xl mb-2">Login</h1>
            <p className="text-sm sm:text-base text-white/90">Sign in to your account</p>
          </div>

          {/* Form Container with Padding */}
          <div className="p-6 sm:p-8">
            {/* Login Mode Tabs - COMMENTED OUT */}
            {/* <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('user');
                    setSelectedRole('user');
                  }}
                  className={`flex-1 py-2.5 sm:py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    loginMode === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User className="w-4 h-4 inline-block mr-1.5" />
                  Guest Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('business');
                    setSelectedRole('motel');
                  }}
                  className={`flex-1 py-2.5 sm:py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    loginMode === 'business'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 inline-block mr-1.5" />
                  Business Login
                </button>
              </div>
            </motion.div> */}

            {/* Business Role Selection - Only show when business mode is active */}
            <AnimatePresence>
              {loginMode === 'business' && (
                <motion.div 
                  className="mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-gray-900 text-sm font-semibold mb-3">Select Your Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      onClick={() => setSelectedRole('motel')}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedRole === 'motel'
                          ? 'bg-gradient-to-br from-orange-500 to-red-600 border-transparent shadow-lg'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Building2 className={`w-6 h-6 mx-auto mb-2 ${
                        selectedRole === 'motel' ? 'text-white' : 'text-gray-600'
                      }`} />
                      <span className={`text-sm font-semibold block ${
                        selectedRole === 'motel' ? 'text-white' : 'text-gray-700'
                      }`}>Motel Owner</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setSelectedRole('admin')}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedRole === 'admin'
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-transparent shadow-lg'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Shield className={`w-6 h-6 mx-auto mb-2 ${
                        selectedRole === 'admin' ? 'text-white' : 'text-gray-600'
                      }`} />
                      <span className={`text-sm font-semibold block ${
                        selectedRole === 'admin' ? 'text-white' : 'text-gray-700'
                      }`}>Admin</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-gray-900 text-sm font-semibold mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-all"
                    placeholder={loginMode === 'user' ? 'your.email@example.com' : 'business@moteltrips.com'}
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-gray-900 text-sm font-semibold mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Remember & Forgot */}
              <motion.div 
                className="flex items-center justify-between text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-600 cursor-pointer" />
                  <span>Remember me</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-orange-600 hover:text-orange-700 transition-colors cursor-pointer font-semibold"
                >
                  Forgot Password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className={`w-full py-3.5 rounded-xl font-black text-white shadow-lg cursor-pointer bg-gradient-to-r ${
                  selectedRole === 'admin' 
                    ? 'from-purple-500 to-pink-500' 
                    : 'from-orange-500 to-red-600'
                } hover:shadow-xl transition-all`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {loginMode === 'user' ? 'Sign In' : `Sign In as ${roles.find(r => r.value === selectedRole)?.label}`}
              </motion.button>
            </form>

            {/* Footer */}
            <motion.div
              className="mt-6 text-center space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link 
                  to="/signup"
                  className="text-orange-600 font-semibold hover:underline cursor-pointer"
                >
                  Sign Up
                </Link>
              </p>
              <p className="text-gray-600 text-sm">
                Want to list your motel?{' '}
                <Link 
                  to="/partner"
                  className="text-orange-600 font-semibold hover:underline cursor-pointer"
                >
                  Register as Partner
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