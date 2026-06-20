import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { sellerService, type SellerOverview as Overview, type RevenuePoint } from '@/services/seller.service';
import { bookingService } from '@/services/booking.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Skeleton } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import { initialsOf } from '@/lib/avatar';
import { getErrorMessage } from '@/lib/apiClient';
import type { Booking, Orchard, User } from '@/types';

export default function SellerOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [queue, setQueue] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = () =>
    bookingService
      .list({ role: 'seller', status: 'requested' })
      .then((res) => setQueue(res.data))
      .catch(() => {});

  useEffect(() => {
    Promise.all([sellerService.overview(), sellerService.revenue(6)])
      .then(([o, r]) => {
        setOverview(o);
        setRevenue(r);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    loadQueue();
  }, []);

  const approve = async (id: string) => {
    try {
      await bookingService.approve(id);
      toast.success('Booking approved — renter notified');
      loadQueue();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const kpis = overview
    ? [
        { k: 'Total revenue', v: formatCurrency(overview.revenue), sub: 'this season' },
        { k: 'Active listings', v: `${overview.activeListings} / ${overview.totalOrchards}`, sub: 'published' },
        { k: 'Total bookings', v: overview.totalBookings, sub: `${overview.pendingApprovals} pending` },
        { k: 'Total views', v: overview.totalViews.toLocaleString(), sub: 'across listings' },
      ]
    : [];

  const maxRev = Math.max(1, ...revenue.map((r) => r.revenue));

  return (
    <main className="mx-auto max-w-[1180px] px-6 pb-16 pt-[26px]">
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-faint">Good day, {user?.name?.split(' ')[0]} 🌿</p>
          <h1 className="mt-0.5 font-serif text-[28px] font-semibold">Orchard dashboard</h1>
        </div>
        <button
          onClick={() => navigate('/seller/orchards/new')}
          className="flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-cream hover:bg-forest-dark"
        >
          <Plus className="h-4 w-4" /> Add orchard
        </button>
      </div>

      {/* KPIs */}
      <div className="mb-[22px] grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px]" />)
          : kpis.map((k) => (
              <div key={k.k} className="rounded-2xl border border-sand bg-cream px-5 py-[18px]">
                <div className="mb-2 text-[12.5px] font-semibold text-faint">{k.k}</div>
                <div className="font-serif text-[26px] font-bold text-ink">{k.v}</div>
                <div className="mt-1.5 text-xs font-semibold text-[#3f8a52]">{k.sub}</div>
              </div>
            ))}
      </div>

      <div className="flex flex-wrap items-start gap-5">
        {/* Revenue bars */}
        <div className="min-w-[320px] flex-[2_1_440px] rounded-[18px] border border-sand bg-cream p-[22px]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-[18px] font-semibold">Revenue · last 6 months</h2>
            <span className="text-[12.5px] font-semibold text-faint">₹</span>
          </div>
          {loading ? (
            <Skeleton className="h-[140px]" />
          ) : (
            <div className="flex h-[160px] items-end gap-3.5 px-1">
              {revenue.map((b) => (
                <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div className="text-[11px] font-bold text-sub">{b.revenue ? formatCurrency(b.revenue) : ''}</div>
                  <div
                    className="w-full rounded-t-[5px] bg-forest transition-all"
                    style={{ height: `${Math.max(4, Math.round((b.revenue / maxRev) * 120))}px` }}
                  />
                  <div className="text-xs font-semibold text-faint">{b.label.split(' ')[0]}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approval queue */}
        <div className="min-w-[280px] flex-1 basis-[280px] rounded-[18px] border border-sand bg-cream p-[22px]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-[18px] font-semibold">Approval queue</h2>
            <span className="rounded-full bg-[#fbf2dd] px-2.5 py-[3px] text-xs font-bold text-[#a9772b]">
              {queue.length} pending
            </span>
          </div>
          {queue.length === 0 ? (
            <p className="py-3.5 text-center text-[13px] text-faint">All caught up 🌿</p>
          ) : (
            queue.slice(0, 4).map((b) => {
              const renter = b.renterId as User;
              const o = b.orchardId as Orchard;
              return (
                <div key={b._id} className="flex items-center gap-2.5 border-t border-chip py-[11px]">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-forest-light text-xs font-bold text-cream">
                    {initialsOf(renter?.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-bold">{renter?.name}</div>
                    <div className="truncate text-[11.5px] text-faint">{o?.gardenName}</div>
                  </div>
                  <button
                    onClick={() => approve(b._id)}
                    className="flex-none rounded-[9px] bg-forest px-2.5 py-[7px] text-xs font-bold text-cream"
                  >
                    Approve
                  </button>
                </div>
              );
            })
          )}
          <button
            onClick={() => navigate('/seller/bookings')}
            className="mt-3 w-full rounded-[10px] bg-avail py-2.5 text-[13px] font-bold text-forest"
          >
            View all bookings
          </button>
        </div>
      </div>
    </main>
  );
}
