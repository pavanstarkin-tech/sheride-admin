import React, { useState, useMemo } from 'react';
import { useFleetStore } from '../../stores/fleetStore';
import { SOSAlert, SupportTicket } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  formatDateTime, 
  timeAgo 
} from '../../lib/utils';
import { 
  ShieldAlert, 
  ShieldCheck, 
  PhoneCall, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  HelpCircle, 
  User, 
  Clock, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';

export const SafetyPage: React.FC = () => {
  const { sosAlerts, supportTickets, config, resolveSosAlert } = useFleetStore();

  const [activeTab, setActiveTab] = useState<'sos' | 'tickets'>('sos');
  const [selectedSos, setSelectedSos] = useState<SOSAlert | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Active & Resolved SOS Alerts
  const activeAlerts = useMemo(() => {
    return Object.values(sosAlerts)
      .filter((s) => s.status === 'active')
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [sosAlerts]);

  const resolvedAlerts = useMemo(() => {
    return Object.values(sosAlerts)
      .filter((s) => s.status === 'resolved')
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [sosAlerts]);

  const handleResolveSos = async () => {
    if (!selectedSos) return;
    setIsProcessing(true);
    try {
      await resolveSosAlert(selectedSos.id, resolveNotes || 'Verified and resolved by safety response team.');
      setSelectedSos(null);
      setResolveNotes('');
    } catch (err: any) {
      alert(`Error resolving SOS: ${err.message}`);
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
            Safety & Emergency Mission Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time passenger & captain SOS emergency monitoring, ticket resolution, and dispatch
          </p>
        </div>

        {/* Emergency Dispatch Helpline */}
        <div className="flex items-center gap-3">
          <a
            href={`tel:${config?.policeEmergencyNumber || '112'}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/25 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Police (112)</span>
          </a>
          <a
            href={`tel:${config?.safetyHelpline || '8000123456'}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Safety Helpline</span>
          </a>
        </div>
      </div>

      {/* Active SOS High-Priority Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 shadow-xl shadow-rose-500/10 animate-pulse">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/30">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-rose-900 flex items-center gap-2">
                  🚨 {activeAlerts.length} EMERGENCY INCIDENT(S) IN PROGRESS
                </h3>
                <p className="text-xs text-rose-700 font-medium mt-1">
                  Immediate protocol required: Contact passenger and captain, confirm GPS location, alert emergency contacts.
                </p>
              </div>
            </div>

            <Button
              variant="danger"
              size="md"
              onClick={() => setSelectedSos(activeAlerts[0])}
              className="w-full md:w-auto font-bold uppercase tracking-wider text-xs"
            >
              Respond to Top Incident →
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('sos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>SOS Incidents ({activeAlerts.length} Active / {resolvedAlerts.length} Resolved)</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'tickets' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>Support Tickets ({Object.keys(supportTickets).length})</span>
        </button>
      </div>

      {/* SOS Tab View */}
      {activeTab === 'sos' && (
        <div className="space-y-6">
          {/* Active Incidents Queue */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              Active Urgent Incidents
            </h3>

            {activeAlerts.length === 0 ? (
              <Card className="p-8 text-center text-slate-500">
                <ShieldCheck className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
                <h4 className="font-bold text-slate-900 text-base">All Clear! No Active SOS Incidents</h4>
                <p className="text-xs text-slate-400 mt-1">All female passengers and captains are safe and verified.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAlerts.map((alert) => (
                  <Card key={alert.id} className="border-rose-200 bg-rose-50/20 shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="danger" dot>LIVE SOS EMERGENCY</Badge>
                        <span className="text-xs font-mono text-slate-500">#{alert.id.slice(-6)}</span>
                      </div>
                      <span className="text-xs text-rose-600 font-bold">{timeAgo(alert.timestamp)}</span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-rose-100">
                        <span className="text-slate-400 block mb-0.5">Passenger in distress:</span>
                        <div className="font-bold text-slate-900 text-sm">{alert.userName || 'Passenger'}</div>
                        <div className="text-slate-600 font-mono">{alert.userPhone || '—'}</div>
                      </div>

                      {alert.location && (
                        <div className="p-3 bg-white rounded-xl border border-rose-100 flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-400 block mb-0.5">GPS Location Coordinates:</span>
                            <div className="font-mono text-slate-900 font-semibold">
                              {alert.location.latitude.toFixed(5)}, {alert.location.longitude.toFixed(5)}
                            </div>
                            <a
                              href={`https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary font-semibold text-[11px] underline mt-1 inline-block"
                            >
                              Open in Google Maps →
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-end gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setSelectedSos(alert)}
                        className="text-xs"
                      >
                        Resolve & Mark Safe
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Resolved Incidents Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
              Resolved Incident History
            </h3>
            <Card className="p-0 overflow-hidden">
              {resolvedAlerts.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">No past incidents recorded.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                        <th className="py-3 px-6">Incident ID</th>
                        <th className="py-3 px-6">Passenger</th>
                        <th className="py-3 px-6">Time Triggered</th>
                        <th className="py-3 px-6">Resolved Time</th>
                        <th className="py-3 px-6">Resolution Notes</th>
                        <th className="py-3 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                      {resolvedAlerts.map((alert) => (
                        <tr key={alert.id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-6 font-mono font-bold">#{alert.id.slice(-6)}</td>
                          <td className="py-3.5 px-6 font-semibold text-slate-900">{alert.userName || 'Passenger'}</td>
                          <td className="py-3.5 px-6 text-slate-500">{formatDateTime(alert.timestamp)}</td>
                          <td className="py-3.5 px-6 text-slate-500">{formatDateTime(alert.resolvedAt)}</td>
                          <td className="py-3.5 px-6 text-slate-600 max-w-xs truncate">{alert.notes || 'Resolved'}</td>
                          <td className="py-3.5 px-6">
                            <Badge variant="success">Resolved</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Tickets Tab View */}
      {activeTab === 'tickets' && (
        <Card className="p-0 overflow-hidden">
          {Object.keys(supportTickets).length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40 text-blue-500" />
              <p className="text-base font-medium text-slate-700">No support tickets in queue</p>
              <p className="text-xs text-slate-400 mt-1">Inquiries from user & rider help centers will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-6">Ticket ID</th>
                    <th className="py-3 px-6">Subject / Category</th>
                    <th className="py-3 px-6">Sender</th>
                    <th className="py-3 px-6">Message Preview</th>
                    <th className="py-3 px-6">Created</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                  {Object.values(supportTickets).map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-6 font-mono font-bold">#{ticket.id.slice(-6)}</td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-900">{ticket.subject}</div>
                        <Badge variant="default" className="mt-0.5">{ticket.category || 'General'}</Badge>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-slate-900">{ticket.userName || 'User'}</div>
                        <div className="text-[11px] text-slate-400">{ticket.userPhone}</div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 max-w-sm truncate">{ticket.message}</td>
                      <td className="py-3.5 px-6 text-slate-500">{formatDateTime(ticket.createdAt)}</td>
                      <td className="py-3.5 px-6">
                        <Badge variant={ticket.status === 'resolved' ? 'success' : 'warning'}>
                          {ticket.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Resolve SOS Incident Modal */}
      <Modal
        isOpen={!!selectedSos}
        onClose={() => setSelectedSos(null)}
        title="Resolve SOS Emergency Alert"
        description={`Confirming safety for passenger ${selectedSos?.userName || ''}`}
      >
        <div className="space-y-4">
          <Input
            label="Resolution Protocol Notes"
            placeholder="e.g. Passenger reached out via phone, false alarm / Police dispatched and verified safe"
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setSelectedSos(null)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleResolveSos}
              isLoading={isProcessing}
            >
              Confirm Resolved & Close Alert
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
