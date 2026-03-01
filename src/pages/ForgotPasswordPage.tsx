import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Input, Button } from '../components/ui';
import { Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from '../components/Header';
import { apiPostWithoutToken } from "../api/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (!email) {
    setError("Please enter your email address");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("Please enter a valid email address");
    return;
  }

  try {
    setIsLoading(true);

    const response = await apiPostWithoutToken(
      "/auth/forgotpassword",
      { email }
    );

    if (response.data?.success) {
      setIsSubmitted(true);
    }
  } catch (err: any) {
    setError(
      err?.response?.data?.message ||
        "Something went wrong. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Forgot Password - Reset Your Account | MOTELTRIPS.COM"
        description="Reset your MOTELTRIPS.COM password securely. Enter your email to receive password reset instructions."
        keywords="forgot password, reset password, account recovery, password help"
        canonicalUrl="https://moteltrips.com/forgot-password"
      />

      <Header />
      <div className="flex-1 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600">
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 100, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -100, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 15, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Logo/Icon */}
                  <motion.div
                    className="flex justify-center mb-8"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                      <Lock className="w-10 h-10 text-blue-600" />
                    </div>
                  </motion.div>

                  {/* Card */}
                  <motion.div
                    className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-lg"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h1 className="text-3xl text-center mb-2">Forgot Password?</h1>
                      <p className="text-gray-600 text-center mb-8">
                        No worries! Enter your email and we'll send you reset instructions.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm mb-2 text-gray-700">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter your email"
                              className="pl-12"
                            />
                          </div>
                          {error && (
                            <motion.p
                              className="text-red-500 text-sm mt-2"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              {error}
                            </motion.p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl hover:shadow-lg transition-all"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <motion.div
                              className="flex items-center justify-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <motion.div
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              />
                              Sending...
                            </motion.div>
                          ) : (
                            'Send Reset Link'
                          )}
                        </Button>

                        <div className="text-center">
                          <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                          </Link>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Success Icon */}
                  <motion.div
                    className="flex justify-center mb-8"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <motion.div
                      className="w-24 h-24 bg-green-500 rounded-full shadow-2xl flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          '0 0 0 0 rgba(34, 197, 94, 0.7)',
                          '0 0 0 20px rgba(34, 197, 94, 0)',
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <CheckCircle className="w-14 h-14 text-white" />
                    </motion.div>
                  </motion.div>

                  {/* Success Card */}
                  <motion.div
                    className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-lg"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-3xl text-center mb-4">Check Your Email!</h2>
                    <p className="text-gray-600 text-center mb-2">
                      We've sent password reset instructions to:
                    </p>
                    <p className="text-blue-600 text-center mb-8">
                      {email}
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <p className="text-sm text-gray-700">
                        <strong>Didn't receive the email?</strong> Check your spam folder or wait a few minutes. The email may take up to 5 minutes to arrive.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl"
                      >
                        Resend Email
                      </Button>
                      
                      <Link to="/login" className="block">
                        <Button
                          variant="outline"
                          className="w-full border-2 border-gray-300 py-3 rounded-xl hover:border-blue-500 transition-colors"
                        >
                          Back to Login
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Additional Help */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-white/90 mb-2">Need help?</p>
              <a
                href="mailto:support@moteltrips.com"
                className="text-white hover:text-cyan-200 transition-colors underline"
              >
                Contact Support
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}