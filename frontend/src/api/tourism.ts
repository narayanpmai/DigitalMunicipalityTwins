import { api } from './client';

export interface Destination {
  id?: string;
  name: string;
  nameEn?: string;
  wardNo?: number;
  altitudeMeters?: number;
  category: string;
  description: string;
  bestSeason?: string;
  trekDuration?: string;
  highlights?: string[];
  imageUrl?: string;
  lat?: number;
  lng?: number;
}

export interface Hotel {
  id?: string;
  name: string;
  type: string;
  wardNo?: number;
  ownerName?: string;
  proprietorName?: string;
  contactNumber?: string;
  phone?: string;
  capacity: number;
  pricePerNight?: string;
  amenities?: string[];
  status: string;
  imageUrl?: string;
  // Local Government Municipal Fields
  palikaRegNo?: string;
  homestayType?: 'community_homestay' | 'private_homestay' | 'hotel_lodge' | 'resort';
  classification?: 'क' | 'ख' | 'ग' | 'साधारण';
  totalRooms?: number;
  bedCapacity?: number;
  operatorPanOrCitizenship?: string;
}

export interface TouristLog {
  id?: string;
  touristName: string;
  country: string;
  gender?: string;
  ageGroup?: string;
  purpose?: string;
  entryDate?: string;
  exitDate?: string;
  destination?: string;
  permitNumber?: string;
  // Local Government Municipal & Safety Fields
  guideName?: string;
  guideLicenseNo?: string;
  guidePhone?: string;
  emergencyContact?: string;
  insurancePolicyNo?: string;
  entryFeeNpr?: number;
  entryFeeStatus?: 'paid' | 'waived' | 'pending';
}

export interface TourPackage {
  id?: string;
  title: string;
  titleEn?: string;
  durationDays: number;
  costPerPerson?: string;
  difficulty: string;
  destinations?: string[];
  inclusions?: string[];
  guideAvailable?: boolean;
  imageUrl?: string;
  description?: string;
  isActive?: boolean;
}

export interface LocalProduct {
  id?: string;
  name: string;
  nameEn?: string;
  category: string;
  price?: string;
  vendorName: string;
  wardNo?: number;
  contactNumber?: string;
  inStock?: boolean;
  imageUrl?: string;
  description?: string;
}

export interface Reservation {
  id?: string;
  guestName: string;
  phone: string;
  email?: string;
  bookingType: 'hotel' | 'package';
  referenceId: string;
  checkInDate?: string;
  pax: number;
  totalAmount?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  createdAt?: string;
}

export interface TourismStats {
  totalDestinations: number;
  totalHotels: number;
  totalPackages: number;
  totalProducts: number;
  totalReservations: number;
  totalTourists: number;
}

// ── Default Municipal Seeds for Tourism (Panchpokhari Thangpal) ──
const INITIAL_HOTELS: Hotel[] = [
  {
    id: 'ht-01',
    name: 'तार्केघ्याङ शेर्पा सामुदायिक होमस्टे',
    type: 'homestay',
    homestayType: 'community_homestay',
    classification: 'क',
    wardNo: 3,
    ownerName: 'दावा लामा शेर्पा',
    proprietorName: 'दावा लामा शेर्पा',
    contactNumber: '९८४१२३४५६७',
    phone: '९८४१२३४५६७',
    palikaRegNo: 'पाँच-पर्यटन-०३/२०८०-०१',
    operatorPanOrCitizenship: 'PAN: 602348912',
    totalRooms: 8,
    bedCapacity: 20,
    capacity: 20,
    pricePerNight: '१,५००',
    amenities: ['तातो पानी', 'स्थानीय अर्गानिक खाना', 'वाइफाइ', 'क्याम्प फायर'],
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=500&q=80',
  },
  {
    id: 'ht-02',
    name: 'ह्योल्मो हेभन रिसोर्ट एन्ड लज',
    type: 'resort',
    homestayType: 'resort',
    classification: 'क',
    wardNo: 2,
    ownerName: 'पासाङ शेर्पा',
    proprietorName: 'पासाङ शेर्पा',
    contactNumber: '९८५११२२३३४',
    phone: '९८५११२२३३४',
    palikaRegNo: 'पाँच-पर्यटन-०२/२०७९-०८',
    operatorPanOrCitizenship: 'PAN: 301284920',
    totalRooms: 14,
    bedCapacity: 35,
    capacity: 35,
    pricePerNight: '३,०००',
    amenities: ['अट्याच बाथरुम', 'साउना', 'स्थानीय स्याउ वाइन', 'गाइड सेवा'],
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80',
  },
  {
    id: 'ht-03',
    name: 'छिमिटि इको भ्यू होटल तथा लज',
    type: 'hotel',
    homestayType: 'hotel_lodge',
    classification: 'ख',
    wardNo: 4,
    ownerName: 'ल्हाक्पा दोर्जे',
    proprietorName: 'ल्हाक्पा दोर्जे',
    contactNumber: '९८१२९८७६५४',
    phone: '९८१२९८७६५४',
    palikaRegNo: 'पाँच-पर्यटन-०४/२०८१-०२',
    operatorPanOrCitizenship: 'ना.प्र.नं: ०३-०१-७२-०१२३४',
    totalRooms: 6,
    bedCapacity: 15,
    capacity: 15,
    pricePerNight: '१,२००',
    amenities: ['सोलार तातोपानी', 'हाइकिङ रुट गाइड', 'चिया तथा खाजा'],
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&q=80',
  }
];

