import SearchBox from '../components/SearchBox';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Card } from '../components/ui';
import { MapPin, Star, Shield, Clock, TrendingUp, Wifi, Coffee, Tv, ParkingCircle, User, CheckCircle, Award, Heart, Zap, DollarSign, Phone, IndianRupee } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { motion } from 'motion/react';
import { useState } from 'react';

const popularDestinations = [
  {
    name: 'Beach Resorts',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHJlc29ydHxlbnwxfHx8fDE3NjQ3MDQyOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    motels: 45,
    price: '₹6,500'
  },
  {
    name: 'Hill Station Retreats',
    image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHJlc29ydHxlbnwxfHx8fDE3NjQ3NDc1OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    motels: 32,
    price: '₹5,500'
  },
  {
    name: 'City Hotels',
    image: 'https://images.unsplash.com/photo-1614568112072-770f89361490?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwaG90ZWx8ZW58MXx8fHwxNzY0NzM0OTYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    motels: 78,
    price: '₹7,000'
  },
  {
    name: 'Highway Stops',
    image: 'https://images.unsplash.com/photo-1566126727069-6df012224264?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdod2F5JTIwbW90ZWwlMjB2aW50YWdlfGVufDF8fHx8MTc2NDc0NzU5OHww&ixlib=rb-4.1.0&q=80&w=1080',
    motels: 56,
    price: '₹4,500'
  },
  {
    name: 'Heritage Properties',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBob3RlbHxlbnwxfHx8fDE3MzM0OTk2MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    motels: 28,
    price: '₹5,200'
  },
  {
    name: 'Lakeside Stays',
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWtlJTIwaG90ZWx8ZW58MXx8fHwxNzMzNDk5NjM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    motels: 41,
    price: '₹6,000'
  }
];

const featuredMotels = [
  {
    name: 'Charminar Heritage Hotel',
    location: 'Hyderabad, Telangana',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb218ZW58MXx8fHwxNzMzNDk5NjM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviews: 234,
    price: '₹6,500',
    amenities: ['Wifi', 'Pool', 'Parking', 'Breakfast']
  },
  {
    name: 'Golconda Fort View Lodge',
    location: 'Hyderabad, Telangana',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxob3RlbCUyMHJvb218ZW58MXx8fHwxNzMzNDk5NjM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviews: 189,
    price: '₹7,000',
    amenities: ['Wifi', 'Spa', 'Restaurant', 'Parking']
  },
  {
    name: 'Shamshabad Airport Inn',
    location: 'Hyderabad, Telangana',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxob3RlbCUyMHJvb218ZW58MXx8fHwxNzMzNDk5NjM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    reviews: 156,
    price: '₹4,800',
    amenities: ['Wifi', 'Parking', 'Coffee', 'Pet Friendly']
  }
];

