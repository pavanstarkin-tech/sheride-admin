import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Car, 
  Users, 
  UserCheck, 
  Calendar, 
  Wallet, 
  ShieldAlert, 
  BarChart3, 
  Tag, 
  Settings, 
  Layers,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles
} from 'lucide-react';
import { useFleetStore } from '../../stores/fleetStore';
import { cn } from '../../lib/utils';

interface NavItem {
  name: string;
  to: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC<{ isCollapsed?: boolean; onToggle?: () => void }> = ({ 
  isCollapsed = false, 
  onToggle 
}) => {
  const { riders, sosAlerts, payouts } = useFleetStore();

  // Compute live badges
  const pendingApprovals = Object.values(riders).filter(
    (r) => !r.isVerified || r.verificationStatus === 'pending'
  ).length;

  const activeSos = Object.values(sosAlerts).filter((s) => s.status === 'active').length;
  const pendingPayouts = Object.values(payouts).filter((p) => p.status === 'pending').length;

  const navItems: NavItem[] = [
    { name: 'Dashboard', to: '/', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Live Fleet & Zones', to: '/live-map', icon: <MapPin className="w-5 h-5" /> },
    { name: 'Rides & Bookings', to: '/rides', icon: <Car className="w-5 h-5" /> },
    { 
      name: 'Riders & KYC', 
      to: '/riders', 
      icon: <UserCheck className="w-5 h-5" />,
      badge: pendingApprovals > 0 ? pendingApprovals : undefined,
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    { name: 'Users & Wallets', to: '/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Vehicles & Fleet', to: '/fleet', icon: <Layers className="w-5 h-5" /> },
    { name: 'Shifts & Slots', to: '/shifts', icon: <Calendar className="w-5 h-5" /> },
    { 
      name: 'Payouts', 
      to: '/payouts', 
      icon: <Wallet className="w-5 h-5" />,
      badge: pendingPayouts > 0 ? pendingPayouts : undefined,
      badgeColor: 'bg-amber-100 text-amber-900'
    },
    { 
      name: 'Safety & SOS', 
      to: '/safety', 
      icon: <ShieldAlert className="w-5 h-5" />,
      badge: activeSos > 0 ? activeSos : undefined,
      badgeColor: 'bg-rose-600 text-white animate-pulse'
    },
    { name: 'Analytics', to: '/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Offers & Promos', to: '/offers', icon: <Tag className="w-5 h-5" /> },
    { name: 'Settings & Logs', to: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside
      className={cn(
        'h-screen bg-white border-r border-purple-100/80 flex flex-col transition-all duration-300 select-none z-30 sticky top-0 shrink-0 shadow-xs',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header with Collapse Toggle */}
      <div className={cn(
        'h-16 flex items-center border-b border-purple-50 transition-all px-4',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          {isCollapsed ? (
            <img 
              src="/final-logo1-1.jpeg" 
              alt="Lady Pilot" 
              className="w-9 h-9 rounded-xl object-contain shadow-xs border border-purple-100" 
            />
          ) : (
            <div className="flex items-center gap-2">
              <img 
                src="/final-logo1-1.jpeg" 
                alt="Lady Pilot" 
                className="w-8 h-8 rounded-xl object-contain shadow-xs border border-purple-100 shrink-0" 
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-serif font-black text-lg text-golden leading-tight tracking-tight">Lady</span>
                  <span className="font-serif font-black text-lg text-primary leading-tight tracking-tight">pilot</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-purple-50 text-primary rounded-md border border-purple-200/60 ml-1">Admin</span>
                </div>
                <span className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-widest -mt-0.5">
                  Mission Control
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Header Toggle Button on Desktop */}
        {!isCollapsed && onToggle && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-purple-50 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={isCollapsed ? item.name : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative',
                isCollapsed ? 'justify-center py-3 px-0' : 'px-3.5 py-2.5 gap-3',
                isActive
                  ? 'bg-purple-50 text-primary font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('transition-colors shrink-0', isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary')}>
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <span className="flex-1 truncate text-xs">{item.name}</span>
                )}

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'font-bold rounded-full transition-all',
                      isCollapsed 
                        ? 'absolute top-1.5 right-1.5 w-2 h-2 p-0'
                        : 'text-xs px-2 py-0.5',
                      item.badgeColor
                    )}
                  >
                    {!isCollapsed && item.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Ecosystem Apps & Downloads Card */}
      {!isCollapsed && (
        <div className="mx-2.5 mb-3 p-2.5 bg-gradient-to-br from-purple-50/90 to-purple-100/50 rounded-2xl border border-purple-200/60 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-900 tracking-tight">Connected Ecosystem</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-lg border border-purple-100">
              <span className="font-semibold text-slate-700">Passenger</span>
              <div className="flex items-center gap-1.5">
                <a href="https://farmx.acheva.in/user/" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold text-[10.5px]">Web</a>
                <span className="text-slate-300">|</span>
                <a href="https://github.com/pavanstarkin-tech/sheride-user/releases/download/v1.0.0/SheRide_Passenger_Release.apk" target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline font-bold text-[10.5px]">APK</a>
              </div>
            </div>
            <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded-lg border border-purple-100">
              <span className="font-semibold text-slate-700">Captain</span>
              <div className="flex items-center gap-1.5">
                <a href="https://farmx.acheva.in/rider/" target="_blank" rel="noreferrer" className="text-amber-700 hover:underline font-bold text-[10.5px]">Web</a>
                <span className="text-slate-300">|</span>
                <a href="https://github.com/pavanstarkin-tech/sheride-rider/releases/download/v1.0.0/SheRide_Captain_Release.apk" target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline font-bold text-[10.5px]">APK</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Persistent Expand/Collapse Action */}
      <div className={cn(
        'p-3 border-t border-slate-100 bg-slate-50/50 flex items-center transition-all',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-700">Live Firebase</span>
          </div>
        )}

        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              'p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white border border-slate-200/60 shadow-xs transition-all flex items-center gap-2',
              isCollapsed && 'w-full justify-center'
            )}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-600">Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
