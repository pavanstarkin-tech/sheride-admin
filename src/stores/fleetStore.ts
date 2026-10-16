import { create } from 'zustand';
import { ref, onValue, off, update, remove, set as fbSet, push } from 'firebase/database';
import { rtdb } from '../lib/firebase';
import type { 
  Ride, 
  Rider, 
  User, 
  SOSAlert, 
  Payout, 
  PromoCode, 
  AppConfig, 
  AdminAuditLog,
  SupportTicket,
  CustomVehicleType,
  AvailabilityZone 
} from '../types';

export const DEFAULT_VEHICLE_TYPES: Record<string, CustomVehicleType> = {
  scooty: {
    id: 'scooty',
    name: 'Scooty',
    category: 'scooter',
    tagline: 'Quick, nimble & affordable solo city commute',
    isElectric: false,
    baseFare: 20,
    perKmRate: 9,
    perMinuteRate: 1.0,
    minimumFare: 25,
    capacity: 1,
    badge: '🌸 Most Affordable',
    color: '#E91E63',
    imageUrl: './vehicles/scooty.png',
    icon: 'Bike',
    isActive: true,
    displayOrder: 1,
    serviceRadiusKm: 15,
    createdAt: Date.now() - 86400000 * 30,
  },
  electric_scooty: {
    id: 'electric_scooty',
    name: 'Electric Scooty',
    category: 'scooter',
    tagline: '100% Eco-friendly, silent & zero-emission scooter',
    isElectric: true,
    baseFare: 25,
    perKmRate: 10,
    perMinuteRate: 1.2,
    minimumFare: 30,
    capacity: 1,
    badge: '⚡ 100% Electric',
    color: '#10B981',
    imageUrl: './vehicles/electric_scooty.png',
    icon: 'Bike',
    isActive: true,
    displayOrder: 2,
    serviceRadiusKm: 18,
    createdAt: Date.now() - 86400000 * 30,
  },
  bike: {
    id: 'bike',
    name: 'Bike',
    category: 'bike',
    tagline: 'Fastest commute through peak traffic',
    isElectric: false,
    baseFare: 25,
    perKmRate: 11,
    perMinuteRate: 1.3,
    minimumFare: 30,
    capacity: 1,
    badge: '⚡ Fast Travel',
    color: '#3B82F6',
    imageUrl: './vehicles/bike.png',
    icon: 'Bike',
    isActive: true,
    displayOrder: 3,
    serviceRadiusKm: 20,
    createdAt: Date.now() - 86400000 * 30,
  },
  priority_bike: {
    id: 'priority_bike',
    name: 'Priority Bike',
    category: 'bike',
    tagline: 'Guaranteed top-rated captains & faster pickup',
    isElectric: false,
    baseFare: 35,
    perKmRate: 13,
    perMinuteRate: 1.6,
    minimumFare: 40,
    capacity: 1,
    badge: '⭐ Priority Express',
    color: '#8B5CF6',
    imageUrl: './vehicles/priority_bike.png',
    icon: 'Bike',
    isActive: true,
    displayOrder: 4,
    serviceRadiusKm: 22,
    createdAt: Date.now() - 86400000 * 30,
  },
  auto: {
    id: 'auto',
    name: 'Auto',
    category: 'auto',
    tagline: 'Safe, iconic 3-wheeler driven by women captains',
    isElectric: false,
    baseFare: 30,
    perKmRate: 13,
    perMinuteRate: 1.6,
    minimumFare: 40,
    capacity: 3,
    badge: '🌱 Safe & Reliable',
    color: '#EAB308',
    imageUrl: './vehicles/auto.png',
    icon: 'Car',
    isActive: true,
    displayOrder: 5,
    serviceRadiusKm: 25,
    createdAt: Date.now() - 86400000 * 30,
  },
  priority_auto: {
    id: 'priority_auto',
    name: 'Priority Auto',
    category: 'auto',
    tagline: 'Express dispatch auto with minimal wait time',
    isElectric: false,
    baseFare: 40,
    perKmRate: 15,
    perMinuteRate: 1.8,
    minimumFare: 50,
    capacity: 3,
    badge: '🚀 Express Dispatch',
    color: '#F97316',
    imageUrl: './vehicles/priority_auto.png',
    icon: 'Car',
    isActive: true,
    displayOrder: 6,
    serviceRadiusKm: 25,
    createdAt: Date.now() - 86400000 * 30,
  },
  premium_auto: {
    id: 'premium_auto',
    name: 'Premium Auto',
    category: 'auto',
    tagline: 'Upgraded spacious auto with top safety rating',
    isElectric: false,
    baseFare: 45,
    perKmRate: 16,
    perMinuteRate: 2.0,
    minimumFare: 55,
    capacity: 3,
    badge: '👑 Premium Fleet',
    color: '#D97706',
    imageUrl: './vehicles/premium_auto.png',
    icon: 'Car',
    isActive: true,
    displayOrder: 7,
    serviceRadiusKm: 28,
    createdAt: Date.now() - 86400000 * 30,
  },
  mini_car: {
    id: 'mini_car',
    name: 'Mini Car',
    category: 'cab',
    tagline: 'Clean, air-conditioned comfortable hatchback cab',
    isElectric: false,
    baseFare: 55,
    perKmRate: 17,
    perMinuteRate: 2.2,
    minimumFare: 75,
    capacity: 4,
    badge: '❄️ AC Hatchback',
    color: '#06B6D4',
    imageUrl: './vehicles/mini_car.png',
    icon: 'Car',
    isActive: true,
    displayOrder: 8,
    serviceRadiusKm: 35,
    createdAt: Date.now() - 86400000 * 30,
  },
  premium_car: {
    id: 'premium_car',
    name: 'Premium Car',
    category: 'cab',
    tagline: 'Luxury executive sedan/SUV with top-rated captains',
    isElectric: false,
    baseFare: 85,
    perKmRate: 22,
    perMinuteRate: 2.8,
    minimumFare: 120,
    capacity: 4,
    badge: '✨ Executive Comfort',
    color: '#6366F1',
    imageUrl: './vehicles/premium_car.png',
    icon: 'Car',
    isActive: true,
    displayOrder: 9,
    serviceRadiusKm: 50,
    createdAt: Date.now() - 86400000 * 30,
  },
  ev_car: {
    id: 'ev_car',
    name: 'EV Car',
    category: 'cab',
    tagline: 'Silent, zero-emission premium electric cab',
    isElectric: true,
    baseFare: 70,
    perKmRate: 19,
    perMinuteRate: 2.4,
    minimumFare: 95,
    capacity: 4,
    badge: '⚡ Clean EV',
    color: '#059669',
    imageUrl: './vehicles/ev_car.png',
    icon: 'Car',
    isActive: true,
    displayOrder: 10,
    serviceRadiusKm: 40,
    createdAt: Date.now() - 86400000 * 30,
  },
};

