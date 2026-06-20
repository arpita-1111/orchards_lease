import { cn } from '@/lib/cn';

/** Pill toggle switch matching the reference design (42×24, sliding 18px knob). */
export function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        'relative h-6 w-[42px] flex-none rounded-full transition-colors',
        on ? 'bg-forest' : 'bg-[#d8d0bd]'
      )}
    >
      <span
        className={cn(
          'absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all',
          on ? 'left-[21px]' : 'left-[3px]'
        )}
      />
    </button>
  );
}
