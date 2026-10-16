import React, { useState, useMemo } from 'react';
import { useFleetStore } from '../../stores/fleetStore';
import { Rider, ShiftSlot } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';
import dayjs from 'dayjs';

export const ShiftsPage: React.FC = () => {
  const { riders } = useFleetStore();

  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [shiftFilter, setShiftFilter] = useState<'all' | 'morning' | 'evening' | 'night'>('all');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [slotType, setSlotType] = useState('morning');

  // Simulated shift slot assignments from active riders
  const shifts = useMemo(() => {
    const list: ShiftSlot[] = [];
    const riderList = Object.values(riders);

    riderList.forEach((rider, idx) => {
      const shiftIndex = idx % 3;
      let slot = { startTime: '06:00', endTime: '14:00', name: 'Morning Shift' };
      if (shiftIndex === 1) slot = { startTime: '14:00', endTime: '22:00', name: 'Evening Shift' };
      if (shiftIndex === 2) slot = { startTime: '22:00', endTime: '06:00', name: 'Night Shift' };

      list.push({
        id: `shift_${rider.id || rider.uid}`,
        riderId: rider.id || rider.uid,
        riderName: rider.name,
        date: selectedDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: rider.isOnline ? 'active' : 'scheduled',
      });
    });

    return list;
  }, [riders, selectedDate]);

  const morningShifts = shifts.filter((s) => s.startTime === '06:00');
  const eveningShifts = shifts.filter((s) => s.startTime === '14:00');
  const nightShifts = shifts.filter((s) => s.startTime === '22:00');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Captain Shifts & Shift Scheduling
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage peak-hour shift assignments, hourly fleet coverage, and attendance tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="py-1.5 px-3 text-xs font-semibold w-40"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAssignModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Assign Shift Slot
          </Button>
        </div>
      </div>

      {/* Shift Slots Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Morning Slot */}
        <Card className="border-t-4 border-t-amber-400">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">Morning Peak</h3>
            </div>
            <Badge variant="warning">06:00 - 14:00</Badge>
          </div>
          <div className="py-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Scheduled Captains:</span>
              <span className="font-bold text-slate-900">{morningShifts.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Currently Active:</span>
              <span className="font-bold text-emerald-600">
                {morningShifts.filter((s) => s.status === 'active').length}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 max-h-48 overflow-y-auto space-y-1.5">
            {morningShifts.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-800">{s.riderName}</span>
                <Badge variant={s.status === 'active' ? 'success' : 'default'} dot>
                  {s.status === 'active' ? 'Logged In' : 'Scheduled'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Evening Slot */}
        <Card className="border-t-4 border-t-primary">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sunset className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-slate-900 text-sm">Evening Rush</h3>
            </div>
            <Badge variant="primary">14:00 - 22:00</Badge>
          </div>
          <div className="py-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Scheduled Captains:</span>
              <span className="font-bold text-slate-900">{eveningShifts.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Currently Active:</span>
              <span className="font-bold text-emerald-600">
                {eveningShifts.filter((s) => s.status === 'active').length}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 max-h-48 overflow-y-auto space-y-1.5">
            {eveningShifts.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-800">{s.riderName}</span>
                <Badge variant={s.status === 'active' ? 'success' : 'default'} dot>
                  {s.status === 'active' ? 'Logged In' : 'Scheduled'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Night Slot */}
        <Card className="border-t-4 border-t-indigo-600">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Night Safe Travel</h3>
            </div>
            <Badge variant="info">22:00 - 06:00</Badge>
          </div>
          <div className="py-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Scheduled Captains:</span>
              <span className="font-bold text-slate-900">{nightShifts.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Currently Active:</span>
              <span className="font-bold text-emerald-600">
                {nightShifts.filter((s) => s.status === 'active').length}
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 max-h-48 overflow-y-auto space-y-1.5">
            {nightShifts.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-800">{s.riderName}</span>
                <Badge variant={s.status === 'active' ? 'success' : 'default'} dot>
                  {s.status === 'active' ? 'Logged In' : 'Scheduled'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Assign Shift Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Captain Shift Slot"
        description="Allocate dedicated duty hours to maintain high fulfillment rates"
      >
        <div className="space-y-4">
          <Select
            label="Select Captain"
            value={selectedRiderId}
            onChange={(e) => setSelectedRiderId(e.target.value)}
          >
            <option value="">-- Choose Rider --</option>
            {Object.values(riders).map((r) => (
              <option key={r.id || r.uid} value={r.id || r.uid}>
                {r.name} ({r.vehicleType} • {r.vehicleNumber})
              </option>
            ))}
          </Select>

          <Select
            label="Shift Time Slot"
            value={slotType}
            onChange={(e) => setSlotType(e.target.value)}
          >
            <option value="morning">Morning Shift (06:00 - 14:00)</option>
            <option value="evening">Evening Rush (14:00 - 22:00)</option>
            <option value="night">Night Safe Shift (22:00 - 06:00)</option>
          </Select>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert('Shift assigned successfully!');
                setIsAssignModalOpen(false);
              }}
              disabled={!selectedRiderId}
            >
              Confirm Assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