interface FleetState {
  rides: Record<string, Ride>;
  riders: Record<string, Rider>;
  users: Record<string, User>;
  riderLocations: Record<string, { latitude: number; longitude: number; heading?: number; speed?: number; updatedAt?: number }>;
  sosAlerts: Record<string, SOSAlert>;
  payouts: Record<string, Payout>;
  offers: Record<string, PromoCode>;
  zones: Record<string, AvailabilityZone>;
  vehicleTypes: Record<string, CustomVehicleType>;
  supportTickets: Record<string, SupportTicket>;
  adminLogs: Record<string, AdminAuditLog>;
  config: AppConfig | null;
  isConnected: boolean;
  isLoading: boolean;
  listenersActive: boolean;

  // Real-time listener init/cleanup
  initRealtimeListeners: () => () => void;

  // Direct operations
  updateRiderStatus: (riderId: string, isVerified: boolean, verificationStatus: 'approved' | 'rejected', reason?: string) => Promise<void>;
  toggleRiderBlock: (riderId: string, isBlocked: boolean) => Promise<void>;
  toggleRiderOnline: (riderId: string, isOnline: boolean) => Promise<void>;
  toggleUserBlock: (userId: string, isBlocked: boolean) => Promise<void>;
  adjustUserWallet: (userId: string, amountChange: number, reason: string) => Promise<void>;
  resolveSosAlert: (alertId: string, adminNotes?: string) => Promise<void>;
  savePromoCode: (promo: Partial<PromoCode>) => Promise<void>;
  deletePromoCode: (promoId: string) => Promise<void>;
  saveZone: (zone: AvailabilityZone) => Promise<void>;
  deleteZone: (zoneId: string) => Promise<void>;
  toggleZoneActive: (zoneId: string, isActive: boolean) => Promise<void>;
  saveVehicleType: (vehicle: CustomVehicleType) => Promise<void>;
  deleteVehicleType: (vehicleId: string) => Promise<void>;
  toggleVehicleTypeActive: (vehicleId: string, isActive: boolean) => Promise<void>;
  updateAppConfig: (config: Partial<AppConfig>) => Promise<void>;
  forceCancelRide: (rideId: string, reason: string) => Promise<void>;
  forceCompleteRide: (rideId: string) => Promise<void>;
}

