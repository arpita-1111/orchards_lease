import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AnnouncementBanner } from './AnnouncementBanner';
import { CommandPalette } from './CommandPalette';

export function Layout() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <AnnouncementBanner />
      <Navbar />
      <CommandPalette />
      <Outlet />
    </div>
  );
}
