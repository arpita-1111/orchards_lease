import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { Skeleton } from '@/components/ui';
import { formatCurrency, titleCase } from '@/lib/format';
import { initialsOf } from '@/lib/avatar';

type Analytics = Awaited<ReturnType<typeof adminService.analytics>>;

// Acquisition channels are illustrative — the backend does not track referrers yet.
const ACQUISITION = [
  { label: 'Organic search', pct: 42 },
  { label: 'Referral / word of mouth', pct: 28 },
  { label: 'Social', pct: 18 },
  { label: 'Direct', pct: 12 },
];

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .analytics(12)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = (data?.revenue || []).reduce((t, r) => t + (r.revenue || 0), 0);
  const totalBookings = (data?.revenue || []).reduce((t, r) => t + (r.bookings || 0), 0);
  const lastMonthUsers = data?.userGrowth?.length ? data.userGrowth[data.userGrowth.length - 1].count || 0 : 0;

  const growth = [
    { k: 'GMV · 12 mo', v: formatCurrency(totalRevenue), d: 'gross merchandise value' },
    { k: 'Bookings · 12 mo', v: totalBookings, d: 'total lease requests' },
    { k: 'New users · last mo', v: lastMonthUsers, d: 'sellers + renters' },
    { k: 'States covered', v: data?.geographic?.length ?? 0, d: 'across India' },
  ];

  const maxSeller = Math.max(1, ...(data?.topSellers || []).map((t) => t.revenue));
  const maxFruit = Math.max(1, ...(data?.topFruits || []).map((f) => f.count));

  return (
    <main className="mx-auto max-w-[1240px] px-6 pb-16 pt-6">
      <div className="mb-[18px]">
        <h1 className="font-serif text-[27px] font-semibold">Analytics</h1>
        <p className="mt-1 text-[13.5px] text-faint">Growth, revenue mix and acquisition</p>
      </div>

      <div className="mb-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[92px]" />)
          : growth.map((g) => (
              <div key={g.k} className="rounded-2xl border border-sand bg-cream px-[19px] py-[17px]">
                <div className="mb-[7px] text-xs font-semibold text-faint">{g.k}</div>
                <div className="font-serif text-[24px] font-bold text-ink">{g.v}</div>
                <div className="mt-1 text-xs font-semibold text-[#3f8a52]">{g.d}</div>
              </div>
            ))}
      </div>

      <div className="flex flex-wrap items-start gap-5">
        {/* Top sellers */}
        <section className="min-w-[300px] flex-1 basis-[340px] rounded-[18px] border border-sand bg-cream p-[22px]">
          <h2 className="mb-[18px] font-serif text-[18px] font-semibold">Top sellers by GMV</h2>
          {loading ? (
            <Skeleton className="h-[200px]" />
          ) : (data?.topSellers || []).length === 0 ? (
            <p className="text-sm text-faint">No seller revenue yet.</p>
          ) : (
            <div className="flex flex-col gap-[15px]">
              {data!.topSellers.map((t) => (
                <div key={t.sellerId}>
                  <div className="mb-[7px] flex items-center justify-between">
                    <span className="flex items-center gap-2.5 text-[13.5px] font-bold">
                      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-forest-light text-[11px] font-bold text-cream">
                        {initialsOf(t.name)}
                      </span>
                      {t.name}
                    </span>
                    <span className="text-[13px] font-bold text-terra">{formatCurrency(t.revenue)}</span>
                  </div>
                  <div className="rounded-[5px] bg-chip">
                    <div className="h-2 rounded-[5px] bg-terra" style={{ width: `${Math.round((t.revenue / maxSeller) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top fruits */}
        <section className="min-w-[300px] flex-1 basis-[340px] rounded-[18px] border border-sand bg-cream p-[22px]">
          <h2 className="mb-[18px] font-serif text-[18px] font-semibold">Top fruit categories</h2>
          {loading ? (
            <Skeleton className="h-[200px]" />
          ) : (
            <div className="flex flex-col gap-[15px]">
              {(data?.topFruits || []).map((f) => (
                <div key={f.fruit}>
                  <div className="mb-[7px] flex items-center justify-between">
                    <span className="text-[13.5px] font-bold">{titleCase(f.fruit)}</span>
                    <span className="text-[12.5px] font-semibold text-faint">{f.count} orchards</span>
                  </div>
                  <div className="rounded-[5px] bg-chip">
                    <div className="h-2 rounded-[5px] bg-gold" style={{ width: `${Math.round((f.count / maxFruit) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Acquisition */}
      <section className="mt-5 rounded-[18px] border border-sand bg-cream p-[22px]">
        <h2 className="mb-[18px] font-serif text-[18px] font-semibold">User acquisition channels</h2>
        <div className="flex flex-col gap-3.5">
          {ACQUISITION.map((a) => (
            <div key={a.label} className="flex items-center gap-3.5">
              <span className="w-[180px] flex-none text-[13px] font-semibold text-[#3a4632]">{a.label}</span>
              <div className="flex-1 rounded-[5px] bg-chip">
                <div className="h-2 rounded-[5px] bg-forest" style={{ width: `${a.pct}%` }} />
              </div>
              <span className="w-12 flex-none text-right text-[13px] font-bold">{a.pct}%</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
