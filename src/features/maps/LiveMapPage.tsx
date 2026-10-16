import React, { useState, useMemo } from 'react';
import { useFleetStore } from '../../stores/fleetStore';
import type { Rider, VehicleType, AvailabilityZone, ZoneType } from '../../types';
import { LiveFleetMap } from '../../components/maps/LiveFleetMap';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { 
  getVehicleDetails, 
  timeAgo 
} from '../../lib/utils';
import { 
  MapPin, 
  Navigation, 
  Power, 
  Star, 
  X, 
  Plus,
  Trash2,
  Layers,
  CircleDot,
  Pentagon,
  RotateCcw,
  Check,
  Edit2
} from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  const { riders, rides, sosAlerts, zones, toggleRiderOnline, saveZone, deleteZone, toggleZoneActive } = useFleetStore();

  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [onlineOnly, setOnlineOnly] = useState<boolean>(true);

  // Zone Creation & Type Selection
  const [isTypeSelectModalOpen, setIsTypeSelectModalOpen] = useState<boolean>(false);
  const [markingMode, setMarkingMode] = useState<'none' | 'circle' | 'polygon'>('none');
  const [polygonPoints, setPolygonPoints] = useState<Array<{ latitude: number; longitude: number }>>([]);

  // Zone Save Modal State
  const [isZoneModalOpen, setIsZoneModalOpen] = useState<boolean>(false);
  const [zoneType, setZoneType] = useState<ZoneType>('circle');
  const [zoneName, setZoneName] = useState<string>('');
  const [zoneLat, setZoneLat] = useState<number>(12.9716);
  const [zoneLng, setZoneLng] = useState<number>(77.5946);
  const [zoneRadius, setZoneRadius] = useState<string>('2.5');
  const [zoneSurge, setZoneSurge] = useState<string>('1.0');
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [isSavingZone, setIsSavingZone] = useState<boolean>(false);

  // Filter riders for the map
  const visibleRiders = useMemo(() => {
    const res: Record<string, Rider> = {};
    Object.entries(riders).forEach(([id, rider]) => {
      if (onlineOnly && !rider.isOnline) return;
      if (vehicleFilter !== 'all' && rider.vehicleType !== vehicleFilter) return;
      res[id] = rider;
    });
    return res;
  }, [riders, onlineOnly, vehicleFilter]);

  const onlineCount = Object.values(riders).filter((r) => r.isOnline).length;
  const inTripCount = Object.values(rides).filter(
    (r) => r.status === 'in_progress' || r.status === 'arriving' || r.status === 'accepted'
  ).length;

  const handleStartMarking = (type: ZoneType) => {
    setIsTypeSelectModalOpen(false);
    setZoneType(type);
    if (type === 'circle') {
      setMarkingMode('circle');
      setPolygonPoints([]);
    } else {
      setMarkingMode('polygon');
      setPolygonPoints([]);
    }
  };

  const handleMapClick = (coords: { latitude: number; longitude: number }) => {
    if (markingMode === 'circle') {
      setZoneLat(coords.latitude);
      setZoneLng(coords.longitude);
      setEditingZoneId(null);
      setZoneName(`Circular Zone (${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)})`);
      setZoneRadius('2.5');
      setZoneSurge('1.0');
      setIsZoneModalOpen(true);
      setMarkingMode('none');
    } else if (markingMode === 'polygon') {
      setPolygonPoints((prev) => [...prev, coords]);
    }
  };

  const handleCompletePolygon = () => {
    if (polygonPoints.length < 3) {
      alert('Please place at least 3 points on the map to define a closed polygon boundary.');
      return;
    }
    setEditingZoneId(null);
    setZoneName(`Custom Polygon Zone (${polygonPoints.length} Points)`);
    setZoneSurge('1.0');
    setIsZoneModalOpen(true);
    setMarkingMode('none');
  };

  const handleUndoPoint = () => {
    setPolygonPoints((prev) => prev.slice(0, -1));
  };

  const handleCancelMarking = () => {
    setMarkingMode('none');
    setPolygonPoints([]);
  };

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;

    setIsSavingZone(true);
    try {
      const newZone: AvailabilityZone = {
        id: editingZoneId || `zone_${Date.now()}`,
        name: zoneName.trim(),
        type: zoneType,
        surgeMultiplier: parseFloat(zoneSurge) || 1.0,
        color: '#7F00FD', // Unified signature Lady Pilot Purple
        isActive: true,
        allowedVehicles: ['bike', 'scooter', 'auto', 'cab_economy', 'cab_premium'],
        createdAt: Date.now(),
      };

      if (zoneType === 'circle') {
        newZone.center = { latitude: zoneLat, longitude: zoneLng };
        newZone.radiusKm = parseFloat(zoneRadius) || 2.5;
      } else {
        newZone.points = polygonPoints;
      }

      await saveZone(newZone);
      setIsZoneModalOpen(false);
      setEditingZoneId(null);
      setPolygonPoints([]);
    } catch (err: any) {
      alert(`Error saving zone: ${err.message}`);
    } finally {
      setIsSavingZone(false);
    }
  };

  const zoneList = Object.values(zones);

  return (
    <div className="space-y-4 h-[calc(100vh-6.5rem)] flex flex-col w-full">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-purple-100/80 shadow-sm shrink-0 w-full">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 text-primary rounded-xl">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#180D2B] leading-tight flex items-center gap-2 font-serif">
              Live Fleet & Availability Zones
              <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-primary rounded-full font-sans">
                {zoneList.filter((z) => z.isActive).length} Active Zones
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {onlineCount} captains online • {inTripCount} active trips
            </p>
          </div>
        </div>

        {/* View Switchers & Zone Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Availability Zone Creator Trigger */}
          {markingMode === 'none' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsTypeSelectModalOpen(true)}
              leftIcon={<MapPin className="w-4 h-4" />}
              className="text-xs font-bold shadow-sm"
            >
              + Mark Zone on Map
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900 text-white p-1.5 rounded-xl text-xs">
              {markingMode === 'polygon' && (
                <>
                  <span className="font-bold text-pink-400 px-2">
                    {polygonPoints.length} Points
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUndoPoint}
                    disabled={polygonPoints.length === 0}
                    className="text-xs text-white hover:bg-slate-800 py-1 px-2.5 h-auto gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Undo
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleCompletePolygon}
                    disabled={polygonPoints.length < 3}
                    className="text-xs py-1 px-3 h-auto gap-1 font-bold"
                  >
                    <Check className="w-3.5 h-3.5" /> Complete Shape
                  </Button>
                </>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancelMarking}
                className="text-xs py-1 px-2.5 h-auto"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Vehicle Filters */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['all', 'bike', 'scooter', 'auto', 'cab_economy'].map((v) => (
              <button
                key={v}
                onClick={() => setVehicleFilter(v)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  vehicleFilter === v ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {v.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setOnlineOnly(!onlineOnly)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              onlineOnly
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${onlineOnly ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>Online Only</span>
          </button>
        </div>
      </div>

      {/* Main Map Container + Floating Overlay Drawers */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-sm w-full">
        <LiveFleetMap
          riders={visibleRiders}
          rides={rides}
          sosAlerts={sosAlerts}
          zones={zones}
          selectedRiderId={selectedRider?.id || selectedRider?.uid}
          onSelectRider={(rider) => setSelectedRider(rider)}
          markingMode={markingMode}
          polygonPoints={polygonPoints}
          onMapClick={handleMapClick}
          height="100%"
          zoom={12}
        />

        {/* Floating Availability Zones Drawer on Map */}
        <div className="absolute top-4 right-4 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-3.5 z-10 max-h-[calc(100%-2rem)] flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Service Coverage ({zoneList.length})
            </span>
            <button
              onClick={() => setIsTypeSelectModalOpen(true)}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              + Add Zone
            </button>
          </div>

          <div className="overflow-y-auto space-y-2 flex-1 pr-1">
            {zoneList.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No availability zones created. Click "+ Mark Zone on Map" to create a circular or custom multi-dot zone!
              </div>
            ) : (
              zoneList.map((zone) => (
                <div
                  key={zone.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/75 hover:bg-white transition-all text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      {zone.type === 'circle' ? (
                        <CircleDot className="w-3.5 h-3.5 text-primary shrink-0" />
                      ) : (
                        <Pentagon className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                      <span className="font-bold text-slate-900 truncate">{zone.name}</span>
                    </div>
                    <button
                      onClick={() => deleteZone(zone.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 shrink-0"
                      title="Delete Zone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {zone.type === 'circle' ? (
                        `Radius: ${zone.radiusKm} km`
                      ) : (
                        `Polygon: ${zone.points?.length || 0} vertices`
                      )}
                    </span>
                    {zone.surgeMultiplier > 1.0 && (
                      <span className="text-pink-600 font-bold bg-pink-50 px-1.5 py-0.2 rounded">
                        {zone.surgeMultiplier}x Surge
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                    <button
                      onClick={() => toggleZoneActive(zone.id, !zone.isActive)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                        zone.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {zone.isActive ? 'Active Area' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingZoneId(zone.id);
                        setZoneType(zone.type);
                        setZoneName(zone.name);
                        setZoneSurge(String(zone.surgeMultiplier));
                        if (zone.type === 'circle' && zone.center) {
                          setZoneLat(zone.center.latitude);
                          setZoneLng(zone.center.longitude);
                          setZoneRadius(String(zone.radiusKm || 2.5));
                        } else if (zone.points) {
                          setPolygonPoints(zone.points);
                        }
                        setIsZoneModalOpen(true);
                      }}
                      className="text-[11px] text-primary font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Rider Detail Flyout Card */}
        {selectedRider && (
          <div className="absolute top-4 left-4 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-5 z-20 animate-slide-in">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center font-bold text-primary text-base">
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
                  <h4 className="font-bold text-slate-900 text-sm">{selectedRider.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{Number(selectedRider.rating || 5.0).toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedRider(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-slate-900">{selectedRider.phone || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Vehicle Mode:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getVehicleDetails(selectedRider.vehicleType).bg}`}>
                  {getVehicleDetails(selectedRider.vehicleType).label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">License Plate:</span>
                <span className="font-mono font-bold text-slate-800">{selectedRider.vehicleNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Completed Rides:</span>
                <span className="font-bold text-slate-900">{selectedRider.totalRides || 0}</span>
              </div>
              {selectedRider.currentLocation?.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last GPS Ping:</span>
                  <span className="text-slate-600">{timeAgo(selectedRider.currentLocation.updatedAt)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant={selectedRider.isOnline ? 'danger' : 'success'}
                size="sm"
                className="w-full text-xs"
                onClick={async () => {
                  await toggleRiderOnline(selectedRider.id || selectedRider.uid, !selectedRider.isOnline);
                  setSelectedRider({ ...selectedRider, isOnline: !selectedRider.isOnline });
                }}
              >
                <Power className="w-3.5 h-3.5 mr-1.5" />
                {selectedRider.isOnline ? 'Force Offline' : 'Set Online'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Step 1: Choose Zone Type Modal */}
      <Modal
        isOpen={isTypeSelectModalOpen}
        onClose={() => setIsTypeSelectModalOpen(false)}
        title="Choose Zone Marking Method"
        description="Select how you want to mark and define the availability service zone on the map"
        size="md"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Circular Zone Option */}
          <div
            onClick={() => handleStartMarking('circle')}
            className="p-5 rounded-2xl border-2 border-slate-200 hover:border-primary hover:bg-purple-50/40 cursor-pointer transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CircleDot className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Circular Zone</h4>
            <p className="text-xs text-slate-500 mt-1">
              Click a single center pin on the map and set a coverage radius (in KM)
            </p>
            <span className="mt-4 text-xs font-bold text-primary group-hover:underline">
              Select Circular →
            </span>
          </div>

          {/* Multi-Dot Polygon Option */}
          <div
            onClick={() => handleStartMarking('polygon')}
            className="p-5 rounded-2xl border-2 border-slate-200 hover:border-primary hover:bg-purple-50/40 cursor-pointer transition-all flex flex-col items-center text-center group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Pentagon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Multi-Dot Polygon</h4>
            <p className="text-xs text-slate-500 mt-1">
              Click multiple boundary points on the map to draw a custom shape
            </p>
            <span className="mt-4 text-xs font-bold text-primary group-hover:underline">
              Draw Multi-Dot →
            </span>
          </div>
        </div>
      </Modal>

      {/* Step 2: Save / Edit Availability Zone Modal */}
      <Modal
        isOpen={isZoneModalOpen}
        onClose={() => {
          setIsZoneModalOpen(false);
          setPolygonPoints([]);
        }}
        title={editingZoneId ? "Edit Availability Zone" : `Save ${zoneType === 'circle' ? 'Circular' : 'Multi-Dot Polygon'} Zone`}
        description="All zones automatically blend into a single unified coverage area with standard Lady Pilot Purple branding"
      >
        <form onSubmit={handleSaveZone} className="space-y-4">
          <Input
            label="Zone Name / Area Identifier"
            placeholder="e.g. Indiranagar Safe Sector / CBD Corridor"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            required
          />

          {zoneType === 'circle' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Center Latitude"
                  type="number"
                  step="0.0001"
                  value={zoneLat}
                  onChange={(e) => setZoneLat(parseFloat(e.target.value))}
                  required
                />
                <Input
                  label="Center Longitude"
                  type="number"
                  step="0.0001"
                  value={zoneLng}
                  onChange={(e) => setZoneLng(parseFloat(e.target.value))}
                  required
                />
              </div>

              <Input
                label="Coverage Radius (KM)"
                type="number"
                step="0.5"
                min="0.5"
                max="25"
                value={zoneRadius}
                onChange={(e) => setZoneRadius(e.target.value)}
                helperText="Circular boundary radius"
                required
              />
            </>
          )}

          {zoneType === 'polygon' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-semibold text-slate-700 block">Polygon Boundary Vertices:</span>
              <span className="font-bold text-primary">
                {polygonPoints.length} Geofence boundary points recorded on map
              </span>
            </div>
          )}

          <Input
            label="Surge Multiplier (e.g. 1.2x)"
            type="number"
            step="0.1"
            min="1.0"
            max="3.0"
            value={zoneSurge}
            onChange={(e) => setZoneSurge(e.target.value)}
            helperText="1.0x = Standard pricing rate"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsZoneModalOpen(false);
                setPolygonPoints([]);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSavingZone}>
              {editingZoneId ? "Update Zone" : "Save & Blend Zone"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
