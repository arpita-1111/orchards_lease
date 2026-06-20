import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, type AdminDashboard } from '@/services/admin.service';
import { Skeleton } from '@/components/ui';
import { formatCurrency, formatNumber } from '@/lib/format';
import { orchardSurface } from '@/lib/gradients';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/apiClient';
import type { Orchard } from '@/types';

export default function AdminOverview() {
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [queue, setQueue] = useState<Orchard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = () => adminService.moderationQueue().then(setQueue).catch(() => {});

  useEffect(() => {
    adminService
      .dashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
    loadQueue();
  }, []);

  const approve = async (id: string) => {
    try {
      await adminService.moderate(id, 'approve');
      toast.success('Listing approved');
      loadQueue();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const k = data?.kpis;
  const kpis = k
    ? [
        { k: 'Platform GMV', v: formatCurrency(k.totalRevenue), sub: `${k.totalBookings} bookings`, up: true },
        { k: 'Total users', v: formatNumber(k.totalUsers), sub: `${k.userGrowthPercent >= 0 ? '+' : ''}${k.userGrowthPercent}% MoM`, up: k.userGrowthPercent >= 0 },
        { k: 'Live orchards', v: formatNumber(k.totalOrchards), sub: `${k.orchardGrowthPercent >= 0 ? '+' : ''}${k.orchardGrowthPercent}% MoM`, up: k.orchardGrowthPercent >= 0 },
        { k: 'Active rentals', v: formatNumber(k.activeRentals), sub: 'in progress', up: true },
        { k: 'Conversion rate', v: `${k.conversionRate}%`, sub: 'bookings → paid', up: true },
        { k: 'Pending review', v: formatNumber(k.pendingModeration), sub: 'awaiting moderation', up: false },
      ]
    : [];

  const maxRev = Math.max(1, ...(data?.revenue || []).map((r) => r.revenue || 0));
  const maxGeo = Math.max(1, ...(data?.geographic || []).map((g) => g.orchards));

  return (
    <main className="mx-auto max-w-[1240px] px-6 pb-16 pt-6">
      <div className="mb-[22px]">
        <h1 className="font-serif text-[27px] font-semibold">Platform overview</h1>
        <p className="mt-1 text-[13.5px] text-faint">Live health of the OrchardLease marketplace</p>
      </div>

      <div className="mb-[22px] grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[96px]" />)
          : kpis.map((kp) => (
              <div key={kp.k} className="rounded-2xl border border-sand bg-cream px-[19px] py-[17px]">
                <div className="mb-[7px] text-xs font-semibold text-faint">{kp.k}</div>
                <div className="font-serif text-[25px] font-bold text-ink">{kp.v}</div>
                <div className={`mt-1 text-xs font-semibold ${kp.up ? 'text-[#3f8a52]' : 'text-[#a05a45]'}`}>{kp.sub}</div>
              </div>
            ))}
      </div>

      <div className="mb-5 flex flex-wrap items-start gap-5">
        {/* Revenue */}
        <div className="min-w-[320px] flex-[2_1_460px] rounded-[18px] border border-sand bg-cream p-[22px]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-[18px] font-semibold">Revenue overview</h2>
            <span className="text-[12.5px] font-semibold text-faint">GMV / month</span>
          </div>
          {loading ? (
            <Skeleton className="h-[150px]" />
          ) : (
            <div className="flex h-[170px] items-end gap-3">
              {(data?.revenue || []).map((b) => (
                <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div
                    className="w-full rounded-t-[5px] bg-forest transition-all"
                    style={{ height: `${Math.max(4, Math.round(((b.revenue || 0) / maxRev) * 130))}px` }}
                  />
                  <div className="text-[11.5px] font-semibold text-faint">{b.label.split(' ')[0]}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approval queue */}
        <div className="min-w-[290px] flex-1 basis-[300px] rounded-[18px] border border-sand bg-cream p-[22px]">
          <div className="mb-3.5 flex items-center justify-between">
            <h2 className="font-serif text-[18px] font-semibold">Approval queue</h2>
            <span className="rounded-full bg-[#fbf2dd] px-2.5 py-[3px] text-xs font-bold text-[#a9772b]">
              {queue.length} pending
            </span>
          </div>
          {queue.length === 0 ? (
            <p className="py-3 text-center text-[13px] text-faint">Nothing to review 🌿</p>
          ) : (
            queue.slice(0, 4).map((o) => (
              <div key={o._id} className="flex items-center gap-2.5 border-t border-chip py-[11px]">
                <div className="h-10 w-10 flex-none rounded-[10px]" style={orchardSurface(o.thumbnail, o.fruitTypes, o._id)} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-bold">{o.gardenName}</div>
                  <div className="truncate text-[11.5px] text-faint">{o.state}</div>
                </div>
                <button onClick={() => approve(o._id)} className="flex-none rounded-[9px] bg-forest px-2.5 py-[7px] text-xs font-bold text-cream">
                  Approve
                </button>
              </div>
            ))
          )}
          <button onClick={() => navigate('/admin/moderation')} className="mt-3 w-full rounded-[10px] bg-avail py-2.5 text-[13px] font-bold text-forest">
            Open moderation
          </button>
        </div>
      </div>

      {/* Geographic */}
      <div className="rounded-[18px] border border-sand bg-cream p-[22px]">
        <h2 className="mb-[18px] font-serif text-[18px] font-semibold">Geographic analytics · orchards by state</h2>
        {loading ? (
          <Skeleton className="h-[120px]" />
        ) : (
          <div className="flex flex-col gap-3.5">
            {(data?.geographic || []).map((g) => (
              <div key={g.state} className="flex items-center gap-3.5">
                <span className="w-[130px] flex-none text-[13px] font-semibold text-[#3a4632]">{g.state}</span>
                <div className="flex-1 rounded-[5px] bg-chip">
                  <div className="h-2 rounded-[5px] bg-forest" style={{ width: `${Math.round((g.orchards / maxGeo) * 100)}%` }} />
                </div>
                <span className="w-[96px] flex-none text-right text-[13px] font-bold text-ink">{g.orchards} orchards</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
