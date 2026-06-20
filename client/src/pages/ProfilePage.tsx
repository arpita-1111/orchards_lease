import { useEffect, useState } from 'react';
import { Phone, Globe, CalendarDays, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { userService } from '@/services/user.service';
import { sellerService } from '@/services/seller.service';
import { Toggle } from '@/components/ui/Toggle';
import { getErrorMessage } from '@/lib/apiClient';
import { avatarGradient, initialsOf } from '@/lib/avatar';
import { formatDate, formatCurrency, timeAgo } from '@/lib/format';
import type { NotificationSettings } from '@/types';

interface Activity {
  type: string;
  title: string;
  detail: string;
  at: string;
}

const NOTIF_ROWS: { key: keyof NotificationSettings; title: string; desc: string }[] = [
  { key: 'emailBookings', title: 'Booking alerts', desc: 'Status changes on your lease requests.' },
  { key: 'emailApprovals', title: 'Approval updates', desc: 'When listings or bookings are approved.' },
  { key: 'emailMarketing', title: 'Newsletter', desc: 'Seasonal orchard highlights & offers.' },
  { key: 'inAppSystem', title: 'System notices', desc: 'Important account & platform updates.' },
];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { savedIds, compareIds, bookingCount } = useMarketplace();
  const toast = useToast();

  const isSeller = user?.role === 'seller';
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ bio: '', phone: '', language: '' });
  const [notif, setNotif] = useState<NotificationSettings | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [sellerStats, setSellerStats] = useState<{ orchards: number; revenue: number; rating: number } | null>(null);

  useEffect(() => {
    if (user) {
      setForm({ bio: user.bio || '', phone: user.phone || '', language: user.language || 'English' });
      setNotif(
        user.notificationSettings || {
          emailBookings: true,
          emailApprovals: true,
          emailMarketing: false,
          inAppBookings: true,
          inAppSystem: true,
        }
      );
    }
    userService.getActivity().then(setActivity).catch(() => {});
    if (isSeller) {
      sellerService
        .overview()
        .then((o) => setSellerStats({ orchards: o.totalOrchards, revenue: o.revenue, rating: 0 }))
        .catch(() => {});
    }
  }, [user, isSeller]);

  if (!user) return null;

  const save = async () => {
    try {
      const updated = await userService.updateProfile(form);
      updateUser(updated);
      setEdit(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleNotif = async (key: keyof NotificationSettings) => {
    if (!notif) return;
    const next = { ...notif, [key]: !notif[key] };
    setNotif(next);
    try {
      await userService.updateNotifications({ [key]: next[key] });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setNotif(notif);
    }
  };

  const stats = isSeller
    ? [
        { k: 'Orchards', v: sellerStats?.orchards ?? 0 },
        { k: 'Season revenue', v: formatCurrency(sellerStats?.revenue ?? 0) },
        { k: 'Saved', v: savedIds.size },
        { k: 'Bookings', v: bookingCount },
      ]
    : [
        { k: 'Bookings', v: bookingCount },
        { k: 'Saved', v: savedIds.size },
        { k: 'Comparing', v: compareIds.length },
        { k: 'Reviews', v: activity.filter((a) => a.type === 'review').length },
      ];

  const cover = isSeller
    ? 'linear-gradient(135deg,#3f6b34,#c98a2b)'
    : 'linear-gradient(135deg,#2f5d3a,#3f6b34)';

  return (
    <main className="mx-auto max-w-[1080px] px-6 pb-16 pt-6">
      <div className="relative h-32 overflow-hidden rounded-3xl" style={{ background: cover }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 86% 30%,rgba(201,138,43,.3),transparent 44%)' }} />
      </div>

      <div className="-mt-[46px] mb-[22px] flex flex-wrap items-end gap-[18px] px-2">
        <span
          className="flex h-24 w-24 items-center justify-center rounded-[24px] border-4 border-paper text-[30px] font-bold text-cream"
          style={{ background: avatarGradient(user.role) }}
        >
          {initialsOf(user.name)}
        </span>
        <div className="flex-1 basis-60 pb-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-serif text-[25px] font-semibold">{user.name}</h1>
            {isSeller ? (
              <span className="rounded-full bg-[#fbf2dd] px-2.5 py-[3px] text-[11.5px] font-bold text-[#a9772b]">
                Verified Seller
              </span>
            ) : (
              <span className="rounded-full bg-avail px-2.5 py-[3px] text-[11.5px] font-bold text-forest">Renter</span>
            )}
          </div>
          <p className="mt-1 text-[13.5px] text-faint">
            {user.email} · {isSeller ? 'Selling' : 'Member'} since {formatDate(user.createdAt)}
          </p>
        </div>
        <button
          onClick={() => (edit ? save() : setEdit(true))}
          className="rounded-[11px] border border-sand bg-cream px-[18px] py-2.5 text-[13.5px] font-bold text-ink"
        >
          {edit ? 'Save changes' : 'Edit profile'}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {stats.map((st) => (
          <div key={st.k} className="rounded-[15px] border border-sand bg-cream px-5 py-[18px]">
            <div className="font-serif text-[28px] font-bold text-ink">{st.v}</div>
            <div className="mt-0.5 text-[12.5px] font-semibold text-faint">{st.k}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex flex-1 basis-[360px] flex-col gap-5">
          {/* About */}
          <section className="rounded-2xl border border-sand bg-cream p-[22px]">
            <h2 className="mb-4 font-serif text-[18px] font-semibold">
              {isSeller ? 'About the orchardist' : 'About you'}
            </h2>
            {edit ? (
              <>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="mb-3.5 w-full resize-y rounded-[11px] border border-sand bg-white px-3.5 py-3 text-sm outline-none"
                  placeholder="Tell others about yourself…"
                />
                <div className="flex flex-wrap gap-3">
                  <label className="flex-1 basis-[140px]">
                    <span className="eyebrow mb-1.5 block">Phone</span>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-[11px] border border-sand bg-white px-3.5 py-3 text-sm outline-none"
                    />
                  </label>
                  <label className="flex-1 basis-[140px]">
                    <span className="eyebrow mb-1.5 block">Language</span>
                    <input
                      value={form.language}
                      onChange={(e) => setForm({ ...form, language: e.target.value })}
                      className="w-full rounded-[11px] border border-sand bg-white px-3.5 py-3 text-sm outline-none"
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 text-[14.5px] leading-relaxed text-[#3a4632]">
                  {user.bio || 'No bio yet — click Edit profile to add one.'}
                </p>
                <div className="flex flex-col gap-2.5 text-sm text-[#3a4632]">
                  <span className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-faint" /> {user.phone || '—'}
                  </span>
                  <span className="flex items-center gap-2.5">
                    <Globe className="h-4 w-4 text-faint" /> {user.language || 'English'}
                  </span>
                  <span className="flex items-center gap-2.5">
                    <CalendarDays className="h-4 w-4 text-faint" /> Joined {formatDate(user.createdAt)}
                  </span>
                </div>
              </>
            )}
          </section>

          {/* Notifications (both roles) */}
          <section className="rounded-2xl border border-sand bg-cream p-[22px]">
            <h2 className="font-serif text-[18px] font-semibold">Notifications</h2>
            <p className="mb-4 text-[13px] text-faint">Choose what we ping you about.</p>
            <div className="flex flex-col">
              {notif &&
                NOTIF_ROWS.map((row) => (
                  <div key={row.key} className="flex items-center justify-between gap-3.5 border-t border-chip py-[11px]">
                    <div>
                      <div className="text-sm font-semibold">{row.title}</div>
                      <div className="text-[12.5px] text-faint">{row.desc}</div>
                    </div>
                    <Toggle on={!!notif[row.key]} onClick={() => toggleNotif(row.key)} />
                  </div>
                ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="flex-1 basis-[280px]">
          {isSeller ? (
            <section className="rounded-2xl border border-sand bg-cream p-[22px]">
              <h2 className="mb-4 font-serif text-[18px] font-semibold">Payout &amp; verification</h2>
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center gap-2.5 rounded-xl bg-avail px-3.5 py-3">
                  <Check className="h-[18px] w-[18px] text-forest" strokeWidth={2.2} />
                  <div>
                    <div className="text-[13.5px] font-bold text-forest">KYC verified</div>
                    <div className="text-xs text-[#5f7a58]">Aadhaar &amp; PAN on file</div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-sand px-3.5 py-3">
                  <div>
                    <div className="text-[13.5px] font-bold">Bank payout</div>
                    <div className="text-xs text-faint">HDFC •••• 4821</div>
                  </div>
                  <span className="cursor-pointer text-xs font-semibold text-terra">Edit</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-sand px-3.5 py-3">
                  <div>
                    <div className="text-[13.5px] font-bold">Response rate</div>
                    <div className="text-xs text-faint">Replies within 6 hrs</div>
                  </div>
                  <span className="text-sm font-bold text-forest">98%</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-4 w-full rounded-[11px] bg-[#f7ece6] py-3 text-[13.5px] font-bold text-[#a05a45]"
              >
                Log out
              </button>
            </section>
          ) : (
            <section className="rounded-2xl border border-sand bg-cream p-[22px]">
              <h2 className="mb-[18px] font-serif text-[18px] font-semibold">Recent activity</h2>
              <div className="flex flex-col">
                {activity.length === 0 ? (
                  <p className="pb-4 text-sm text-faint">No recent activity yet.</p>
                ) : (
                  activity.slice(0, 6).map((t, i) => (
                    <div key={i} className="flex gap-3 pb-[18px]">
                      <span className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-avail">
                        <span className="h-2.5 w-2.5 rounded-full bg-forest" />
                      </span>
                      <div className="pt-0.5">
                        <div className="text-[13.5px] font-semibold leading-snug text-ink">{t.title}</div>
                        <div className="mt-0.5 text-xs text-faint">{timeAgo(t.at)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={logout}
                className="mt-1 w-full rounded-[11px] bg-[#f7ece6] py-3 text-[13.5px] font-bold text-[#a05a45]"
              >
                Log out
              </button>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
