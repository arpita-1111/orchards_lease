/**
 * Deterministic fruit-toned gradients matching the reference design.
 * Real listing photos (when present and not a placeholder) take priority;
 * otherwise we render one of these lush gradients keyed off the fruit/id.
 */
const FRUIT_GRADIENTS: Record<string, string> = {
  mango: 'linear-gradient(135deg,#cf8a3a 0%,#9a6b2e 38%,#3f6b34 100%)',
  alphonso: 'linear-gradient(135deg,#cf8a3a 0%,#9a6b2e 38%,#3f6b34 100%)',
  kesar: 'linear-gradient(135deg,#e0a23a 0%,#a8782e 42%,#3f6b34 100%)',
  dasheri: 'linear-gradient(135deg,#d9a93f 0%,#7c8a2e 45%,#356b2f 100%)',
  litchi: 'linear-gradient(135deg,#c4452f 0%,#9a3a36 40%,#3f6b34 100%)',
  cherry: 'linear-gradient(135deg,#c4452f 0%,#9a3a36 40%,#3f6b34 100%)',
  pomegranate: 'linear-gradient(135deg,#b8333a 0%,#7e3a52 42%,#3f6b34 100%)',
  plum: 'linear-gradient(135deg,#b8333a 0%,#7e3a52 42%,#3f6b34 100%)',
  guava: 'linear-gradient(135deg,#bcc466 0%,#7c9a3e 45%,#356b2f 100%)',
  pear: 'linear-gradient(135deg,#bcc466 0%,#7c9a3e 45%,#356b2f 100%)',
  orange: 'linear-gradient(135deg,#d98a2e 0%,#b86a2a 40%,#3f6b34 100%)',
  apricot: 'linear-gradient(135deg,#d98a2e 0%,#b86a2a 40%,#3f6b34 100%)',
  peach: 'linear-gradient(135deg,#d98a2e 0%,#b86a2a 40%,#3f6b34 100%)',
  apple: 'linear-gradient(135deg,#9a7b3e 0%,#6e7a3a 45%,#356b2f 100%)',
  fig: 'linear-gradient(135deg,#8aa06a 0%,#5e7a4a 45%,#356b2f 100%)',
  grape: 'linear-gradient(135deg,#7e3a52 0%,#5a4a6a 42%,#3f6b34 100%)',
  banana: 'linear-gradient(135deg,#d9c23f 0%,#9aa02e 45%,#356b2f 100%)',
};

const FALLBACKS = Object.values(FRUIT_GRADIENTS);

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const isRealImage = (url?: string) =>
  !!url && !/placehold\.co|placeholder|via\.placeholder/i.test(url);

export const orchardGradient = (fruitTypes: string[] = [], seed = '') => {
  for (const f of fruitTypes) {
    const key = f.toLowerCase().split(' ').find((w) => FRUIT_GRADIENTS[w]) || f.toLowerCase();
    if (FRUIT_GRADIENTS[key]) return FRUIT_GRADIENTS[key];
  }
  return FALLBACKS[hash(seed || fruitTypes.join()) % FALLBACKS.length];
};

/** Returns a CSS background — real photo if available, else a gradient. */
export const orchardSurface = (
  thumbnail: string | undefined,
  fruitTypes: string[],
  seed: string
): { backgroundImage: string; backgroundSize?: string; backgroundPosition?: string } => {
  if (isRealImage(thumbnail)) {
    return {
      backgroundImage: `url(${thumbnail})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { backgroundImage: orchardGradient(fruitTypes, seed) };
};
