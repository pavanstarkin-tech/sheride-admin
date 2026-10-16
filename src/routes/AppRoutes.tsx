import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '../components/layout/AdminLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { RidesPage } from '../features/rides/RidesPage';
import { RidersPage } from '../features/riders/RidersPage';
import { UsersPage } from '../features/users/UsersPage';
import { LiveMapPage } from '../features/maps/LiveMapPage';
import { FleetPage } from '../features/fleet/FleetPage';
import { ShiftsPage } from '../features/shifts/ShiftsPage';
import { PayoutsPage } from '../features/payouts/PayoutsPage';
import { SafetyPage } from '../features/safety/SafetyPage';
import { OffersPage } from '../features/offers/OffersPage';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { PlayConsoleLegalPage } from '../features/legal/PlayConsoleLegalPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/legal" element={<PlayConsoleLegalPage />} />
      <Route path="/privacy" element={<PlayConsoleLegalPage />} />
      <Route path="/terms" element={<PlayConsoleLegalPage />} />
      <Route path="/delete-account" element={<PlayConsoleLegalPage />} />

      {/* Protected Admin Console Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="rides" element={<RidesPage />} />
        <Route path="riders" element={<RidersPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="live-map" element={<LiveMapPage />} />
        <Route path="fleet" element={<FleetPage />} />
        <Route path="shifts" element={<ShiftsPage />} />
        <Route path="payouts" element={<PayoutsPage />} />
        <Route path="safety" element={<SafetyPage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="legal" element={<PlayConsoleLegalPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
