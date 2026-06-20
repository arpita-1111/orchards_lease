import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { wishlistService } from '@/services/wishlist.service';
import { EmptyState, Button, Spinner } from '@/components/ui';
import { useMarketplace } from '@/context/MarketplaceContext';
import { formatCurrency, titleCase } from '@/lib/format';
import { orchardSurface } from '@/lib/gradients';
import type { Orchard } from '@/types';

export default function ComparePage() {
  const navigate = useNavigate();
  const { compareIds, toggleCompare } = useMarketplace();
  const [items, setItems] = useState<Orchard[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    wishlistService
      .getCompare()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const visible = items.filter((o) => compareIds.includes(o._id));

  const rowsFor = (o: Orchard) => [
    { k: 'Fruit', v: o.fruitTypes.map(titleCase).join(', ') },
    { k: 'Location', v: `${o.district}, ${o.state}` },
    { k: 'Trees', v: o.totalTrees.toLocaleString() },
    { k: 'Avg / tree', v: `${o.averageFruitPerTree}` },
    { k: 'Exp. yield', v: `${o.expectedYield.toLocaleString()} kg` },
    { k: 'Area', v: `${o.totalArea} ${o.areaUnit}` },
    { k: 'Harvest', v: o.estimatedHarvestDate ? new Date(o.estimatedHarvestDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—' },
    { k: 'Rating', v: `${o.ratingAverage.toFixed(1)} ★` },
    { k: 'Price', v: `${formatCurrency(o.price)}` },
  ];

  return (
    <main className="mx-auto max-w-[1180px] px-6 pb-16 pt-7">
      <h1 className="mb-1.5 font-serif text-[28px] font-semibold">Compare orchards</h1>
      <p className="mb-6 text-sm text-faint">Side-by-side on the numbers that matter.</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          emoji="⚖️"
          title="Nothing to compare yet"
          description="Add up to 4 orchards using the compare icon on any card."
          action={<Button onClick={() => navigate('/explore')}>Explore orchards</Button>}
        />
      ) : (
        <div className="flex gap-[18px] overflow-x-auto pb-2">
          {visible.map((o) => (
            <div key={o._id} className="w-[260px] flex-none overflow-hidden rounded-2xl border border-sand bg-cream">
              <div className="relative h-[120px]" style={orchardSurface(o.thumbnail, o.fruitTypes, o._id)}>
                <button
                  onClick={() => toggleCompare(o._id)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-cream/90"
                >
                  <X className="h-3.5 w-3.5 text-sub" />
                </button>
              </div>
              <div className="px-4 py-3.5">
                <h3
                  onClick={() => navigate(`/orchards/${o.slug}`)}
                  className="mb-3 cursor-pointer font-serif text-base font-semibold leading-[1.2]"
                >
                  {o.gardenName}
                </h3>
                {rowsFor(o).map((r) => (
                  <div key={r.k} className="flex justify-between gap-2.5 border-t border-chip py-2 text-[13px]">
                    <span className="text-faint">{r.k}</span>
                    <span className="text-right font-semibold">{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
