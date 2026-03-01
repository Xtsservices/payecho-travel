import { useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import MotelCard from '../components/MotelCard';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { SlidersHorizontal, X, Edit3, MapPin, Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SearchBox from '../components/SearchBox';

const MOCK_MOTELS = [
  {
    id: '1',
    name: 'Sunrise Motel',
    location: 'Los Angeles, CA',
    image: 'https://images.unsplash.com/photo-1566126727069-6df012224264?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdod2F5JTIwbW90ZWwlMjB2aW50YWdlfGVufDF8fHx8MTc2NDc0NzU5OHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 89,
    rating: 4,
    reviews: 245,
    type: 'Budget',
    amenities: ['Wi-Fi', 'Parking', 'A/C']
  },
  {
    id: '2',
    name: 'Mountain View Inn',
    location: 'Denver, CO',
    image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHJlc29ydHxlbnwxfHx8fDE3NjQ3NDc1OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 125,
    rating: 5,
    reviews: 389,
    type: 'Deluxe',
    amenities: ['Wi-Fi', 'Parking', 'A/C', 'Breakfast']
  },
  {
    id: '3',
    name: 'Beachside Motel',
    location: 'Miami, FL',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHJlc29ydHxlbnwxfHx8fDE3NjQ3MDQyOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 149,
    rating: 5,
    reviews: 512,
    type: 'Deluxe',
    amenities: ['Wi-Fi', 'Parking', 'A/C', 'Breakfast']
  },
  {
    id: '4',
    name: 'Highway Rest Motel',
    location: 'Phoenix, AZ',
    image: 'https://images.unsplash.com/photo-1764304052987-80d263a1fd3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RlbCUyMG5pZ2h0JTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzY0NzQ3NTk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 75,
    rating: 3,
    reviews: 128,
    type: 'Budget',
    amenities: ['Wi-Fi', 'Parking']
  },
  {
    id: '5',
    name: 'Family Comfort Suites',
    location: 'Orlando, FL',
    image: 'https://images.unsplash.com/photo-1662841540530-2f04bb3291e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RlbCUyMHJvb20lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjQ3NDc1OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 110,
    rating: 4,
    reviews: 267,
    type: 'Family',
    amenities: ['Wi-Fi', 'Parking', 'A/C', 'Breakfast']
  },
  {
    id: '6',
    name: 'Downtown Express',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1614568112072-770f89361490?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwaG90ZWx8ZW58MXx8fHwxNzY0NzM0OTYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 189,
    rating: 5,
    reviews: 634,
    type: 'Suite',
    amenities: ['Wi-Fi', 'Parking', 'A/C', 'Breakfast']
  }
];

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const locationState = useLocation();
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const location = searchParams.get('location') || 'All locations';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '2';
console.log('SearchResultsPage render with location:', location, 'checkIn:', checkIn, 'checkOut:', checkOut, 'guests:', guests);
  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const passedMotels = (locationState.state as any)?.motels ?? null;
  const baseMotels = passedMotels ?? MOCK_MOTELS;

  // Normalize incoming motel objects (API shape) to the MotelCard props shape
  const normalizedMotels = (baseMotels as any[]).map(m => ({
    id: String(m.id ?? m.id),
    name: m.motel_name ?? m.name ?? '',
    location: m.locality ?? m.address ?? m.location ?? '',
    image: m.primary_image ?? m.image ?? '',
    price: Number(m.base_price ?? m.price) || 0,
    rating: Number(m.rating) || 0,
    reviews: Number(m.reviews) || 0,
    type: m.type ?? 'Motel',
    amenities: m.amenities ?? []
  }));

  // Remove duplicate motels by ID
  const uniqueMotels = Array.from(
    new Map(normalizedMotels.map(m => [m.id, m])).values()
  );

  const filteredMotels = uniqueMotels.filter((motel: any) => {
    if (motel.price < priceRange[0] || motel.price > priceRange[1]) return false;
    if (selectedRating > 0 && motel.rating < selectedRating) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(motel.type)) return false;
    if (selectedAmenities.length > 0 && !selectedAmenities.every((a: string) => motel.amenities.includes(a))) return false;
    return true;
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    "name": `Motel Search Results - ${location}`,
    "description": `Find and compare ${filteredMotels.length} motels in ${location}. Filter by price, rating, and amenities to find your perfect stay.`
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <SEO 
        title={`Motels in ${location} - Search Results | MOTELTRIPS.COM`}
        description={`Browse ${filteredMotels.length} motels in ${location}. Compare prices from $${Math.min(...MOCK_MOTELS.map(m => m.price))} per night. Free cancellation, instant confirmation.`}
        keywords={`motels in ${location}, ${location} accommodation, cheap motels ${location}, hotels ${location}`}
        schema={schema}
        canonicalUrl={`https://moteltrips.com/search?location=${encodeURIComponent(location)}`}
      />
      {/* Search Section */}
      <section className="bg-gradient-to-br from-cyan-500 to-blue-600 py-3 sm:py-4 lg:py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl">{location}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/90">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  {checkIn} to {checkOut}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  {guests} Guest{guests > 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowSearchBox(!showSearchBox)}
              className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-white/30 transition-all flex items-center gap-2 text-sm self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Modify Search
            </button>
          </div>

          <AnimatePresence>
            {showSearchBox && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SearchBox variant="inline" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Mobile filter button */}
        <motion.button
          onClick={() => setShowMobileFilters(true)}
          className="lg:hidden fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-4 rounded-full shadow-2xl z-40 flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="font-semibold">Filters</span>
        </motion.button>

        {/* Results Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {filteredMotels.map((motel, index) => (
            <motion.div
              key={motel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MotelCard checkIn={checkIn} checkOut={checkOut} guests={guests} {...motel} />
            </motion.div>
          ))}
        </motion.div>
        {filteredMotels.length === 0 && (
          <motion.div 
            className="text-center py-20 w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-2xl mb-2">No motels found</p>
            <p className="text-gray-500">Try adjusting your filters</p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}