import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wishlistService } from '@/services/wishlist.service';
import { OrchardCard, OrchardCardSkeleton } from '@/components/orchard/OrchardCard';
import { EmptyState, Button } from '@/components/ui';
import { useMarketplace } from '@/context/MarketplaceContext';
import type { Orchard } from '@/types';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { savedIds, isCompared, toggleSave, toggleCompare } = useMarketplace();
  const [items, setItems] = useState<Orchard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wishlistService
      .getWishlist()
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // keep the displayed grid in sync when a card is un-saved
  const visible = items.filter((o) => savedIds.has(o._id));

  return (
    <main className="mx-auto max-w-[1180px] px-6 pb-16 pt-7">
      <h1 className="mb-1.5 font-serif text-[28px] font-semibold">Saved orchards</h1>
      <p className="mb-6 text-sm text-faint">Orchards you've bookmarked to revisit.</p>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <OrchardCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          emoji="🤍"
          title="No saved orchards yet"
          description="Tap the heart on any orchard to save it here."
          action={<Button onClick={() => navigate('/explore')}>Explore orchards</Button>}
        />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-5">
          {visible.map((o) => (
            <OrchardCard
              key={o._id}
              orchard={o}
              isSaved
              isCompared={isCompared(o._id)}
              onToggleSave={toggleSave}
              onToggleCompare={toggleCompare}
            />
          ))}
        </div>
      )}
    </main>
  );
}
