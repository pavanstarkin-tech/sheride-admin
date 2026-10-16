import React, { useState, useMemo } from 'react';
import { useFleetStore } from '../../stores/fleetStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { formatCurrency, getVehicleDetails } from '../../lib/utils';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Car, 
  ShieldAlert, 
  Star, 
  CheckCircle2, 
  Calendar,
  Sparkles 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import dayjs from 'dayjs';

export const AnalyticsPage: React.FC = () => {
  const { rides, riders, sosAlerts } = useFleetStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  // Daily Trends
  const trendData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 60;
    const map: { [key: string]: { date: string; rides: number; revenue: number; cancelled: number } } = {};

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = dayjs().subtract(i, 'day').format('DD MMM');
      map[d] = { date: d, rides: 0, revenue: 0, cancelled: 0 };
    }

    Object.values(rides).forEach((ride) => {
      const d = dayjs(ride.createdAt || Date.now()).format('DD MMM');
      if (map[d]) {
        map[d].rides += 1;
        if (ride.status === 'completed') {
          map[d].revenue += Number(ride.fare || ride.totalFare || 0);
        } else if (ride.status === 'cancelled') {
          map[d].cancelled += 1;
        }
      }
    });

    return Object.values(map);
  }, [rides, timeRange]);

  // Vehicle Breakdown
  const vehicleStats = useMemo(() => {
    const counts: Record<string, { name: string; rides: number; revenue: number; color: string }> = {
      bike: { name: 'Bike', rides: 0, revenue: 0, color: '#E91E63' },
      scooter: { name: 'Scooter', rides: 0, revenue: 0, color: '#9C27B0' },
      auto: { name: 'Auto', rides: 0, revenue: 0, color: '#EAB308' },
      cab_economy: { name: 'Cab Economy', rides: 0, revenue: 0, color: '#10B981' },
      cab_premium: { name: 'Cab Premium', rides: 0, revenue: 0, color: '#6366F1' },
    };

    Object.values(rides).forEach((ride) => {
      const v = (ride.vehicleType || 'bike').toLowerCase();
      if (counts[v]) {
        counts[v].rides += 1;
        if (ride.status === 'completed') {
          counts[v].revenue += Number(ride.fare || ride.totalFare || 0);
        }
      }
    });

    return Object.values(counts);
  }, [rides]);

  // Rider Leaderboard
  const topRiders = useMemo(() => {
    return Object.values(riders)
      .sort((a, b) => (b.totalRides || 0) - (a.totalRides || 0))
      .slice(0, 5);
  }, [riders]);

  // Export CSV functionality
  const handleExportCSV = () => {
    const rows = [
      ['Ride ID', 'User Name', 'Captain Name', 'Vehicle', 'Fare', 'Status', 'Date'],
      ...Object.values(rides).map((r) => [
        r.id,
        r.userName || '',
        r.riderName || '',
        r.vehicleType,
        r.fare || r.totalFare || 0,
        r.status,
        dayjs(r.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sheride_analytics_${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Platform Analytics & Executive Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyze ride conversion funnels, captain leaderboards, revenue yield, and safety compliance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="py-1.5 px-3 text-xs font-semibold w-36"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time History</option>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4 text-primary" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Primary Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Growth Trend */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base">Revenue Yield Over Time</CardTitle>
              <CardDescription>Daily gross completed booking volume</CardDescription>
            </div>
          </CardHeader>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C2185B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C2185B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C2185B"
                  strokeWidth={2.5}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Trips Completed vs Cancelled */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base">Trip Completion vs Cancellation</CardTitle>
              <CardDescription>Fulfillment efficiency breakdown</CardDescription>
            </div>
          </CardHeader>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9' }} />
                <Bar dataKey="rides" name="Completed" fill="#E91E63" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Leaderboard & Vehicle Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Captains Leaderboard */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                Top Captains Leaderboard
              </CardTitle>
              <CardDescription>Highest ride completion and earnings</CardDescription>
            </div>
          </CardHeader>

          <div className="divide-y divide-slate-100">
            {topRiders.map((rider, index) => (
              <div key={rider.id || rider.uid} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 font-bold flex items-center justify-center text-slate-700">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{rider.name}</div>
                    <div className="text-slate-400 font-mono">{rider.vehicleNumber} • {rider.vehicleType}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-slate-900">{rider.totalRides || 0} rides</div>
                  <div className="text-emerald-600 font-semibold">{formatCurrency(rider.totalEarnings || 0)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Vehicle Performance Breakdown */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-base">Revenue by Vehicle Category</CardTitle>
              <CardDescription>Aggregate contribution across fleet classes</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-3">
            {vehicleStats.map((v) => (
              <div key={v.name} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: v.color }} />
                  <div>
                    <span className="font-bold text-slate-800">{v.name}</span>
                    <span className="text-slate-400 ml-2">({v.rides} rides)</span>
                  </div>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(v.revenue)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
