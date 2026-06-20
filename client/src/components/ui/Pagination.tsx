import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  const items: (number | '...')[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - (pages[i - 1] as number) > 1) items.push('...');
    items.push(p);
  });

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {items.map((it, idx) =>
        it === '...' ? (
          <span key={`dots-${idx}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <Button
            key={it}
            variant={it === page ? 'primary' : 'outline'}
            size="icon"
            onClick={() => onChange(it)}
          >
            {it}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
