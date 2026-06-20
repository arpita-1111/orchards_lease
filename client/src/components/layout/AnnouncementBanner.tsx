import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import api from '@/lib/apiClient';
import { cn } from '@/lib/cn';

interface PublicSettings {
  announcement: { enabled: boolean; message: string; level: 'info' | 'warning' | 'critical' };
}

const levelStyles = {
  info: 'bg-sky-600',
  warning: 'bg-amber-600',
  critical: 'bg-red-600',
};

export function AnnouncementBanner() {
  const [data, setData] = useState<PublicSettings['announcement'] | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    api
      .get('/meta/settings')
      .then((res) => setData(res.data.data.announcement))
      .catch(() => {});
  }, []);

  if (!data?.enabled || !data.message || dismissed) return null;

  return (
    <div className={cn('text-white', levelStyles[data.level])}>
      <div className="container-page flex items-center gap-3 py-2 text-sm">
        <Megaphone className="h-4 w-4 shrink-0" />
        <p className="flex-1">{data.message}</p>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss announcement">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
