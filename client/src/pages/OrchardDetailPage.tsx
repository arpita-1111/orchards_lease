import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Heart, 
  GitCompareArrows, 
  Star, 
  MapPin, 
  Calendar, 
  Check, 
  BadgeCheck,
  Store,        // For Markets
  Milestone,    // For Highways / Connectivity
  Warehouse,    // For Warehouses
  Fuel,         // For Petrol Pumps
  Activity,     // For Hospitals
  ShoppingBag   // For Agricultural Stores
} from 'lucide-react';
import { orchardService } from '@/services/orchard.service';
import { bookingService } from '@/services/booking.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { Button, EmptyState, Badge } from '@/components/ui';
import { BookingModal } from '@/components/orchard/BookingModal';
import { OrchardCard as OrchardMini } from '@/components/orchard/OrchardCard';
import { formatCurrency, formatDate, titleCase } from '@/lib/format';
import { orchardSurface } from '@/lib/gradients';
import { getErrorMessage } from '@/lib/apiClient';
import { cn } from '@/lib/cn';
import type { Orchard, Review } from '@/types';

export default function OrchardDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { isSaved, isCompared, toggleSave, toggleCompare, refreshBookingCount } = useMarketplace();

  const [orchard, setOrchard] = useState<Orchard | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

// Crop season dictionary mapping layout rules
  const cropSeasons: Record<string, string> = {
    apple: 'August - October (Autumn Peak)',
    mango: 'April - July (Summer Peak)',
    orange: 'November - January (Winter Peak)',
    banana: 'Year-round Availability',
    grapes: 'January - April (Spring Harvest)',
    pomegranate: 'September - February (Winter Harvest)'
  };

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    orchardService
      .getBySlug(slug)
      .then((o) => {
        setOrchard(o);
        setGalleryIndex(0);
        orchardService.getReviews(o._id).then((r) => setReviews(r.data)).catch(() => {});
      })
      .catch(() => setOrchard(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const requestBooking = () => {
    if (!user) {
      navigate('/login', { state: { from: `/orchards/${slug}` } });
      return;
    }
    if (user.role !== 'renter') {
      toast.info('Only renters can book orchards');
      return;
    }
    setBookingOpen(true);
  };

  const confirmBooking = async (startDate: string, endDate: string) => {
    if (!orchard) return;
    setSubmitting(true);
    try {
      await bookingService.create({ orchardId: orchard._id, startDate, endDate });
      toast.success('Booking request sent to seller');
      setBookingOpen(false);
      refreshBookingCount();
      navigate('/bookings');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!orchard)
    return (
      <main className="container-page py-16">
        <EmptyState
          emoji="🌳"
          title="Orchard not found"
          description="This orchard may have been removed or unpublished."
          action={<Button onClick={() => navigate('/explore')}>Browse orchards</Button>}
        />
      </main>
    );

  const seller = typeof orchard.sellerId === 'object' ? orchard.sellerId : null;
  const surface = orchardSurface(orchard.thumbnail, orchard.fruitTypes, orchard._id);
  const rent = orchard.rentType?.startsWith('per') ? orchard.rentType : `per ${orchard.rentType}`;
  const fee = Math.round(orchard.price * 0.08);
  const dep = Math.round(orchard.price * 0.15);
  const saved = isSaved(orchard._id);
  const plantationYear = (orchard as any).plantationYear || 2020;
  const calculatedAge = 2026 - plantationYear;

  const stats = [
    { k: 'Total trees', v: orchard.totalTrees.toLocaleString() },
    { k: 'Avg yield / tree', v: `${orchard.averageFruitPerTree} fruits` },
    { k: 'Expected yield', v: `${orchard.expectedYield.toLocaleString()} kg` },
    { k: 'Plot area', v: `${orchard.totalArea} ${orchard.areaUnit}` },
    { k: 'Harvest window', v: formatDate(orchard.estimatedHarvestDate) },
    { k: 'Orchard Maturity', v: `${calculatedAge > 0 ? calculatedAge : 0} years old (Est. ${plantationYear})` },
  ];

  // Dynamic nearby facilities matching issue specifications
  const nearbyFacilities = [
    { name: `${orchard.district} Wholesalers`, type: 'Local Market', distance: '2.4 km', icon: Store },
    { name: 'State Highway Connect', type: 'Transport Link', distance: '4.1 km', icon: Milestone },
    { name: 'Agro Cold Storage Vaults', type: 'Warehouse Facility', distance: '1.8 km', icon: Warehouse },
    { name: 'National Fuel Station', type: 'Petrol Pump', distance: '3.5 km', icon: Fuel },
    { name: 'District Civil Hospital', type: 'Medical Care', distance: '5.2 km', icon: Activity },
    { name: 'Kisan Supply Emporium', type: 'Agricultural Store', distance: '0.9 km', icon: ShoppingBag },
  ];

  return (
    <main className="mx-auto max-w-[1180px] px-6 pb-16 pt-5">
      <button
        onClick={() => navigate('/explore')}
        className="mb-4 flex items-center gap-1.5 py-1 text-[13.5px] font-semibold text-sub"
      >
        <ChevronLeft className="h-[17px] w-[17px]" /> Back to explore
      </button>

      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2.5">
            <Badge tone={orchard.available ? 'green' : 'gray'}>
              {orchard.available ? 'Available now' : 'Booked out'}
            </Badge>
            <span className="eyebrow">{orchard.fruitTypes[0]}</span>
          </div>
          <h1 className="font-serif text-[clamp(24px,3vw,33px)] font-semibold leading-[1.1]">
            {orchard.gardenName}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-3.5 text-sm text-sub">
            {orchard.ratingCount > 0 && (
              <span className="flex items-center gap-1.5 font-bold text-ink">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                {orchard.ratingAverage.toFixed(1)} · {orchard.ratingCount} reviews
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-faint" />
              {orchard.district}, {orchard.state}
            </span>
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => toggleSave(orchard._id)}
            className="flex items-center gap-1.5 rounded-xl border border-sand bg-cream px-4 py-2.5 text-[13px] font-semibold text-ink"
          >
            <Heart className={cn('h-[15px] w-[15px]', saved ? 'fill-terra text-terra' : 'text-sub')} />
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={() => toggleCompare(orchard._id)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-[13px] font-semibold',
              isCompared(orchard._id) ? 'border-forest bg-forest text-cream' : 'border-sand bg-cream text-ink'
            )}
          >
            <GitCompareArrows className="h-[15px] w-[15px]" />
            Compare
          </button>
        </div>
      </div>

      {/* Hero + gallery */}
      <div className="mb-7 flex items-stretch gap-2.5">
        <div className="relative flex-1 overflow-hidden rounded-[18px]" style={{ height: 'clamp(260px,38vw,420px)', ...surface }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,transparent 55%,rgba(20,30,15,.4))' }} />
          <div className="absolute bottom-3.5 left-4 text-[11px] font-bold uppercase tracking-[.1em] text-cream/80">
            Orchard photo · {orchard.district}, {orchard.state}
          </div>
        </div>
        <div className="flex w-[84px] flex-none flex-col gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => setGalleryIndex(i)}
              className="h-[70px] rounded-[10px]"
              style={{
                ...surface,
                filter: `hue-rotate(${i * 14}deg) brightness(${i === galleryIndex ? 1 : 0.86})`,
                outline: i === galleryIndex ? '2px solid #2f5d3a' : '2px solid transparent',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-[30px]">
        {/* Left */}
        <div className="min-w-[300px] flex-[2_1_480px]">
          <p className="mb-6 max-w-[64ch] text-[15.5px] leading-[1.65] text-[#3a4632]">{orchard.description}</p>

          <h2 className="mb-3.5 font-serif text-[19px] font-semibold">Orchard at a glance</h2>
          <div className="mb-7 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-px overflow-hidden rounded-xl border border-sand bg-sand">
            {stats.map((st) => (
              <div key={st.k} className="bg-cream px-4 py-4">
                <div className="mb-1.5 text-[11.5px] font-bold uppercase tracking-[.05em] text-faint">{st.k}</div>
                <div className="font-serif text-[18px] font-semibold text-ink">{st.v}</div>
              </div>
            ))}
          </div>

         <h2 className="mb-3.5 font-serif text-[19px] font-semibold">Crop Variety &amp; Seasonal Info</h2>
          <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {orchard.fruitTypes.map((f) => (
              <div key={f} className="flex flex-col rounded-xl border border-sand bg-cream p-3.5">
                <div className="text-sm font-bold text-ink">{titleCase(f)}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-forest font-semibold">
                  <span className="inline-block h-2 w-2 rounded-full bg-forest animate-pulse" />
                  {cropSeasons[f.toLowerCase()] || 'Check with owner for specific harvest schedules'}
                </div>
              </div>
            ))}
          </div>
          
          {/* Soil Composition Details Block */}
          <h2 className="mb-3.5 font-serif text-[19px] font-semibold">Soil &amp; Land Quality</h2>
          <div className="mb-7 rounded-xl border border-sand bg-cream p-4">
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-chip pb-3 mb-3">
              <span className="text-sm font-bold text-ink">Soil Classification</span>
              <span className="rounded-full bg-avail px-3 py-1 text-xs font-bold text-forest">
                {(orchard as any).soilType || 'Loamy'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#3a4632]">
              {(orchard as any).soilDescription || 'No secondary nutritional details provided by owner yet. This classification represents general soil compositions typical to the regional district area.'}
            </p>
          </div>

          {orchard.amenities.length > 0 && (
            <>
              <h2 className="mb-3.5 font-serif text-[19px] font-semibold">Amenities &amp; infrastructure</h2>
              <div className="mb-7 grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2.5">
                {orchard.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2.5 text-sm text-[#3a4632]">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-[7px] bg-avail">
                      <Check className="h-3 w-3 text-forest" strokeWidth={2.4} />
                    </span>
                    {titleCase(a)}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* New Nearby Infrastructure Section */}
          <h2 className="mb-3.5 font-serif text-[19px] font-semibold">Nearby Facilities</h2>
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {nearbyFacilities.map((fac, idx) => {
              const IconComp = fac.icon;
              return (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-sand bg-cream p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chip text-forest">
                      <IconComp className="h-[18px] w-[18px]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ink">{fac.name}</div>
                      <div className="text-xs text-faint">{fac.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-avail px-2.5 py-1 text-xs font-bold text-forest">
                      {fac.distance}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="mb-3.5 font-serif text-[19px] font-semibold">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-faint">No reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-3.5">
              {reviews.map((r) => (
                <div key={r._id} className="rounded-xl border border-sand bg-cream px-[18px] py-4">
                  <div className="mb-2.5 flex items-center gap-2.5">
                    <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-forest text-[13px] font-bold text-cream">
                      {r.renterId?.name?.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <div className="text-sm font-bold">{r.renterId?.name}</div>
                      <div className="text-xs text-faint">{formatDate(r.createdAt)}</div>
                    </div>
                  </div>
                  <p className="text-sm leading-[1.55] text-[#3a4632]">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right booking card */}
        <aside className="min-w-[300px] flex-1 basis-[320px] lg:sticky lg:top-[84px]">
          <div className="rounded-[18px] border border-sand bg-cream p-[22px] shadow-soft">
            <div className="mb-1 flex items-baseline gap-1.5">
              <span className="font-serif text-[28px] font-bold text-terra">{formatCurrency(orchard.price)}</span>
              <span className="text-[13px] text-faint">{rent}</span>
            </div>
            <p className="mb-4 text-[12.5px] text-faint">
              Harvest window · {formatDate(orchard.estimatedHarvestDate)}
            </p>

            <button
              onClick={requestBooking}
              className="mb-3.5 w-full rounded-xl border border-sand px-4 py-3 text-left"
            >
              <div className="mb-0.5 text-[11px] font-bold uppercase tracking-[.06em] text-faint">Lease dates</div>
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Calendar className="h-[15px] w-[15px] text-forest" />
                Select harvest dates
              </div>
            </button>

            <div className="mb-3.5 text-[13px] text-sub">
              <Row label={`Lease (${rent})`} value={formatCurrency(orchard.price)} />
              <Row label="Platform fee (8%)" value={formatCurrency(fee)} />
              <Row label="Refundable deposit" value={formatCurrency(dep)} />
              <div className="mt-1.5 flex justify-between border-t border-chip pt-3 text-[15px] font-bold text-ink">
                <span>Total</span>
                <span>{formatCurrency(orchard.price + fee + dep)}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" disabled={!orchard.available} onClick={requestBooking}>
              {orchard.available ? 'Request to book' : 'Currently unavailable'}
            </Button>
            <p className="mt-2.5 text-center text-xs text-faint">
              You won't be charged until the seller approves.
            </p>

            {seller && (
              <div className="mt-[18px] flex items-center gap-2.5 border-t border-chip pt-[18px]">
                <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-forest-light text-sm font-bold text-cream">
                  {seller.avatar ? (
                    <img src={seller.avatar} alt="" className="h-[42px] w-[42px] rounded-full object-cover" />
                  ) : (
                    seller.name?.slice(0, 2).toUpperCase()
                  )}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-sm font-bold">
                    {seller.name}
                    <BadgeCheck className="h-3.5 w-3.5 text-forest" />
                  </div>
                  <div className="text-xs text-faint">Member since {formatDate(seller.createdAt)}</div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {bookingOpen && (
        <BookingModal
          orchard={orchard}
          submitting={submitting}
          onClose={() => setBookingOpen(false)}
          onConfirm={confirmBooking}
        />
      )}

      {/* Related */}
      <RelatedOrchards slug={slug} />
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-[5px]">
      <span>{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function RelatedOrchards({ slug }: { slug: string }) {
  const [related, setRelated] = useState<Orchard[]>([]);
  const { isSaved, isCompared, toggleSave, toggleCompare } = useMarketplace();

  useEffect(() => {
    orchardService.getRelated(slug).then(setRelated).catch(() => {});
  }, [slug]);

  if (related.length === 0) return null;
  return (
    <section className="mt-14">
      <h2 className="mb-5 font-serif text-xl font-semibold">Related orchards</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {related.slice(0, 4).map((o) => (
          <OrchardMini
            key={o._id}
            orchard={o}
            isSaved={isSaved(o._id)}
            isCompared={isCompared(o._id)}
            onToggleSave={toggleSave}
            onToggleCompare={toggleCompare}
          />
        ))}
      </div>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 pb-16 pt-5">
      <div className="sk mb-5 h-4 w-32 rounded" />
      <div className="sk mb-3 h-8 w-[55%] rounded-lg" />
      <div className="sk mb-6 h-4 w-[35%] rounded-lg" />
      <div className="sk mb-6 rounded-[18px]" style={{ height: 'clamp(260px,38vw,420px)' }} />
      <div className="flex flex-wrap gap-7">
        <div className="flex-[2_1_460px]">
          <div className="sk h-[230px] rounded-xl" />
        </div>
        <div className="flex-1 basis-[320px]">
          <div className="sk h-[330px] rounded-xl" />
        </div>
      </div>
    </main>
  );
}
