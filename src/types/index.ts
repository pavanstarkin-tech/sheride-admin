export type VehicleType = string;

export type VehicleCategory = 'scooter' | 'bike' | 'auto' | 'cab' | 'ev_charging' | 'special';

export interface CustomVehicleType {
  id: string; // unique slug identifier e.g. "ev_scooter", "ev_charging_unit", "ev_auto", "ev_cab_eco", "ev_cab_premium"
  name: string; // e.g. "Lady Pilot EV Scooter", "Mobile EV Charging Unit"
  category: VehicleCategory;
  tagline: string; // e.g. "Fast & 100% Eco-Friendly Commute"
  isElectric: boolean; // ⚡ EV Badge
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  capacity: number; // Passenger seats or charging units
  badge?: string; // "⚡ 100% Electric", "🔋 Mobile Fast Charger", "🌱 Zero Emission", "⭐ Most Popular"
  color: string; // Accent color hex
  imageUrl: string; // Illustrative vehicle artwork URL
  icon: string; // Lucide icon name
  isActive: boolean;
  displayOrder: number;
  serviceRadiusKm?: number;
  createdAt: number;
  updatedAt?: number;
}

export type RideStatus = 
  | 'requested'
  | 'accepted'
  | 'arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface Ride {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  pickup: LocationPoint;
  drop: LocationPoint;
  vehicleType: VehicleType;
  fare: number;
  totalFare?: number;
  baseFare?: number;
  distanceKm?: number;
  durationMin?: number;
  status: RideStatus;
  otp?: string;
  paymentMethod?: 'cash' | 'wallet' | 'upi' | 'card';
  paymentStatus?: 'pending' | 'completed' | 'refunded';
  rating?: number;
  ratingComment?: string;
  createdAt: number;
  acceptedAt?: number;
  startedAt?: number;
  completedAt?: number;
  cancelledAt?: number;
  cancelledBy?: 'user' | 'rider' | 'admin';
  cancelReason?: string;
  trackingPoints?: LocationPoint[];
}

export interface Rider {
  id: string;
  uid: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  vehicleModel?: string;
  isOnline: boolean;
  isVerified: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  isBlocked?: boolean;
  rating: number;
  totalRatings?: number;
  totalRides: number;
  totalEarnings?: number;
  totalWithdrawn?: number;
  currentShift?: string;
  documents?: {
    drivingLicenseUrl?: string;
    aadhaarUrl?: string;
    rcBookUrl?: string;
    photoUrl?: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    updatedAt?: number;
  };
  createdAt: number;
  verifiedAt?: number;
}

export interface User {
  id: string;
  uid: string;
  name: string;
  phone: string;
  email?: string;
  gender?: 'female' | 'other';
  walletBalance?: number;
  totalRides?: number;
  isBlocked?: boolean;
  emergencyContacts?: EmergencyContact[];
  createdAt: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
}

export interface SOSAlert {
  id: string;
  rideId?: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  location: LocationPoint;
  status: 'active' | 'resolved' | 'investigating';
  timestamp: number;
  resolvedAt?: number;
  resolvedBy?: string;
  notes?: string;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  rideId?: string;
  subject: string;
  message: string;
  category?: 'billing' | 'safety' | 'rider_behavior' | 'app_issue' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: number;
  updatedAt?: number;
}

export interface Payout {
  id: string;
  riderId: string;
  riderName?: string;
  riderPhone?: string;
  amount: number;
  bankDetails?: {
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  transactionId?: string;
  requestedAt: number;
  processedAt?: number;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount?: number;
  minFare?: number;
  vehicleTypes?: VehicleType[];
  validFrom: number;
  validUntil: number;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
}

export type ZoneType = 'circle' | 'polygon';

export interface AvailabilityZone {
  id: string;
  name: string;
  type: ZoneType;
  // For Circular zones
  center?: {
    latitude: number;
    longitude: number;
  };
  radiusKm?: number;
  // For Multi-Dot Polygon zones
  points?: Array<{
    latitude: number;
    longitude: number;
  }>;
  surgeMultiplier: number; // e.g. 1.0, 1.25, 1.5
  color?: string; // Unified Lady Pilot Pink default #E91E63
  isActive: boolean;
  allowedVehicles: VehicleType[];
  createdAt: number;
  updatedAt?: number;
}

export interface ShiftSlot {
  id: string;
  riderId: string;
  riderName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'scheduled' | 'active' | 'completed' | 'missed';
}

export interface AppConfig {
  commissionRate: number; // e.g. 15 (%)
  baseFares: Record<VehicleType, {
    baseFare: number;
    perKmRate: number;
    perMinuteRate: number;
    minimumFare: number;
  }>;
  safetyHelpline: string;
  policeEmergencyNumber: string;
  appVersionAndroid: string;
  appVersionIOS: string;
  forceUpdate: boolean;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  adminId?: string;
  targetId?: string;
  details?: any;
  timestamp: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: 'super_admin' | 'admin' | 'support_admin';
  createdAt?: number;
}
