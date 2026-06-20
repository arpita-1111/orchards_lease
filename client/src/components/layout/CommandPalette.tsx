import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Heart, LayoutDashboard, User, Plus, CalendarDays } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { orchardService } from '@/services/orchard.service';
import type { Orchard } from '@/types';

interface Command {
  label: string;
  icon: typeof Search;
  action: () => void;
  group: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Orchard[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Cmd/Ctrl+K toggles
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await orchardService.list({ search: query, limit: 5 });
        setResults(res.data);
      } catch {
        /* ignore */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const go = useCallback(
    (path: string) => {
      setOpen(false);
      setQuery('');
      navigate(path);
    },
    [navigate]
  );

  const commands: Command[] = [
    { label: 'Explore orchards', icon: Compass, action: () => go('/explore'), group: 'Navigate' },
    ...(user?.role === 'renter'
      ? [
          { label: 'My wishlist', icon: Heart, action: () => go('/wishlist'), group: 'Navigate' },
          { label: 'My bookings', icon: CalendarDays, action: () => go('/bookings'), group: 'Navigate' },
        ]
      : []),
    ...(user?.role === 'seller'
      ? [
          { label: 'Seller dashboard', icon: LayoutDashboard, action: () => go('/seller'), group: 'Navigate' },
          { label: 'Add orchard', icon: Plus, action: () => go('/seller/orchards/new'), group: 'Actions' },
        ]
      : []),
    ...(user ? [{ label: 'My profile', icon: User, action: () => go('/profile'), group: 'Navigate' }] : []),
  ];

  const filtered = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center p-4 pt-[15vh]">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-xl animate-slide-up overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orchards or jump to a page…"
            className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-slate-400"
          />
          <kbd className="hidden rounded border border-slate-300 px-1.5 text-[10px] text-slate-400 sm:block dark:border-slate-700">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-xs font-semibold uppercase text-slate-400">Orchards</p>
              {results.map((o) => (
                <button
                  key={o._id}
                  onClick={() => go(`/orchards/${o.slug}`)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <img src={o.thumbnail} alt="" className="h-8 w-8 rounded object-cover" />
                  <div>
                    <p className="text-sm text-slate-800 dark:text-slate-100">{o.gardenName}</p>
                    <p className="text-xs text-slate-400">
                      {o.district}, {o.state}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <p className="px-2 py-1 text-xs font-semibold uppercase text-slate-400">Quick actions</p>
          {filtered.map((c) => (
            <button
              key={c.label}
              onClick={c.action}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <c.icon className="h-4 w-4 text-slate-400" />
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
