import { TouristDestination } from './profile';

export interface HotelHomestay {
  id: string;
  name: string;
  type: 'hotel' | 'homestay' | 'resort';
  wardNo: number;
  proprietorName: string;
  phone: string;
  capacity: number;
  pricePerNight: string;
  facilities: string[];
  status: 'active' | 'closed';
  imageUrl?: string;
}

export interface TourPackage {
  id: string;
  title: string;
  durationDays: number;
  costPerPerson: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  destinations: string[]; 
  inclusions: string[];
  guideAvailable: boolean;
  imageUrl?: string;
}

export interface Reservation {
  id: string;
  guestName: string;
  phone: string;
  bookingType: 'hotel' | 'package';
  referenceId: string; 
  checkInDate: string;
  pax: number;
  totalAmount?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface LocalProduct {
  id: string;
  name: string;
  category: 'handicraft' | 'food' | 'clothing' | 'other';
  price: string;
  vendorName: string;
  wardNo: number;
  contactNumber: string;
  inStock: boolean;
  imageUrl?: string;
}

export interface TouristLog {
  id: string;
  name: string;
  nationality: string;
  passportOrId: string;
  entryDateBs: string;
  purpose: string;
  contactNumber: string;
}
