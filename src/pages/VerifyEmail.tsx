import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGetWithoutToken, apiPostWithoutToken } from "../api/api";
import { motion } from "framer-motion";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); 
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token.");
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await apiGetWithoutToken(`/motels/verify-email?token=${token}`);

      if (res.data.success) {
        setStatus("success");
        setMessage(res.data.message); // "Email verified successfully. Password sent to your email."
      } else {
        setStatus("error");
        setMessage(res.data.message || "Verification failed.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  const regenerateToken = async () => {
    setStatus("loading");
    setMessage("Sending new verification email...");

    try {
      const res = await apiPostWithoutToken("/motels/regenerate-verification-token", {
        contact_email: "ENTER_CONTACT_EMAIL_HERE",
        motel_id: 12,
        motel_name: "XTS Motel"
      });

      if (res.data.success) {
        setStatus("success");
        setMessage(res.data.message); // "New verification email sent."
      } else {
        setStatus("error");
        setMessage(res.data.message);
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to regenerate token. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <motion.div
        className="max-w-xl w-full bg-white p-10 rounded-3xl shadow-xl text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {status === "loading" && (
          <>
            <div className="text-2xl font-bold mb-4">Verifying Email...</div>
            <p className="text-gray-500">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-3xl font-bold mb-4 text-green-600">Success!</div>
            <p className="text-gray-700 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              Check your email for your login credentials.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-3xl font-bold mb-4 text-red-500">Verification Failed</div>
            <p className="text-gray-700 mb-6">{message}</p>

            <button
              onClick={regenerateToken}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold"
            >
              Resend Verification Email
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
