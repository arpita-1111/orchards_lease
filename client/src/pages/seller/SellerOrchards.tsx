import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MoreVertical, Copy, EyeOff, Eye, Archive, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/cn';
import { orchardService } from '@/services/orchard.service';
import { bookingService } from '@/services/booking.service';
import { EmptyState, Spinner } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatNumber, titleCase } from '@/lib/format';
import { orchardSurface } from '@/lib/gradients';
import { getErrorMessage } from '@/lib/apiClient';
import type { Orchard } from '@/types';

export default function SellerOrchards() {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState<Orchard[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [menuId, setMenuId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    orchardService
      .listMine()
      .then((res) => setItems(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    bookingService
      .list({ role: 'seller' })
      .then((res) => {
        const map: Record<string, number> = {};
        res.data.forEach((b) => {
          const oid = typeof b.orchardId === 'object' ? b.orchardId._id : b.orchardId;
          map[oid] = (map[oid] || 0) + 1;
        });
        setCounts(map);
      })
      .catch(() => {});
  };

  useEffect(load, []);

  const act = async (fn: () => Promise<unknown>, msg: string) => {
    setMenuId(null);
    try {
      await fn();
      toast.success(msg);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const statusPill = (o: Orchard) => {
    const tone =
      o.status === 'published'
        ? 'bg-avail text-forest'
        : o.status === 'pending'
          ? 'bg-[#fbf2dd] text-[#a9772b]'
          : o.status === 'rejected'
            ? 'bg-[#f3e7e1] text-[#a05a45]'
            : 'bg-chip text-sub';
    return <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold ${tone}`}>{titleCase(o.status)}</span>;
  };

  return (
    <main className="mx-auto max-w-[1080px] px-6 pb-16 pt-[26px]">
      <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[27px] font-semibold">My orchards</h1>
          <p className="mt-1 text-[13.5px] text-faint">{items.length} listings · manage availability and performance</p>
        </div>
        <button
          onClick={() => navigate('/seller/orchards/new')}
          className="flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-cream hover:bg-forest-dark"
        >
          <Plus className="h-4 w-4" /> Add orchard
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          emoji="🌱"
          title="No orchards yet"
          description="Create your first listing to start receiving lease requests."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((o) => (
            <div key={o._id} className="flex flex-wrap items-center gap-[15px] rounded-[15px] border border-sand bg-cream px-4 py-3.5">
              <div className="h-[58px] w-[58px] flex-none rounded-xl" style={orchardSurface(o.thumbnail, o.fruitTypes, o._id)} />
              <div className="min-w-[170px] flex-1 basis-[200px]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-serif text-base font-semibold leading-tight">{o.gardenName}</h3>
                  {statusPill(o)}
                  {o.healthScore && (
                    <span className={cn(
                      "rounded-full px-2.5 py-1 text-[11.5px] font-bold border shadow-sm",
                      o.healthScore.score >= 90
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : o.healthScore.score >= 75
                          ? 'bg-green-50 text-green-800 border-green-200'
                          : o.healthScore.score >= 60
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-orange-50/70 text-terra border-orange-200'
                    )}>
                      🌱 {o.healthScore.rating} {o.healthScore.score}/100
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[12.5px] text-faint">
                  {o.district}, {o.state} · {o.fruitTypes[0]}
                </p>
              </div>
              <div className="flex flex-none gap-[22px]">
                <Stat v={formatNumber(o.viewCount)} k="views" />
                <Stat v={formatNumber(o.favouriteCount)} k="saves" />
                <Stat v={String(counts[o._id] || 0)} k="bookings" />
                <Stat v={formatCurrency(o.price)} k={o.rentType} accent />
              </div>
              <div className="flex flex-none items-center gap-2">
                <button
                  onClick={() => navigate(`/orchards/${o.slug}`)}
                  className="rounded-[9px] border border-sand bg-white px-3 py-2 text-[12.5px] font-semibold text-ink"
                >
                  View
                </button>
                <button
                  onClick={() => navigate(`/seller/orchards/${o._id}/edit`)}
                  className="rounded-[9px] border border-sand bg-white px-3 py-2 text-[12.5px] font-semibold text-ink"
                >
                  Edit
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMenuId(menuId === o._id ? null : o._id)}
                    className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-sand bg-white"
                  >
                    <MoreVertical className="h-4 w-4 text-sub" />
                  </button>
                  {menuId === o._id && (
                    <div
                      className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-xl border border-sand bg-cream shadow-card"
                      onMouseLeave={() => setMenuId(null)}
                    >
                      {o.status !== 'published' ? (
                        <Item icon={Eye} label="Publish" onClick={() => act(() => orchardService.setStatus(o._id, 'publish'), 'Submitted for review')} />
                      ) : (
                        <Item icon={EyeOff} label="Unpublish" onClick={() => act(() => orchardService.setStatus(o._id, 'unpublish'), 'Unpublished')} />
                      )}
                      <Item icon={Copy} label="Duplicate" onClick={() => act(() => orchardService.clone(o._id), 'Duplicated')} />
                      <Item icon={Calendar} label="Harvest schedule" onClick={() => navigate(`/seller/orchards/${o._id}/harvest`)} />
                      <Item icon={Archive} label="Archive" onClick={() => act(() => orchardService.setStatus(o._id, 'archive'), 'Archived')} />
                      <Item icon={Trash2} label="Delete" danger onClick={() => act(() => orchardService.remove(o._id), 'Deleted')} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Stat({ v, k, accent }: { v: string; k: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <div className={`font-serif text-base font-bold ${accent ? 'text-terra' : 'text-ink'}`}>{v}</div>
      <div className="text-[11px] font-semibold text-faint">{k}</div>
    </div>
  );
}

function Item({ icon: Icon, label, onClick, danger }: { icon: typeof Eye; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-chip ${danger ? 'text-[#a05a45]' : 'text-ink'}`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}
