import { Star, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface MotelCardProps {
  id: string;
  name: string;
  location: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  type: string;
}

export default function MotelCard({ checkIn, checkOut, guests, id, name, location, image, price, rating, reviews, type }: MotelCardProps & { checkIn: string; checkOut: string; guests?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  const query = new URLSearchParams();
  if (checkIn) query.set('checkIn', checkIn);
  if (checkOut) query.set('checkOut', checkOut);
  if (guests) query.set('guests', guests);
  const toLink = `/motel/${id}${query.toString() ? `?${query.toString()}` : ''}`;

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-500 group border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-40 overflow-hidden">
        <ImageWithFallback 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        <div className="absolute top-2 right-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-2 py-1 rounded text-xs shadow-lg">
          {type}
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-1.5 text-base tracking-tight">{name}</h3>
        <div className="flex items-center gap-1 text-gray-600 mb-3">
          <MapPin className="w-3 h-3" />
          <span className="text-xs">{location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-600 text-xs">from </span>
            <span className="text-xl tracking-tight">${price}</span>
            <span className="text-gray-600 text-xs">/night</span>
          </div>
          <Link
            to={toLink}
            className="flex items-center gap-1 text-cyan-600 hover:gap-2 transition-all duration-300 text-xs font-medium"
          >
            View
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
