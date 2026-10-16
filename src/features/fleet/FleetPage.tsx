import React, { useState, useMemo } from 'react';
import { useFleetStore, DEFAULT_VEHICLE_TYPES } from '../../stores/fleetStore';
import type { CustomVehicleType, VehicleCategory } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency } from '../../lib/utils';
import { 
  Layers, 
  Car, 
  Bike, 
  Zap, 
  BatteryCharging, 
  Sparkles, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  Power, 
  Users, 
  ShieldCheck, 
  Gauge, 
  DollarSign, 
  Clock, 
  MapPin, 
  Image as ImageIcon 
} from 'lucide-react';

const PRESET_ILLUSTRATIVE_ASSETS = [
  {
    name: '⚡ Lady Pilot Purple EV Scooter',
    url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    category: 'scooter',
    color: '#7F00FD',
  },
  {
    name: '⚡ Ather / Ola Speed EV Bike',
    url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
    category: 'bike',
    color: '#9C27B0',
  },
  {
    name: '🛺 Mahindra Treo EV Auto',
    url: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=600&auto=format&fit=crop&q=80',
    category: 'auto',
    color: '#EAB308',
  },
  {
    name: '🚗 Tata Tiago EV Cab Economy',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
    category: 'cab',
    color: '#10B981',
  },
  {
    name: '✨ MG ZS Luxury EV SUV',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
    category: 'cab',
    color: '#6366F1',
  },
  {
    name: '🔋 Mobile EV Rapid Charging Van',
    url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80',
    category: 'ev_charging',
    color: '#06B6D4',
  },
];

