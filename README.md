# SheRide Admin Panel (Full-Stack Mission Control)

The official web administrator portal for **SheRide** — India's premier women-only ride hailing platform.

---

## 🚀 Tech Stack

- **Frontend Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (Strict clean white/light theme with SheRide Pink accents `#E91E63`)
- **State Management**: TanStack Query + Zustand (Real-time sync)
- **Live Maps**: Mapbox GL JS (`light-v11` style with custom pulsing markers)
- **Charts & Graphs**: Recharts (Interactive Area, Line, Bar, and Donut charts)
- **Icons**: Lucide React
- **Date Handling**: Day.js
- **Database & Auth**: Firebase Realtime Database (`sheride-1`) + Firebase Auth
- **Backend API**: Hostinger PHP Endpoints (`/api`)

---

## 📦 Modules Implemented

1. **Authentication & Role Guard**: Protected routes ensuring only authenticated administrators with custom claim `admin: true`, RTDB node `/admins/{uid}`, or authorized email domains can log in.
2. **Dashboard (Home)**: Real-time KPI metrics, Recharts graphs (7-day volume, peak hours, vehicle revenue distribution), Live Map snippet, and incoming bookings stream.
3. **Live Map Tracking**: Fullscreen Mapbox radar displaying online captain locations (colored by vehicle type), active ride polylines, pulsing SOS markers, and remote force-offline controls.
4. **Riders & KYC Approval**: Tabbed management for pending captain applications, document viewer (Driving License, Aadhaar, RC, Photo), 1-click Approve/Reject, and account blocking.
5. **Rides & Bookings**: Real-time rides table, detail drawer (OTP, coordinates, timeline, fare breakdown), and admin override controls (Force Cancel / Force Complete).
6. **Users & Wallets**: Passenger profile inspection, emergency contacts list, ride history, and manual wallet adjustments (Credit/Debit with audit reason).
7. **Vehicles & Fleet**: Fleet category allocation (Bike Pink, Scooter EV, Auto, Cab Economy, Cab Premium) and pricing rates.
8. **Shifts & Scheduling**: Hourly shift coverage (Morning Peak, Evening Rush, Night Safe Shift) and attendance tracking.
9. **Payouts & Settlement**: Rider withdrawal requests processing with UTR/transaction reference logging and platform commission management.
10. **Safety & SOS Center**: Real-time high-priority SOS emergency incidents, resolution workflow with safety notes, and direct emergency dispatches.
11. **Offers & Promos**: Discount coupons and marketing campaigns manager with usage counters.
12. **Analytics & Reports**: Platform metrics with date range filters and CSV data export.
13. **Settings & Audit Trail**: Global base fares, commission percentage, helpline numbers, and immutable audit logs.

---

## 🛠️ How to Setup Initial Admin User

### Option A: Via Firebase Realtime Database (Quickest)
1. Go to Firebase Console -> **Realtime Database**.
2. Add an entry under `/admins`:
```json
{
  "admins": {
    "YOUR_FIREBASE_AUTH_UID": {
      "email": "admin@sheride.app",
      "name": "Super Admin",
      "role": "super_admin",
      "createdAt": 1700000000000
    }
  }
}
```

### Option B: Via Firebase Security Rules
Add the rule into `firebase_rules.json`:
```json
"admins": {
  "$uid": {
    ".read": "auth != null && root.child('admins').child(auth.uid).exists()",
    ".write": false
  }
}
```

---

## 🌐 Running Locally

```bash
cd sheride_admin
npm install
npm run dev
```

Build for production:
```bash
npm run build
```
Production assets are generated in `dist/`.
