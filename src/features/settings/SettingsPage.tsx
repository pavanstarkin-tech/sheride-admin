import React, { useState } from 'react';
import { useFleetStore } from '../../stores/fleetStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { adminApi } from '../../lib/api';
import { formatDateTime } from '../../lib/utils';
import { 
  Settings, 
  ShieldCheck, 
  Car, 
  FileText, 
  Clock, 
  Save, 
  Sparkles,
  Phone,
  Layers 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { config, adminLogs, updateAppConfig } = useFleetStore();

  const [commissionRate, setCommissionRate] = useState(String(config?.commissionRate || 15));
  const [safetyHelpline, setSafetyHelpline] = useState(config?.safetyHelpline || '+91 8000 123 456');
  const [policeNumber, setPoliceNumber] = useState(config?.policeEmergencyNumber || '112');
  const [appVersionAndroid, setAppVersionAndroid] = useState(config?.appVersionAndroid || '1.0.0');
  const [appVersionIOS, setAppVersionIOS] = useState(config?.appVersionIOS || '1.0.0');

  // Base fare per vehicle
  const [bikeBase, setBikeBase] = useState(String(config?.baseFares?.bike?.baseFare || 30));
  const [bikePerKm, setBikePerKm] = useState(String(config?.baseFares?.bike?.perKmRate || 12));
  const [scooterBase, setScooterBase] = useState(String(config?.baseFares?.scooter?.baseFare || 25));
  const [scooterPerKm, setScooterPerKm] = useState(String(config?.baseFares?.scooter?.perKmRate || 10));
  const [autoBase, setAutoBase] = useState(String(config?.baseFares?.auto?.baseFare || 35));
  const [autoPerKm, setAutoPerKm] = useState(String(config?.baseFares?.auto?.perKmRate || 14));
  const [cabEcoBase, setCabEcoBase] = useState(String(config?.baseFares?.cab_economy?.baseFare || 60));
  const [cabEcoPerKm, setCabEcoPerKm] = useState(String(config?.baseFares?.cab_economy?.perKmRate || 18));
  const [cabPremBase, setCabPremBase] = useState(String(config?.baseFares?.cab_premium?.baseFare || 90));
  const [cabPremPerKm, setCabPremPerKm] = useState(String(config?.baseFares?.cab_premium?.perKmRate || 24));

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedFares = {
        bike: { baseFare: Number(bikeBase), perKmRate: Number(bikePerKm), perMinuteRate: 1.5, minimumFare: 40 },
        scooter: { baseFare: Number(scooterBase), perKmRate: Number(scooterPerKm), perMinuteRate: 1.2, minimumFare: 35 },
        auto: { baseFare: Number(autoBase), perKmRate: Number(autoPerKm), perMinuteRate: 1.8, minimumFare: 50 },
        cab_economy: { baseFare: Number(cabEcoBase), perKmRate: Number(cabEcoPerKm), perMinuteRate: 2.2, minimumFare: 80 },
        cab_premium: { baseFare: Number(cabPremBase), perKmRate: Number(cabPremPerKm), perMinuteRate: 3.0, minimumFare: 120 },
      };

      const newRate = Number(commissionRate);

      // Call API
      await adminApi.updateCommission(newRate, updatedFares);

      // Update RTDB
      await updateAppConfig({
        commissionRate: newRate,
        baseFares: updatedFares,
        safetyHelpline,
        policeEmergencyNumber: policeNumber,
        appVersionAndroid,
        appVersionIOS,
      });

      alert('Global platform settings updated successfully!');
    } catch (err: any) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const logsList = Object.values(adminLogs).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Platform Settings & Admin Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure vehicle base fares, commission splits, safety numbers, and inspect administrative logs
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Pricing & Base Fares Card */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" />
                Vehicle Base Fares & Distance Rates
              </CardTitle>
              <CardDescription>
                Live calculation formulas used by backend fare engine
              </CardDescription>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Bike */}
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
              <span className="text-xs font-bold text-primary uppercase">Lady Pilot Bike</span>
              <Input
                label="Base Fare (₹)"
                type="number"
                value={bikeBase}
                onChange={(e) => setBikeBase(e.target.value)}
              />
              <Input
                label="Per KM Rate (₹)"
                type="number"
                value={bikePerKm}
                onChange={(e) => setBikePerKm(e.target.value)}
              />
            </div>

            {/* Scooter */}
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
              <span className="text-xs font-bold text-purple-700 uppercase">Scooter EV</span>
              <Input
                label="Base Fare (₹)"
                type="number"
                value={scooterBase}
                onChange={(e) => setScooterBase(e.target.value)}
              />
              <Input
                label="Per KM Rate (₹)"
                type="number"
                value={scooterPerKm}
                onChange={(e) => setScooterPerKm(e.target.value)}
              />
            </div>

            {/* Auto */}
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-3">
              <span className="text-xs font-bold text-amber-800 uppercase">Auto 3-Wheeler</span>
              <Input
                label="Base Fare (₹)"
                type="number"
                value={autoBase}
                onChange={(e) => setAutoBase(e.target.value)}
              />
              <Input
                label="Per KM Rate (₹)"
                type="number"
                value={autoPerKm}
                onChange={(e) => setAutoPerKm(e.target.value)}
              />
            </div>

            {/* Cab Economy */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
              <span className="text-xs font-bold text-emerald-700 uppercase">Cab Economy</span>
              <Input
                label="Base Fare (₹)"
                type="number"
                value={cabEcoBase}
                onChange={(e) => setCabEcoBase(e.target.value)}
              />
              <Input
                label="Per KM Rate (₹)"
                type="number"
                value={cabEcoPerKm}
                onChange={(e) => setCabEcoPerKm(e.target.value)}
              />
            </div>

            {/* Cab Premium */}
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
              <span className="text-xs font-bold text-indigo-700 uppercase">Cab Premium</span>
              <Input
                label="Base Fare (₹)"
                type="number"
                value={cabPremBase}
                onChange={(e) => setCabPremBase(e.target.value)}
              />
              <Input
                label="Per KM Rate (₹)"
                type="number"
                value={cabPremPerKm}
                onChange={(e) => setCabPremPerKm(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Platform Commission & Emergency Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base">Commission & Platform Fee</CardTitle>
                <CardDescription>Percentage retained on every completed booking</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-3">
              <Input
                label="Platform Commission Rate (%)"
                type="number"
                min="0"
                max="50"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                helperText="Standard industry rate is 15-20%"
              />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base">Safety Helplines & Numbers</CardTitle>
                <CardDescription>Displayed across passenger and captain mobile apps</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-3">
              <Input
                label="Lady Pilot Safety Helpline Phone"
                value={safetyHelpline}
                onChange={(e) => setSafetyHelpline(e.target.value)}
              />
              <Input
                label="Emergency Police Number"
                value={policeNumber}
                onChange={(e) => setPoliceNumber(e.target.value)}
              />
            </div>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save All Platform Settings
          </Button>
        </div>
      </form>

      {/* Admin Audit Trail Logs */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Administrative Audit Logs
            </CardTitle>
            <CardDescription>
              Immutable action trail for KYC approvals, cancellations, wallet credits, and payouts
            </CardDescription>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {logsList.length} Total Events
          </span>
        </div>

        {logsList.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No audit records yet. All administrative actions will be automatically recorded here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-6">Action Event</th>
                  <th className="py-3 px-6">Target Record</th>
                  <th className="py-3 px-6">Metadata Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-mono">
                {logsList.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-6 text-slate-400 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-6">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-primary border border-purple-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-900 font-semibold">
                      {log.targetId || 'Platform'}
                    </td>
                    <td className="py-3 px-6 text-slate-500 max-w-sm truncate">
                      {JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
