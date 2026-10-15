export type AppLanguage = 'ne' | 'hy' | 'ta' | 'en';

export interface LanguageStrings {
  greeting: string;
  palikaName: string;
  palikaSubtitle: string;
  twinTitle: string;
  home: string;
  charter: string;
  sifarish: string;
  twin: string;
  museum: string;
  tax: string;
  complaints: string;
  directory: string;
  projects: string;
  sos: string;
  scanner: string;
  library: string;
  moreServices: string;
  profile: string;
  login: string;
  logout: string;
  verifiedCitizen: string;
  guestUser: string;
  searchPlaceholder: string;
  aiAssistant: string;
  newsTickerTitle: string;
  onlineStatus: string;
  viewAll: string;
}

export const TRANSLATIONS: Record<AppLanguage, LanguageStrings> = {
  ne: {
    greeting: 'नमस्ते',
    palikaName: 'पाँचपोखरी थाङपाल गाउँपालिका',
    palikaSubtitle: 'Municipal Digital Twins • सिन्धुपाल्चोक',
    twinTitle: 'पर्यटन तथा सम्पदा डिजिटल ट्विन',
    home: 'गृहपृष्ठ',
    charter: 'नागरिक बडापत्र',
    sifarish: 'ई-सिफारिस',
    twin: 'पर्यटन ट्विन (३D GIS)',
    museum: 'सांस्कृतिक सङ्ग्रहालय',
    tax: 'डिजिटल कर',
    complaints: 'नागरिक गुनासो',
    directory: 'जनप्रतिनिधि/कर्मचारी',
    projects: 'योजना ट्र्याकर',
    sos: 'आपतकालीन SOS',
    scanner: 'कागजात स्क्यानर',
    library: 'डिजिटल ई-पुस्तकालय',
    moreServices: 'थप सेवा',
    profile: 'नागरिक प्रोफाइल',
    login: 'नागरिक लगइन',
    logout: 'लगआउट',
    verifiedCitizen: 'प्रमाणित नागरिक',
    guestUser: 'अतिथि नागरिक',
    searchPlaceholder: 'सेवा, ऐन, योजना वा कर्मचारी खोज्नुहोस्...',
    aiAssistant: 'AI साथी',
    newsTickerTitle: 'अत्यन्त जरुरी सूचना',
    onlineStatus: 'सक्रिय अनलाइन',
    viewAll: 'सबै हेर्नुहोस्',
  },
  hy: {
    greeting: 'तासी देलेक (Tashi Delek)',
    palikaName: 'पाँचपोखरी थाङपाल गाउँपालिका (ह्योल्मो युल्सा)',
    palikaSubtitle: 'ह्योल्मो युल्सा डिजिटल ट्विन • सिन्धुपाल्चोक',
    twinTitle: 'ह्योल्मो सम्पदा तथा पर्यटन ३D ट्विन',
    home: 'खाङ्पा (गृहपृष्ठ)',
    charter: 'मिमाङ थोथो (बडापत्र)',
    sifarish: 'यिके (ई-सिफारिस)',
    twin: 'पाँचपोखरी कुण्ड ३D ट्विन',
    museum: 'ह्योल्मो सङ्ग्रहालय',
    tax: 'ठाल (डिजिटल कर)',
    complaints: 'नागरिक गुनासो',
    directory: 'गेन्पो तथा कर्मचारी',
    projects: 'विकास योजना ट्र्याकर',
    sos: 'आपतकालीन SOS',
    scanner: 'कागजात स्क्यानर',
    library: 'ई-पुस्तकालय',
    moreServices: 'थप सेवा',
    profile: 'मेरो प्रोफाइल',
    login: 'लगइन (प्रवेश)',
    logout: 'लगआउट',
    verifiedCitizen: 'प्रमाणित ह्योल्मो नागरिक',
    guestUser: 'कुन्छोक (अतिथि)',
    searchPlaceholder: 'सम्पदा, गुम्बा वा सेवा खोज्नुहोस्...',
    aiAssistant: 'AI रोक्पा (सहायक)',
    newsTickerTitle: 'अत्यन्त जरुरी सूचना',
    onlineStatus: 'अनलाइन चालु',
    viewAll: 'सबै हेर्नुहोस्',
  },
  ta: {
    greeting: 'फ्याफुल्ला (Fyafulla)',
    palikaName: 'पाँचपोखरी थाङपाल गाउँपालिका',
    palikaSubtitle: 'तामाङ ह्युल डिजिटल ट्विन • सिन्धुपाल्चोक',
    twinTitle: 'पर्यटन तथा सम्पदा डिजिटल ट्विन',
    home: 'छिम (गृहपृष्ठ)',
    charter: 'नागरिक बडापत्र',
    sifarish: 'यिग (सिफारिस)',
    twin: 'पाँचपोखरी ३D ट्विन',
    museum: 'सांस्कृतिक सङ्ग्रहालय',
    tax: 'कर (राजस्व)',
    complaints: 'नागरिक गुनासो',
    directory: 'ताम्बा / कर्मचारी सूची',
    projects: 'योजना ट्र्याकर',
    sos: 'आपतकालीन SOS',
    scanner: 'कागजात स्क्यानर',
    library: 'ई-पुस्तकालय',
    moreServices: 'थप सेवा',
    profile: 'नागरिक प्रोफाइल',
    login: 'लगइन गर्नुहोस्',
    logout: 'लगआउट',
    verifiedCitizen: 'प्रमाणित नागरिक',
    guestUser: 'अतिथि नागरिक',
    searchPlaceholder: 'सेवा वा योजना खोज्नुहोस्...',
    aiAssistant: 'AI साथी',
    newsTickerTitle: 'अत्यन्त जरुरी सूचना',
    onlineStatus: 'सक्रिय अनलाइन',
    viewAll: 'सबै हेर्नुहोस्',
  },
  en: {
    greeting: 'Namaste',
    palikaName: 'Panchpokhari Thangpal Rural Municipality',
    palikaSubtitle: 'Municipal Digital Twins • Sindhupalchok',
    twinTitle: 'Tourism & Heritage Digital Twin',
    home: 'Home',
    charter: 'Citizen Charter',
    sifarish: 'e-Sifarish',
    twin: '3D GIS Tourism Twin',
    museum: 'Cultural Museum',
    tax: 'Digital Taxes',
    complaints: 'Grievance',
    directory: 'Staff Directory',
    projects: 'Project Tracker',
    sos: 'Emergency SOS',
    scanner: 'Doc Scanner',
    library: 'Digital Library',
    moreServices: 'More Services',
    profile: 'Citizen Profile',
    login: 'Citizen Login',
    logout: 'Logout',
    verifiedCitizen: 'Verified Citizen',
    guestUser: 'Guest Citizen',
    searchPlaceholder: 'Search services, laws, or projects...',
    aiAssistant: 'AI Assistant',
    newsTickerTitle: 'Urgent Notice',
    onlineStatus: 'Active Online',
    viewAll: 'View All',
  },
};
