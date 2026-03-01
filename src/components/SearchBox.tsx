import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiGetWithoutToken } from '../api/api';
import { MapPin, Calendar, Users, Search, ChevronDown, Home, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchBoxProps {
  variant?: 'hero' | 'compact';
}

interface Locality {
  id: number;
  name: string;
  city_id: number;
  pincode: string;
  status: number;
  city_name: string;
  state_name: string;
  state_code: string;
  display_name: string;
}

export default function SearchBox({ variant = 'hero' }: SearchBoxProps) {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loadingLocalities, setLoadingLocalities] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  // Fetch localities on component mount
  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        setLoadingLocalities(true);
        const res = await apiGetWithoutToken<{ success: boolean; data: Locality[] }>('/masterdata/locality');
        if (res.data.success && Array.isArray(res.data.data)) {
          setLocalities(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch localities:', error);
      } finally {
        setLoadingLocalities(false);
      }
    };

    fetchLocalities();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
        setShowGuestsDropdown(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalGuests = adults + children;

    try {
      const params = new URLSearchParams();
      if (location) params.append('locality', location);
      if (checkIn) params.append('checkIn', checkIn);
      if (checkOut) params.append('checkOut', checkOut);
      params.append('rooms', String(rooms));
      params.append('guests', String(totalGuests));

      const url = `/user-booking/searchmotels?${params.toString()}`;
      const res = await apiGet(url);
      const motels = res?.data?.motels ?? [];

      // Navigate to search results and pass motels in location state
      navigate(`/search?location=${encodeURIComponent(location)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${totalGuests}&rooms=${rooms}`, { state: { motels } });
    } catch (err) {
      console.error('Search API failed', err);
      // fallback to the original navigation so the page still loads
      const totalGuests = adults + children;
      navigate(`/search?location=${location}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${totalGuests}&rooms=${rooms}`);
    }
  };

  const isHero = variant === 'hero';
  const totalGuests = adults + children;

  // Calculate nights
  const calculateNights = () => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const nights = calculateNights();

  return (
    <motion.form 
      onSubmit={handleSearch} 
      className={`bg-white rounded-2xl shadow-2xl ${isHero ? 'p-2' : 'p-2'} border border-gray-100`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col lg:flex-row items-stretch gap-0">
        {/* Location */}
        <div className="flex-1 relative" ref={locationRef}>
          <div 
            className={`p-4 md:p-5 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none border-b lg:border-b-0 lg:border-r border-gray-200 ${focusedField === 'location' ? 'bg-gray-50' : ''}`}
            onClick={() => {
              setShowLocationDropdown(true);
              setFocusedField('location');
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs md:text-sm text-gray-500 mb-0.5">City, Property or Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => {
                    setShowLocationDropdown(true);
                    setFocusedField('location');
                  }}
                  placeholder="Where are you going?"
                  className="w-full text-sm md:text-base bg-transparent border-none outline-none placeholder-gray-400"
                  required
                />
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {showLocationDropdown && (
              <motion.div 
                className="absolute top-full left-0 right-0 lg:right-auto mt-2 w-full lg:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 md:p-5 z-50 max-h-[70vh] overflow-y-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {loadingLocalities ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">Loading localities...</p>
                  </div>
                ) : localities.length > 0 ? (
                  <>
                    <div className="mb-3">
                      <p className="text-xs md:text-sm text-gray-500 mb-2 uppercase tracking-wide">Available Localities</p>
                    </div>
                    <div className="space-y-1">
                      {localities
                        .filter((locality) =>
                          locality.name.toLowerCase().includes(location.toLowerCase()) ||
                          locality.pincode.toLowerCase().includes(location.toLowerCase()) ||
                          locality.city_name.toLowerCase().includes(location.toLowerCase())
                        )
                        .map((locality) => (
                          <button
                            key={locality.id}
                            type="button"
                            onClick={() => {
                              setLocation(locality.display_name);
                              setShowLocationDropdown(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 md:p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
                          >
                            <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-sm md:text-base text-gray-700 block">{locality.name}, {locality.city_name}, {locality.state_code}</span>
                            </div>
                          </button>
                        ))}
                      {localities.filter((locality) =>
                        locality.name.toLowerCase().includes(location.toLowerCase()) ||
                        locality.pincode.toLowerCase().includes(location.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No localities found</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No localities found</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Check-in & Check-out - Combined on mobile */}
        <div className="flex-1 grid grid-cols-2 lg:contents border-b lg:border-b-0 border-gray-200">
          {/* Check-in */}
          <div className="lg:flex-1 border-r border-gray-200">
            <div 
              className={`p-4 md:p-5 cursor-pointer hover:bg-gray-50 transition-colors lg:border-r border-gray-200 h-full ${focusedField === 'checkIn' ? 'bg-gray-50' : ''}`}
              onClick={() => setFocusedField('checkIn')}
            >
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs md:text-sm text-gray-500 mb-0.5">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    onFocus={() => setFocusedField('checkIn')}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full text-sm md:text-base bg-transparent border-none outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Check-out */}
          <div className="lg:flex-1">
            <div 
                className={`p-4 md:p-5 transition-colors lg:border-r border-gray-200 h-full ${focusedField === 'checkOut' ? 'bg-gray-50' : ''}`}
                onClick={() => {
                  if (!checkIn) {
                    setFocusedField('checkIn');
                    return;
                  }
                  setFocusedField('checkOut');
                }}
              >
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs md:text-sm text-gray-500 mb-0.5">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    onFocus={(e) => {
                      if (!checkIn) {
                        e.currentTarget.blur();
                        setFocusedField('checkIn');
                      } else {
                        setFocusedField('checkOut');
                      }
                    }}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className={`w-full text-sm md:text-base bg-transparent border-none outline-none ${!checkIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={!checkIn}
                    required
                  />
                </div>
              </div>
              {nights > 0 && (
                <div className="mt-1 lg:mt-2">
                  <p className="text-xs text-cyan-600 ml-12 md:ml-14">{nights} {nights === 1 ? 'Night' : 'Nights'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rooms & Guests */}
        <div className="flex-1 relative border-b lg:border-b-0" ref={guestsRef}>
          <div 
            className={`p-4 md:p-5 cursor-pointer hover:bg-gray-50 transition-colors lg:border-r border-gray-200 ${focusedField === 'guests' ? 'bg-gray-50' : ''}`}
            onClick={() => {
              setShowGuestsDropdown(!showGuestsDropdown);
              setFocusedField('guests');
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs md:text-sm text-gray-500 mb-0.5">Rooms & Guests</label>
                <div className="text-sm md:text-base truncate">
                  {rooms} Room{rooms > 1 ? 's' : ''}, {totalGuests} Guest{totalGuests > 1 ? 's' : ''}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform ${showGuestsDropdown ? 'rotate-180' : ''}`} />
            </div>
          </div>
          
          <AnimatePresence>
            {showGuestsDropdown && (
              <motion.div 
                className="absolute top-full left-0 right-0 lg:right-auto mt-2 w-full lg:w-80 bg-white border border-gray-200 rounded-xl shadow-2xl p-5 md:p-6 z-50 max-h-[70vh] overflow-y-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Rooms */}
                <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
                      <span className="font-medium text-sm md:text-base">Rooms</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500">Number of rooms</p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRooms(Math.max(1, rooms - 1));
                      }}
                      disabled={rooms <= 1}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-lg border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-lg"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-medium text-sm md:text-base">{rooms}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRooms(rooms + 1);
                      }}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-lg border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 transition-colors cursor-pointer flex items-center justify-center text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Adults */}
                <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-200">
                  <div>
                    <div className="font-medium mb-1 text-sm md:text-base">Adults</div>
                    <p className="text-xs md:text-sm text-gray-500">Age 13 or above</p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdults(Math.max(1, adults - 1));
                      }}
                      disabled={adults <= 1}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-lg border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-lg"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-medium text-sm md:text-base">{adults}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdults(adults + 1);
                      }}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-lg border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 transition-colors cursor-pointer flex items-center justify-center text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium mb-1 text-sm md:text-base">Children</div>
                    <p className="text-xs md:text-sm text-gray-500">Age 0-12</p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChildren(Math.max(0, children - 1));
                      }}
                      disabled={children <= 0}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-lg border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-lg"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-medium text-sm md:text-base">{children}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChildren(children + 1);
                      }}
                      className="w-9 h-9 md:w-10 md:h-10 rounded-lg border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 transition-colors cursor-pointer flex items-center justify-center text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGuestsDropdown(false);
                  }}
                  className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 md:py-4 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all cursor-pointer text-sm md:text-base"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Button */}
        <div className="flex items-center p-2 md:p-3">
          <button
            type="submit"
            className="w-full lg:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 md:px-10 py-4 md:py-5 rounded-xl lg:rounded-r-2xl lg:rounded-l-none hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 cursor-pointer hover:scale-105 active:scale-95 text-base md:text-lg"
          >
            <Search className="w-5 h-5 md:w-6 md:h-6" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </motion.form>
  );
}
