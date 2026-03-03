import { useRef } from 'react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Search, Filter, Calendar, CreditCard, CheckCircle, MapPin, Star, Shield } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';

const steps = [
  {
    icon: Search,
    title: 'Search & Discover',
    description: 'Enter your destination, dates, and number of guests. Our smart search engine finds the perfect motels for your journey.',
    color: 'from-cyan-400 to-cyan-600',
    delay: 0.2
  },
  {
    icon: Filter,
    title: 'Filter & Compare',
    description: 'Use our advanced filters to narrow down options by price, rating, amenities, and motel type. Compare side-by-side to find your match.',
    color: 'from-blue-400 to-blue-600',
    delay: 0.4
  },
  {
    icon: CreditCard,
    title: 'Book Securely',
    description: 'Select your room, choose payment method, and complete your booking in minutes. Your information is always protected.',
    color: 'from-green-400 to-green-600',
    delay: 0.8
  },
  {
    icon: CheckCircle,
    title: 'Enjoy Your Stay',
    description: 'Receive instant confirmation and check-in details. Our 24/7 support team is always here to help make your stay perfect.',
    color: 'from-pink-400 to-pink-600',
    delay: 1.0
  }
];

const features = [
  { icon: Shield, title: 'Secure Booking', desc: 'SSL encrypted transactions' },
  { icon: Star, title: 'Best Prices', desc: 'Guaranteed lowest rates' },
  { icon: CheckCircle, title: 'Instant Confirmation', desc: 'Book with confidence' }
];

export default function HowItWorksPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col" ref={containerRef}>
      <SEO 
        title="How It Works - Easy Motel Booking Process | MOTELTRIPS.COM"
        description="Learn how to book motels in 4 simple steps: Search & Discover, Filter & Compare, Book Securely, and Enjoy Your Stay. 24/7 support, instant confirmation, and best prices guaranteed."
        keywords="how to book motel, booking process, motel reservation steps, easy booking, MotelTrips guide"
        canonicalUrl="https://moteltrips.com/how-it-works"
      />
      {/* Hero Section */}
      <motion.div 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ opacity, scale }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600">
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
            className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ duration: 15, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-7xl md:text-8xl text-white mb-6 font-black"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{
                backgroundImage: 'linear-gradient(90deg, #fff, #a5f3fc, #fff)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              How It Works
            </motion.h1>
            <motion.p 
              className="text-2xl text-white/90 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Your journey to the perfect motel starts here
            </motion.p>
          </motion.div>

          {/* Floating Icons */}
          <div className="relative h-40 mt-12">
            {[Search, MapPin, Calendar, Star].map((Icon, index) => (
              <motion.div
                key={index}
                className="absolute"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [0, -20, 0],
                }}
                transition={{
                  opacity: { delay: 0.5 + index * 0.1, duration: 0.5 },
                  scale: { delay: 0.5 + index * 0.1, duration: 0.5 },
                  y: { delay: 1, duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }}
                style={{
                  left: `${20 + index * 15}%`,
                  top: `${Math.sin(index) * 20}%`
                }}
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30">
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scroll Indicator */}
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
      </motion.div>

      {/* Steps Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl mb-4 font-black">Simple Steps to Your Perfect Stay</h2>
            <p className="text-xl text-gray-600">Book your motel in just 5 easy steps</p>
          </motion.div>

          <div className="space-y-32">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
                  initial={{ opacity: 0, x: isEven ? -100 : 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {/* Icon Circle */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <motion.div
                      className={`w-48 h-48 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl`}
                      animate={{
                        boxShadow: [
                          '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          '0 25px 50px -12px rgba(6, 182, 212, 0.5)',
                          '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <step.icon className="w-24 h-24 text-white" />
                    </motion.div>
                    
                    {/* Step Number */}
                    <motion.div
                      className="absolute -top-4 -right-4 w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-xl"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                    >
                      {index + 1}
                    </motion.div>

                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <motion.div
                        className="hidden lg:block absolute top-1/2 w-32"
                        style={{
                          left: isEven ? '100%' : 'auto',
                          right: isEven ? 'auto' : '100%',
                        }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                      >
                        <div className="h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    className={`flex-1 ${isEven ? 'lg:text-left' : 'lg:text-right'} text-center`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <h3 className="text-4xl mb-4 font-black">{step.title}</h3>
                    <p className="text-xl text-gray-600 leading-relaxed max-w-xl">{step.description}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
        {/* Animated Background */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl mb-4 font-black">Why Choose Tripways?</h2>
            <p className="text-xl text-gray-300">Premium features for a seamless booking experience</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <motion.div
                  className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 h-full relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Hover Gradient Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />

                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto relative z-10"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className="text-xl mb-2 text-center font-black relative z-10">{feature.title}</h3>
                  <p className="text-gray-300 text-center relative z-10">{feature.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 p-12 rounded-3xl shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-5xl text-white mb-6 font-black">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of travelers who trust Tripways for their accommodation needs
            </p>
            <motion.a
              href="/"
              className="inline-block bg-white text-blue-600 px-12 py-4 rounded-xl font-black text-xl shadow-xl"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Booking Now
            </motion.a>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}