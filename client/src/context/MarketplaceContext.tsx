import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { wishlistService } from '@/services/wishlist.service';
import { bookingService } from '@/services/booking.service';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getErrorMessage } from '@/lib/apiClient';

interface MarketplaceContextValue {
  savedIds: Set<string>;
  compareIds: string[];
  bookingCount: number;
  isSaved: (id: string) => boolean;
  isCompared: (id: string) => boolean;
  toggleSave: (id: string) => Promise<void>;
  toggleCompare: (id: string) => Promise<void>;
  clearCompare: () => Promise<void>;
  refreshBookingCount: () => void;
  setBookingCount: (n: number) => void;
}

const MarketplaceContext = createContext<MarketplaceContextValue | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const isRenter = user?.role === 'renter';

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [bookingCount, setBookingCount] = useState(0);

  const refreshBookingCount = useCallback(() => {
    if (!isRenter) return;
    bookingService
      .list({ role: 'renter' })
      .then((res) => setBookingCount(res.meta?.total ?? res.data.length))
      .catch(() => {});
  }, [isRenter]);

  useEffect(() => {
    if (!isRenter) {
      setSavedIds(new Set());
      setCompareIds([]);
      setBookingCount(0);
      return;
    }
    wishlistService
      .getWishlist()
      .then((items) => setSavedIds(new Set(items.map((o) => o._id))))
      .catch(() => {});
    wishlistService
      .getCompare()
      .then((items) => setCompareIds(items.map((o) => o._id)))
      .catch(() => {});
    refreshBookingCount();
  }, [isRenter, refreshBookingCount]);

  const toggleSave = useCallback(
    async (id: string) => {
      if (!isRenter) {
        toast.info('Log in as a renter to save orchards');
        return;
      }
      const had = savedIds.has(id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (had) next.delete(id);
        else next.add(id);
        return next;
      });
      try {
        await wishlistService.toggle(id);
        toast.success(had ? 'Removed from wishlist' : 'Saved to wishlist');
      } catch (err) {
        toast.error(getErrorMessage(err));
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (had) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    },
    [isRenter, savedIds, toast]
  );

  const toggleCompare = useCallback(
    async (id: string) => {
      if (!isRenter) {
        toast.info('Log in as a renter to compare orchards');
        return;
      }
      const had = compareIds.includes(id);
      if (!had && compareIds.length >= 4) {
        toast.info('Compare up to 4 orchards');
        return;
      }
      setCompareIds((prev) => (had ? prev.filter((x) => x !== id) : [...prev, id]));
      try {
        const list = await wishlistService.toggleCompare(id);
        setCompareIds(list);
        if (!had) toast.success('Added to compare');
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    },
    [isRenter, compareIds, toast]
  );

  const clearCompare = useCallback(async () => {
    setCompareIds([]);
    try {
      await wishlistService.clearCompare();
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <MarketplaceContext.Provider
      value={{
        savedIds,
        compareIds,
        bookingCount,
        isSaved: (id) => savedIds.has(id),
        isCompared: (id) => compareIds.includes(id),
        toggleSave,
        toggleCompare,
        clearCompare,
        refreshBookingCount,
        setBookingCount,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error('useMarketplace must be used within MarketplaceProvider');
  return ctx;
}
