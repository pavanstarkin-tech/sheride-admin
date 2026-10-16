import React, { useState, useMemo } from 'react';
import { useFleetStore } from '../../stores/fleetStore';
import { PromoCode } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { formatDate, formatCurrency } from '../../lib/utils';
import { adminApi } from '../../lib/api';
import { 
  Tag, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Copy, 
  Percent, 
  Sparkles,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Send,
  BellRing,
  Megaphone,
  Users
} from 'lucide-react';
import dayjs from 'dayjs';

export const OffersPage: React.FC = () => {
  const { offers, savePromoCode, deletePromoCode } = useFleetStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Partial<PromoCode> | null>(null);

  // Promo Form states
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('20');
  const [maxDiscount, setMaxDiscount] = useState('50');
  const [minFare, setMinFare] = useState('100');
  const [validDays, setValidDays] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Marketing Push Broadcast Modal states
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [pushTitle, setPushTitle] = useState('🌸 Special Lady Pilot Weekend Offer!');
  const [pushBody, setPushBody] = useState('Enjoy 20% OFF on all safe rides across town with our verified Lady Pilots. Tap to book!');
  const [pushTarget, setPushTarget] = useState<'all' | 'users' | 'riders'>('all');
  const [pushPromoCode, setPushPromoCode] = useState('');
  const [pushImageUrl, setPushImageUrl] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastFeedback, setBroadcastFeedback] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingPromo(null);
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('20');
    setMaxDiscount('50');
    setMinFare('100');
    setValidDays('30');
    setIsModalOpen(true);
  };

  const openBroadcastModal = () => {
    setPushTitle('🌸 Special Lady Pilot Weekend Offer!');
    setPushBody('Enjoy 20% OFF on all safe rides across town with our verified Lady Pilots. Tap to book!');
    setPushTarget('all');
    setPushPromoCode(Object.values(offers)[0]?.code || '');
    setPushImageUrl('');
    setBroadcastFeedback(null);
    setIsBroadcastModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsSubmitting(true);
    try {
      const now = Date.now();
      const expiry = now + parseInt(validDays || '30') * 24 * 60 * 60 * 1000;

      await savePromoCode({
        id: editingPromo?.id,
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue) || 0,
        maxDiscount: Number(maxDiscount) || 100,
        minFare: Number(minFare) || 50,
        validFrom: editingPromo?.validFrom || now,
        validUntil: expiry,
        isActive: true,
        usageCount: editingPromo?.usageCount || 0,
      });

      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Error saving offer: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatchPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) {
      alert('Please enter both title and body for the push notification.');
      return;
    }

    setIsBroadcasting(true);
    setBroadcastFeedback(null);
    try {
      const res = await adminApi.sendMarketingPush({
        title: pushTitle.trim(),
        body: pushBody.trim(),
        targetGroup: pushTarget,
        promoCode: pushPromoCode.trim().toUpperCase(),
        imageUrl: pushImageUrl.trim() || undefined,
      });

      setBroadcastFeedback(`✅ Broadcast Dispatched! Notification delivered to ${res.recipientsCount || 'all'} registered passengers & pilots.`);
      setTimeout(() => {
        setIsBroadcastModalOpen(false);
        setBroadcastFeedback(null);
      }, 2500);
    } catch (err: any) {
      alert(`Push Broadcast Error: ${err.message}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleToggleActive = async (promo: PromoCode) => {
    await savePromoCode({
      ...promo,
      isActive: !promo.isActive,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this promo code permanently?')) return;
    await deletePromoCode(id);
  };

  const promoList = Object.values(offers);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Offers & Marketing Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create ride discount coupons and broadcast live push notifications directly to user and rider apps
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={openBroadcastModal}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
            leftIcon={<Megaphone className="w-4 h-4 text-primary" />}
          >
            📢 Broadcast Push
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Promo Code
          </Button>
        </div>
      </div>

      {/* Offers Cards Grid */}
      {promoList.length === 0 ? (
        <Card className="p-16 text-center text-slate-400">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-40 text-primary" />
          <h4 className="text-base font-semibold text-slate-700">No active promo codes</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            Create coupon codes like <span className="font-mono text-primary font-bold">LADYPILOT50</span> to attract new female passengers.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="golden" size="sm" onClick={openCreateModal}>
              Create First Promo Code
            </Button>
            <Button variant="outline" size="sm" onClick={openBroadcastModal}>
              📢 Send Push Alert
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {promoList.map((promo) => {
            const isExpired = promo.validUntil < Date.now();

            return (
              <Card
                key={promo.id}
                className={`border-2 transition-all ${
                  promo.isActive && !isExpired
                    ? 'border-purple-100 bg-white hover:border-purple-300'
                    : 'border-slate-200 bg-slate-50/75 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 font-mono font-black text-primary text-base tracking-wider flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    {promo.code}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(promo)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title={promo.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {promo.isActive ? (
                        <ToggleRight className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-700 font-medium line-clamp-2 min-h-[40px]">
                  {promo.description || 'Special fare reduction'}
                </p>

                <div className="my-3 py-2 border-y border-slate-100 flex items-center justify-between text-xs">
                  <div className="font-semibold text-slate-900">
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}% OFF`
                      : `FLAT ${formatCurrency(promo.discountValue)} OFF`}
                  </div>
                  {promo.discountType === 'percentage' && (
                    <span className="text-slate-500">Max {formatCurrency(promo.maxDiscount)}</span>
                  )}
                  <span className="text-slate-400">Min {formatCurrency(promo.minFare)}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {isExpired ? 'Expired' : `Expires ${dayjs(promo.validUntil).format('DD MMM YYYY')}`}
                  </span>
                  <Badge variant={promo.isActive && !isExpired ? 'success' : 'neutral'} size="sm">
                    {promo.isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Broadcast Marketing Push Modal */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="📢 Dispatch Marketing Push Notification"
      >
        <form onSubmit={handleDispatchPush} className="space-y-4">
          <p className="text-xs text-slate-500">
            Send an instant promotional push notification to all passengers and captains via Firebase Cloud Messaging & in-app bell notification center.
          </p>

          {broadcastFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium animate-fadeIn">
              {broadcastFeedback}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Audience Target Group
            </label>
            <Select
              value={pushTarget}
              onChange={(e) => setPushTarget(e.target.value as any)}
              options={[
                { value: 'all', label: '🌸 All Passengers & Captains (Broadcast)' },
                { value: 'users', label: '👩 Passengers Only (Women Riders)' },
                { value: 'riders', label: '🛵 Captains Only (Lady Pilots)' },
              ]}
            />
          </div>

          <Input
            label="Push Notification Title"
            value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)}
            placeholder="e.g. 🌸 Special Lady Pilot Weekend Offer!"
            required
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Notification Message Body
            </label>
            <textarea
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              rows={3}
              value={pushBody}
              onChange={(e) => setPushBody(e.target.value)}
              placeholder="e.g. Enjoy 20% OFF on all safe rides across town with code WOMEN20!"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Attach Active Promo Code
              </label>
              <select
                className="w-full text-xs rounded-xl border border-slate-300 p-2 focus:border-primary focus:outline-none"
                value={pushPromoCode}
                onChange={(e) => setPushPromoCode(e.target.value)}
              >
                <option value="">(None)</option>
                {promoList.map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.code} ({p.discountValue}% OFF)
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Banner Image URL (Optional)"
              value={pushImageUrl}
              onChange={(e) => setPushImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsBroadcastModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              isLoading={isBroadcasting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send Live Push Alert
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create / Edit Promo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPromo ? 'Edit Promo Code' : 'Create New Lady Pilot Promo Code'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Promo Code (e.g. LADY PILOT50)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="LADYPILOT20"
            required
          />

          <Input
            label="Marketing Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="20% off up to ₹50 on solo scooty & bike rides"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Discount Type
              </label>
              <Select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                options={[
                  { value: 'percentage', label: 'Percentage (%)' },
                  { value: 'flat', label: 'Flat Amount (₹)' },
                ]}
              />
            </div>

            <Input
              label={discountType === 'percentage' ? 'Discount (%)' : 'Discount (₹)'}
              type="number"
              min="1"
              max={discountType === 'percentage' ? '100' : '1000'}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Max Discount Cap (₹)"
              type="number"
              min="1"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              disabled={discountType === 'flat'}
            />

            <Input
              label="Minimum Ride Fare (₹)"
              type="number"
              min="0"
              value={minFare}
              onChange={(e) => setMinFare(e.target.value)}
            />
          </div>

          <Input
            label="Validity Duration (Days from today)"
            type="number"
            min="1"
            max="365"
            value={validDays}
            onChange={(e) => setValidDays(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="golden" type="submit" isLoading={isSubmitting}>
              Publish Coupon Code
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
