import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { Spinner } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { initialsOf } from '@/lib/avatar';
import { formatDate, titleCase } from '@/lib/format';
import { getErrorMessage } from '@/lib/apiClient';
import { cn } from '@/lib/cn';
import type { User } from '@/types';

const FILTERS = [
  ['all', 'All'],
  ['renter', 'Renters'],
  ['seller', 'Sellers'],
  ['blocked', 'Flagged'],
] as const;

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string | boolean> = {};
    if (search) params.search = search;
    if (filter === 'renter' || filter === 'seller') params.role = filter;
    if (filter === 'blocked') params.blocked = true;
    adminService
      .users(params)
      .then((res) => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, filter]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const act = async (id: string, action: 'suspend' | 'block', name: string) => {
    try {
      await adminService.updateUserStatus(id, action);
      toast.success(`${name} ${action}ed`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const roleStyle = (role: string) =>
    role === 'seller' ? 'bg-[#fbf2dd] text-[#a9772b]' : 'bg-[#e7eef6] text-[#39618f]';
  const statusStyle = (u: User) =>
    u.isBlocked
      ? 'bg-[#f3e7e1] text-[#a05a45]'
      : u.accountStatus === 'suspended'
        ? 'bg-[#fbf2dd] text-[#a9772b]'
        : 'bg-avail text-forest';
  const statusLabel = (u: User) => (u.isBlocked ? 'Blocked' : titleCase(u.accountStatus || 'active'));

  return (
    <main className="mx-auto max-w-[1240px] px-6 pb-16 pt-6">
      <div className="mb-[18px]">
        <h1 className="font-serif text-[27px] font-semibold">User management</h1>
        <p className="mt-1 text-[13.5px] text-faint">Search, filter and moderate platform accounts</p>
      </div>

      <div className="mb-[18px] flex flex-wrap items-center gap-3">
        <div className="flex min-w-[220px] flex-1 basis-[280px] items-center gap-2.5 rounded-xl border border-sand bg-cream px-3.5 py-2.5">
          <Search className="h-[17px] w-[17px] text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
          />
        </div>
        <div className="flex flex-wrap gap-[7px]">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'rounded-full border px-3.5 py-[7px] text-[12.5px] font-semibold transition-all',
                filter === key ? 'border-forest bg-forest text-cream' : 'border-sand text-sub hover:border-faint'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-sand bg-cream">
        <div className="flex items-center gap-3.5 border-b border-chip px-[18px] py-3 text-[11.5px] font-bold uppercase tracking-[.05em] text-faint">
          <span className="flex-1 basis-60">User</span>
          <span className="w-[90px] flex-none">Role</span>
          <span className="w-[100px] flex-none">Status</span>
          <span className="hidden w-[90px] flex-none sm:block">Joined</span>
          <span className="w-[150px] flex-none text-right">Actions</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-7 w-7" />
          </div>
        ) : users.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-faint">No users match your search.</div>
        ) : (
          users.map((u) => (
            <div key={u._id} className="flex flex-wrap items-center gap-3.5 border-t border-[#f3efe4] px-[18px] py-3">
              <div className="flex min-w-[200px] flex-1 basis-60 items-center gap-2.5">
                <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-forest text-xs font-bold text-cream">
                  {initialsOf(u.name)}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold">{u.name}</div>
                  <div className="truncate text-xs text-faint">{u.email}</div>
                </div>
              </div>
              <span className="w-[90px] flex-none">
                <span className={cn('rounded-full px-2 py-[3px] text-[11px] font-bold', roleStyle(u.role))}>
                  {titleCase(u.role)}
                </span>
              </span>
              <span className="w-[100px] flex-none">
                <span className={cn('rounded-full px-2.5 py-[3px] text-[11.5px] font-bold', statusStyle(u))}>
                  {statusLabel(u)}
                </span>
              </span>
              <span className="hidden w-[90px] flex-none text-[12.5px] text-sub sm:block">{formatDate(u.createdAt)}</span>
              <div className="flex w-[150px] flex-none justify-end gap-1.5">
                <button
                  onClick={() => act(u._id || u.id, 'suspend', u.name)}
                  className="rounded-lg bg-[#fbf2dd] px-2.5 py-[7px] text-xs font-semibold text-[#a9772b]"
                >
                  Suspend
                </button>
                <button
                  onClick={() => act(u._id || u.id, 'block', u.name)}
                  className="rounded-lg bg-[#f3e7e1] px-2.5 py-[7px] text-xs font-semibold text-[#a05a45]"
                >
                  Block
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
