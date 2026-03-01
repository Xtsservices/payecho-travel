import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { MapPin, Wifi, Coffee, Tv, ParkingCircle, ChevronLeft, ChevronRight, Check, X as XIcon, Calendar, Users } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion } from 'motion/react';
import { apiGetWithoutToken } from '../api/api';

// This page fetches motel details from the user-booking API and renders them.

export default function MotelDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '1';

  const [motel, setMotel] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (checkIn) params.set('check-in', checkIn);
    if (checkOut) params.set('check-out', checkOut);
    if (guests) params.set('guests', guests);

    apiGetWithoutToken('/user-booking/motels/' + id + '/details?' + params.toString())
      .then(res => {
        const data = res.data?.motel ?? res.data ?? null;
        setMotel(data);
        const rooms = data?.room_types ?? data?.rooms ?? [];
        if (rooms.length > 0) setSelectedRoom(String(rooms[0].id ?? rooms[0].type ?? rooms[0].name));
      })
      .catch(() => {
        setError('Failed to load motel details');
        setMotel(null);
      })
      .finally(() => setLoading(false));
  }, [id, checkIn, checkOut, guests]);

  const roomsList = motel?.room_types ?? motel?.rooms ?? [];
  const priceMin = roomsList.length ? Math.min(...roomsList.map((r: any) => Number(r.price ?? r.base_price ?? 0))) : 0;

  // Normalize images to an array of URL strings (API may return objects)
  const motelImages: string[] = ((motel?.images ?? []) as any[])
    .map((img: any) => (typeof img === 'string' ? img : img?.file_url ?? img?.url ?? img?.path ?? ''))
    .filter(Boolean);

  const motelAmenities = (() => {
    const a = motel?.amenities;
    if (!a) return [];

    // Helper to extract labels from an object of amenity flags
    const extractFromObject = (obj: any) => {
      const list: string[] = [];
      if (!obj) return list;
      if (obj.wifi_available) list.push('Free Wi-Fi');
      if (obj.parking_available) list.push('Free Parking');
      if (obj.ac_available) list.push('Air Conditioning');
      if (obj.restaurant_available) list.push('Restaurant');
      if (obj.swimming_pool) list.push('Swimming Pool');
      if (obj.power_backup) list.push('Power Backup');
      if (obj.cctv) list.push('CCTV');
      if (obj.room_service) list.push('Room Service');
      if (obj.laundry_service) list.push('Laundry Service');
      if (obj.pet_friendly) list.push('Pet Friendly');
      return list;
    };

    if (Array.isArray(a)) {
      const list: string[] = [];
      a.forEach((item: any) => {
        if (!item) return;
        if (typeof item === 'string') list.push(item);
        else if (typeof item === 'object') {
          if (item.name) list.push(item.name);
          else {
            // If the item is an object of flags, extract multiple labels
            const fromObj = extractFromObject(item);
            if (fromObj.length) list.push(...fromObj);
            else {
              // Fallback: stringify primitive-like objects safely
              try {
                const maybe = Object.values(item).find(v => typeof v === 'string' || typeof v === 'number');
                if (maybe) list.push(String(maybe));
              } catch (e) {
                // ignore
              }
            }
          }
        }
      });
      return list;
    }

    if (typeof a === 'object') {
      return extractFromObject(a);
    }

    return [];
  })();

  const handleContinueBooking = () => {
    const sel = roomsList.find((r: any) => String(r.id) === String(selectedRoom) || r.type === selectedRoom || r.name === selectedRoom);
    navigate(`/motel/${id}/select-rooms`, { state: { selectedRoom: sel, checkIn, checkOut, guests } });
  };

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: motel?.motel_name ?? motel?.name ?? '',
    description: motel?.description ?? '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: motel?.address ?? motel?.location ?? ''
    },
    priceRange: priceMin ? ('$' + priceMin) : '',
    image: motelImages
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={(motel?.motel_name ?? motel?.name ?? 'Motel') + ' - Book Now | MOTELTRIPS.COM'}
        description={(motel?.description ?? '') + ' Starting from ' + priceMin + ' per night.'}
        keywords={(motel?.motel_name ?? motel?.name ?? '') + ', motel'}
        schema={schema}
        canonicalUrl={'https://moteltrips.com/motel/' + id}
        ogImage={motelImages[0] ?? ''}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 flex-1">
        {loading && <div className="text-center py-20">Loading motel details…</div>}
        {error && <div className="text-center py-8 text-red-600">{error}</div>}
        {!loading && !motel && !error && <div className="text-center py-8">No motel details available.</div>}

        {!loading && motel && (
          <>
            <section className="bg-white py-6 sm:py-8 lg:py-12 px-4 sm:px-6">
              <div className="max-w-7xl mx-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {motelImages.map((image: string, index: number) => (
                    <motion.div
                      key={index}
                      className={index === 0 ? 'col-span-1 sm:col-span-2 lg:row-span-2 h-64 sm:h-96 lg:h-full relative overflow-hidden rounded-xl sm:rounded-2xl' : 'h-48 sm:h-64 lg:h-auto relative overflow-hidden rounded-xl sm:rounded-2xl'}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <ImageWithFallback src={image} alt={(motel.motel_name ?? motel.name ?? 'Motel') + ' - Image ' + (index + 1)} className="w-full h-full object-cover cursor-pointer" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h1 className="text-5xl mb-3 font-black">{motel.motel_name ?? motel.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5 text-cyan-500" />
                      <span>{motel.address ?? motel.locality ?? ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {motel.reviews ? <span className="text-gray-600 font-semibold">({motel.reviews} reviews)</span> : null}
                    </div>
                  </div>
                </motion.div>

                <motion.div className="mb-8 bg-gray-50 p-6 rounded-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h2 className="text-2xl mb-4 font-black">About This Motel</h2>
                  <p className="text-gray-700 leading-relaxed">{motel.about || motel.description}</p>
                </motion.div>

                <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <h2 className="text-2xl mb-6 font-black">Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {motelAmenities.map((amenity: any, index: number) => (
                        <motion.div key={index} className="flex items-center gap-3 bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-100" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + index * 0.05 }} whileHover={{ scale: 1.05, y: -2 }}>
                          <span className="w-5 h-5 text-cyan-600" />
                          <span className="font-semibold text-gray-700">{amenity}</span>
                        </motion.div>
                      ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <h2 className="text-2xl mb-6 font-black">Select Room Type</h2>
                  <div className="space-y-4">
                    {roomsList.map((room: any, index: number) => (
                      <motion.div key={room.id ?? index} className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${selectedRoom === String(room.id ?? room.type ?? room.name) ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`} onClick={() => setSelectedRoom(String(room.id ?? room.type ?? room.name))} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + index * 0.1 }} whileHover={{ x: 5 }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl mb-2 font-black">{room.type ?? room.name}</h3>
                            <p className="text-gray-600 mb-2">{room.description}</p>
                            <p className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full inline-block">Sleeps {room.max_guests ?? room.capacity ?? ''}</p>
                          </div>
                          <div className="text-right">
                            <motion.div className="text-4xl text-blue-600 mb-1 font-black" animate={{ scale: selectedRoom === String(room.id ?? room.type ?? room.name) ? [1, 1.1, 1] : 1 }} transition={{ duration: 0.3 }}>
                              {room.price ?? room.base_price ?? 0}
                            </motion.div>
                            <div className="text-sm text-gray-600">per night</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <div className="lg:col-span-1">
                <motion.div className="bg-white rounded-2xl shadow-2xl p-6 sticky top-24 border border-gray-100" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <div className="mb-6 text-center pb-6 border-b">
                    <div className="text-gray-600 mb-2">Starting from</div>
                    <motion.div className="text-5xl text-blue-600 mb-1 font-black" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                      {(() => {
                        const sel = roomsList.find((r: any) => String(r.id) === String(selectedRoom) || r.type === selectedRoom || r.name === selectedRoom);
                        return sel ? (sel.price ?? sel.base_price ?? 0) : priceMin;
                      })()}
                    </motion.div>
                    <div className="text-gray-600">per night</div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2 font-semibold">Check-in</label>
                      <input type="date" defaultValue={checkIn} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-2 font-semibold">Check-out</label>
                      <input type="date" defaultValue={checkOut} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all" />
                    </div>
                  </div>

                  <motion.button onClick={handleContinueBooking} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-semibold text-lg cursor-pointer" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                    Continue Booking
                  </motion.button>

                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                    {['Free cancellation up to 24 hours', 'No booking fees', 'Instant confirmation'].map((benefit, index) => (
                      <motion.div key={index} className="flex items-center gap-3 text-sm text-gray-600" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.1 }}>
                        <span className="text-green-600 text-lg">✓</span>
                        <span>{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}