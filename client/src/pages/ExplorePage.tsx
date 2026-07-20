import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { orchardService, type OrchardFilters } from '@/services/orchard.service';
import { wishlistService } from '@/services/wishlist.service';
import { OrchardCard, OrchardCardSkeleton } from '@/components/orchard/OrchardCard';
import { Button, EmptyState } from '@/components/ui';
import { Pagination } from '@/components/ui/Pagination';
import { HeroSection } from '@/components/landing/HeroSection';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/format';
import { orchardSurface } from '@/lib/gradients';
import { cn } from '@/lib/cn';
import type { Orchard, FilterOptions, PageMeta } from '@/types';

const SORTS = [
  { value: 'newest', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'popular', label: 'Most trees' },
];

const RATINGS = [
  { label: 'Any', v: 0 },
  { label: '4.0+', v: 4 },
  { label: '4.5+', v: 4.5 },
];

export default function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const { isSaved, isCompared, toggleSave, toggleCompare } = useMarketplace();

  const [orchards, setOrchards] = useState<Orchard[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [recent, setRecent] = useState<Orchard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);

  const fruitList = (params.get('fruit') || '').split(',').filter(Boolean);
  const priceMax = Number(params.get('maxPrice') || 200000);
  const minTrees = Number(params.get('minTrees') || 0);
  const rating = Number(params.get('rating') || 0);
  const availableOnly = params.get('available') === 'true';

  useEffect(() => {
    orchardService.getFilterOptions().then(setOptions).catch(() => {});
    if (user?.role === 'renter') {
      wishlistService.getRecentlyViewed().then(setRecent).catch(() => {});
    }
  }, [user]);

  const load = useCallback(async () => {
    setLoading(true);
    const filters: OrchardFilters = {
      search: params.get('search') || undefined,
      fruit: params.get('fruit') || undefined,
      state: params.get('state') || undefined,
      sort: params.get('sort') || 'newest',
      maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
      minTrees: minTrees || undefined,
      rating: rating || undefined,
      available: availableOnly ? true : undefined,
      page: params.get('page') ? Number(params.get('page')) : 1,
    };
    try {
      const res = await orchardService.list(filters);
      setOrchards(res.data);
      setMeta(res.meta || null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const toggleFruit = (f: string) => {
    const next = fruitList.includes(f) ? fruitList.filter((x) => x !== f) : [...fruitList, f];
    set('fruit', next.join(','));
  };

  const filterCount =
    fruitList.length +
    (params.get('state') ? 1 : 0) +
    (availableOnly ? 1 : 0) +
    (rating ? 1 : 0) +
    (priceMax < 200000 ? 1 : 0) +
    (minTrees > 0 ? 1 : 0);

  const clearFilters = () => setParams(new URLSearchParams());

  const chip = (active: boolean) =>
    cn(
      'cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-[7px] text-[12.5px] font-semibold transition-all',
      active ? 'border-forest bg-forest text-cream' : 'border-sand text-sub hover:border-faint'
    );

  return (
    <main className="container-page py-6">
      <HeroSection className="mb-6" />

      <div className="flex flex-wrap items-start gap-6">
        {/* Filters */}
        <aside
          className={cn(
            'card max-w-[282px] flex-1 basis-[250px] self-start p-5 lg:sticky lg:top-[84px] lg:block',
            mobileFilters
              ? 'fixed inset-0 z-50 max-w-none overflow-y-auto rounded-none'
              : 'hidden lg:block min-w-[240px]'
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-[17px] w-[17px] text-forest" />
              <span className="text-[15px] font-bold">Filters</span>
              {filterCount > 0 && (
                <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] bg-terra px-[5px] text-[11px] font-bold text-cream">
                  {filterCount}
                </span>
              )}
            </div>
            <button onClick={clearFilters} className="text-xs font-semibold text-terra">
              Clear
            </button>
          </div>

          <div className="eyebrow mb-2.5">Fruit</div>
          <div className="mb-5 flex flex-wrap gap-[7px]">
            {options?.fruitTypes.map((f) => (
              <div key={f} onClick={() => toggleFruit(f)} className={chip(fruitList.includes(f))}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </div>
            ))}
          </div>

          <div className="eyebrow mb-2.5">State</div>
          <div className="mb-5 flex flex-wrap gap-[7px]">
            {options?.states.map((s) => {
              const active = params.get('state') === s;
              return (
                <div key={s} onClick={() => set('state', active ? '' : s)} className={chip(active)}>
                  {s}
                </div>
              );
            })}
          </div>

          <div className="mb-2 flex items-baseline justify-between">
            <span className="eyebrow">Max price</span>
            <span className="text-[13px] font-bold text-forest">{formatCurrency(priceMax)}</span>
          </div>
          <input
            type="range"
            min={25000}
            max={200000}
            step={1000}
            value={priceMax}
            onChange={(e) => set('maxPrice', e.target.value)}
            className="mb-[22px] w-full"
          />

          <div className="mb-2 flex items-baseline justify-between">
            <span className="eyebrow">Min trees</span>
            <span className="text-[13px] font-bold text-forest">{minTrees}+ trees</span>
          </div>
          <input
            type="range"
            min={0}
            max={500}
            step={20}
            value={minTrees}
            onChange={(e) => set('minTrees', e.target.value || '')}
            className="mb-[22px] w-full"
          />

          <div className="eyebrow mb-2.5">Min rating</div>
          <div className="mb-5 flex gap-[7px]">
            {RATINGS.map((r) => (
              <div
                key={r.label}
                onClick={() => set('rating', r.v ? String(r.v) : '')}
                className={chip(rating === r.v)}
              >
                {r.label}
              </div>
            ))}
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] font-semibold">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => set('available', e.target.checked ? 'true' : '')}
              className="h-[17px] w-[17px] cursor-pointer"
            />
            Available now only
          </label>

          {mobileFilters && (
            <Button className="mt-6 w-full" onClick={() => setMobileFilters(false)}>
              Show {meta?.total ?? 0} results
            </Button>
          )}
        </aside>

        {/* Results */}
        <section className="min-w-[300px] flex-[3_1_600px]">
          <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3.5">
            <span className="text-sm text-sub">
              <b className="text-base text-ink">{meta?.total ?? 0}</b> orchards available
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobileFilters(true)}>
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </Button>
              <label className="flex items-center gap-2 text-[13px] text-sub">
                Sort by
                <select
                  value={params.get('sort') || 'newest'}
                  onChange={(e) => set('sort', e.target.value)}
                  className="cursor-pointer rounded-[10px] border border-sand bg-cream px-3 py-2 text-[13.5px] font-semibold text-ink"
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <OrchardCardSkeleton key={i} />
              ))}
            </div>
          ) : orchards.length === 0 ? (
            <EmptyState
              title="No orchards match those filters"
              description="Try widening your price range or clearing a filter."
              action={<Button onClick={clearFilters}>Clear all filters</Button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-5">
                {orchards.map((o) => (
                  <OrchardCard
                    key={o._id}
                    orchard={o}
                    isSaved={isSaved(o._id)}
                    isCompared={isCompared(o._id)}
                    onToggleSave={toggleSave}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
              {meta && meta.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination page={meta.page} totalPages={meta.totalPages} onChange={(p) => set('page', String(p))} />
                </div>
              )}
            </>
          )}

          {recent.length > 0 && (
            <div className="mt-[34px]">
              <h3 className="mb-3.5 font-serif text-[18px] font-semibold">Recently viewed</h3>
              <div className="flex gap-3.5 overflow-x-auto pb-1.5">
                {recent.map((o) => (
                  <a
                    key={o._id}
                    href={`/orchards/${o.slug}`}
                    className="w-[210px] flex-none overflow-hidden rounded-[13px] border border-sand bg-cream"
                  >
                    <div className="h-24" style={orchardSurface(o.thumbnail, o.fruitTypes, o._id)} />
                    <div className="px-3 py-2.5">
                      <h4 className="mb-0.5 font-serif text-sm leading-[1.2]">{o.gardenName}</h4>
                      <p className="text-[11.5px] text-faint">
                        {o.district}, {o.state}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