const testimonials = [
  {
    name: 'Vamsi Krishna',
    location: 'Gachibowli, Hyderabad',
    rating: 5,
    text: 'Amazing experience! Found the perfect hotel for my business trip. Clean rooms, great price, and easy booking process.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3MzM0OTk2MzZ8MA&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    name: 'Satya Reddy',
    location: 'HITEC City, Hyderabad',
    rating: 5,
    text: 'Best hotel booking platform! The search filters made it so easy to find exactly what I needed. Highly recommended!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3MzM0OTk2MzZ8MA&ixlib=rb-4.1.0&q=80&w=400'
  },
  {
    name: 'Prasanth Kumar',
    location: 'Madhapur, Hyderabad',
    rating: 5,
    text: 'I use TripWays for all my business travels. Reliable, affordable, and the customer service is outstanding!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3MzM0OTk2MzZ8MA&ixlib=rb-4.1.0&q=80&w=400'
  }
];

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "MOTELTRIPS.COM",
    "description": "Find and book comfortable motels at unbeatable prices across thousands of locations",
    "url": "https://moteltrips.com",
    "priceRange": "₹4,500-₹12,000",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "100000"
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="MOTELTRIPS.COM - Find & Book Affordable Motels | Best Prices Guaranteed"
        description="Discover comfortable motels at unbeatable prices across thousands of locations. 24/7 support, secure booking, and instant confirmation. Trusted by 100K+ travelers."
        keywords="motel booking, cheap motels, hotel reservation, affordable accommodation, budget travel, roadside motels, highway motels, lodging deals"
        schema={schema}
        canonicalUrl="https://moteltrips.com"
      />
      {/* Hero Section */}
      <div 
        className="relative min-h-[90vh] sm:min-h-[85vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url('https://images.unsplash.com/photo-1764304052987-80d263a1fd3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RlbCUyMG5pZ2h0JTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzY0NzQ3NTk3fDA&ixlib=rb-4.1.0&q=80&w=1080')`
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 relative z-10 py-8 sm:py-12 lg:py-16">
          <motion.div 
            className="text-center mb-8 sm:mb-10 lg:mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-4 sm:mb-5 lg:mb-6 tracking-tight px-4">
              Find Your <span className="text-orange-400">Perfect Stay</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-7 lg:mb-8 font-light max-w-2xl mx-auto px-4">
              Discover comfortable motels at unbeatable prices across thousands of locations
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4 text-white text-xs sm:text-sm mb-6 sm:mb-8 px-4">
              <motion.div 
                className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-white/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                <span className="whitespace-nowrap">Secure Booking</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-white/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                <span className="whitespace-nowrap">24/7 Support</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-white/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                <span className="whitespace-nowrap">Trusted by 100K+</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-white/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                <span className="whitespace-nowrap">Best Price</span>
              </motion.div>
            </div>
          </motion.div>
          <motion.div 
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <SearchBox variant="hero" />
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-orange-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center text-gray-800">
            {[
              { number: '10,000+', label: 'Motels Listed', icon: MapPin },
              { number: '100K+', label: 'Happy Travelers', icon: User },
              { number: '50K+', label: 'Monthly Bookings', icon: CheckCircle },
              { number: '4.9/5', label: 'Average Rating', icon: Star }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 border border-orange-300 shadow-md">
                  <stat.icon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 mx-auto mb-3 sm:mb-4 text-orange-600" />
                  <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-1 sm:mb-2 text-gray-800 font-bold">{stat.number}</div>
                  <div className="text-gray-700 text-xs sm:text-sm lg:text-base font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-8 sm:mb-10 lg:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent px-4">
              Popular Destinations
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Explore our most sought-after locations for your next adventure
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {popularDestinations.map((destination, index) => (
              <motion.div
                key={index}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Card className="overflow-hidden border-2 border-gray-100 h-full">
                  <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                    <ImageWithFallback
                      src={destination.image}
                      alt={destination.name}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        hoveredCard === index ? 'scale-110' : 'scale-100'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 lg:p-6 text-white">
                      <h3 className="text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">{destination.name}</h3>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="flex items-center gap-1 sm:gap-1.5">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          {destination.motels} Motels
                        </span>
                        <span className="text-base sm:text-lg lg:text-xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-black">
                          from {destination.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Motels */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-8 sm:mb-10 lg:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs sm:text-sm uppercase tracking-wider text-orange-600 mb-2 sm:mb-3">Featured Properties</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-3 sm:mb-4 tracking-tight px-4">Top Rated <span className="text-orange-600">Motels</span></h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-light max-w-2xl mx-auto px-4">Handpicked motels loved by our travelers</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {featuredMotels.map((motel, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover className="overflow-hidden h-full">
                  <div className="relative h-48 sm:h-52 lg:h-56 overflow-hidden rounded-xl mb-4">
                    <ImageWithFallback
                      src={motel.image}
                      alt={motel.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/95 backdrop-blur-sm px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-lg">
                      <div className="text-cyan-600 text-xs sm:text-sm">
                        <span className="font-light">from</span> <span className="font-semibold">{motel.price}</span><span className="font-light">/night</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <h3 className="text-lg sm:text-xl mb-2 tracking-tight">{motel.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm mb-3">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600" />
                      <span>{motel.location}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-sm sm:text-base">{motel.rating}</span>
                      </div>
                      <span className="text-gray-500 text-xs sm:text-sm">({motel.reviews} reviews)</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {motel.amenities.slice(0, 4).map((amenity, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-gray-700 px-2.5 sm:px-3 py-1 rounded-full">
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg opacity-0 group-hover:opacity-100 text-sm sm:text-base">
                      Book Now
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-8 sm:mb-10 lg:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs sm:text-sm uppercase tracking-wider text-orange-600 mb-2 sm:mb-3">Benefits</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-3 sm:mb-4 tracking-tight px-4">Why Choose <span className="text-orange-600">Trip ways?</span></h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-light max-w-2xl mx-auto px-4">Experience the difference with our premium features</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {[
              { icon: MapPin, title: 'Best Locations', desc: 'Find motels perfectly positioned on your route with our smart location finder', gradient: 'from-orange-500 to-red-600' },
              { icon: IndianRupee, title: 'Best Price Guarantee', desc: 'Competitive rates and exclusive deals you won\'t find anywhere else', gradient: 'from-orange-500 to-red-600' },
              { icon: Shield, title: 'Secure Booking', desc: 'Simple, safe and secure reservation process with 100% protection', gradient: 'from-orange-500 to-red-600' },
              { icon: Zap, title: 'Instant Confirmation', desc: 'Get instant booking confirmation via email and SMS notifications', gradient: 'from-orange-500 to-red-600' },
              { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock customer service to help you anytime, anywhere', gradient: 'from-orange-500 to-red-600' },
              { icon: Award, title: 'Verified Reviews', desc: 'Read authentic reviews from real travelers to make informed decisions', gradient: 'from-orange-500 to-red-600' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card padding="lg" hover>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl mb-2 sm:mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-light text-sm sm:text-base">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-8 sm:mb-10 lg:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs sm:text-sm uppercase tracking-wider text-orange-600 mb-2 sm:mb-3">Testimonials</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-3 sm:mb-4 tracking-tight px-4">What Our <span className="text-orange-600">Travelers Say</span></h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-light max-w-2xl mx-auto px-4">Real experiences from real travelers</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card padding="lg" hover>
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-cyan-500 flex-shrink-0">
                      <ImageWithFallback
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base truncate">{testimonial.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed font-light italic text-sm sm:text-base">"{testimonial.text}"</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-orange-200 text-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Heart className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-5 sm:mb-6 text-orange-600" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-4 sm:mb-5 lg:mb-6 tracking-tight px-4">Ready to Start Your Journey?</h2>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-7 lg:mb-8 text-gray-700 font-light px-4">Join thousands of satisfied travelers and find your perfect motel today</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-4">
              <button className="bg-orange-600 text-white px-6 sm:px-7 lg:px-8 py-3 sm:py-3.5 lg:py-4 rounded-lg sm:rounded-xl hover:bg-orange-700 transition-all shadow-lg text-base sm:text-lg font-semibold">
                Browse Motels
              </button>
              <button className="bg-white border-2 border-orange-400 text-orange-600 px-6 sm:px-7 lg:px-8 py-3 sm:py-3.5 lg:py-4 rounded-lg sm:rounded-xl hover:bg-orange-50 transition-all text-base sm:text-lg flex items-center justify-center gap-2 font-semibold">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}