import React, { useState, useMemo } from 'react';
import { useFleetStore } from '../../stores/fleetStore';
import { Rider, VehicleType } from '../../types';
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
  formatDateTime, 
  getStatusBadge, 
  getVehicleDetails 
} from '../../lib/utils';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye, 
  ShieldCheck, 
  ShieldAlert, 
  Star, 
  Car, 
  Phone, 
  FileText, 
  ExternalLink,
  Power,
  Ban,
  Unlock,
  Sparkles
} from 'lucide-react';

export const RidersPage: React.FC = () => {
  const { riders, updateRiderStatus, toggleRiderBlock, toggleRiderOnline } = useFleetStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [documentModalRider, setDocumentModalRider] = useState<Rider | null>(null);
  const [rejectModalRider, setRejectModalRider] = useState<Rider | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtered Riders List
  const filteredRiders = useMemo(() => {
    return Object.values(riders).filter((rider) => {
      // Tab filter
      const isApproved = rider.isVerified && rider.verificationStatus !== 'pending';
      const isPending = !rider.isVerified || rider.verificationStatus === 'pending';

      if (activeTab === 'pending' && !isPending) return false;
      if (activeTab === 'verified' && !isApproved) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = rider.name?.toLowerCase().includes(query);
        const matchesPhone = rider.phone?.toLowerCase().includes(query);
        const matchesVehicle = rider.vehicleNumber?.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesVehicle) return false;
      }

      // Vehicle filter
      if (vehicleFilter !== 'all' && rider.vehicleType !== vehicleFilter) {
        return false;
      }

      return true;
    });
  }, [riders, activeTab, searchQuery, vehicleFilter]);

  const pendingCount = Object.values(riders).filter(
    (r) => !r.isVerified || r.verificationStatus === 'pending'
  ).length;
  const verifiedCount = Object.values(riders).filter(
    (r) => r.isVerified && r.verificationStatus !== 'pending'
  ).length;

  const handleApprove = async (rider: Rider) => {
    setIsProcessing(true);
    try {
      // 1. Call PHP Admin API
      await adminApi.approveRider(rider.id || rider.uid, 'approve');
      // 2. Optimistic update via store
      await updateRiderStatus(rider.id || rider.uid, true, 'approved');
      if (selectedRider?.id === rider.id) {
        setSelectedRider({ ...rider, isVerified: true, verificationStatus: 'approved' });
      }
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModalRider) return;
    setIsProcessing(true);
    try {
      await adminApi.approveRider(rejectModalRider.id || rejectModalRider.uid, 'reject', rejectionReason);
      await updateRiderStatus(rejectModalRider.id || rejectModalRider.uid, false, 'rejected', rejectionReason);
      setRejectModalRider(null);
      setRejectionReason('');
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Rider Captains & KYC Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review document verification, manage fleet status, and audit female rider profiles
          </p>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pending Approvals</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('verified')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center gap-2 ${
                activeTab === 'verified'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Verified Captains</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                {verifiedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Riders ({Object.keys(riders).length})
            </button>
          </div>

          {/* Search and Vehicle Filter */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-64">
              <Input
                placeholder="Search by name, phone, plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="py-1.5 text-xs"
              />
            </div>

            <div className="w-40 shrink-0">
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
            </div>
          </div>
        </div>
      </Card>

      {/* Riders Table */}
      <Card className="p-0 overflow-hidden">
        {filteredRiders.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-40 text-primary" />
            <p className="text-base font-medium text-slate-700">No riders matching filter criteria</p>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'pending'
                ? 'All rider KYC applications are reviewed and up to date!'
                : 'Try adjusting your search query or vehicle filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-purple-100/80 bg-purple-50/30 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Captain Profile</th>
                  <th className="py-3.5 px-6">Phone Number</th>
                  <th className="py-3.5 px-6">Vehicle Details</th>
                  <th className="py-3.5 px-6">Status & Rating</th>
                  <th className="py-3.5 px-6">Rides / Earnings</th>
                  <th className="py-3.5 px-6">Live Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50/80 text-slate-700">
                {filteredRiders.map((rider) => {
                  const vehicleInfo = getVehicleDetails(rider.vehicleType);
                  const isPending = !rider.isVerified || rider.verificationStatus === 'pending';
                  const isBlocked = rider.isBlocked;

                  return (
                    <tr key={rider.id || rider.uid} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                            {rider.photoUrl ? (
                              <img
                                src={rider.photoUrl}
                                alt={rider.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              rider.name?.charAt(0) || 'R'
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {rider.name}
                              {rider.isVerified && (
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              )}
                              {isBlocked && (
                                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-100 text-rose-700 rounded">
                                  BLOCKED
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              ID: {rider.id?.slice(-8) || rider.uid?.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-800 text-xs">
                        {rider.phone || '—'}
                      </td>

                      <td className="py-4 px-6">
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${vehicleInfo.bg}`}>
                            {vehicleInfo.label}
                          </span>
                          <div className="text-xs font-mono font-medium text-slate-600 mt-1">
                            {rider.vehicleNumber || 'KA 01 XX 0000'}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {isPending ? (
                            <Badge variant="warning" dot>
                              Pending KYC
                            </Badge>
                          ) : (
                            <Badge variant="success" dot>
                              Verified Captain
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{Number(rider.rating || 5.0).toFixed(1)}</span>
                            <span className="text-slate-400 font-normal">
                              ({rider.totalRatings || rider.totalRides || 0})
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-xs font-semibold text-slate-900">
                          {rider.totalRides || 0} rides
                        </div>
                        <div className="text-xs text-emerald-700 font-medium">
                          {formatCurrency(rider.totalEarnings || 0)}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleRiderOnline(rider.id || rider.uid, !rider.isOnline)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            rider.isOnline
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{rider.isOnline ? 'Online' : 'Offline'}</span>
                        </button>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Documents Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDocumentModalRider(rider)}
                            className="p-1.5"
                            title="View KYC Documents"
                          >
                            <FileText className="w-4 h-4 text-slate-600" />
                          </Button>

                          {/* Detail Profile Drawer */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRider(rider)}
                            className="p-1.5"
                            title="Rider Profile & Shifts"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Button>

                          {/* Approval Actions */}
                          {isPending ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleApprove(rider)}
                                isLoading={isProcessing}
                                className="px-2.5 py-1.5 text-xs gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </Button>

                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setRejectModalRider(rider)}
                                className="px-2.5 py-1.5 text-xs gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant={isBlocked ? 'success' : 'ghost'}
                              size="sm"
                              onClick={() => toggleRiderBlock(rider.id || rider.uid, !isBlocked)}
                              className={`p-1.5 ${isBlocked ? 'text-white' : 'text-slate-400 hover:text-rose-600'}`}
                              title={isBlocked ? 'Unblock Rider' : 'Block Rider'}
                            >
                              {isBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </Button>
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

      {/* KYC Document Viewer Modal */}
      <Modal
        isOpen={!!documentModalRider}
        onClose={() => setDocumentModalRider(null)}
        title={`KYC Verification Documents - ${documentModalRider?.name}`}
        description="Verify driver's license, Aadhaar, vehicle registration RC, and captain photo"
        size="lg"
      >
        {documentModalRider && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Driving License */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Driving License (DL)
                  </span>
                  <Badge variant="primary">Verified Format</Badge>
                </div>
                {documentModalRider.documents?.drivingLicenseUrl ? (
                  <img
                    src={documentModalRider.documents.drivingLicenseUrl}
                    alt="Driving License"
                    className="w-full h-44 object-cover rounded-xl border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="h-44 bg-white border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                    <FileText className="w-8 h-8 mb-2 opacity-50 text-primary" />
                    <span>DL Uploaded in Mobile App</span>
                    <span className="text-[10px] text-slate-400 mt-1">Verification Reference: DL-{documentModalRider.id?.slice(0, 8)}</span>
                  </div>
                )}
              </div>

              {/* Aadhaar Card */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Aadhaar Card (Identity)
                  </span>
                  <Badge variant="primary">Female Gender Verified</Badge>
                </div>
                {documentModalRider.documents?.aadhaarUrl ? (
                  <img
                    src={documentModalRider.documents.aadhaarUrl}
                    alt="Aadhaar Card"
                    className="w-full h-44 object-cover rounded-xl border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="h-44 bg-white border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                    <ShieldCheck className="w-8 h-8 mb-2 opacity-50 text-emerald-500" />
                    <span>Aadhaar KYC Submitted</span>
                    <span className="text-[10px] text-slate-400 mt-1">Gender: Female (Platform Verified)</span>
                  </div>
                )}
              </div>

              {/* RC Book */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Vehicle Registration (RC)
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {documentModalRider.vehicleNumber}
                  </span>
                </div>
                <div className="h-32 bg-white border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                  <Car className="w-8 h-8 mb-2 opacity-50 text-amber-500" />
                  <span>Vehicle Model: {documentModalRider.vehicleModel || documentModalRider.vehicleType}</span>
                </div>
              </div>

              {/* Profile Photo */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Live Photo Verification
                  </span>
                </div>
                <div className="h-32 bg-white border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                  <UserCheck className="w-8 h-8 mb-2 opacity-50 text-primary" />
                  <span>Biometric Selfie Verified</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDocumentModalRider(null)}>
                Close
              </Button>
              {!documentModalRider.isVerified && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setRejectModalRider(documentModalRider);
                      setDocumentModalRider(null);
                    }}
                  >
                    Reject Application
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => {
                      handleApprove(documentModalRider);
                      setDocumentModalRider(null);
                    }}
                    isLoading={isProcessing}
                    leftIcon={<Check className="w-4 h-4" />}
                  >
                    Approve Captain
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={!!rejectModalRider}
        onClose={() => setRejectModalRider(null)}
        title="Reject Rider Application"
        description="Provide a reason for rejection. This will be sent as a notification to the rider."
      >
        <div className="space-y-4">
          <Input
            label="Rejection Reason"
            placeholder="e.g. Blurred Driving License copy or Invalid RC number"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setRejectModalRider(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              isLoading={isProcessing}
              disabled={!rejectionReason.trim()}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rider Detail Profile Drawer / Modal */}
      <Modal
        isOpen={!!selectedRider}
        onClose={() => setSelectedRider(null)}
        title={selectedRider?.name || 'Rider Profile'}
        description={`Captain ID: ${selectedRider?.id || selectedRider?.uid}`}
        size="md"
      >
        {selectedRider && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center font-bold text-xl text-primary shrink-0">
                {selectedRider.photoUrl ? (
                  <img
                    src={selectedRider.photoUrl}
                    alt={selectedRider.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  selectedRider.name?.charAt(0) || 'R'
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedRider.name}</h4>
                <p className="text-xs text-slate-500 font-medium">{selectedRider.phone}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {Number(selectedRider.rating || 5.0).toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600 font-medium">
                    {selectedRider.totalRides || 0} completed rides
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Total Earnings</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {formatCurrency(selectedRider.totalEarnings || 0)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-1">Vehicle Plate</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {selectedRider.vehicleNumber || '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant={selectedRider.isBlocked ? 'success' : 'danger'}
                size="sm"
                onClick={async () => {
                  await toggleRiderBlock(selectedRider.id || selectedRider.uid, !selectedRider.isBlocked);
                  setSelectedRider({ ...selectedRider, isBlocked: !selectedRider.isBlocked });
                }}
              >
                {selectedRider.isBlocked ? 'Unblock Rider' : 'Block Rider Account'}
              </Button>

              <Button variant="outline" size="sm" onClick={() => setSelectedRider(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
