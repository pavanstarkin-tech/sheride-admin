import React, { useState, useMemo } from 'react';
import { useFleetStore } from '../../stores/fleetStore';
import { Ride, RideStatus, VehicleType } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { adminApi } from '../../lib/api';
import { 
  formatCurrency, 
  formatDate, 
  formatTime, 
  formatDateTime, 
  getStatusBadge, 
  getVehicleDetails, 
  timeAgo 
} from '../../lib/utils';
import { 
  Car, 
  Search, 
  Filter, 
  Eye, 
  Ban, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  CreditCard, 
  Star, 
  Navigation,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const RidesPage: React.FC = () => {
  const { rides, forceCancelRide, forceCompleteRide } = useFleetStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [cancelModalRide, setCancelModalRide] = useState<Ride | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter rides
  const filteredRides = useMemo(() => {
    return Object.values(rides)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .filter((ride) => {
        // Status filter
        if (statusFilter !== 'all' && ride.status !== statusFilter) return false;

        // Vehicle filter
        if (vehicleFilter !== 'all' && ride.vehicleType !== vehicleFilter) return false;

        // Search query (Ride ID, User name, Rider name, Phone)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesId = ride.id?.toLowerCase().includes(q);
          const matchesUser = ride.userName?.toLowerCase().includes(q);
          const matchesRider = ride.riderName?.toLowerCase().includes(q);
          const matchesPickup = ride.pickup?.name?.toLowerCase().includes(q) || ride.pickup?.address?.toLowerCase().includes(q);
          const matchesDrop = ride.drop?.name?.toLowerCase().includes(q) || ride.drop?.address?.toLowerCase().includes(q);
          if (!matchesId && !matchesUser && !matchesRider && !matchesPickup && !matchesDrop) return false;
        }

        return true;
      });
  }, [rides, statusFilter, vehicleFilter, searchQuery]);

  const handleCancelSubmit = async () => {
    if (!cancelModalRide) return;
    setIsSubmitting(true);
    try {
      // 1. Call PHP Admin API
      await adminApi.cancelRide(cancelModalRide.id, cancelReason || 'Cancelled by Admin');
      // 2. Sync to Firebase RTDB
      await forceCancelRide(cancelModalRide.id, cancelReason || 'Cancelled by Admin');
      setCancelModalRide(null);
      setCancelReason('');
      if (selectedRide?.id === cancelModalRide.id) {
        setSelectedRide({ ...selectedRide, status: 'cancelled', cancelReason });
      }
    } catch (err: any) {
      alert(`Error cancelling ride: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceComplete = async (ride: Ride) => {
    if (!window.confirm(`Force complete ride #${ride.id.slice(-6)}?`)) return;
    try {
      await forceCompleteRide(ride.id);
      if (selectedRide?.id === ride.id) {
        setSelectedRide({ ...selectedRide, status: 'completed' });
      }
    } catch (err: any) {
      alert(`Error completing ride: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Rides & Bookings Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time live trip tracker, dispatch overview, fare audit, and override controls
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search by ID, User, Captain, Address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="py-1.5 text-xs"
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 text-xs"
          >
            <option value="all">All Statuses ({Object.keys(rides).length})</option>
            <option value="in_progress">In Transit (Active)</option>
            <option value="arriving">Arriving / Accepted</option>
            <option value="requested">Matching Passenger</option>
            <option value="completed">Completed Trips</option>
            <option value="cancelled">Cancelled Trips</option>
          </Select>

          <Select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="py-1.5 text-xs"
          >
            <option value="all">All Vehicles</option>
            <option value="bike">Bike</option>
            <option value="scooter">Scooter</option>
            <option value="auto">Auto</option>
            <option value="cab_economy">Cab Economy</option>
            <option value="cab_premium">Cab Premium</option>
          </Select>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setVehicleFilter('all');
              }}
              className="w-full text-xs"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Rides Table */}
      <Card className="p-0 overflow-hidden">
        {filteredRides.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Car className="w-12 h-12 mx-auto mb-3 opacity-40 text-primary" />
            <p className="text-base font-medium text-slate-700">No rides matching filter criteria</p>
            <p className="text-xs text-slate-400 mt-1">Live booking events will stream here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-purple-100/80 bg-purple-50/30 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Ride ID</th>
                  <th className="py-3.5 px-6">Passenger</th>
                  <th className="py-3.5 px-6">Captain</th>
                  <th className="py-3.5 px-6">Vehicle</th>
                  <th className="py-3.5 px-6">Pickup & Drop Route</th>
                  <th className="py-3.5 px-6">Fare</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50/80 text-slate-700">
                {filteredRides.map((ride) => {
                  const statusInfo = getStatusBadge(ride.status);
                  const vehicleInfo = getVehicleDetails(ride.vehicleType);
                  const isLive = ride.status === 'in_progress' || ride.status === 'arriving' || ride.status === 'accepted';

                  return (
                    <tr key={ride.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-4 px-6 font-mono font-medium text-xs text-slate-900">
                        <div className="flex items-center gap-1.5">
                          {isLive && <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />}
                          #{ride.id.slice(-6)}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 text-xs">
                          {ride.userName || 'Passenger'}
                        </div>
                        {ride.userPhone && (
                          <div className="text-[11px] text-slate-400 font-medium">
                            {ride.userPhone}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {ride.riderName ? (
                          <div>
                            <div className="font-semibold text-slate-800 text-xs">
                              {ride.riderName}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {ride.riderPhone || 'Assigned'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Awaiting Captain</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${vehicleInfo.bg}`}>
                          {vehicleInfo.label}
                        </span>
                      </td>

                      <td className="py-4 px-6 max-w-xs">
                        <div className="text-xs font-medium text-slate-800 truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">{ride.pickup?.name || ride.pickup?.address || 'Pickup'}</span>
                        </div>
                        <div className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span className="truncate">{ride.drop?.name || ride.drop?.address || 'Drop'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-xs">
                          {formatCurrency(ride.fare || ride.totalFare)}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">
                          {ride.paymentMethod || 'Cash'}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-400 whitespace-nowrap">
                        <div>{formatTime(ride.createdAt)}</div>
                        <div className="text-[10px]">{formatDate(ride.createdAt)}</div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRide(ride)}
                            className="p-1.5 text-xs"
                            title="Trip Timeline & Details"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Button>

                          {isLive && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleForceComplete(ride)}
                                className="p-1.5 text-xs"
                                title="Force Complete Trip"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setCancelModalRide(ride)}
                                className="p-1.5 text-xs"
                                title="Cancel Ride by Admin"
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Ride Details Drawer / Modal */}
      <Modal
        isOpen={!!selectedRide}
        onClose={() => setSelectedRide(null)}
        title={`Ride Details #${selectedRide?.id.slice(-6)}`}
        description={`Full trip metadata and audit history`}
        size="lg"
      >
        {selectedRide && (
          <div className="space-y-6">
            {/* Status & Quick Info */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Ride Status
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedRide.status).bg}`}>
                  {getStatusBadge(selectedRide.status).label}
                </span>
              </div>

              {selectedRide.otp && (
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Start Ride OTP
                  </span>
                  <span className="text-base font-mono font-extrabold text-primary bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                    {selectedRide.otp}
                  </span>
                </div>
              )}
            </div>

            {/* Route Addresses */}
            <div className="space-y-3 bg-white border border-slate-200 p-4 rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Pickup Location
                  </span>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    {selectedRide.pickup?.name || selectedRide.pickup?.address || 'Pickup Point'}
                  </p>
                  {selectedRide.pickup?.address && selectedRide.pickup?.name && (
                    <p className="text-xs text-slate-500">{selectedRide.pickup.address}</p>
                  )}
                </div>
              </div>

              <div className="w-0.5 h-6 bg-slate-200 ml-3" />

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
                  <Navigation className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    Drop Location
                  </span>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    {selectedRide.drop?.name || selectedRide.drop?.address || 'Drop Point'}
                  </p>
                  {selectedRide.drop?.address && selectedRide.drop?.name && (
                    <p className="text-xs text-slate-500">{selectedRide.drop.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Passenger & Captain Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                  Passenger
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-primary font-bold">
                    {selectedRide.userName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{selectedRide.userName || 'Passenger'}</div>
                    <div className="text-xs text-slate-500">{selectedRide.userPhone || '—'}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                  Captain / Rider
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold">
                    {selectedRide.riderName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{selectedRide.riderName || 'Not Assigned'}</div>
                    <div className="text-xs text-slate-500">{selectedRide.riderPhone || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Fare Charged
                </span>
                <span className="text-xl font-black text-slate-900">
                  {formatCurrency(selectedRide.fare || selectedRide.totalFare)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Payment Mode
                </span>
                <span className="text-xs font-bold text-primary uppercase">
                  {selectedRide.paymentMethod || 'Cash'} • {selectedRide.paymentStatus || 'Completed'}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedRide(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Admin Cancel Ride Modal */}
      <Modal
        isOpen={!!cancelModalRide}
        onClose={() => setCancelModalRide(null)}
        title="Admin Force Cancel Ride"
        description="Cancelling this ride will immediately notify both the passenger and captain."
      >
        <div className="space-y-4">
          <Input
            label="Cancellation Reason"
            placeholder="e.g. Passenger requested admin support / Driver breakdown"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCancelModalRide(null)}>
              Dismiss
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelSubmit}
              isLoading={isSubmitting}
            >
              Confirm Force Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
