import { useEffect, useState } from 'react';
import { CalendarDays, FileDown } from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { EmptyState, Badge, statusTone, Spinner } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDate, titleCase } from '@/lib/format';
import { initialsOf } from '@/lib/avatar';
import { getErrorMessage } from '@/lib/apiClient';
import { cn } from '@/lib/cn';
import type { Booking, Orchard, User } from '@/types';

const TABS = [
  ['all', 'All'],
  ['requested', 'Pending'],
  ['approved', 'Approved'],
  ['completed', 'Completed'],
] as const;

export default function SellerBookings() {
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    bookingService
      .list({ role: 'seller', status: tab === 'all' ? undefined : tab })
      .then((res) => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  const act = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      toast.success(msg);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const downloadAgreement = async (id: string) => {
    setDownloadingId(id);
    try {
      await bookingService.downloadAgreement(id);
      toast.success('Lease agreement downloaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-[1000px] px-6 pb-16 pt-[26px]">
      <h1 className="mb-1 font-serif text-[27px] font-semibold">Booking requests</h1>
      <p className="mb-5 text-[13.5px] text-faint">Review and respond to lease requests on your orchards.</p>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'rounded-full border px-3.5 py-[7px] text-[12.5px] font-semibold transition-all',
              tab === key ? 'border-forest bg-forest text-cream' : 'border-sand text-sub hover:border-faint'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState emoji="🧺" title="No bookings in this view" description="Try another tab." />
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => {
            const renter = b.renterId as User;
            const o = b.orchardId as Orchard;
            const isDownloading = downloadingId === b._id;
            return (
              <div key={b._id} className="flex flex-wrap items-center gap-3.5 rounded-[15px] border border-sand bg-cream px-[17px] py-[15px]">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-forest-light text-sm font-bold text-cream">
                  {initialsOf(renter?.name)}
                </span>
                <div className="min-w-[180px] flex-1 basis-[200px]">
                  <div className="text-[14.5px] font-bold">{renter?.name}</div>
                  <div className="my-0.5 text-[12.5px] text-faint">{o?.gardenName}</div>
                  <div className="flex items-center gap-1.5 text-[12.5px] text-[#3a4632]">
                    <CalendarDays className="h-3 w-3 text-faint" />
                    {formatDate(b.startDate)} → {formatDate(b.endDate)}
                  </div>
                </div>
                <div className="flex-none text-right">
                  <Badge tone={statusTone[b.bookingStatus] || 'gray'}>{titleCase(b.bookingStatus)}</Badge>
                  <div className="mt-[7px] font-serif text-[17px] font-bold">{formatCurrency(b.totalAmount)}</div>
                </div>
                <div className="flex flex-none flex-wrap gap-2">
                  {b.bookingStatus === 'requested' && (
                    <>
                      <button
                        onClick={() => act(() => bookingService.approve(b._id), 'Booking approved — renter notified')}
                        className="rounded-[9px] bg-forest px-[15px] py-2.5 text-[12.5px] font-bold text-cream"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => act(() => bookingService.reject(b._id), 'Booking declined')}
                        className="rounded-[9px] bg-[#f3e7e1] px-[15px] py-2.5 text-[12.5px] font-semibold text-[#a05a45]"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {b.bookingStatus === 'approved' && (
                    <button
                      onClick={() => act(() => bookingService.complete(b._id), 'Marked complete')}
                      className="rounded-[9px] border border-sand bg-white px-[15px] py-2.5 text-[12.5px] font-semibold text-ink"
                    >
                      Mark complete
                    </button>
                  )}
                  {['approved', 'completed'].includes(b.bookingStatus) && (
                    <button
                      id={`seller-download-agreement-${b._id}`}
                      onClick={() => downloadAgreement(b._id)}
                      disabled={isDownloading}
                      className="flex items-center gap-1.5 rounded-[9px] bg-[#2a4e20] px-[15px] py-2.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {isDownloading ? (
                        <Spinner className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <FileDown className="h-3.5 w-3.5" />
                      )}
                      {isDownloading ? 'Generating…' : 'Download Agreement'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
