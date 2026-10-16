import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useFleetStore } from '../../stores/fleetStore';
import { 
  LogOut, 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  User, 
  Search, 
  Bell,
  Menu,
  Sparkles,
  ExternalLink,
  Download
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const { user, adminProfile, logout } = useAuthStore();
  const { isConnected, sosAlerts, rides, riders } = useFleetStore();
  const navigate = useNavigate();

  const activeSos = Object.values(sosAlerts).filter((s) => s.status === 'active');
  const onlineRidersCount = Object.values(riders).filter((r) => r.isOnline).length;
  const ongoingRidesCount = Object.values(rides).filter(
    (r) => r.status === 'accepted' || r.status === 'arriving' || r.status === 'in_progress'
  ).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3">
      {/* Top Banner for Active SOS Emergency Alerts */}
      {activeSos.length > 0 && (
        <div 
          onClick={() => navigate('/safety')}
          className="mb-2.5 -mt-1 px-4 py-2 bg-rose-600 text-white rounded-xl flex items-center justify-between text-xs font-bold cursor-pointer shadow-md shadow-rose-500/20 animate-pulse hover:bg-rose-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>CRITICAL ALERT: {activeSos.length} Active SOS Incident(s) in Progress! Click to Respond</span>
          </div>
          <span className="underline uppercase tracking-wider text-[11px]">View Safety Room →</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Real-Time Metrics Pills */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100/90 rounded-full text-xs font-semibold text-purple-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>{onlineRidersCount} Riders Online</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full text-xs font-semibold text-amber-900 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-golden" />
              <span>{ongoingRidesCount} Ongoing Trips</span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Quick Ecosystem Hub Links */}
          <div className="hidden xl:flex items-center gap-2">
            <a
              href="https://farmx.acheva.in/user/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors shadow-2xs"
              title="Open Live Passenger Web App"
            >
              <span>User Web</span>
              <ExternalLink className="w-3 h-3 text-purple-600" />
            </a>

            <a
              href="https://farmx.acheva.in/rider/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors shadow-2xs"
              title="Open Live Captain Web App"
            >
              <span>Rider Web</span>
              <ExternalLink className="w-3 h-3 text-amber-700" />
            </a>

            <a
              href="https://github.com/pavanstarkin-tech/sheride-user/releases/download/v1.0.0/Lady Pilot_Passenger_Release.apk"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors shadow-2xs"
              title="Download Passenger Android APK"
            >
              <Download className="w-3 h-3 text-emerald-600" />
              <span>User APK</span>
            </a>

            <a
              href="https://github.com/pavanstarkin-tech/sheride-rider/releases/download/v1.0.0/Lady Pilot_Captain_Release.apk"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors shadow-2xs"
              title="Download Captain Android APK"
            >
              <Download className="w-3 h-3 text-emerald-600" />
              <span>Rider APK</span>
            </a>
          </div>

          {/* RTDB Connection State Indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white border border-purple-100 px-3 py-1.5 rounded-full shadow-xs">
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-700 font-semibold text-[11px]">Live Firebase Sync</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-rose-600 font-semibold text-[11px]">Connecting...</span>
              </>
            )}
          </div>

          {/* Admin User Info & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-purple-100">
            <div className="hidden lg:block text-right">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {adminProfile?.displayName || user?.email?.split('@')[0] || 'Admin'}
              </div>
              <div className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                {adminProfile?.role?.replace('_', ' ') || 'Super Admin'}
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-primary font-bold text-sm shadow-xs">
              {adminProfile?.displayName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'A'}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
