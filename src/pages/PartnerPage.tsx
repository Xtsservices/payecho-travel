import React from 'react';
import { motion } from 'motion/react';
import Footer from '../components/Footer';
import { apiPostWithoutToken, apiGet } from '../api/api';
import { 
  Handshake, TrendingUp, Users, DollarSign, BarChart3, Globe, 
  Zap, Shield, Smartphone, Calendar, Star, CheckCircle, 
  ArrowRight, Sparkles, Target, Award, Mail
} from 'lucide-react';

const benefits = [
  {
    icon: TrendingUp,
    title: 'Increase Revenue',
    description: 'Reach thousands of travelers actively searching for accommodations',
    color: 'orange-500'
  },
  {
    icon: Users,
    title: 'Expand Customer Base',
    description: 'Connect with new guests from across the country',
    color: 'orange-500'
  },
  {
    icon: Globe,
    title: 'Online Visibility',
    description: 'Showcase your property to a wider audience with premium listings',
    color: 'orange-500'
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track bookings, revenue, and customer insights with our dashboard',
    color: 'orange-500'
  },
  {
    icon: Zap,
    title: 'Instant Bookings',
    description: 'Automated booking system reduces manual work and errors',
    color: 'orange-500'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Safe and reliable payment processing with guaranteed payouts',
    color: 'orange-500'
  }
];

const steps = [
  {
    number: '01',
    title: 'Sign Up',
    description: 'Create your partner account in minutes with our simple registration process'
  },
  {
    number: '02',
    title: 'List Your Property',
    description: 'Add photos, amenities, room details, and set your pricing strategy'
  },
  {
    number: '03',
    title: 'Start Receiving Bookings',
    description: 'Get instant notifications and manage reservations through our platform'
  },
  {
    number: '04',
    title: 'Grow Your Business',
    description: 'Use our tools and analytics to optimize performance and increase revenue'
  }
];

const stats = [
  { value: '100K+', label: 'Active Users' },
  { value: '50K+', label: 'Monthly Bookings' },
  { value: '98%', label: 'Partner Satisfaction' },
  { value: '$5M+', label: 'Partner Revenue' }
];

const features = [
  { icon: Smartphone, text: 'Mobile-friendly dashboard' },
  { icon: Calendar, text: 'Advanced booking calendar' },
  { icon: Star, text: 'Review management system' },
  { icon: BarChart3, text: 'Performance analytics' },
  { icon: DollarSign, text: 'Flexible pricing tools' },
  { icon: Globe, text: 'Multi-channel distribution' }
];