const INITIAL_TOURIST_LOGS: TouristLog[] = [
  {
    id: 'log-01',
    touristName: 'माइकल क्लार्क (Michael Clarke)',
    country: 'Australia',
    gender: 'male',
    ageGroup: 'adult',
    purpose: 'Trekking',
    entryDate: '2026-09-20',
    exitDate: '2026-09-27',
    destination: 'पाँचपोखरी ताल तथा आमायांग्री चुचुरो',
    permitNumber: 'TIMS-2026-9812',
    guideName: 'तेन्जिङ शेर्पा',
    guideLicenseNo: 'NMA-GL-8492',
    guidePhone: '९८४१२३००११',
    emergencyContact: 'Sarah Clarke (+61 412 345 678)',
    insurancePolicyNo: 'ALLIANZ-GLOBE-99214',
    entryFeeNpr: 2000,
    entryFeeStatus: 'paid'
  },
  {
    id: 'log-02',
    touristName: 'इलेना सोफिया (Elena Sophia)',
    country: 'Germany',
    gender: 'female',
    ageGroup: 'adult',
    purpose: 'Research',
    entryDate: '2026-09-22',
    exitDate: '2026-09-29',
    destination: 'तार्केघ्याङ ह्योल्मो सांस्कृतिक सम्पदा',
    permitNumber: 'TIMS-2026-9830',
    guideName: 'पेम्बा दोर्जे तामाङ',
    guideLicenseNo: 'TAAN-GUIDE-3312',
    guidePhone: '९८५१२४८८९०',
    emergencyContact: 'Hans Sophia (+49 170 123456)',
    insurancePolicyNo: 'ERGO-INT-48921',
    entryFeeNpr: 2000,
    entryFeeStatus: 'paid'
  },
  {
    id: 'log-03',
    touristName: 'सन्तोष खतिवडा',
    country: 'Nepal',
    gender: 'male',
    ageGroup: 'youth',
    purpose: 'Pilgrimage',
    entryDate: '2026-09-24',
    destination: 'पाँचपोखरी तीर्थयात्रा',
    permitNumber: 'नागरिकता: २७-०१-७५-१२३४',
    guideName: 'स्थानीय सहयोगी - दावा',
    guideLicenseNo: 'स्थानिय युवा क्लब',
    guidePhone: '९८६००११२२३',
    emergencyContact: 'रामेश्वर खतिवडा (९८४१००११२२)',
    insurancePolicyNo: 'शिखर इन्स्योरेन्स: ०१-४४-९०२१',
    entryFeeNpr: 100,
    entryFeeStatus: 'paid'
  }
];

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const tourismApi = {
  // Destinations
  getDestinations: async () => {
    try {
      const res = await api.get<Destination[]>('/tourism/destinations');
      const list = (res as any)?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return getStored('p5_tourism_destinations', [
      {
        id: 'dest-1',
        name: 'पाँचपोखरी ताल (Panchpokhari Lakes)',
        nameEn: 'Panchpokhari',
        wardNo: 3,
        altitudeMeters: 4100,
        category: 'तीर्थस्थल तथा ताल',
        description: 'विश्वको नवौं अग्लो स्थानमा रहेको ५ वटा पवित्र कुण्डहरूको संगम, जनैपूर्णिमा मेलाको प्रमुख गन्तव्य।',
        bestSeason: 'भदौ - कात्तिक',
        trekDuration: '५-६ दिन',
        highlights: ['५ वटा कुण्ड', 'शिव मन्दिर', 'जुगल हिमाल दर्शन', 'ह्योल्मो संस्कृति'],
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80',
        lat: 27.973,
        lng: 85.712
      },
      {
        id: 'dest-2',
        name: 'आमायांग्री चुचुरो (Ama Yangri Peak)',
        nameEn: 'Ama Yangri',
        wardNo: 2,
        altitudeMeters: 3771,
        category: 'भ्यू पोइन्ट तथा पदयात्रा',
        description: 'ह्योल्मो संस्कृतिको रक्षक देवी मानिने आमायांग्री चुचुरोबाट जुगल, लाङटाङ र गणेश हिमालको मनोरम दृश्य देखिन्छ।',
        bestSeason: 'असोज - वैशाख',
        trekDuration: '२-३ दिन',
        highlights: ['३६० डिग्री हिमाल दर्शन', 'ह्योल्मो स्तूप', 'सूर्योदय अवलोकन'],
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
        lat: 27.950,
        lng: 85.650
      },
      {
        id: 'dest-3',
        name: 'तार्केघ्याङ ऐतिहासिक गुम्बा',
        nameEn: 'Tarkeghyang Monastery',
        wardNo: 3,
        altitudeMeters: 2600,
        category: 'धार्मिक तथा सांस्कृतिक सम्पदा',
        description: 'प्राचीन बौद्ध धर्म गुरुहरूले तपस्या गरेको ऐतिहासिक गुम्बा र मौलिक ह्योल्मो परम्परागत बस्ती।',
        bestSeason: 'बाह्रै महिना',
        trekDuration: '१-२ दिन',
        highlights: ['ऐतिहासिक गुम्बा', 'ह्योल्मो होमस्टे', 'स्याउका बगैंचा'],
        imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&q=80',
        lat: 27.940,
        lng: 85.620
      }
    ]);
  },
  createDestination: (data: Partial<Destination>) => api.post<Destination>('/tourism/destinations', data).then(res => (res as any).data || res),
  updateDestination: (id: string, data: Partial<Destination>) => api.put<Destination>(`/tourism/destinations/${id}`, data).then(res => (res as any).data || res),
  deleteDestination: (id: string) => api.delete(`/tourism/destinations/${id}`).then(res => (res as any).data || res),

  // Hotels
  getHotels: async (): Promise<Hotel[]> => {
    try {
      const res = await api.get<Hotel[]>('/tourism/hotels');
      const list = (res as any)?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return getStored<Hotel[]>('p5_tourism_hotels', INITIAL_HOTELS);
  },
  createHotel: async (data: Partial<Hotel>): Promise<Hotel> => {
    const list = getStored<Hotel[]>('p5_tourism_hotels', INITIAL_HOTELS);
    const newHotel: Hotel = {
      id: `ht-${Date.now()}`,
      name: data.name || '',
      type: data.type || 'homestay',
      homestayType: data.homestayType || 'community_homestay',
      classification: data.classification || 'क',
      wardNo: data.wardNo || 3,
      ownerName: data.ownerName || '',
      proprietorName: data.ownerName || '',
      contactNumber: data.contactNumber || data.phone || '',
      phone: data.contactNumber || data.phone || '',
      palikaRegNo: data.palikaRegNo || `पाँच-पर्यटन-${data.wardNo || 1}/${new Date().getFullYear()}-${Math.floor(Math.random()*90+10)}`,
      operatorPanOrCitizenship: data.operatorPanOrCitizenship || '',
      totalRooms: data.totalRooms || 5,
      bedCapacity: data.bedCapacity || data.capacity || 10,
      capacity: data.bedCapacity || data.capacity || 10,
      pricePerNight: data.pricePerNight || '१,५००',
      amenities: data.amenities || ['तातो पानी', 'स्थानीय खाना'],
      status: 'active',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=500&q=80',
    };
    try {
      await api.post<Hotel>('/tourism/hotels', newHotel);
    } catch {}
    const updated = [newHotel, ...list];
    setStored('p5_tourism_hotels', updated);
    return newHotel;
  },
  updateHotel: (id: string, data: Partial<Hotel>) => api.put<Hotel>(`/tourism/hotels/${id}`, data).then(res => (res as any).data || res),
  deleteHotel: (id: string) => api.delete(`/tourism/hotels/${id}`).then(res => (res as any).data || res),

  // Tourist Logs
  getTouristLogs: async (): Promise<TouristLog[]> => {
    try {
      const res = await api.get<TouristLog[]>('/tourism/logs');
      const list = (res as any)?.data || res;
      if (Array.isArray(list) && list.length > 0) return list;
    } catch {}
    return getStored<TouristLog[]>('p5_tourism_logs', INITIAL_TOURIST_LOGS);
  },
  createTouristLog: async (data: Partial<TouristLog>): Promise<TouristLog> => {
    const list = getStored<TouristLog[]>('p5_tourism_logs', INITIAL_TOURIST_LOGS);
    const newLog: TouristLog = {
      id: `log-${Date.now()}`,
      touristName: data.touristName || '',
      country: data.country || 'Nepal',
      gender: data.gender || 'male',
      ageGroup: data.ageGroup || 'adult',
      purpose: data.purpose || 'Trekking',
      entryDate: data.entryDate || new Date().toISOString().split('T')[0],
      exitDate: data.exitDate,
      destination: data.destination || 'पाँचपोखरी ताल',
      permitNumber: data.permitNumber,
      guideName: data.guideName,
      guideLicenseNo: data.guideLicenseNo,
      guidePhone: data.guidePhone,
      emergencyContact: data.emergencyContact,
      insurancePolicyNo: data.insurancePolicyNo,
      entryFeeNpr: data.entryFeeNpr ?? (data.country?.toLowerCase() === 'nepal' ? 100 : 2000),
      entryFeeStatus: data.entryFeeStatus || 'paid',
    };
    try {
      await api.post<TouristLog>('/tourism/logs', newLog);
    } catch {}
    const updated = [newLog, ...list];
    setStored('p5_tourism_logs', updated);
    return newLog;
  },
  updateTouristLog: (id: string, data: Partial<TouristLog>) => api.put<TouristLog>(`/tourism/logs/${id}`, data).then(res => (res as any).data || res),
  deleteTouristLog: (id: string) => api.delete(`/tourism/logs/${id}`).then(res => (res as any).data || res),

  // Tour Packages
  getPackages: async (): Promise<TourPackage[]> => {
    try {
      const res = await api.get<TourPackage[]>('/tourism/packages');
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      if (list.length > 0) return list;
    } catch {}
    return [
      {
        id: 'pkg-1',
        title: 'पाँचपोखरी तीर्थ तथा साहसिक पदयात्रा प्याकेज',
        titleEn: 'Panchpokhari Sacred Trek',
        durationDays: 6,
        costPerPerson: '२२,५००',
        difficulty: 'मध्यम-साहसिक',
        destinations: ['तार्केघ्याङ', 'छिमिटि', 'पाँचपोखरी'],
        inclusions: ['गाइड तथा पोर्टर', 'आवास तथा ३ छाक खाना', 'TIMS तथा पालिका परमिट'],
        guideAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&q=80',
        description: 'पाँचपोखरीका पावन तालहरूको दर्शन, स्थानीय शेर्पा-ह्योल्मो संस्कृति र हिमालको अवलोकन।',
        isActive: true,
      },
      {
        id: 'pkg-2',
        title: 'आमायांग्री संस्कृति तथा सूर्योदय अवलोकन प्याकेज',
        titleEn: 'Ama Yangri Cultural Trek',
        durationDays: 3,
        costPerPerson: '११,०००',
        difficulty: 'सजिलो-मध्यम',
        destinations: ['मेलम्चीघ्याङ', 'तार्केघ्याङ', 'आमायांग्री'],
        inclusions: ['स्थानीय होमस्टे', 'अर्गानिक खाना', 'संस्कृतिक कार्यक्रम'],
        guideAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&q=80',
        description: 'ह्योल्मो सम्पदा, गुम्बा दर्शन र आमायांग्री चुचुरोबाट सूर्योदय हेर्ने उत्कृष्ट पदयात्रा।',
        isActive: true,
      }
    ];
  },
  createPackage: (data: Partial<TourPackage>) => api.post<TourPackage>('/tourism/packages', data).then(res => (res as any).data || res),
  updatePackage: (id: string, data: Partial<TourPackage>) => api.put<TourPackage>(`/tourism/packages/${id}`, data).then(res => (res as any).data || res),
  deletePackage: (id: string) => api.delete(`/tourism/packages/${id}`).then(res => (res as any).data || res),

  // Local Products
  getLocalProducts: async (): Promise<LocalProduct[]> => {
    try {
      const res = await api.get<LocalProduct[]>('/tourism/local-products');
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      if (list.length > 0) return list;
    } catch {}
    return [
      {
        id: 'prod-1',
        name: 'पाँचपोखरी अर्गानिक छुर्पी तथा चीज',
        category: 'दुग्ध उत्पादन',
        price: 'रु १,२०० / केजी',
        vendorName: 'थाङपालकोट याक तथा चौंरी कृषक समूह',
        wardNo: 3,
        contactNumber: '९८४१५५६६७७',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&q=80',
        description: 'उच्च हिमाली भेगका चौंरीको शुद्ध दुधबाट परम्परागत विधिले उत्पादित छुर्पी र चीज।'
      },
      {
        id: 'prod-2',
        name: 'ह्योल्मो परम्परागत हातले बुनेको ऊनी राडी/पाखी',
        category: 'हस्तकला तथा कपडा',
        price: 'रु ४,५००',
        vendorName: 'तार्केघ्याङ महिला हस्तकला उद्यम',
        wardNo: 2,
        contactNumber: '९८५१२३४९८७',
        inStock: true,
        imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&q=80',
        description: 'भेडाको शुद्ध ऊनबाट स्थानीय महिलाहरूले कातेर बुनेको न्यानो राडी पाखी।'
      }
    ];
  },
  createLocalProduct: (data: Partial<LocalProduct>) => api.post<LocalProduct>('/tourism/local-products', data).then(res => (res as any).data || res),
  updateLocalProduct: (id: string, data: Partial<LocalProduct>) => api.put<LocalProduct>(`/tourism/local-products/${id}`, data).then(res => (res as any).data || res),
  deleteLocalProduct: (id: string) => api.delete(`/tourism/local-products/${id}`).then(res => (res as any).data || res),

  // Reservations
  getReservations: () => api.get<Reservation[]>('/tourism/reservations').then(res => Array.isArray(res) ? res : (res as any).data || []),
  createReservation: (data: Partial<Reservation>) => api.post<Reservation>('/tourism/reservations', data).then(res => (res as any).data || res),
  updateReservationStatus: (id: string, status: string) => api.patch<Reservation>(`/tourism/reservations/${id}/status`, { status }).then(res => (res as any).data || res),
  deleteReservation: (id: string) => api.delete(`/tourism/reservations/${id}`).then(res => (res as any).data || res),

  // Stats
  getStats: async (): Promise<TourismStats> => {
    try {
      const res = await api.get<TourismStats>('/tourism/stats');
      const data = (res as any)?.data || res;
      if (data && data.totalDestinations) return data;
    } catch {}
    const hotels = getStored<Hotel[]>('p5_tourism_hotels', INITIAL_HOTELS);
    const logs = getStored<TouristLog[]>('p5_tourism_logs', INITIAL_TOURIST_LOGS);
    return {
      totalDestinations: 15,
      totalHotels: hotels.length || 32,
      totalPackages: 8,
      totalProducts: 14,
      totalReservations: 12,
      totalTourists: (logs.length || 0) + 850,
    };
  },
};
