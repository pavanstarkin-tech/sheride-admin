import React, { useState, useMemo } from 'react';
import { useFleetStore } from '../../stores/fleetStore';
import { User, Ride } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  formatCurrency, 
  formatDate, 
  formatTime, 
  getStatusBadge 
} from '../../lib/utils';
import { 
  Users, 
  Search, 
  Eye, 
  Wallet, 
  Ban, 
  Unlock, 
  Phone, 
  ShieldCheck, 
  Heart, 
  Plus, 
  Minus,
  Sparkles 
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { users, rides, toggleUserBlock, adjustUserWallet } = useFleetStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [walletModalUser, setWalletModalUser] = useState<User | null>(null);
  const [walletAmount, setWalletAmount] = useState<string>('');
  const [walletAction, setWalletAction] = useState<'credit' | 'debit'>('credit');
  const [walletReason, setWalletReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter users
  const filteredUsers = useMemo(() => {
    return Object.values(users)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .filter((user) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const matchesName = user.name?.toLowerCase().includes(q);
        const matchesPhone = user.phone?.toLowerCase().includes(q);
        const matchesEmail = user.email?.toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesEmail;
      });
  }, [users, searchQuery]);

  // User's ride history
  const userRides = useMemo(() => {
    if (!selectedUser) return [];
    return Object.values(rides)
      .filter((r) => r.userId === selectedUser.id || r.userId === selectedUser.uid)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [selectedUser, rides]);

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletModalUser || !walletAmount) return;
    const num = parseFloat(walletAmount);
    if (isNaN(num) || num <= 0) return;

    setIsSubmitting(true);
    try {
      const change = walletAction === 'credit' ? num : -num;
      await adjustUserWallet(walletModalUser.id || walletModalUser.uid, change, walletReason || 'Admin Manual Adjustment');
      setWalletModalUser(null);
      setWalletAmount('');
      setWalletReason('');
    } catch (err: any) {
      alert(`Wallet error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Passenger Users & Wallets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit female passenger accounts, balance credits, emergency contacts, and ride records
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by passenger name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="py-1.5 text-xs"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Total Users: <span className="text-slate-900 font-bold">{Object.keys(users).length}</span>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40 text-primary" />
            <p className="text-base font-medium text-slate-700">No users found</p>
            <p className="text-xs text-slate-400 mt-1">Registered mobile passengers will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-purple-100/80 bg-purple-50/30 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">User Profile</th>
                  <th className="py-3.5 px-6">Phone Number</th>
                  <th className="py-3.5 px-6">Wallet Balance</th>
                  <th className="py-3.5 px-6">Total Rides</th>
                  <th className="py-3.5 px-6">Emergency SOS Contacts</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50/80 text-slate-700">
                {filteredUsers.map((user) => {
                  const isBlocked = user.isBlocked;
                  const contactsCount = user.emergencyContacts?.length || 0;

                  return (
                    <tr key={user.id || user.uid} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-xs">{user.name || 'Passenger'}</div>
                            <div className="text-[11px] text-slate-400">{user.email || '—'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-800 text-xs">
                        {user.phone || '—'}
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-xs">
                          {formatCurrency(user.walletBalance || 0)}
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-700 text-xs">
                        {user.totalRides || 0} rides
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-100" />
                          <span>{contactsCount} contact(s)</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {isBlocked ? (
                          <Badge variant="danger">Blocked</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setWalletModalUser(user)}
                            className="p-1.5 text-xs text-primary hover:text-primary-700"
                            title="Adjust Wallet Balance"
                          >
                            <Wallet className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            className="p-1.5 text-xs text-slate-600"
                            title="View Full Profile & Ride History"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant={isBlocked ? 'success' : 'ghost'}
                            size="sm"
                            onClick={() => toggleUserBlock(user.id || user.uid, !isBlocked)}
                            className={`p-1.5 ${isBlocked ? 'text-white' : 'text-slate-400 hover:text-rose-600'}`}
                            title={isBlocked ? 'Unblock User' : 'Block User'}
                          >
                            {isBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* User Details & History Drawer / Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.name || 'User Profile'}
        description={`UID: ${selectedUser?.id || selectedUser?.uid}`}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Wallet Balance</span>
                <span className="text-lg font-black text-slate-900">
                  {formatCurrency(selectedUser.walletBalance || 0)}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Phone Number</span>
                <span className="text-sm font-bold text-slate-900">{selectedUser.phone || '—'}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-400 font-semibold block mb-1">Total Trips</span>
                <span className="text-lg font-black text-slate-900">{userRides.length}</span>
              </div>
            </div>

            {/* Emergency Contacts List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                Emergency SOS Contacts ({selectedUser.emergencyContacts?.length || 0})
              </h4>
              {selectedUser.emergencyContacts && selectedUser.emergencyContacts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedUser.emergencyContacts.map((contact, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{contact.name}</div>
                        <div className="text-slate-500 font-mono">{contact.phone}</div>
                      </div>
                      <Badge variant="primary">{contact.relationship || 'Emergency'}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-400 text-center">
                  No emergency contacts configured by this user yet.
                </div>
              )}
            </div>

            {/* Ride History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Recent Ride History ({userRides.length})
              </h4>
              {userRides.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400 text-center">
                  No rides booked by this user yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {userRides.slice(0, 10).map((ride) => (
                    <div key={ride.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-800">
                          #{ride.id.slice(-6)} • {ride.pickup?.name || 'Pickup'} → {ride.drop?.name || 'Drop'}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {formatDate(ride.createdAt)} • Captain: {ride.riderName || 'Unassigned'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{formatCurrency(ride.fare || ride.totalFare)}</div>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(ride.status).bg}`}>
                          {getStatusBadge(ride.status).label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Adjust Wallet Modal */}
      <Modal
        isOpen={!!walletModalUser}
        onClose={() => setWalletModalUser(null)}
        title={`Adjust Wallet: ${walletModalUser?.name}`}
        description={`Current Balance: ${formatCurrency(walletModalUser?.walletBalance || 0)}`}
      >
        <form onSubmit={handleWalletSubmit} className="space-y-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setWalletAction('credit')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                walletAction === 'credit'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Credit (Add Money)
            </button>
            <button
              type="button"
              onClick={() => setWalletAction('debit')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                walletAction === 'debit'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              Debit (Deduct Money)
            </button>
          </div>

          <Input
            label="Amount (₹)"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 200"
            value={walletAmount}
            onChange={(e) => setWalletAmount(e.target.value)}
            required
          />

          <Input
            label="Reason / Notes"
            placeholder="e.g. Compensation for ride delay / Customer support credit"
            value={walletReason}
            onChange={(e) => setWalletReason(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setWalletModalUser(null)}>
              Cancel
            </Button>
            <Button
              variant={walletAction === 'credit' ? 'success' : 'danger'}
              type="submit"
              isLoading={isSubmitting}
            >
              Confirm Wallet {walletAction === 'credit' ? 'Credit' : 'Debit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