export default function PartnerPage() {
  const [formData, setFormData] = React.useState({
    motel_name: "",
    owner_first_name: "",
    owner_last_name: "",
    owner_email: "",
    owner_phone: "",
    contact_email: "",
    contact_phone: "",
    country_name: "",
    state_name: "",
    city_name: "",
    locality_id: "",
     address: "",
    zip_code: "",
    registration_type: "",
    rooms: "",
    message: ""
  });

  const [submitted, setSubmitted] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [countries, setCountries] = React.useState<Array<{id:number,name:string}>>([]);
  const [states, setStates] = React.useState<Array<{id:number,name:string,country_id?:number}>>([]);
  const [cities, setCities] = React.useState<Array<{id:number,name:string,state_id?:number}>>([]);
  const [localities, setLocalities] = React.useState<Array<{id:number,name:string,city_id?:number}>>([]);
  
  // Search states for dropdowns
  const [countrySearch, setCountrySearch] = React.useState('');
  const [stateSearch, setStateSearch] = React.useState('');
  const [citySearch, setCitySearch] = React.useState('');
  const [localitySearch, setLocalitySearch] = React.useState('');
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
  
  // Refs for dropdown containers
  const countryRef = React.useRef<HTMLDivElement>(null);
  const stateRef = React.useRef<HTMLDivElement>(null);
  const cityRef = React.useRef<HTMLDivElement>(null);
  const localityRef = React.useRef<HTMLDivElement>(null);
  // Refs for dropdown list elements to enable scrolling to selection
  const countryListRef = React.useRef<HTMLDivElement>(null);
  const stateListRef = React.useRef<HTMLDivElement>(null);
  const cityListRef = React.useRef<HTMLDivElement>(null);
  const localityListRef = React.useRef<HTMLDivElement>(null);
  const touchStartYRef = React.useRef<number | null>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (countryRef.current && !countryRef.current.contains(target)) {
        if (openDropdown === 'country') setOpenDropdown(null);
      }
      if (stateRef.current && !stateRef.current.contains(target)) {
        if (openDropdown === 'state') setOpenDropdown(null);
      }
      if (cityRef.current && !cityRef.current.contains(target)) {
        if (openDropdown === 'city') setOpenDropdown(null);
      }
      if (localityRef.current && !localityRef.current.contains(target)) {
        if (openDropdown === 'locality') setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Global listeners to prevent body scroll when interacting with dropdowns
  React.useEffect(() => {
    if (!openDropdown) return;

    const lists = [countryListRef.current, stateListRef.current, cityListRef.current, localityListRef.current];

    const onWheel = (e: WheelEvent) => {
      try {
        const target = e.target as Node;
        const el = lists.find(l => l && (l === target || l.contains(target)));
        if (!el) return; // not interacting with our lists

        const delta = e.deltaY;
        const atTop = el.scrollTop === 0;
        const atBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 1;
        if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
          e.preventDefault();
        }
      } catch (err) {
        // ignore
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      try {
        const touch = e.touches[0];
        if (!touch) return;
        const target = e.target as Node;
        const el = lists.find(l => l && (l === target || l.contains(target)));
        if (!el) return;
        const startY = touchStartYRef.current ?? touch.clientY;
        const diff = startY - touch.clientY; // positive when swiping up
        const atTop = el.scrollTop === 0;
        const atBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 1;
        if ((diff < 0 && atTop) || (diff > 0 && atBottom)) {
          e.preventDefault();
        }
      } catch (err) {
        // ignore
      }
    };

    document.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      document.removeEventListener('wheel', onWheel as any);
      document.removeEventListener('touchmove', onTouchMove as any);
      touchStartYRef.current = null;
    };
  }, [openDropdown]);

  // When a dropdown opens, try to scroll the currently selected/matching item into view
  React.useEffect(() => {
    if (!openDropdown) return;

    const scrollToMatch = (listRef: React.RefObject<HTMLDivElement>, matchName?: string) => {
      try {
        const container = listRef.current;
        if (!container || !matchName) return;
        const selector = `[data-name="${CSS.escape(matchName)}"]`;
        const el = container.querySelector(selector) as HTMLElement | null;
        if (el) el.scrollIntoView({ block: 'nearest' });
      } catch (e) {
        // ignore
      }
    };

    if (openDropdown === 'country') {
      const match = formData.country_name || countrySearch;
      scrollToMatch(countryListRef, match);
    } else if (openDropdown === 'state') {
      const match = formData.state_name || stateSearch;
      scrollToMatch(stateListRef, match);
    } else if (openDropdown === 'city') {
      const match = formData.city_name || citySearch;
      scrollToMatch(cityListRef, match);
    } else if (openDropdown === 'locality') {
      const match = (formData.locality_id ? localities.find(l => String(l.id) === formData.locality_id)?.name : null) || localitySearch;
      scrollToMatch(localityListRef, match ?? undefined);
    }
  }, [openDropdown, countrySearch, stateSearch, citySearch, localitySearch, formData.country_name, formData.state_name, formData.city_name, formData.locality_id, localities]);

  // Prevent page/body scroll when interacting with dropdown lists (wheel/touch)
  const handleListWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const delta = e.deltaY;
    const atTop = el.scrollTop === 0;
    const atBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 1;
    if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
      e.preventDefault();
    }
    e.stopPropagation();
  };

  const handleListTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = e.touches[0]?.clientY ?? null;
  };

  const handleListTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const startY = touchStartYRef.current ?? 0;
    const currentY = e.touches[0]?.clientY ?? 0;
    const diff = startY - currentY; // positive when swiping up
    const atTop = el.scrollTop === 0;
    const atBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= 1;
    if ((diff < 0 && atTop) || (diff > 0 && atBottom)) {
      e.preventDefault();
    }
    e.stopPropagation();
  };

  React.useEffect(() => {
    let mounted = true;
    const fetchCountries = async () => {
      try {
        const res = await apiGet('/masterdata/country');
        const payload = res?.data;
        if (payload && payload.success && Array.isArray(payload.data)) {
          if (mounted) {
            const list = payload.data.map((c: any) => ({ id: c.id, name: c.name }));
            list.sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
            setCountries(list);
          }
        } else {
          console.warn('Failed to load countries', payload ?? res);
        }
      } catch (err) {
        console.warn('Error fetching countries', err);
      }

      // fetch states
      try {
        const res2 = await apiGet('/masterdata/state');
        const payload2 = res2?.data;
        if (payload2 && payload2.success && Array.isArray(payload2.data)) {
          if (mounted) {
            const list2 = payload2.data.map((s: any) => ({ id: s.id, name: s.name, country_id: s.country_id }));
            list2.sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
            setStates(list2);
          }
        } else {
          console.warn('Failed to load states', payload2 ?? res2);
        }
      } catch (err) {
        console.warn('Error fetching states', err);
      }

      // fetch cities
      try {
        const res3 = await apiGet('/masterdata/city');
        const payload3 = res3?.data;
        if (payload3 && payload3.success && Array.isArray(payload3.data)) {
          if (mounted) {
            const list3 = payload3.data.map((c: any) => ({ id: c.id, name: c.name, state_id: c.state_id }));
            list3.sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
            setCities(list3);
          }
        } else {
          console.warn('Failed to load cities', payload3 ?? res3);
        }
      } catch (err) {
        console.warn('Error fetching cities', err);
      }

      // fetch localities
      try {
        const res4 = await apiGet('/masterdata/locality');
        const payload4 = res4?.data;
        if (payload4 && payload4.success && Array.isArray(payload4.data)) {
          if (mounted) {
            const list4 = payload4.data.map((l: any) => ({ id: l.id, name: l.name, city_id: l.city_id }));
            list4.sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
            setLocalities(list4);
          }
        } else {
          console.warn('Failed to load localities', payload4 ?? res4);
        }
      } catch (err) {
        console.warn('Error fetching localities', err);
      }
    };

    fetchCountries();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let value = e.target.value;
    const fieldName = e.target.name;

    // Validate name fields - only alphabets and spaces allowed
    if (fieldName === 'owner_first_name' || fieldName === 'owner_last_name') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }

    // Validate phone fields - only numbers, max 10 digits
    if (fieldName === 'owner_phone' || fieldName === 'contact_phone') {
      value = value.replace(/[^\d]/g, '').slice(0, 10);
    }

    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Motel Name validation
    if (!formData.motel_name.trim()) {
      newErrors.motel_name = 'Motel name is required';
    } else if (formData.motel_name.trim().length < 3) {
      newErrors.motel_name = 'Motel name must be at least 3 characters';
    }

    // Registration Type validation
    if (!formData.registration_type) {
      newErrors.registration_type = 'Registration type is required';
    }

    // Rooms validation
    if (!formData.rooms) {
      newErrors.rooms = 'Number of rooms is required';
    }

    // Owner First Name validation
    if (!formData.owner_first_name.trim()) {
      newErrors.owner_first_name = 'First name is required';
    } else if (formData.owner_first_name.trim().length < 2) {
      newErrors.owner_first_name = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.owner_first_name)) {
      newErrors.owner_first_name = 'First name can only contain alphabets and spaces';
    }

    // Owner Last Name validation
    if (!formData.owner_last_name.trim()) {
      newErrors.owner_last_name = 'Last name is required';
    } else if (formData.owner_last_name.trim().length < 2) {
      newErrors.owner_last_name = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.owner_last_name)) {
      newErrors.owner_last_name = 'Last name can only contain alphabets and spaces';
    }

    // Owner Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.owner_email.trim()) {
      newErrors.owner_email = 'Owner email is required';
    } else if (!emailRegex.test(formData.owner_email)) {
      newErrors.owner_email = 'Please enter a valid email address';
    }

    // Owner Phone validation - exactly 10 digits
    const phoneNumberRegex = /^[0-9]{10}$/;
    if (!formData.owner_phone.trim()) {
      newErrors.owner_phone = 'Owner phone is required';
    } else if (formData.owner_phone.length !== 10) {
      newErrors.owner_phone = 'Phone number must be exactly 10 digits';
    } else if (!phoneNumberRegex.test(formData.owner_phone)) {
      newErrors.owner_phone = 'Phone number must contain only digits';
    }

    // Contact Email validation
    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!emailRegex.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    // Contact Phone validation - exactly 10 digits
    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = 'Contact phone is required';
    } else if (formData.contact_phone.length !== 10) {
      newErrors.contact_phone = 'Phone number must be exactly 10 digits';
    } else if (!phoneNumberRegex.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Phone number must contain only digits';
    }

    // Country validation
    if (!formData.country_name) {
      newErrors.country_name = 'Country is required';
    }

    // State validation
    if (!formData.state_name) {
      newErrors.state_name = 'State is required';
    }

    // City validation
    if (!formData.city_name) {
      newErrors.city_name = 'City is required';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }

    // Zip Code validation
    const zipRegex = /^[a-zA-Z0-9\s-]+$/;
    if (!formData.zip_code.trim()) {
      newErrors.zip_code = 'Zip code is required';
    } else if (!zipRegex.test(formData.zip_code)) {
      newErrors.zip_code = 'Please enter a valid zip code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ⭐ UPDATED handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload = {
      motel_name: formData.motel_name,
      owner_first_name: formData.owner_first_name,
      owner_last_name: formData.owner_last_name,
      owner_email: formData.owner_email,
      owner_phone: formData.owner_phone,
      contact_email: formData.contact_email,
      rooms: formData.rooms,
      contact_phone: formData.contact_phone,
      country_name: formData.country_name,
      state_name: formData.state_name,
      city_name: formData.city_name,
      locality_id: formData.locality_id,
      address: formData.address,
      zip_code: formData.zip_code,
      registration_type: formData.registration_type,
      about: formData.message,
      status: 1,
    };

    try {
      // ⭐ UPDATED — call API directly without token
      const res = await apiPostWithoutToken("/motels/register", payload);

      if (res.data?.success) {
        setSubmitted(true);
      } else {
        alert(res.data?.message || "Failed to register motel");
      }

    } catch (err: any) {
      console.error("Motel registration failed:", err);
      alert(err?.message || "Failed to register motel. Please try again.");
    }
  };

  if (submitted) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-white">
      <motion.div
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center border-2 border-gray-100"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Mail className="w-14 h-14 text-white" />
        </motion.div>

        <motion.h1
          className="text-4xl font-black mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Verify Your Email
        </motion.h1>

        <motion.p
          className="text-lg text-gray-600 mb-6 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          We sent a verification link to:
        </motion.p>

        <motion.p
          className="text-xl font-semibold text-orange-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {formData.contact_email}
        </motion.p>

        <motion.p
          className="text-gray-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Please check your inbox and click the verification link to activate your motel account.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={() => window.location.href = "/"}
            className="bg-orange-500 text-white px-8 py-4 rounded-xl hover:scale-105 transition-all shadow-lg font-semibold text-lg"
          >
            Back to Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}


  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700">
          <motion.div
            className="absolute top-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 15, repeat: Infinity }}
          />
          
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
            className="mb-8"
          >
            <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center mx-auto border border-white/30">
              <Handshake className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          <motion.h1
            className="text-7xl md:text-8xl text-white mb-6 font-black"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Partner With Us
          </motion.h1>
          
          <motion.p
            className="text-2xl md:text-3xl text-white/90 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Join Tripways.com and reach thousands of travelers
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white/20 backdrop-blur-lg px-8 py-4 rounded-2xl border border-white/30"
                whileHover={{ scale: 1.1, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl font-black text-white">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.a
            href="#apply"
            className="inline-flex items-center gap-3 bg-white text-orange-600 px-10 py-5 rounded-2xl font-black text-xl shadow-2xl cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Become a Partner</span>
            <ArrowRight className="w-6 h-6" />
          </motion.a>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>

      {/* Benefits Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">PARTNER BENEFITS</span>
            </motion.div>
            <h2 className="text-5xl mb-4 font-black">Why Partner With Tripways?</h2>
            <p className="text-xl text-gray-600">Unlock powerful tools to grow your motel business</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <motion.div
                  className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 h-full relative overflow-hidden"
                  whileHover={{ y: -10, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Gradient background on hover */}
                  <motion.div
                    className={`absolute inset-0 bg-${benefit.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  <motion.div
                    className={`w-16 h-16 bg-${benefit.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className="text-2xl mb-3 font-black">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 text-white relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl mb-4 font-black">How It Works</h2>
            <p className="text-xl text-gray-300">Get started in 4 simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                <motion.div
                  className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 h-full relative overflow-hidden"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step number */}
                  <div className="text-8xl font-black text-white/10 absolute -top-4 -right-4">
                    {step.number}
                  </div>

                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white text-orange-600 rounded-xl flex items-center justify-center mb-4 font-black text-xl">
                      {step.number}
                    </div>
                    <h3 className="text-2xl mb-3 font-black">{step.title}</h3>
                    <p className="text-white/90">{step.description}</p>
                  </div>
                </motion.div>

                {/* Connecting arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-20">
                    <ArrowRight className="w-8 h-8 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl mb-4 font-black">Powerful Tools for Partners</h2>
            <p className="text-xl text-gray-600">Everything you need to manage and grow your business</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-4 bg-orange-50 p-6 rounded-2xl border border-orange-200"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5, scale: 1.02 }}
              >
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold text-gray-800">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">

          <motion.div className="text-center mb-12">
            <h2 className="text-5xl mb-4 font-black">Apply Now</h2>
            <p className="text-xl text-gray-600">Fill out the form below</p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100"
          >

            {/* PROPERTY DETAILS */}
            <h3 className="text-2xl font-bold mb-4">Property Information</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">

              <div>
                <label className="font-semibold">Tripways Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="motel_name"
                  value={formData.motel_name}
                  onChange={handleChange}
                  required
                  className={`w-full p-3 border-2 rounded-xl ${errors.motel_name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder='enter your motel name'
                />
                {errors.motel_name && <p className="text-red-500 text-sm mt-1">{errors.motel_name}</p>}
              </div>

              <div>
                <label className="font-semibold">Registration Type <span className="text-red-500">*</span></label>
                <select
                  name="registration_type"
                  value={formData.registration_type}
                  onChange={handleChange}
                  required
                  className={`w-full p-3 border-2 rounded-xl ${errors.registration_type ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">select your registration type</option>
                  <option value="Motel">Motel</option>
                  <option value="Inn">Inn</option>
                  <option value="Lodge">Lodge</option>
                  <option value="Others">Others</option>
                </select>
                {errors.registration_type && <p className="text-red-500 text-sm mt-1">{errors.registration_type}</p>}
              </div>

              {/* Star rating removed: backend no longer requires this field */}

              <div>
                <label className="font-semibold">Rooms <span className="text-red-500">*</span></label>
                <select
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleChange}
                  required
                  className={`w-full p-3 border-2 rounded-xl ${errors.rooms ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder='select number of rooms'
                >
                  <option value="">select number of rooms</option>
                  <option value="1-10">1-10 rooms</option>
                  <option value="11-25">11-25 rooms</option>
                  <option value="26-50">26-50 rooms</option>
                  <option value="51-100">51-100 rooms</option>
                  <option value="100+">100+ rooms</option>
                </select>
                {errors.rooms && <p className="text-red-500 text-sm mt-1">{errors.rooms}</p>}
              </div>

            </div>

            {/* OWNER INFORMATION */}
            <h3 className="text-2xl font-bold mb-4">Owner Information</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">

              <div>
                <label className="font-semibold">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="owner_first_name"
                  value={formData.owner_first_name}
                  onChange={handleChange}
                  required
                  className={`w-full p-3 border-2 rounded-xl ${errors.owner_first_name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder='enter owner first name'
                />
                {errors.owner_first_name && <p className="text-red-500 text-sm mt-1">{errors.owner_first_name}</p>}
              </div>

              <div>
                <label className="font-semibold">Last Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="owner_last_name"
                  value={formData.owner_last_name}
                  onChange={handleChange}
                  required
                  className={`w-full p-3 border-2 rounded-xl ${errors.owner_last_name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder='enter owner last name'
                />
                {errors.owner_last_name && <p className="text-red-500 text-sm mt-1">{errors.owner_last_name}</p>}
              </div>

              <div>
                <label className="font-semibold">Owner Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="owner_email"
                  value={formData.owner_email}
                  onChange={handleChange}
                  required
                  className={`w-full p-3 border-2 rounded-xl ${errors.owner_email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder='enter owner email'
                />
                {errors.owner_email && <p className="text-red-500 text-sm mt-1">{errors.owner_email}</p>}
              </div>

              <div>
                <label className="font-semibold">Owner Phone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="owner_phone"
                  value={formData.owner_phone}
                  onChange={handleChange}
                  required
                  className={`w-full p-3 border-2 rounded-xl ${errors.owner_phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder='enter owner phone'
                />
                {errors.owner_phone && <p className="text-red-500 text-sm mt-1">{errors.owner_phone}</p>}
              </div>

            </div>

            {/* CONTACT INFORMATION */}
            <h3 className="text-2xl font-bold mb-4">Motel Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-semibold">Contact Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  required
                  className={`w-full p-3 border-2 rounded-xl ${errors.contact_email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder='enter contact email'
                />
                {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>}
              </div>
              <div>
                <label className="font-semibold">Contact Phone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  required
                  className={`w-full p-3 border-2 rounded-xl ${errors.contact_phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder='enter contact phone'
                />
                {errors.contact_phone && <p className="text-red-500 text-sm mt-1">{errors.contact_phone}</p>}
              </div>
            </div>

            {/* ADDRESS INFORMATION */}
            <h3 className="text-2xl font-bold mb-4">Address Details</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">

              <div ref={countryRef}>
                <label className="font-semibold">Country <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={formData.country_name || countrySearch}
                    onChange={(e) => {
                      setCountrySearch(e.target.value);
                      setOpenDropdown('country');
                    }}
                    onFocus={() => setOpenDropdown('country')}
                    className={`w-full p-3 border-2 rounded-xl ${errors.country_name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {openDropdown === 'country' && (
                    <div ref={countryListRef} onWheel={handleListWheel} onTouchStart={handleListTouchStart} onTouchMove={handleListTouchMove} className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-50 max-h-[70vh] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-cyan-200 scrollbar-track-gray-100" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 ? (
                        <div className="p-3 text-gray-600">No countries found</div>
                      ) : (
                        countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                          <button
                            key={c.id}
                            type="button"
                            data-name={c.name}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, country_name: c.name }));
                              setCountrySearch('');
                              setOpenDropdown(null);
                            }}
                            className="w-full flex items-center gap-3 p-3 md:p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <span className="text-sm text-gray-800">{c.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {errors.country_name && <p className="text-red-500 text-sm mt-1">{errors.country_name}</p>}
              </div>

              <div ref={stateRef}>
                <label className="font-semibold">State <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search state..."
                    value={formData.state_name || stateSearch}
                    onChange={(e) => {
                      setStateSearch(e.target.value);
                      setOpenDropdown('state');
                    }}
                    onFocus={() => setOpenDropdown('state')}
                    className={`w-full p-3 border-2 rounded-xl ${errors.state_name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {openDropdown === 'state' && (
                    <div ref={stateListRef} onWheel={handleListWheel} onTouchStart={handleListTouchStart} onTouchMove={handleListTouchMove} className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-50 max-h-[70vh] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-cyan-200 scrollbar-track-gray-100" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {states.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase())).length === 0 ? (
                        <div className="p-3 text-gray-600">No states found</div>
                      ) : (
                        states.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase())).map(s => (
                          <button
                            key={s.id}
                            type="button"
                            data-name={s.name}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, state_name: s.name }));
                              setStateSearch('');
                              setOpenDropdown(null);
                            }}
                            className="w-full flex items-center gap-3 p-3 md:p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <span className="text-sm text-gray-800">{s.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {errors.state_name && <p className="text-red-500 text-sm mt-1">{errors.state_name}</p>}
              </div>

              <div ref={cityRef}>
                <label className="font-semibold">City <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search city..."
                    value={formData.city_name || citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      setOpenDropdown('city');
                    }}
                    onFocus={() => setOpenDropdown('city')}
                    className={`w-full p-3 border-2 rounded-xl ${errors.city_name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {openDropdown === 'city' && (
                    <div ref={cityListRef} onWheel={handleListWheel} onTouchStart={handleListTouchStart} onTouchMove={handleListTouchMove} className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-50 max-h-[70vh] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-cyan-200 scrollbar-track-gray-100" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())).length === 0 ? (
                        <div className="p-3 text-gray-600">No cities found</div>
                      ) : (
                        cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())).map(c => (
                          <button
                            key={c.id}
                            type="button"
                            data-name={c.name}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, city_name: c.name }));
                              setCitySearch('');
                              setOpenDropdown(null);
                            }}
                            className="w-full flex items-center gap-3 p-3 md:p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <span className="text-sm text-gray-800">{c.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {errors.city_name && <p className="text-red-500 text-sm mt-1">{errors.city_name}</p>}
              </div>

              <div ref={localityRef}>
                <label className="font-semibold">Locality</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search locality..."
                    value={
                      formData.locality_id 
                        ? localities.find(l => String(l.id) === formData.locality_id)?.name || localitySearch 
                        : localitySearch
                    }
                    onChange={(e) => {
                      setLocalitySearch(e.target.value);
                      setOpenDropdown('locality');
                    }}
                    onFocus={() => setOpenDropdown('locality')}
                    className="w-full p-3 border-2 border-gray-300 rounded-xl"
                  />
                  {openDropdown === 'locality' && (
                    <div ref={localityListRef} onWheel={handleListWheel} onTouchStart={handleListTouchStart} onTouchMove={handleListTouchMove} className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-50 max-h-[70vh] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-cyan-200 scrollbar-track-gray-100" style={{ WebkitOverflowScrolling: 'touch' }}>
                      {localities.filter(l => l.name.toLowerCase().includes(localitySearch.toLowerCase())).length === 0 ? (
                        <div className="p-3 text-gray-600">No localities found</div>
                      ) : (
                        localities.filter(l => l.name.toLowerCase().includes(localitySearch.toLowerCase())).map(l => (
                          <button
                            key={l.id}
                            type="button"
                            data-name={l.name}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, locality_id: String(l.id) }));
                              setLocalitySearch('');
                              setOpenDropdown(null);
                            }}
                            className="w-full flex items-center gap-3 p-3 md:p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <span className="text-sm text-gray-800">{l.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="font-semibold">Address <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className={`w-full p-3 border-2 rounded-xl ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                placeholder='enter address'
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="mb-4">
              <label className="font-semibold">Zip Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                required
                className={`w-full p-3 border-2 rounded-xl ${errors.zip_code ? 'border-red-500' : 'border-gray-300'}`}
                placeholder='enter zip code'
              />
              {errors.zip_code && <p className="text-red-500 text-sm mt-1">{errors.zip_code}</p>}
            </div>

            {/* MESSAGE */}
            <div className="mb-4">
              <label className="font-semibold">About This Motel</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 border-2 rounded-xl"
                rows={4}
                placeholder='any additional information you would like to provide'
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold"
            >
              Submit Application
            </button>

          </motion.form>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid md:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {[
              { icon: Award, text: 'Trusted Platform' },
              { icon: Shield, text: 'Secure Payments' },
              { icon: Users, text: '24/7 Support' },
              { icon: Target, text: 'Growth Focused' }
            ].map((badge, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <badge.icon className="w-8 h-8 text-white" />
                </div>
                <p className="font-semibold text-gray-800">{badge.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}