export const FleetPage: React.FC = () => {
  const { 
    vehicleTypes, 
    riders, 
    rides, 
    saveVehicleType, 
    deleteVehicleType, 
    toggleVehicleTypeActive 
  } = useFleetStore();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<VehicleCategory>('scooter');
  const [formTagline, setFormTagline] = useState('');
  const [formIsElectric, setFormIsElectric] = useState(true);
  const [formBadge, setFormBadge] = useState('⚡ 100% Electric');
  const [formBaseFare, setFormBaseFare] = useState('30');
  const [formPerKmRate, setFormPerKmRate] = useState('12');
  const [formPerMinuteRate, setFormPerMinuteRate] = useState('1.5');
  const [formMinimumFare, setFormMinimumFare] = useState('40');
  const [formCapacity, setFormCapacity] = useState('1');
  const [formColor, setFormColor] = useState('#E91E63');
  const [formImageUrl, setFormImageUrl] = useState(PRESET_ILLUSTRATIVE_ASSETS[0].url);
  const [isSaving, setIsSaving] = useState(false);

  const vehicleList = useMemo(() => {
    const list = Object.values(vehicleTypes || DEFAULT_VEHICLE_TYPES);
    if (categoryFilter === 'all') return list;
    if (categoryFilter === 'electric') return list.filter((v) => v.isElectric);
    return list.filter((v) => v.category === categoryFilter);
  }, [vehicleTypes, categoryFilter]);

  // Compute live stats per vehicle
  const fleetStats = useMemo(() => {
    const stats: Record<string, { totalRiders: number; onlineRiders: number; completedTrips: number; revenue: number }> = {};
    
    Object.values(vehicleTypes || DEFAULT_VEHICLE_TYPES).forEach((v) => {
      stats[v.id] = { totalRiders: 0, onlineRiders: 0, completedTrips: 0, revenue: 0 };
    });

    Object.values(riders).forEach((rider) => {
      const vId = rider.vehicleType || 'ev_scooter';
      if (!stats[vId]) {
        stats[vId] = { totalRiders: 0, onlineRiders: 0, completedTrips: 0, revenue: 0 };
      }
      stats[vId].totalRiders += 1;
      if (rider.isOnline) stats[vId].onlineRiders += 1;
    });

    Object.values(rides).forEach((ride) => {
      const vId = ride.vehicleType || 'ev_scooter';
      if (stats[vId] && ride.status === 'completed') {
        stats[vId].completedTrips += 1;
        stats[vId].revenue += Number(ride.fare || ride.totalFare || 0);
      }
    });

    return stats;
  }, [vehicleTypes, riders, rides]);

  const openAddModal = () => {
    setEditingId(null);
    setFormId(`custom_ev_${Date.now()}`);
    setFormName('');
    setFormCategory('scooter');
    setFormTagline('');
    setFormIsElectric(true);
    setFormBadge('⚡ 100% Electric');
    setFormBaseFare('30');
    setFormPerKmRate('12');
    setFormPerMinuteRate('1.5');
    setFormMinimumFare('40');
    setFormCapacity('1');
    setFormColor('#E91E63');
    setFormImageUrl(PRESET_ILLUSTRATIVE_ASSETS[0].url);
    setIsModalOpen(true);
  };

  const openEditModal = (v: CustomVehicleType) => {
    setEditingId(v.id);
    setFormId(v.id);
    setFormName(v.name);
    setFormCategory(v.category || 'scooter');
    setFormTagline(v.tagline || '');
    setFormIsElectric(v.isElectric !== undefined ? v.isElectric : true);
    setFormBadge(v.badge || '⚡ 100% Electric');
    setFormBaseFare(String(v.baseFare || 30));
    setFormPerKmRate(String(v.perKmRate || 12));
    setFormPerMinuteRate(String(v.perMinuteRate || 1.5));
    setFormMinimumFare(String(v.minimumFare || 40));
    setFormCapacity(String(v.capacity || 1));
    setFormColor(v.color || '#E91E63');
    setFormImageUrl(v.imageUrl || PRESET_ILLUSTRATIVE_ASSETS[0].url);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a vehicle name');
      return;
    }

    setIsSaving(true);
    try {
      const vehiclePayload: CustomVehicleType = {
        id: editingId || (formId.trim().toLowerCase().replace(/\s+/g, '_') || `vehicle_${Date.now()}`),
        name: formName.trim(),
        category: formCategory,
        tagline: formTagline.trim() || 'Women-Driven Safe Commute',
        isElectric: formIsElectric,
        badge: formBadge.trim(),
        baseFare: parseFloat(formBaseFare) || 30,
        perKmRate: parseFloat(formPerKmRate) || 12,
        perMinuteRate: parseFloat(formPerMinuteRate) || 1.5,
        minimumFare: parseFloat(formMinimumFare) || 40,
        capacity: parseInt(formCapacity, 10) || 1,
        color: formColor || '#E91E63',
        imageUrl: formImageUrl || PRESET_ILLUSTRATIVE_ASSETS[0].url,
        icon: formCategory === 'cab' ? 'Car' : formCategory === 'ev_charging' ? 'Zap' : 'Bike',
        isActive: true,
        displayOrder: 1,
        createdAt: Date.now(),
      };

      await saveVehicleType(vehiclePayload);
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Failed to save vehicle: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from active fleet categories?`)) {
      await deleteVehicleType(id);
    }
  };

  const totalCaptains = Object.values(riders).length;
  const totalOnline = Object.values(riders).filter((r) => r.isOnline).length;
  const totalCompletedRevenue = Object.values(rides)
    .filter((r) => r.status === 'completed')
    .reduce((acc, r) => acc + Number(r.fare || 0), 0);

  return (
    <div className="space-y-6 w-full">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-purple-100/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 text-primary rounded-xl">
              <Layers className="w-6 h-6" />
            </span>
            <h1 className="text-xl font-extrabold text-[#180D2B] tracking-tight font-serif">
              Vehicle Fleet & Custom EV Catalog
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure dynamic vehicle types, EV charging vans, custom illustrative artworks & real-time booking pricing.
          </p>
        </div>

        <Button
          variant="golden"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-md shadow-amber-500/20 font-bold text-xs"
        >
          + Add Custom Vehicle / EV Model
        </Button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-purple-100/60 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-primary flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{Object.keys(vehicleTypes || {}).length}</div>
            <div className="text-xs text-slate-500 font-medium">Active Fleet Models</div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">
              {Object.values(vehicleTypes || {}).filter((v) => v.isElectric).length}
            </div>
            <div className="text-xs text-slate-500 font-medium">100% Electric (EV) Fleet</div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {totalOnline} <span className="text-xs font-semibold text-slate-400">/ {totalCaptains}</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Captains Online Now</div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-100 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{formatCurrency(totalCompletedRevenue)}</div>
            <div className="text-xs text-slate-500 font-medium">Fleet Trips Revenue</div>
          </div>
        </Card>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-xs">
        {[
          { id: 'all', label: 'All Fleet Models' },
          { id: 'electric', label: '⚡ 100% EV Models' },
          { id: 'scooter', label: '🛵 EV Scooters' },
          { id: 'bike', label: '⚡ EV Bikes' },
          { id: 'auto', label: '🛺 EV Autos' },
          { id: 'cab', label: '🚗 EV Cabs & SUVs' },
          { id: 'ev_charging', label: '🔋 Mobile EV Chargers' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              categoryFilter === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Vehicle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicleList.map((v) => {
          const stats = fleetStats[v.id] || { totalRiders: 0, onlineRiders: 0, completedTrips: 0, revenue: 0 };
          return (
            <Card
              key={v.id}
              className={`overflow-hidden border transition-all hover:shadow-lg ${
                v.isActive ? 'border-slate-200/80 bg-white' : 'border-slate-200 bg-slate-50/70 opacity-75'
              }`}
            >
              {/* Illustrative Vehicle Image Banner with Overlay Badges */}
              <div className="relative h-44 w-full bg-gradient-to-br from-slate-100 to-purple-50/40 overflow-hidden flex items-center justify-center p-3">
                <img
                  src={v.imageUrl}
                  alt={v.name}
                  className="w-full h-full object-contain drop-shadow-md transform group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to illustrative placeholder
                    (e.target as HTMLImageElement).src = PRESET_ILLUSTRATIVE_ASSETS[0].url;
                  }}
                />

                {/* Badges Top Left & Right */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {v.isElectric && (
                    <span className="bg-emerald-600/90 backdrop-blur-md text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current" />
                      {v.badge || '100% Electric'}
                    </span>
                  )}
                  {v.category === 'ev_charging' && (
                    <span className="bg-cyan-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <BatteryCharging className="w-3 h-3" />
                      Mobile SOS Charging
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${
                      v.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {v.isActive ? '● Live Booking' : '○ Disabled'}
                  </span>
                </div>

                {/* Capacity Pill Bottom Right */}
                <div className="absolute bottom-2 right-3 bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm border border-slate-100 flex items-center gap-1">
                  <Users className="w-3 h-3 text-primary" />
                  {v.category === 'ev_charging' ? `${v.capacity} Charging Guns` : `${v.capacity} Seats`}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">{v.name}</h3>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {v.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{v.tagline}</p>
                </div>

                {/* Live Real-time Fleet Allocation Stats */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{stats.onlineRiders} <span className="text-[10px] font-normal text-slate-400">/ {stats.totalRiders}</span></div>
                    <div className="text-[10px] text-slate-500 font-medium">Online Fleet</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{stats.completedTrips}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Trips Done</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-600">{formatCurrency(stats.revenue)}</div>
                    <div className="text-[10px] text-slate-500 font-medium">Revenue</div>
                  </div>
                </div>

                {/* Fare Model Details */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Base Fare & Min:</span>
                    <span className="font-bold text-slate-900">
                      ₹{v.baseFare} <span className="text-[10px] font-normal text-slate-400">(Min ₹{v.minimumFare})</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Per Km Rate:</span>
                    <span className="font-bold text-slate-900">₹{v.perKmRate} / km</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Per Minute Rate:</span>
                    <span className="font-bold text-slate-900">₹{v.perMinuteRate} / min</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => toggleVehicleTypeActive(v.id, !v.isActive)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                      v.isActive
                        ? 'text-amber-700 hover:bg-amber-50'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {v.isActive ? 'Disable' : 'Enable'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(v)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      className="text-xs text-slate-700 hover:text-primary py-1 px-2 h-auto"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(v.id, v.name)}
                      className="text-xs text-rose-600 hover:bg-rose-50 py-1 px-2 h-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Custom Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Vehicle / EV Model' : 'Add Custom Vehicle / EV Model'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vehicle Display Name *
              </label>
              <Input
                placeholder="e.g. Lady Pilot Pink EV Scooter"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vehicle Slug ID *
              </label>
              <Input
                placeholder="e.g. ev_scooter_pink"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                disabled={!!editingId}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <Select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as VehicleCategory)}
                options={[
                  { value: 'scooter', label: '🛵 Electric Scooter' },
                  { value: 'bike', label: '⚡ Electric Bike' },
                  { value: 'auto', label: '🛺 EV Auto Rickshaw' },
                  { value: 'cab', label: '🚗 EV Cab / SUV' },
                  { value: 'ev_charging', label: '🔋 Mobile EV Rapid Charger Van' },
                  { value: 'special', label: '✨ Special Fleet Service' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Capacity ({formCategory === 'ev_charging' ? 'Charging Guns' : 'Passenger Seats'})
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formCapacity}
                onChange={(e) => setFormCapacity(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tagline (Displayed on User Booking Sheet)
              </label>
              <Input
                placeholder="e.g. Fastest commute with certified women captains"
                value={formTagline}
                onChange={(e) => setFormTagline(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Promotional Badge
              </label>
              <Input
                placeholder="e.g. ⚡ 100% Electric"
                value={formBadge}
                onChange={(e) => setFormBadge(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsElectric}
                  onChange={(e) => setFormIsElectric(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-3 text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  100% Electric Vehicle (EV)
                </span>
              </label>
            </div>
          </div>

          {/* Pricing Model Section */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              Dynamic Booking Fare Model
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Base Fare (₹)</label>
                <Input
                  type="number"
                  value={formBaseFare}
                  onChange={(e) => setFormBaseFare(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Per Km (₹)</label>
                <Input
                  type="number"
                  step="0.5"
                  value={formPerKmRate}
                  onChange={(e) => setFormPerKmRate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Per Min (₹)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formPerMinuteRate}
                  onChange={(e) => setFormPerMinuteRate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Min Fare (₹)</label>
                <Input
                  type="number"
                  value={formMinimumFare}
                  onChange={(e) => setFormMinimumFare(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Illustrative Vehicle Image Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Illustrative Vehicle Image Artwork *</span>
              <span className="text-[11px] text-slate-400 font-normal">Shown to passengers during booking</span>
            </label>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_ILLUSTRATIVE_ASSETS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setFormImageUrl(preset.url);
                    setFormColor(preset.color);
                  }}
                  className={`cursor-pointer rounded-xl border-2 p-1 text-center transition-all ${
                    formImageUrl === preset.url
                      ? 'border-primary ring-2 ring-purple-500/20 bg-purple-50/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-12 object-contain rounded-lg mb-1" />
                  <div className="text-[10px] font-bold text-slate-700 truncate">{preset.name}</div>
                </div>
              ))}
            </div>

            <div className="mt-2">
              <Input
                placeholder="Or paste custom image URL (PNG/SVG/WebP)"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="golden"
              disabled={isSaving}
              className="font-bold shadow-md shadow-amber-500/20"
            >
              {isSaving ? 'Saving...' : editingId ? 'Save Changes' : '+ Add Vehicle to Fleet'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
