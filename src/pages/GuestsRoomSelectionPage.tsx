import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Users, Minus, Plus, MapPin, Calendar, CreditCard, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { apiPost } from '../api/api';

const steps = [
  { title: 'Select Motel', icon: MapPin },
  { title: 'Rooms & Guests', icon: Users },
  { title: 'Reservation', icon: Calendar },
  { title: 'Confirm', icon: CheckCircle }
];

const currentStep = 1;

const ROOM_TYPES = [
  {
    id: 'standard',
    name: 'Standard Room',
    price: 89,
    capacity: 2
  },
  {
    id: 'deluxe',
    name: 'Deluxe Room',
    price: 119,
    capacity: 2
  },
  {
    id: 'family',
    name: 'Family Suite',
    price: 149,
    capacity: 4
  }
];

export default function GuestsRoomSelectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRoomFromState = location.state?.selectedRoom ?? null;
  const selectedCheckIn = location.state?.checkIn ?? '';
  const selectedCheckOut = location.state?.checkOut ?? '';
  console.log("selectedCheckIn:", selectedCheckIn, "selectedCheckOut:", selectedCheckOut, "selectedRoomFromState:", selectedRoomFromState);
  const selectedGuests = location.state?.guests ?? undefined;
  const parsedGuests = selectedGuests ? (typeof selectedGuests === 'string' ? parseInt(selectedGuests, 10) : selectedGuests) : 2;
  
  // Helper function to safely parse price from various formats
  const parsePrice = (price: any): number => {
    if (price === null || price === undefined) return 0;
    
    // If already a number, return it
    if (typeof price === 'number') return price;
    
    // If string, remove currency symbols and parse
    if (typeof price === 'string') {
      let cleaned = price.replace(/[$,\s]/g, '');
      
      // Handle 'k' suffix (thousands)
      if (cleaned.toLowerCase().endsWith('k')) {
        cleaned = cleaned.slice(0, -1); // Remove 'k'
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed * 1000;
      }
      
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  };

  console.log('selectedRoomFromState:', selectedRoomFromState);
  if (selectedRoomFromState) {
    console.log('Room price fields:', {
      price: selectedRoomFromState.price,
      base_price: selectedRoomFromState.base_price,
      price_per_night: selectedRoomFromState.price_per_night,
      rate: selectedRoomFromState.rate
    });
  }
  
  const defaultRooms = selectedRoomFromState
    ? { [String(selectedRoomFromState.id ?? selectedRoomFromState.type ?? selectedRoomFromState.name)]: 1 }
    : { standard: 1, deluxe: 0, family: 0 };
  const [rooms, setRooms] = useState(() => defaultRooms);
  const [guests, setGuests] = useState(parsedGuests);
  const [nights, setNights] = useState(1);
  const [bookingPreview, setBookingPreview] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Calculate total rooms from rooms state
  const totalRooms = Object.values(rooms).reduce((sum, count) => sum + count, 0);

  // Calculate nights from check-in and check-out
  useEffect(() => {
    if (selectedCheckIn && selectedCheckOut) {
      const checkIn = new Date(selectedCheckIn);
      const checkOut = new Date(selectedCheckOut);
      const calculatedNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      setNights(Math.max(1, calculatedNights));
    }
  }, [selectedCheckIn, selectedCheckOut]);

  // Fetch booking preview whenever rooms, guests, or dates change
  useEffect(() => {
    const fetchBookingPreview = async () => {
      if (!id || !selectedCheckIn || !selectedCheckOut || totalRooms === 0) return;

      try {
        setPreviewLoading(true);

        // Build rooms array from current room selections
        const roomsArray = Object.entries(rooms)
          .filter(([_, count]) => count > 0)
          .map(([roomTypeId, count]) => ({
            roomType: selectedRoomFromState?.type ?? selectedRoomFromState?.room_type ?? selectedRoomFromState?.name ?? roomTypeId,
            count
          }));

        const payload = {
          motelId: Number(id),
          checkIn: selectedCheckIn,
          checkOut: selectedCheckOut,
          nights,
          rooms: roomsArray,
          guests
        };

        console.log('Booking preview payload:', payload);

        const res = await apiPost('/user-booking/bookings/preview', payload);
        console.log('Booking preview response:', res?.data);
        if (res?.data?.success) {
          setBookingPreview(res.data);
          console.log('Booking preview data set:', res.data);
        }
      } catch (err) {
        console.error('Failed to fetch booking preview', err);
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchBookingPreview();
  }, [id, selectedCheckIn, selectedCheckOut, rooms, guests, nights, totalRooms, selectedRoomFromState?.id]);

  const updateRoomCount = (roomId: string, delta: number) => {
    setRooms(prev => ({
      ...prev,
      [roomId]: Math.max(0, (prev[roomId as keyof typeof prev] ?? 0) + delta)
    }));
  };

  const totalPrice = Object.entries(rooms).reduce((sum, [roomId, count]) => {
    // find in ROOM_TYPES or check if selectedRoomFromState matches
      let room = ROOM_TYPES.find(r => r.id === roomId);
    if (!room && selectedRoomFromState) {
      const idKey = String(selectedRoomFromState.id ?? selectedRoomFromState.type ?? selectedRoomFromState.room_type ?? selectedRoomFromState.name);
      if (idKey === roomId) {
        room = {
          id: idKey,
            name: selectedRoomFromState.type ?? selectedRoomFromState.room_type ?? selectedRoomFromState.name ?? 'Room',
          price: parsePrice(selectedRoomFromState.price ?? selectedRoomFromState.base_price ?? 0),
          capacity: selectedRoomFromState.max_guests ?? selectedRoomFromState.capacity ?? 1
        } as any;
      }
    }
    return sum + (room ? room.price * count : 0);
  }, 0);

  const handleNext = () => {
    if (totalRooms === 0) {
      alert('Please select at least one room');
      return;
    }

    // Ensure we have checkIn and checkOut
    if (!selectedCheckIn || !selectedCheckOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    // Build rooms array for booking
    const roomsArray = Object.entries(rooms)
      .filter(([_, count]) => count > 0)
      .map(([roomTypeId, count]) => ({
        roomType: selectedRoomFromState?.type ?? selectedRoomFromState?.room_type ?? selectedRoomFromState?.name ?? roomTypeId,
        count
      }));

    const payload = {
      checkIn: selectedCheckIn,
      checkOut: selectedCheckOut,
      nights,
      guests,
      rooms: roomsArray,
      totalAmount: bookingPreview?.summary?.total || totalPrice * nights
    };

    console.log('Navigating to reservation with payload:', payload);

    navigate(`/motel/${id}/reservation`, {
      state: payload
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-1 items-center">
                <div className="flex flex-col items-center flex-1">
                  <motion.div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 sm:mb-2 ${
                      currentStep > index
                        ? 'bg-green-500'
                        : currentStep === index
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                        : 'bg-gray-200'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {currentStep > index ? (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <step.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${currentStep === index ? 'text-white' : 'text-gray-400'}`} />
                    )}
                  </motion.div>
                  <span className={`text-xs sm:text-sm ${currentStep >= index ? 'text-gray-900' : 'text-gray-400'} hidden sm:block`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 ${currentStep > index ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 flex-1">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Room Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guests Count */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-lg tracking-tight">Number of Guests</h2>
              </div>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <span className="text-base">Adults</span>
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-11 h-11 rounded-full bg-white border border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Minus className="w-5 h-5" />
                  </motion.button>
                  <motion.span 
                    className="text-xl w-16 text-center"
                    key={guests}
                    initial={{ scale: 1.3, color: '#06b6d4' }}
                    animate={{ scale: 1, color: '#000000' }}
                    transition={{ duration: 0.2 }}
                  >
                    {guests}
                  </motion.span>
                  <motion.button
                    onClick={() => setGuests(guests + 1)}
                    className="w-11 h-11 rounded-full bg-white border border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Room Types */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg mb-5 tracking-tight">Select Rooms</h2>
              <div className="space-y-5">
                {(selectedRoomFromState ? [{
                  id: String(selectedRoomFromState.id ?? selectedRoomFromState.type ?? selectedRoomFromState.name),
                  name: selectedRoomFromState?.type ?? selectedRoomFromState?.name ?? 'Room',
                  price: parsePrice(selectedRoomFromState?.price ?? selectedRoomFromState?.base_price ?? selectedRoomFromState?.price_per_night ?? selectedRoomFromState?.rate ?? 0),
                  capacity: selectedRoomFromState?.max_guests ?? selectedRoomFromState?.capacity ?? 1
                }] : ROOM_TYPES).map((room, index) => (
                  <motion.div 
                    key={room.id} 
                    className="border-b pb-5 last:border-b-0 last:pb-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-base mb-2 tracking-tight">{room.name}</h3>
                        <p className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full inline-block">Sleeps {room.capacity}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl text-blue-600">${isNaN(room.price) ? '0' : room.price.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">per night</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-700 text-sm">Rooms</span>
                      <div className="flex items-center gap-4">
                        <motion.button
                          onClick={() => updateRoomCount(room.id, -1)}
                          className="w-11 h-11 rounded-full bg-white border border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                          disabled={rooms[room.id as keyof typeof rooms] === 0}
                          whileHover={{ scale: rooms[room.id as keyof typeof rooms] === 0 ? 1 : 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Minus className="w-5 h-5" />
                        </motion.button>
                        <motion.span 
                          className="text-xl w-16 text-center"
                          key={rooms[room.id as keyof typeof rooms]}
                          initial={{ scale: 1.3, color: '#06b6d4' }}
                          animate={{ scale: 1, color: '#000000' }}
                          transition={{ duration: 0.2 }}
                        >
                          {rooms[room.id as keyof typeof rooms]}
                        </motion.span>
                        <motion.button
                          onClick={() => updateRoomCount(room.id, 1)}
                          className="w-11 h-11 rounded-full bg-white border border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Nights */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="text-lg mb-5 tracking-tight">Number of Nights</h2>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <span className="text-base">Nights</span>
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={() => setNights(Math.max(1, nights - 1))}
                    className="w-11 h-11 rounded-full bg-white border border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Minus className="w-5 h-5" />
                  </motion.button>
                  <motion.span 
                    className="text-xl w-16 text-center"
                    key={nights}
                    initial={{ scale: 1.3, color: '#06b6d4' }}
                    animate={{ scale: 1, color: '#000000' }}
                    transition={{ duration: 0.2 }}
                  >
                    {nights}
                  </motion.span>
                  <motion.button
                    onClick={() => setNights(nights + 1)}
                    className="w-11 h-11 rounded-full bg-white border border-gray-300 hover:border-cyan-500 hover:bg-cyan-50 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Pricing Summary */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 text-white rounded-xl shadow-lg p-8 sticky top-20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-xl mb-6 tracking-tight">Booking Summary</h2>
              
              <div className="space-y-4 mb-6 text-base">
                {[
                  { label: 'Guests:', value: guests },
                  { label: 'Rooms:', value: totalRooms },
                  { label: 'Nights:', value: nights }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex justify-between text-blue-100"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-white/20 pt-5 mb-6">
                {Object.entries(rooms).map(([roomId, count], index) => {
                  if (count === 0) return null;
                  const room = ROOM_TYPES.find(r => r.id === roomId);
                  if (!room) return null;
                  return (
                    <motion.div 
                      key={roomId} 
                      className="flex justify-between text-sm text-blue-100 mb-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <span>{room.name} × {count}</span>
                      <span>${room.price * count * nights}</span>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div 
                className="border-t border-white/20 pt-6 mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg">Total</span>
                  <div className="text-right">
                    <motion.div 
                      className="text-4xl"
                      key={bookingPreview?.summary?.total || totalPrice * nights}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {bookingPreview?.summary?.total !== undefined ? bookingPreview.summary.total : (totalPrice * nights).toFixed(2)}
                    </motion.div>
                    <div className="text-sm text-blue-200 mt-1">for {nights} {nights === 1 ? 'night' : 'nights'}</div>
                  </div>
                </div>
                {previewLoading && (
                  <div className="text-xs text-blue-300 mt-2">Loading pricing...</div>
                )}
              </motion.div>

              <motion.button
                onClick={handleNext}
                disabled={totalRooms === 0}
                className="w-full bg-white text-blue-600 py-5 text-lg rounded-xl hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                whileHover={{ scale: totalRooms === 0 ? 1 : 1.02, y: totalRooms === 0 ? 0 : -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Next — Guest Information
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}