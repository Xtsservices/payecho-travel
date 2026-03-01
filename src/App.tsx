import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import MotelDetailsPage from './pages/MotelDetailsPage';
import GuestsRoomSelectionPage from './pages/GuestsRoomSelectionPage';
import ReservationDetailsPage from './pages/ReservationDetailsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import PartnerPage from './pages/PartnerPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import MotelDashboard from './pages/MotelDashboard';
import UserDashboard from './pages/UserDashboard';
import Header from './components/Header';
import MotelDetailsRedirect from './components/MotelDetailsRedirect';
import VerifyEmail from './pages/VerifyEmail';
import ResetPasswordPage from './components/ResetPasswordPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}


export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <Routes>
          {/* Public Routes with Header */}
          <Route path="/" element={<><Header /><HomePage /></>} />
          <Route path="/search" element={<><Header /><SearchResultsPage /></>} />
          <Route path="/motel/:id" element={<><Header /><MotelDetailsPage /></>} />
          <Route path="/motel-details/:id" element={<MotelDetailsRedirect />} />
          <Route path="/motel/:id/select-rooms" element={<><Header /><GuestsRoomSelectionPage /></>} />
          <Route path="/motel/:id/reservation" element={<><Header /><ReservationDetailsPage /></>} />
          <Route path="/how-it-works" element={<><Header /><HowItWorksPage /></>} />
          <Route path="/terms" element={<><Header /><TermsPage /></>} />
          <Route path="/privacy" element={<><Header /><PrivacyPage /></>} />
          <Route path="/partner" element={<><Header /><PartnerPage /></>} />
          
          {/* Auth Routes (No Header) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />


          
          {/* Dashboard Routes (No Header - they have their own navigation) */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/motel/dashboard" element={<MotelDashboard />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}