export const useFleetStore = create<FleetState>((set, get) => ({
  rides: {},
  riders: {},
  users: {},
  riderLocations: {},
  sosAlerts: {},
  payouts: {},
  offers: {},
  vehicleTypes: DEFAULT_VEHICLE_TYPES,
  zones: {
    zone_indiranagar: {
      id: "zone_indiranagar",
      name: "Indiranagar High-Demand Sector",
      center: { latitude: 12.9784, longitude: 77.6408 },
      radiusKm: 2.5,
      surgeMultiplier: 1.2,
      color: "#E91E63",
      isActive: true,
      allowedVehicles: ["bike", "scooter", "auto", "cab_economy"],
      createdAt: Date.now() - 86400000,
    },
    zone_koramangala: {
      id: "zone_koramangala",
      name: "Koramangala Tech Corridor",
      center: { latitude: 12.9352, longitude: 77.6245 },
      radiusKm: 3.0,
      surgeMultiplier: 1.15,
      color: "#9C27B0",
      isActive: true,
      allowedVehicles: ["bike", "scooter", "auto", "cab_economy", "cab_premium"],
      createdAt: Date.now() - 86400000,
    },
    zone_mgroad: {
      id: "zone_mgroad",
      name: "CBD / MG Road Safe Hub",
      center: { latitude: 12.9756, longitude: 77.6066 },
      radiusKm: 2.0,
      surgeMultiplier: 1.0,
      color: "#10B981",
      isActive: true,
      allowedVehicles: ["bike", "scooter", "auto", "cab_economy", "cab_premium"],
      createdAt: Date.now() - 86400000,
    },
    zone_hsr: {
      id: "zone_hsr",
      name: "HSR Layout & Silkboard Sector",
      center: { latitude: 12.9121, longitude: 77.6446 },
      radiusKm: 3.5,
      surgeMultiplier: 1.25,
      color: "#F59E0B",
      isActive: true,
      allowedVehicles: ["bike", "scooter", "auto", "cab_economy"],
      createdAt: Date.now() - 86400000,
    },
  },
  supportTickets: {},
  adminLogs: {},
  config: {
    commissionRate: 15,
    baseFares: {
      bike: { baseFare: 30, perKmRate: 12, perMinuteRate: 1.5, minimumFare: 40 },
      scooter: { baseFare: 25, perKmRate: 10, perMinuteRate: 1.2, minimumFare: 35 },
      auto: { baseFare: 35, perKmRate: 14, perMinuteRate: 1.8, minimumFare: 50 },
      cab_economy: { baseFare: 60, perKmRate: 18, perMinuteRate: 2.2, minimumFare: 80 },
      cab_premium: { baseFare: 90, perKmRate: 24, perMinuteRate: 3.0, minimumFare: 120 },
    },
    safetyHelpline: '+91 8000 123 456',
    policeEmergencyNumber: '112',
    appVersionAndroid: '1.0.0',
    appVersionIOS: '1.0.0',
    forceUpdate: false,
  },
  isConnected: false,
  isLoading: true,
  listenersActive: false,

  initRealtimeListeners: () => {
    if (get().listenersActive) return () => {};

    set({ isLoading: true, listenersActive: true });

    // Connection state
    const connectedRef = ref(rtdb, '.info/connected');
    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      set({ isConnected: snap.val() === true });
    });

    // 1. Rides
    const ridesRef = ref(rtdb, 'rides');
    const unsubscribeRides = onValue(ridesRef, (snap) => {
      const data = snap.val() || {};
      const parsed: Record<string, Ride> = {};
      Object.keys(data).forEach((key) => {
        parsed[key] = { id: key, ...data[key] };
      });
      set({ rides: parsed });
    });

    // 2. Riders
    const ridersRef = ref(rtdb, 'riders');
    const unsubscribeRiders = onValue(ridersRef, (snap) => {
      const data = snap.val() || {};
      const parsed: Record<string, Rider> = {};
      Object.keys(data).forEach((key) => {
        parsed[key] = { id: key, ...data[key] };
      });
      set({ riders: parsed });
    });

    // 3. Users
    const usersRef = ref(rtdb, 'users');
    const unsubscribeUsers = onValue(usersRef, (snap) => {
      const data = snap.val() || {};
      const parsed: Record<string, User> = {};
      Object.keys(data).forEach((key) => {
        parsed[key] = { id: key, ...data[key] };
      });
      set({ users: parsed });
    });

    // 4. Live Rider Locations
    const locRef = ref(rtdb, 'riderLocations');
    const unsubscribeLoc = onValue(locRef, (snap) => {
      set({ riderLocations: snap.val() || {} });
    });

    // 5. SOS Alerts
    const sosRef = ref(rtdb, 'safety/sos');
    const unsubscribeSos = onValue(sosRef, (snap) => {
      const data = snap.val() || {};
      const parsed: Record<string, SOSAlert> = {};
      Object.keys(data).forEach((key) => {
        parsed[key] = { id: key, ...data[key] };
      });
      set({ sosAlerts: parsed });
    });

    // 6. Payouts
    const payoutsRef = ref(rtdb, 'payouts');
    const unsubscribePayouts = onValue(payoutsRef, (snap) => {
      const data = snap.val() || {};
      const parsed: Record<string, Payout> = {};
      Object.keys(data).forEach((key) => {
        parsed[key] = { id: key, ...data[key] };
      });
      set({ payouts: parsed });
    });

    // 7. Offers & Promo codes
    const offersRef = ref(rtdb, 'offers');
    const unsubscribeOffers = onValue(offersRef, (snap) => {
      const data = snap.val() || {};
      const parsed: Record<string, PromoCode> = {};
      Object.keys(data).forEach((key) => {
        parsed[key] = { id: key, ...data[key] };
      });
      set({ offers: parsed });
    });

    // 8. Availability & Service Zones
    const zonesRef = ref(rtdb, 'zones');
    const unsubscribeZones = onValue(zonesRef, (snap) => {
      const data = snap.val() || {};
      const parsed: Record<string, AvailabilityZone> = {};
      Object.keys(data).forEach((key) => {
        parsed[key] = { id: key, ...data[key] };
      });
      set({ zones: parsed });
    });

    // 9. Support tickets
    const ticketsRef = ref(rtdb, 'supportTickets');
    const unsubscribeTickets = onValue(ticketsRef, (snap) => {
      const data = snap.val() || {};
      const parsed: Record<string, SupportTicket> = {};
      Object.keys(data).forEach((key) => {
        parsed[key] = { id: key, ...data[key] };
      });
      set({ supportTickets: parsed });
    });

    // 10. Admin Logs
    const logsRef = ref(rtdb, 'adminLogs');
    const unsubscribeLogs = onValue(logsRef, (snap) => {
      const data = snap.val() || {};
      const parsed: Record<string, AdminAuditLog> = {};
      Object.keys(data).forEach((key) => {
        parsed[key] = { id: key, ...data[key] };
      });
      set({ adminLogs: parsed });
    });

    // 11. Custom Vehicle Types
    const vtypesRef = ref(rtdb, 'settings/vehicleTypes');
    const unsubscribeVtypes = onValue(vtypesRef, (snap) => {
      const data = snap.val();
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        const parsed: Record<string, CustomVehicleType> = {};
        Object.keys(data).forEach((key) => {
          parsed[key] = { id: key, ...data[key] };
        });
        set({ vehicleTypes: { ...DEFAULT_VEHICLE_TYPES, ...parsed } });
      }
    });

    // 12. App Config
    const configRef = ref(rtdb, 'settings/appConfig');
    const unsubscribeConfig = onValue(configRef, (snap) => {
      if (snap.exists()) {
        set({ config: snap.val() });
      }
      set({ isLoading: false });
    });

    return () => {
      off(connectedRef);
      off(ridesRef);
      off(ridersRef);
      off(usersRef);
      off(locRef);
      off(sosRef);
      off(payoutsRef);
      off(offersRef);
      off(zonesRef);
      off(ticketsRef);
      off(logsRef);
      off(configRef);
      set({ listenersActive: false });
    };
  },

  updateRiderStatus: async (riderId, isVerified, verificationStatus, reason) => {
    const riderRef = ref(rtdb, `riders/${riderId}`);
    const now = Date.now();
    await update(riderRef, {
      isVerified,
      verificationStatus,
      rejectionReason: reason || null,
      verifiedAt: now,
    });

    // Write audit log
    const logRef = push(ref(rtdb, 'adminLogs'));
    await fbSet(logRef, {
      action: `rider_${verificationStatus}`,
      targetId: riderId,
      details: { isVerified, verificationStatus, reason },
      timestamp: now,
    });
  },

  toggleRiderBlock: async (riderId, isBlocked) => {
    const riderRef = ref(rtdb, `riders/${riderId}`);
    await update(riderRef, { isBlocked });

    const logRef = push(ref(rtdb, 'adminLogs'));
    await fbSet(logRef, {
      action: isBlocked ? 'block_rider' : 'unblock_rider',
      targetId: riderId,
      timestamp: Date.now(),
    });
  },

  toggleRiderOnline: async (riderId, isOnline) => {
    const riderRef = ref(rtdb, `riders/${riderId}`);
    await update(riderRef, { isOnline });
  },

  toggleUserBlock: async (userId, isBlocked) => {
    const userRef = ref(rtdb, `users/${userId}`);
    await update(userRef, { isBlocked });

    const logRef = push(ref(rtdb, 'adminLogs'));
    await fbSet(logRef, {
      action: isBlocked ? 'block_user' : 'unblock_user',
      targetId: userId,
      timestamp: Date.now(),
    });
  },

  adjustUserWallet: async (userId, amountChange, reason) => {
    const walletRef = ref(rtdb, `wallets/${userId}`);
    const userRef = ref(rtdb, `users/${userId}`);
    const now = Date.now();

    const currentUser = get().users[userId];
    const currentBalance = currentUser?.walletBalance || 0;
    const newBalance = Math.max(0, currentBalance + amountChange);

    await update(userRef, { walletBalance: newBalance });
    await update(walletRef, { balance: newBalance, updatedAt: now });

    // Push to wallets/{userId}/transactions
    const txnRef = push(ref(rtdb, `wallets/${userId}/transactions`));
    await fbSet(txnRef, {
      amount: Math.abs(amountChange),
      type: amountChange >= 0 ? 'credit' : 'debit',
      description: `Admin adjustment: ${reason}`,
      timestamp: now,
    });

    // Also push to global transactions node for User App streamTransactions query
    const globalTxnRef = push(ref(rtdb, 'transactions'));
    await fbSet(globalTxnRef, {
      transactionId: globalTxnRef.key,
      uid: userId,
      amount: Math.abs(amountChange),
      type: amountChange >= 0 ? 'credit' : 'debit',
      description: `Admin adjustment: ${reason}`,
      createdAt: now,
      status: 'success',
    });

    // Push notification to User App Notification Center
    const notifRef = push(ref(rtdb, `notifications/${userId}`));
    await fbSet(notifRef, {
      notificationId: notifRef.key,
      title: amountChange >= 0 ? '💰 Lady Pilot Wallet Credited' : 'Lady Pilot Wallet Adjusted',
      body: `₹${Math.abs(amountChange)} was ${amountChange >= 0 ? 'credited to' : 'debited from'} your wallet. Reason: ${reason}. New balance: ₹${newBalance}`,
      type: 'wallet',
      isRead: false,
      createdAt: now,
    });

    const logRef = push(ref(rtdb, 'adminLogs'));
    await fbSet(logRef, {
      action: 'adjust_wallet',
      targetId: userId,
      details: { amountChange, reason, newBalance },
      timestamp: now,
    });
  },

  resolveSosAlert: async (alertId, adminNotes) => {
    const alertRef = ref(rtdb, `safety/sos/${alertId}`);
    const now = Date.now();
    await update(alertRef, {
      status: 'resolved',
      resolvedAt: now,
      notes: adminNotes || 'Resolved by Admin Support',
    });

    const logRef = push(ref(rtdb, 'adminLogs'));
    await fbSet(logRef, {
      action: 'resolve_sos',
      targetId: alertId,
      details: { adminNotes },
      timestamp: now,
    });
  },

  savePromoCode: async (promo) => {
    const id = promo.id || `PROMO_${Date.now()}`;
    const promoRef = ref(rtdb, `offers/${id}`);
    await update(promoRef, {
      id,
      code: promo.code?.toUpperCase(),
      description: promo.description || '',
      discountType: promo.discountType || 'percentage',
      discountValue: Number(promo.discountValue) || 0,
      maxDiscount: Number(promo.maxDiscount) || 100,
      minFare: Number(promo.minFare) || 50,
      validFrom: promo.validFrom || Date.now(),
      validUntil: promo.validUntil || Date.now() + 30 * 24 * 60 * 60 * 1000,
      isActive: promo.isActive !== undefined ? promo.isActive : true,
      usageCount: promo.usageCount || 0,
    });
  },

  deletePromoCode: async (promoId) => {
    const promoRef = ref(rtdb, `offers/${promoId}`);
    await remove(promoRef);
  },

  saveZone: async (zone) => {
    const id = zone.id || `zone_${Date.now()}`;
    const fullZone: AvailabilityZone = {
      ...zone,
      id,
      color: '#E91E63',
    };
    
    // Optimistic local state update
    set((state) => ({
      zones: {
        ...state.zones,
        [id]: fullZone,
      },
    }));

    try {
      const zoneRef = ref(rtdb, `zones/${id}`);
      await update(zoneRef, fullZone);

      const logRef = push(ref(rtdb, 'adminLogs'));
      await fbSet(logRef, {
        action: 'save_availability_zone',
        targetId: id,
        details: { name: fullZone.name, surge: fullZone.surgeMultiplier, type: fullZone.type },
        timestamp: Date.now(),
      });
    } catch (e) {
      console.warn('Firebase RTDB zone write error (local state preserved):', e);
    }
  },

  deleteZone: async (zoneId) => {
    // Optimistic local state update
    set((state) => {
      const nextZones = { ...state.zones };
      delete nextZones[zoneId];
      return { zones: nextZones };
    });

    try {
      const zoneRef = ref(rtdb, `zones/${zoneId}`);
      await remove(zoneRef);

      const logRef = push(ref(rtdb, 'adminLogs'));
      await fbSet(logRef, {
        action: 'delete_availability_zone',
        targetId: zoneId,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.warn('Firebase RTDB zone delete error (local state preserved):', e);
    }
  },

  toggleZoneActive: async (zoneId, isActive) => {
    set((state) => {
      if (!state.zones[zoneId]) return state;
      return {
        zones: {
          ...state.zones,
          [zoneId]: {
            ...state.zones[zoneId],
            isActive,
          },
        },
      };
    });

    try {
      const zoneRef = ref(rtdb, `zones/${zoneId}`);
      await update(zoneRef, { isActive });
    } catch (e) {
      console.warn('Firebase RTDB zone toggle error:', e);
    }
  },

  saveVehicleType: async (vehicle) => {
    const id = vehicle.id || `custom_v_${Date.now()}`;
    const fullVehicle: CustomVehicleType = {
      ...vehicle,
      id,
      updatedAt: Date.now(),
    };

    // Optimistic local state update
    set((state) => ({
      vehicleTypes: {
        ...state.vehicleTypes,
        [id]: fullVehicle,
      },
    }));

    try {
      const vtypeRef = ref(rtdb, `settings/vehicleTypes/${id}`);
      await update(vtypeRef, fullVehicle);

      const logRef = push(ref(rtdb, 'adminLogs'));
      await fbSet(logRef, {
        action: 'save_vehicle_type',
        targetId: id,
        details: { name: fullVehicle.name, isElectric: fullVehicle.isElectric, baseFare: fullVehicle.baseFare },
        timestamp: Date.now(),
      });
    } catch (e) {
      console.warn('Firebase RTDB vehicle save warning:', e);
    }
  },

  deleteVehicleType: async (vehicleId) => {
    set((state) => {
      const next = { ...state.vehicleTypes };
      delete next[vehicleId];
      return { vehicleTypes: next };
    });

    try {
      const vtypeRef = ref(rtdb, `settings/vehicleTypes/${vehicleId}`);
      await remove(vtypeRef);

      const logRef = push(ref(rtdb, 'adminLogs'));
      await fbSet(logRef, {
        action: 'delete_vehicle_type',
        targetId: vehicleId,
        timestamp: Date.now(),
      });
    } catch (e) {
      console.warn('Firebase RTDB vehicle delete warning:', e);
    }
  },

  toggleVehicleTypeActive: async (vehicleId, isActive) => {
    set((state) => {
      if (!state.vehicleTypes[vehicleId]) return state;
      return {
        vehicleTypes: {
          ...state.vehicleTypes,
          [vehicleId]: {
            ...state.vehicleTypes[vehicleId],
            isActive,
          },
        },
      };
    });

    try {
      const vtypeRef = ref(rtdb, `settings/vehicleTypes/${vehicleId}`);
      await update(vtypeRef, { isActive });
    } catch (e) {
      console.warn('Firebase RTDB vehicle toggle warning:', e);
    }
  },

  updateAppConfig: async (newConfig) => {
    const configRef = ref(rtdb, 'settings/appConfig');
    await update(configRef, newConfig);

    const logRef = push(ref(rtdb, 'adminLogs'));
    await fbSet(logRef, {
      action: 'update_app_config',
      details: newConfig,
      timestamp: Date.now(),
    });
  },

  forceCancelRide: async (rideId, reason) => {
    const rideRef = ref(rtdb, `rides/${rideId}`);
    const now = Date.now();
    const ride = get().rides[rideId];

    await update(rideRef, {
      status: 'cancelled',
      cancelledBy: 'admin',
      cancelReason: reason || 'Cancelled by Admin',
      cancelledAt: now,
    });

    // Remove from activeRequests so rider dispatch queues clear
    try {
      await remove(ref(rtdb, `activeRequests/${rideId}`));
    } catch (_) {}

    // Send in-app notification to passenger
    if (ride?.userId) {
      const uNotif = push(ref(rtdb, `notifications/${ride.userId}`));
      await fbSet(uNotif, {
        notificationId: uNotif.key,
        title: '⚠️ Lady Pilot Ride Cancelled',
        body: `Ride #${rideId} was cancelled by Lady Pilot Support. Reason: ${reason || 'Operational update'}`,
        type: 'ride',
        rideId,
        isRead: false,
        createdAt: now,
      });
    }

    // Send in-app notification to captain if assigned
    if (ride?.riderId) {
      const rNotif = push(ref(rtdb, `notifications/${ride.riderId}`));
      await fbSet(rNotif, {
        notificationId: rNotif.key,
        title: '⚠️ Ride Cancelled by Mission Control',
        body: `Ride #${rideId} was cancelled by Support. Reason: ${reason || 'Operational update'}`,
        type: 'ride',
        rideId,
        isRead: false,
        createdAt: now,
      });
    }

    const logRef = push(ref(rtdb, 'adminLogs'));
    await fbSet(logRef, {
      action: 'admin_cancel_ride',
      targetId: rideId,
      details: { reason },
      timestamp: now,
    });
  },

  forceCompleteRide: async (rideId) => {
    const rideRef = ref(rtdb, `rides/${rideId}`);
    const now = Date.now();
    const ride = get().rides[rideId];

    await update(rideRef, {
      status: 'completed',
      completedAt: now,
      paymentStatus: 'completed',
    });

    // Remove from activeRequests
    try {
      await remove(ref(rtdb, `activeRequests/${rideId}`));
    } catch (_) {}

    // Notify passenger
    if (ride?.userId) {
      const uNotif = push(ref(rtdb, `notifications/${ride.userId}`));
      await fbSet(uNotif, {
        notificationId: uNotif.key,
        title: '🎉 Lady Pilot Trip Completed',
        body: `Your ride #${rideId} has been marked completed. Thank you for choosing Lady Pilot!`,
        type: 'ride',
        rideId,
        isRead: false,
        createdAt: now,
      });
    }

    const logRef = push(ref(rtdb, 'adminLogs'));
    await fbSet(logRef, {
      action: 'admin_force_complete_ride',
      targetId: rideId,
      timestamp: now,
    });
  },
}));
