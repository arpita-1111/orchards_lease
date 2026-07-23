export type Role = 'seller' | 'renter' | 'admin';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  bio?: string;
  phone?: string;
  language?: string;
  isBlocked?: boolean;
  accountStatus?: string;
  isEmailVerified?: boolean;
  notificationSettings?: NotificationSettings;
  lastLogin?: string;
  createdAt?: string;
}

export interface NotificationSettings {
  emailBookings: boolean;
  emailApprovals: boolean;
  emailMarketing: boolean;
  inAppBookings: boolean;
  inAppSystem: boolean;
}

export interface OrchardImage {
  url: string;
  publicId?: string;
  alt?: string;
}

export interface PricingRule {
  label: string;
  minDays: number;
  multiplier: number;
}

export interface OrganicCertification {
  isCertified: boolean;
  expiryDate?: string | null;
  documentUrl?: string;
  certificateNumber?: string;
}

export type OrchardStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'unpublished'
  | 'rejected'
  | 'archived';

export interface OrganicCertification {
  isCertified: boolean;
  expiryDate?: string | null;
  documentUrl?: string;
  certificateNumber?: string;
}

export interface WaterSourcesInfo {
  primary: string;
  secondary?: string;
  availableYearRound: boolean;
  description?: string;
}

export interface Orchard {
  _id: string;
  sellerId: string | Pick<User, '_id' | 'name' | 'avatar' | 'bio' | 'createdAt'>;
  gardenName: string;
  slug: string;
  description: string;
  district: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  fruitTypes: string[];
  totalTrees: number;
  averageFruitPerTree: number;
  expectedYield: number;
  estimatedHarvestDate?: string;
  totalArea: number;
  areaUnit: string;
  rentType: string;
  price: number;
  pricingRules: PricingRule[];
  images: OrchardImage[];
  thumbnail: string;
  amenities: string[];
  available: boolean;
  isFeatured: boolean;
  status: OrchardStatus;
  rejectionReason?: string;
  viewCount: number;
  favouriteCount: number;
  ratingAverage: number;
  ratingCount: number;

  waterSources?: WaterSourcesInfo;
  waterSource?: string;
  irrigationMethod?: string;
  irrigationFrequency?: string;

  organicCertification?: OrganicCertification;

  seo?: { metaTitle?: string; metaDescription?: string; keywords?: string[] };
  createdAt: string;
  updatedAt: string;
  pestHistory?: HistoryEntry[];
  diseaseHistory?: HistoryEntry[];
}

export interface Treatment {
  date: string;
  method?: string;
  chemicals?: string[];
  notes?: string;
}

export interface HistoryEntry {
  incidentDate: string;
  season?: string;
  items?: string[];
  severity?: string;
  description?: string;
  treatments?: Treatment[];
  organicCertification?: OrganicCertification;
}

export type BookingStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export interface RenewalEntry {
  renewedAt: string;
  previousEndDate: string;
  newEndDate: string;
  additionalAmount: number;
}

export interface Booking {
  _id: string;
  orchardId: Orchard | string;
  renterId: User | string;
  sellerId: User | string;
  startDate: string;
  endDate: string;
  bookingStatus: BookingStatus;
  paymentStatus: string;
  totalAmount: number;
  message?: string;
  rejectionReason?: string;
  cancellationReason?: string;

  // Lease Renewal Properties (Issue #27)
  isRenewal?: boolean;
  previousBookingId?: string;
  renewalHistory?: RenewalEntry[];

  timeline?: { status: string; note: string; at: string }[];
  createdAt: string;
}

export interface Review {
  _id: string;
  orchardId: string;
  renterId: Pick<User, '_id' | 'name' | 'avatar'>;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  unreadCount?: number;
  roleInsights?: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PageMeta;
}

export interface FilterOptions {
  fruitTypes: string[];
  availableFruitTypes: string[];
  amenities: string[];
  rentTypes: string[];
  areaUnits: string[];
  states: string[];
  // Live facets — only values actually present in published orchards
  availableRentTypes: string[];
  availableAmenities: string[];
  priceRange: { min: number; max: number };
  treeRange:  { min: number; max: number };
}
