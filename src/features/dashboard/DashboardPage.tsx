import React, { useMemo } from 'react';
import { useFleetStore } from '../../stores/fleetStore';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LiveFleetMap } from '../../components/maps/LiveFleetMap';
import { 
  formatCurrency, 
  formatTime, 
  formatDateTime, 
  getStatusBadge, 
  getVehicleDetails 
} from '../../lib/utils';
import { 
  Car, 
  Users, 
  TrendingUp, 
  Wallet, 
  ShieldAlert, 
  Clock, 
  ArrowUpRight,
  Sparkles,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

export const DashboardPage: React.FC = () => {
  const { rides, riders, sosAlerts, payouts } = useFleetStore();
  const navigate = useNavigate();

  // 1. KPI Calculations (Real-Time from RTDB)
  const kpiData = useMemo(() => {
    const rideList = Object.values(rides);
    const riderList = Object.values(riders);
    const now = dayjs();
    const startOfToday = now.startOf('day').valueOf();
    const startOfWeek = now.startOf('week').valueOf();

    let ridesToday = 0;
    let ridesThisWeek = 0;
    let revenueToday = 0;
    let totalRevenue = 0;
    let ongoingTrips = 0;

    rideList.forEach((ride) => {
      const created = ride.createdAt || 0;
      const fare = Number(ride.fare || ride.totalFare || 0);

      if (created >= startOfToday) {
        ridesToday++;
        if (ride.status === 'completed') {
          revenueToday += fare;
        }
      }

      if (created >= startOfWeek) {
        ridesThisWeek++;
      }

      if (ride.status === 'completed') {
        totalRevenue += fare;
      }

      if (ride.status === 'accepted' || ride.status === 'arriving' || ride.status === 'in_progress') {
        ongoingTrips++;
      }
    });

    const onlineRiders = riderList.filter((r) => r.isOnline).length;
    const pendingPayoutsCount = Object.values(payouts).filter((p) => p.status === 'pending').length;
    const activeSosCount = Object.values(sosAlerts).filter((s) => s.status === 'active').length;

    return {
      ridesToday,
      ridesThisWeek,
      totalRides: rideList.length,
      revenueToday,
      totalRevenue,
      onlineRiders,
      totalRiders: riderList.length,
      ongoingTrips,
      pendingPayoutsCount,
      activeSosCount,
    };
  }, [rides, riders, payouts, sosAlerts]);

  // 2. Rides Over Time (Hourly / Daily Trend)
  const ridesTrendData = useMemo(() => {
    const days: { [date: string]: { date: string; rides: number; revenue: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const d = dayjs().subtract(i, 'day').format('DD MMM');
      days[d] = { date: d, rides: 0, revenue: 0 };
    }

    Object.values(rides).forEach((ride) => {
      const d = dayjs(ride.createdAt || Date.now()).format('DD MMM');
      if (days[d]) {
        days[d].rides += 1;
        if (ride.status === 'completed') {
          days[d].revenue += Number(ride.fare || ride.totalFare || 0);
        }
      }
    });

    return Object.values(days);
  }, [rides]);

  // 3. Revenue by Vehicle Type Distribution
  const vehicleDistribution = useMemo(() => {
    const counts: Record<string, { name: string; value: number; color: string }> = {
      bike: { name: 'Bike', value: 0, color: '#7F00FD' },
      scooter: { name: 'Scooter', value: 0, color: '#A753FD' },
      auto: { name: 'Auto', value: 0, color: '#FFB001' },
      cab_economy: { name: 'Cab Economy', value: 0, color: '#10B981' },
      cab_premium: { name: 'Cab Premium', value: 0, color: '#5C00BC' },
    };

    Object.values(rides).forEach((ride) => {
      const v = (ride.vehicleType || 'bike').toLowerCase();
      if (counts[v]) {
        counts[v].value += 1;
      } else {
        counts.bike.value += 1;
      }
    });

    return Object.values(counts);
  }, [rides]);

  // 4. Rides by Hour of Day
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 12 }, (_, i) => {
      const h = (i * 2) % 24;
      return { hour: `${h}:00`, count: 0 };
    });

    Object.values(rides).forEach((ride) => {
      if (ride.createdAt) {
        const hour = dayjs(ride.createdAt).hour();
        const slot = Math.floor(hour / 2);
        if (hours[slot]) {
          hours[slot].count += 1;
        }
      }
    });

    return hours;
  }, [rides]);

  // 5. Recent Rides
  const recentRides = useMemo(() => {
    return Object.values(rides)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 6);
  }, [rides]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#180D2B] tracking-tight flex items-center gap-2 font-serif">
            Operations Dashboard
            <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-primary rounded-full font-sans">
              Live RTDB
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time fleet monitoring, booking volume, and financial performance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/live-map')}
            leftIcon={<MapPin className="w-4 h-4 text-primary" />}
          >
            Live Tracking
          </Button>
          <Button
            variant="golden"
            size="sm"
            onClick={() => navigate('/rides')}
            rightIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            Manage Rides
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Rides Today"
          value={kpiData.ridesToday}
          subtext={`${kpiData.ridesThisWeek} this week`}
          icon={<Car className="w-5 h-5 text-primary" />}
          iconBg="bg-purple-50"
        />

        <StatCard
          title="Active Riders"
          value={kpiData.onlineRiders}
          subtext={`of ${kpiData.totalRiders} total`}
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />

        <StatCard
          title="Ongoing Trips"
          value={kpiData.ongoingTrips}
          subtext="In real-time transit"
          icon={<Clock className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
          badge={
            kpiData.ongoingTrips > 0 ? (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            ) : undefined
          }
        />

        <StatCard
          title="Revenue Today"
          value={formatCurrency(kpiData.revenueToday)}
          subtext={`Total: ${formatCurrency(kpiData.totalRevenue)}`}
          icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50"
        />

        <StatCard
          title="Pending Payouts"
          value={kpiData.pendingPayoutsCount}
          subtext="Rider withdrawal requests"
          icon={<Wallet className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50"
        />

        <StatCard
          title="Active SOS"
          value={kpiData.activeSosCount}
          subtext="Emergency incidents"
          icon={<ShieldAlert className="w-5 h-5 text-rose-600" />}
          iconBg={kpiData.activeSosCount > 0 ? 'bg-rose-100 animate-pulse' : 'bg-rose-50'}
          className={kpiData.activeSosCount > 0 ? 'border-rose-300 ring-2 ring-rose-500/20' : ''}
        />
      </div>

      {/* Live Map Snippet & Fleet Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Live Fleet Radar
                </CardTitle>
                <CardDescription>
                  Real-time locations of verified women captains across the city
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/live-map')}
                className="text-xs text-primary"
              >
                Expand Fullscreen →
              </Button>
            </div>
            <LiveFleetMap
              riders={riders}
              rides={rides}
              sosAlerts={sosAlerts}
              height="340px"
              zoom={11}
            />
          </Card>
        </div>

        {/* Revenue by Vehicle Type */}
        <div>
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 mb-3">
                <div>
                  <CardTitle className="text-base">Vehicle Distribution</CardTitle>
                  <CardDescription>Booking volume by transport mode</CardDescription>
                </div>
              </CardHeader>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {vehicleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${val} rides`, 'Volume']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
              {vehicleDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate">{item.name}:</span>
                  <span className="font-bold text-slate-900 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Ride Volume & Revenue Trend */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base">7-Day Booking Volume</CardTitle>
              <CardDescription>Rides booked over the last week</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ridesTrendData}>
                <defs>
                  <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7F00FD" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#7F00FD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(127,0,253,0.08)' }}
                />
                <Area
                  type="monotone"
                  dataKey="rides"
                  name="Rides"
                  stroke="#7F00FD"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRides)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Peak Hours Histogram */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base">Peak Hours Distribution</CardTitle>
              <CardDescription>Rides requested throughout the day</CardDescription>
            </div>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(255,176,1,0.08)' }}
                />
                <Bar dataKey="count" name="Rides" fill="#FFB001" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Rides Live Feed Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              Recent Ride Activity
            </CardTitle>
            <CardDescription>Live incoming rides from passenger mobile app</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/rides')}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            View All Rides ({Object.keys(rides).length})
          </Button>
        </CardHeader>

        {recentRides.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No rides recorded yet. Live rides will appear here in real-time as users book trips.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-6">Ride ID</th>
                  <th className="py-3 px-6">Passenger</th>
                  <th className="py-3 px-6">Captain</th>
                  <th className="py-3 px-6">Vehicle</th>
                  <th className="py-3 px-6">Route</th>
                  <th className="py-3 px-6">Fare</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentRides.map((ride) => {
                  const statusInfo = getStatusBadge(ride.status);
                  const vehicleInfo = getVehicleDetails(ride.vehicleType);
                  return (
                    <tr key={ride.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-medium text-xs text-slate-900">
                        #{ride.id.slice(-6)}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-900">
                        {ride.userName || 'Passenger'}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">
                        {ride.riderName || <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${vehicleInfo.bg}`}>
                          {vehicleInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-600 max-w-xs truncate">
                        {ride.pickup?.name || ride.pickup?.address || 'Pickup'} → {ride.drop?.name || ride.drop?.address || 'Drop'}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        {formatCurrency(ride.fare || ride.totalFare)}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-400 whitespace-nowrap">
                        {formatTime(ride.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
