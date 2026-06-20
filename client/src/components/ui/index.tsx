import type { HTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export { Button } from './Button';
export { Input, Textarea, Select } from './Input';

/* ------------------------------- Card ------------------------------ */
export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card p-5', className)} {...props}>
      {children}
    </div>
  );
}

/* ------------------------------ Badge ------------------------------ */
type BadgeTone = 'gray' | 'green' | 'terra' | 'gold' | 'requested' | 'approved' | 'cancelled';
const tones: Record<BadgeTone, string> = {
  gray: 'bg-chip text-sub',
  green: 'bg-avail text-forest',
  terra: 'bg-[#f3e7e1] text-[#a05a45]',
  gold: 'bg-gold text-cream',
  requested: 'bg-[#fbf2dd] text-[#a9772b]',
  approved: 'bg-avail text-forest',
  cancelled: 'bg-[#f3e7e1] text-[#a05a45]',
};

export function Badge({
  tone = 'gray',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-bold tracking-[.02em]',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Maps domain statuses to badge tones. */
export const statusTone: Record<string, BadgeTone> = {
  published: 'approved',
  approved: 'approved',
  completed: 'approved',
  Approved: 'approved',
  Requested: 'requested',
  requested: 'requested',
  pending: 'requested',
  draft: 'gray',
  unpublished: 'gray',
  archived: 'gray',
  rejected: 'cancelled',
  cancelled: 'cancelled',
  Cancelled: 'cancelled',
  Rejected: 'cancelled',
};

/* ----------------------------- Spinner ----------------------------- */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-forest', className)} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

/* ---------------------------- Skeleton ----------------------------- */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('sk rounded-lg', className)} />;
}

/* --------------------------- Empty state --------------------------- */
export function EmptyState({
  emoji = '🌾',
  title,
  description,
  action,
}: {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d8d0bd] bg-cream px-5 py-[72px] text-center">
      <div className="mb-2 text-[34px]">{emoji}</div>
      <h3 className="font-serif text-[19px] text-ink">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-faint">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
