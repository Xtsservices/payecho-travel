import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input, Button } from "../components/ui";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { apiPostWithoutToken } from "../api/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // 🔴 Invalid link check
  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">
          Invalid or expired password reset link.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmNewPassword) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      const response = await apiPostWithoutToken(
        "/auth/resetpassword",
        {
          token,
          email,
          newPassword,
          confirmNewPassword,
        }
      );

      if (response.data?.success) {
        setIsSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
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
        title="Reset Password | MOTELTRIPS.COM"
        description="Set a new password for your MOTELTRIPS account"
      />

      <Header />

      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                className="bg-white rounded-3xl shadow-2xl p-8"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Lock className="text-white w-8 h-8" />
                  </div>
                </div>

                <h1 className="text-2xl text-center mb-2">
                  Reset Your Password
                </h1>
                <p className="text-gray-600 text-center mb-6">
                  Set a new password for <br />
                  <span className="text-blue-600">{email}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={(e) =>
                      setConfirmNewPassword(e.target.value)
                    }
                  />

                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-3 rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>

                  <div className="text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                className="bg-white rounded-3xl shadow-2xl p-8 text-center"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-white w-12 h-12" />
                  </div>
                </div>

                <h2 className="text-2xl mb-3">
                  Password Reset Successful 🎉
                </h2>
                <p className="text-gray-600 mb-6">
                  You can now log in using your new password.
                </p>

                <p className="text-sm text-gray-500">
                  Redirecting to login...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
