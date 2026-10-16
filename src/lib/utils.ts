import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { VehicleType, RideStatus } from '../types';

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(timestamp?: number | string | null): string {
  if (!timestamp) return '—';
  const num = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
  return dayjs(num).format('DD MMM YYYY, hh:mm A');
}

export function formatDate(timestamp?: number | string | null): string {
  if (!timestamp) return '—';
  const num = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
  return dayjs(num).format('DD MMM YYYY');
}

export function formatTime(timestamp?: number | string | null): string {
  if (!timestamp) return '—';
  const num = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
  return dayjs(num).format('hh:mm A');
}

export function timeAgo(timestamp?: number | string | null): string {
  if (!timestamp) return '—';
  const num = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
  return dayjs(num).fromNow();
}

export function getStatusBadge(status?: RideStatus | string) {
  switch (status) {
    case 'completed':
      return { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'in_progress':
      return { label: 'In Ride', bg: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' };
    case 'accepted':
    case 'arriving':
      return { label: 'Arriving', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'requested':
      return { label: 'Matching', bg: 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse' };
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'approved':
      return { label: 'Verified', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'pending':
      return { label: 'Pending Review', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'rejected':
      return { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    default:
      return { label: status || 'Unknown', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
}

export function getVehicleDetails(type?: VehicleType | string) {
  const t = type?.toLowerCase() || '';
  if (t === 'scooty') return { label: 'Scooty', color: '#7F00FD', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
  if (t.includes('electric_scooty') || t.includes('ev_scoot')) return { label: 'Electric Scooty', color: '#10B981', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (t === 'priority_bike') return { label: 'Priority Bike', color: '#7F00FD', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
  if (t === 'bike') return { label: 'Bike', color: '#6E00DE', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
  if (t === 'priority_auto') return { label: 'Priority Auto', color: '#FFB001', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
  if (t === 'premium_auto') return { label: 'Premium Auto', color: '#E69E00', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
  if (t === 'auto') return { label: 'Auto', color: '#FFB001', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
  if (t.includes('ev_car') || t.includes('ev_cab')) return { label: 'EV Car', color: '#059669', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (t.includes('premium_car') || t.includes('lux_cab')) return { label: 'Premium Car', color: '#5C00BC', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
  if (t.includes('mini_car') || t.includes('cab')) return { label: 'Mini Car', color: '#06B6D4', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
  return { label: type || 'Bike', color: '#7F00FD', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
}
