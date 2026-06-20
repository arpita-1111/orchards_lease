import type { Role } from '@/types';

/** Role-based avatar gradients, matching the reference design. */
const ROLE_GRADIENTS: Record<string, string> = {
  renter: 'linear-gradient(135deg,#b85c38,#2f5d3a)',
  seller: 'linear-gradient(135deg,#3f6b34,#c98a2b)',
  admin: 'linear-gradient(135deg,#23301d,#b85c38)',
};

export const avatarGradient = (role?: Role | string) =>
  ROLE_GRADIENTS[role || 'renter'] || ROLE_GRADIENTS.renter;

export const initialsOf = (name?: string) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
