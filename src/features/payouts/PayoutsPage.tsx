import React, { useState, useMemo } from 'react';
import { useFleetStore } from '../../stores/fleetStore';
import { Payout } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { adminApi } from '../../lib/api';
import { 
  formatCurrency, 
  formatDate, 
  formatDateTime 
} from '../../lib/utils';
import { 
  Wallet, 
  Check, 
  X, 
  Search, 
  CreditCard, 
  Percent, 
  TrendingUp, 
  Building, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck 
} from 'lucide-react';

export const PayoutsPage: React.FC = () => {
  const { payouts, riders, rides, config, updateAppConfig } = useFleetStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [commissionInput, setCommissionInput] = useState(String(config?.commissionRate || 15));
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);

  // Filter payouts
  const filteredPayouts = useMemo(() => {
    return Object.values(payouts)
      .sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0))
      .filter((p) => {
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const rider = riders[p.riderId];
          const matchesName = rider?.name?.toLowerCase().includes(q) || p.riderName?.toLowerCase().includes(q);
          const matchesTxn = p.transactionId?.toLowerCase().includes(q);
          if (!matchesName && !matchesTxn) return false;
        }
        return true;
      });
  }, [payouts, riders, statusFilter, searchQuery]);

  // Commission & Revenue totals
  const financials = useMemo(() => {
    let totalGross = 0;
    let cashVolume = 0;
    let walletVolume = 0;
    let upiVolume = 0;

    Object.values(rides).forEach((ride) => {
      if (ride.status === 'completed') {
        const fare = Number(ride.fare || ride.totalFare || 0);
        totalGross += fare;
        if (ride.paymentMethod === 'cash') cashVolume += fare;
        else if (ride.paymentMethod === 'wallet') walletVolume += fare;
        else upiVolume += fare;
      }
    });

    const commissionRate = config?.commissionRate || 15;
    const platformRevenue = (totalGross * commissionRate) / 100;
    const captainPayouts = totalGross - platformRevenue;

    return {
      totalGross,
      platformRevenue,
      captainPayouts,
      cashVolume,
      walletVolume,
      upiVolume,
    };
  }, [rides, config]);

  const handleProcessPayout = async () => {
    if (!selectedPayout) return;
    setIsProcessing(true);
    try {
      const txn = transactionId.trim() || `TXN_${Date.now().toString().slice(-8)}`;
      await adminApi.processPayout(selectedPayout.id, selectedPayout.riderId, selectedPayout.amount, txn);
      setSelectedPayout(null);
      setTransactionId('');
    } catch (err: any) {
      alert(`Payout processing error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(commissionInput);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      alert('Please enter a valid commission rate (0-100%)');
      return;
    }
    setIsUpdatingCommission(true);
    try {
      await adminApi.updateCommission(rate);
      await updateAppConfig({ commissionRate: rate });
      alert('Platform commission rate updated successfully!');
    } catch (err: any) {
      alert(`Commission update error: ${err.message}`);
    } finally {
      setIsUpdatingCommission(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Captain Payouts & Settlement
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Process bank/UPI payouts, review platform revenue, and configure commission rates
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Total Gross Bookings
          </span>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(financials.totalGross)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">All completed rides</span>
        </Card>

        <Card className="p-5 border-purple-100 bg-purple-50/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
            Platform Take ({config?.commissionRate || 15}%)
          </span>
          <div className="text-2xl font-black text-primary">
            {formatCurrency(financials.platformRevenue)}
          </div>
          <span className="text-xs text-primary mt-1 block font-medium">Net Lady Pilot Revenue</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Captain Earnings
          </span>
          <div className="text-2xl font-black text-emerald-700">
            {formatCurrency(financials.captainPayouts)}
          </div>
          <span className="text-xs text-emerald-600 mt-1 block">Disbursed or payable</span>
        </Card>

        {/* Commission Rate Settings Card */}
        <Card className="p-5 bg-white border-slate-200">
          <form onSubmit={handleSaveCommission} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Commission %
              </span>
              <Badge variant="primary">Platform Fee</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={commissionInput}
                onChange={(e) => setCommissionInput(e.target.value)}
                className="py-1 px-2.5 text-xs font-bold"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="px-3 text-xs shrink-0"
                isLoading={isUpdatingCommission}
              >
                Save
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Cash Payments</span>
            <div className="text-lg font-bold text-slate-900">{formatCurrency(financials.cashVolume)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
            CASH
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Wallet Payments</span>
            <div className="text-lg font-bold text-slate-900">{formatCurrency(financials.walletVolume)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-primary flex items-center justify-center font-bold text-xs">
            WALLET
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">UPI / Online</span>
            <div className="text-lg font-bold text-slate-900">{formatCurrency(financials.upiVolume)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
            UPI
          </div>
        </div>
      </div>

      {/* Payouts Table Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Pending ({Object.values(payouts).filter((p) => p.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Completed ({Object.values(payouts).filter((p) => p.status === 'completed').length})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All Payouts
            </button>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Search captain or txn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="py-1.5 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Payouts Table */}
      <Card className="p-0 overflow-hidden">
        {filteredPayouts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-40 text-primary" />
            <p className="text-base font-medium text-slate-700">No payout requests in this queue</p>
            <p className="text-xs text-slate-400 mt-1">When captains request withdrawals, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-purple-100/80 bg-purple-50/30 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-6">Captain</th>
                  <th className="py-3.5 px-6">Payout Amount</th>
                  <th className="py-3.5 px-6">Bank / UPI Destination</th>
                  <th className="py-3.5 px-6">Requested Date</th>
                  <th className="py-3.5 px-6">Status & Txn ID</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50/80 text-slate-700">
                {filteredPayouts.map((payout) => {
                  const rider = riders[payout.riderId];
                  const isPending = payout.status === 'pending';

                  return (
                    <tr key={payout.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 text-xs">
                          {payout.riderName || rider?.name || 'Captain'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: {payout.riderId.slice(-6)}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-black text-slate-900 text-sm">
                          {formatCurrency(payout.amount)}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-600">
                        {payout.bankDetails?.upiId ? (
                          <div>
                            <span className="font-semibold text-slate-800">UPI: </span>
                            <span className="font-mono">{payout.bankDetails.upiId}</span>
                          </div>
                        ) : payout.bankDetails?.accountNumber ? (
                          <div>
                            <div>A/C: {payout.bankDetails.accountNumber}</div>
                            <div className="text-slate-400 text-[11px]">IFSC: {payout.bankDetails.ifscCode}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Direct Bank Transfer</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500">
                        {formatDateTime(payout.requestedAt)}
                      </td>

                      <td className="py-4 px-6">
                        {isPending ? (
                          <Badge variant="warning" dot>Pending Approval</Badge>
                        ) : (
                          <div>
                            <Badge variant="success">Completed</Badge>
                            {payout.transactionId && (
                              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                                Txn: {payout.transactionId}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {isPending ? (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => setSelectedPayout(payout)}
                            className="px-3 py-1.5 text-xs gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Process Payout
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-700 font-semibold flex items-center justify-end gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Process Payout Modal */}
      <Modal
        isOpen={!!selectedPayout}
        onClose={() => setSelectedPayout(null)}
        title="Disburse Captain Payout"
        description={`Amount: ${formatCurrency(selectedPayout?.amount)} to ${selectedPayout?.riderName || 'Captain'}`}
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
            <div className="text-slate-500 font-medium">Recipient Bank / UPI Info:</div>
            <div className="font-bold text-slate-900">
              {selectedPayout?.bankDetails?.upiId || selectedPayout?.bankDetails?.accountNumber || 'Primary Bank Account'}
            </div>
          </div>

          <Input
            label="Transaction Reference ID (UTR / IMPS)"
            placeholder="e.g. UTR1234567890 (or leave blank to auto-generate)"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setSelectedPayout(null)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleProcessPayout}
              isLoading={isProcessing}
            >
              Confirm Disbursement & Notify Rider
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
