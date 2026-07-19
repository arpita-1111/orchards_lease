import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileDown } from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { EmptyState, Button, Badge, statusTone, Spinner } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { formatCurrency, formatDate, titleCase } from '@/lib/format';
import { orchardSurface } from '@/lib/gradients';
import { getErrorMessage } from '@/lib/apiClient';
import type { Booking, Orchard } from '@/types';

export default function BookingsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshBookingCount } = useMarketplace();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    bookingService
      .list({ role: 'renter' })
      .then((res) => setBookings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const cancel = async (id: string) => {
    try {
      await bookingService.cancel(id);
      toast.success('Booking cancelled');
      load();
      refreshBookingCount();
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
    <main className="mx-auto max-w-[920px] px-6 pb-16 pt-7">
      <h1 className="mb-1.5 font-serif text-[28px] font-semibold">Your bookings</h1>
      <p className="mb-6 text-sm text-faint">Track lease requests and their status.</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7" />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          emoji="🧺"
          title="No bookings yet"
          description="Find an orchard and send a lease request to get started."
          action={<Button onClick={() => navigate('/explore')}>Explore orchards</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3.5">
          {bookings.map((b) => {
            const o = b.orchardId as Orchard;
            const isDownloading = downloadingId === b._id;
            return (
              <div
                key={b._id}
                className="flex flex-wrap items-center gap-3.5 rounded-[15px] border border-sand bg-cream p-4"
              >
                <div
                  className="h-[72px] w-[92px] flex-none rounded-[10px]"
                  style={orchardSurface(o?.thumbnail, o?.fruitTypes || [], o?._id || b._id)}
                />
                <div className="min-w-[180px] flex-1 basis-[220px]">
                  <h3
                    onClick={() => o?.slug && navigate(`/orchards/${o.slug}`)}
                    className="cursor-pointer font-serif text-base font-semibold leading-[1.2]"
                  >
                    {o?.gardenName || 'Orchard'}
                  </h3>
                  <p className="my-1 text-[12.5px] text-faint">
                    {o ? `${o.district}, ${o.state}` : ''}
                  </p>
                  <p className="flex items-center gap-1.5 text-[13px] text-[#3a4632]">
                    <Calendar className="h-3 w-3 text-faint" />
                    {formatDate(b.startDate)} → {formatDate(b.endDate)}
                  </p>
                </div>
                <div className="flex-none text-right">
                  <Badge tone={statusTone[b.bookingStatus] || 'gray'}>{titleCase(b.bookingStatus)}</Badge>
                  <div className="mt-2 font-serif text-[18px] font-bold text-ink">
                    {formatCurrency(b.totalAmount)}
                  </div>
                  <div className="text-[11.5px] text-faint">Payment: {titleCase(b.paymentStatus)}</div>
                </div>
                <div className="flex flex-none flex-wrap gap-2">
                  {['approved', 'completed'].includes(b.bookingStatus) && (
                    <button
                      id={`download-agreement-${b._id}`}
                      onClick={() => downloadAgreement(b._id)}
                      disabled={isDownloading}
                      className="flex items-center gap-1.5 rounded-[9px] bg-[#2a4e20] px-3.5 py-2.5 text-[12.5px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {isDownloading ? (
                        <Spinner className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <FileDown className="h-3.5 w-3.5" />
                      )}
                      {isDownloading ? 'Generating…' : 'Download Agreement'}
                    </button>
                  )}
                  {['requested', 'approved'].includes(b.bookingStatus) && (
                    <button
                      onClick={() => cancel(b._id)}
                      className="flex-none rounded-[9px] bg-[#f3e7e1] px-3.5 py-2.5 text-[12.5px] font-semibold text-[#a05a45]"
                    >
                      Cancel
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
