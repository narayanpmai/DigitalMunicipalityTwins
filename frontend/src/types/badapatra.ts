export interface CitizenCharterService {
  id: string;
  name: string; // सेवाको नाम (e.g. जन्म दर्ता, नागरिकता सिफारिस)
  category?: string; // व्यक्तिगत घटना, सिफारिस, राजस्व, योजना
  department?: string; // शाखा / वडा कार्यालय
  isWardLevel?: boolean; // वडा तहको सेवा वा पालिका तहको
  wardNo?: number | 'all'; // वडा नं (१-८ वा सबै वडा)
  contactNo?: string;
  requiredDocuments: string[]; // आवश्यक कागजातहरू
  fee: string; // दस्तुर (e.g. निःशुल्क वा रु. १००)
  timeRequired: string; // लाग्ने समय (e.g. सोही दिन, २ घण्टा भित्र)
  responsibleOfficial: string; // जिम्मेवार अधिकारी (e.g. वडा सचिव)
  grievanceOfficial?: string; // गुनासो सुन्ने अधिकारी
  roomNo?: string;
  procedure?: string; // प्रक्रिया
}

export interface BadapatraSummary {
  totalServices: number;
  wardServicesCount: number;
  palikaServicesCount: number;
  freeServicesCount: number;
  departmentCount: number;
}
