import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getErrorMessage } from '@/lib/apiClient';
import { cn } from '@/lib/cn';
import type { Role } from '@/types';

type Mode = 'signin' | 'signup' | 'admin';

function Leaf({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <ellipse cx="9" cy="10" rx="5" ry="7.5" fill="#cfe3c2" transform="rotate(-32 9 10)" />
      <ellipse cx="15" cy="10" rx="5" ry="7.5" fill="#fffdf7" transform="rotate(32 15 10)" />
      <line x1="12" y1="9" x2="12" y2="21" stroke="#cfe3c2" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const FEATURES = [
  ['Verified yields & calendars', 'Transparent tree counts, harvest windows and live availability.'],
  ['Seller-direct bookings', 'No middlemen — lease straight from the orchardist.'],
  ['GI-tagged estates', 'Alphonso, Kesar, Shahi litchi, Nagpur santra & more.'],
];

export default function AuthPage({ initialMode = 'signin' }: { initialMode?: Mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, adminLogin, register } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [role, setRole] = useState<Role>('renter');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || '/';
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const routeFor = (u: { role: Role }) =>
    u.role === 'admin' ? '/admin' : u.role === 'seller' ? '/seller' : from === '/' ? '/explore' : from;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let u;
      if (mode === 'admin') u = await adminLogin(form.email, form.password);
      else if (mode === 'signup') u = await register({ ...form, role });
      else u = await login(form.email, form.password, remember);
      toast.success(mode === 'signup' ? 'Account created — welcome!' : `Welcome back, ${u.name.split(' ')[0]}`);
      navigate(routeFor(u), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const demo = async (email: string, password: string) => {
    setLoading(true);
    try {
      const u = await login(email, password, true);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}`);
      navigate(routeFor(u), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === 'signup';
  const isSignin = mode === 'signin';
  const isAdmin = mode === 'admin';

  const title = isAdmin ? 'Admin console' : isSignup ? 'Create your account' : 'Welcome back';
  const sub = isAdmin
    ? 'Sign in to the OrchardLease operations console.'
    : isSignup
      ? 'Join OrchardLease to lease or list fruiting orchards.'
      : 'Sign in to manage your orchards and bookings.';

  const input =
    'w-full rounded-[11px] border border-sand bg-cream px-3.5 py-3 text-sm text-ink outline-none focus:border-forest';

  return (
    <div className="flex min-h-screen items-stretch">
      {/* Brand panel */}
      <div
        className="relative hidden flex-1 overflow-hidden px-[52px] py-12 text-[#f4f0e3] lg:flex"
        style={{ background: 'linear-gradient(150deg,#23301d 0%,#2f5d3a 52%,#3f6b34 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 82% 14%,rgba(201,138,43,.28),transparent 46%),radial-gradient(circle at 12% 88%,rgba(184,92,56,.22),transparent 44%)',
          }}
        />
        <div className="relative flex h-full w-full flex-col">
          <div className="flex items-center gap-3">
            <span className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-white/[.14]">
              <Leaf />
            </span>
            <span className="font-serif text-[22px] font-semibold">OrchardLease</span>
          </div>
          <div className="my-auto">
            <p className="mb-3.5 text-[12.5px] font-bold uppercase tracking-[.14em] opacity-80">
              India's orchard leasing marketplace
            </p>
            <h1 className="mb-4 max-w-[15ch] font-serif text-[38px] font-semibold leading-[1.12]">
              Lease a fruiting orchard, season after season.
            </h1>
            <div className="mt-6 flex max-w-[38ch] flex-col gap-4">
              {FEATURES.map(([t, d]) => (
                <div key={t} className="flex items-start gap-3">
                  <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[9px] bg-white/[.14]">
                    <Check className="h-4 w-4 text-[#cfe3c2]" strokeWidth={2.2} />
                  </span>
                  <div>
                    <div className="text-[14.5px] font-bold">{t}</div>
                    <div className="text-[13px] opacity-80">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[12.5px] opacity-70">
            Trusted by 1,200+ orchardists &amp; seasonal traders across 6 states
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-paper px-5 py-9">
        <div className="w-full max-w-[392px]">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-forest">
              <Leaf size={20} />
            </span>
            <span className="font-serif text-[20px] font-semibold">OrchardLease</span>
          </div>

          {!isAdmin && (
            <div className="mb-6 flex rounded-xl bg-[#ece6d8] p-1">
              {(['signin', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    navigate(m === 'signin' ? '/login' : '/register', { replace: true });
                  }}
                  className={cn(
                    'flex-1 rounded-[9px] py-2.5 text-[13.5px] font-bold transition-all',
                    (m === 'signin' ? isSignin : isSignup)
                      ? 'bg-cream text-ink shadow-sm'
                      : 'bg-transparent text-faint'
                  )}
                >
                  {m === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>
          )}

          <h2 className="mb-1 font-serif text-[25px] font-semibold">{title}</h2>
          <p className="mb-[22px] text-[13.5px] text-faint">{sub}</p>

          <form onSubmit={submit}>
            {isSignup && (
              <div className="mb-[18px]">
                <label className="eyebrow mb-2.5 block">I want to</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      ['renter', 'Lease orchards', "I'm a renter / trader"],
                      ['seller', 'List orchards', "I'm a seller / owner"],
                    ] as const
                  ).map(([r, t, d]) => (
                    <div
                      key={r}
                      onClick={() => setRole(r)}
                      className={cn(
                        'cursor-pointer rounded-[13px] border-[1.5px] p-3.5 transition-all',
                        role === r ? 'border-forest bg-avail' : 'border-sand bg-cream'
                      )}
                    >
                      <div className="text-[14px] font-bold">{t}</div>
                      <div className="mt-0.5 text-[11.5px] text-faint">{d}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isSignup && (
              <Field label="Full name">
                <input className={input} placeholder="e.g. Rhea Kapoor" value={form.name} onChange={set('name')} required />
              </Field>
            )}

            <Field label="Email">
              <input className={input} type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} required />
            </Field>

            <div className="mb-3.5">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[12.5px] font-semibold">Password</label>
                {isSignin && (
                  <span
                    onClick={() => navigate('/forgot-password')}
                    className="cursor-pointer text-xs font-semibold text-terra"
                  >
                    Forgot?
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  className={input}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                />
                <span
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-xs font-semibold text-faint"
                >
                  {showPw ? 'Hide' : 'Show'}
                </span>
              </div>
            </div>

            {isSignin && (
              <label className="mb-5 flex cursor-pointer items-center gap-2.5 text-[13px] text-sub">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4" />
                Remember me for 30 days
              </label>
            )}
            {isSignup && (
              <p className="mb-5 text-xs leading-relaxed text-faint">
                By creating an account you agree to OrchardLease's Terms of Service and Privacy Policy.
              </p>
            )}
            {isAdmin && <div className="mb-5" />}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-forest py-3.5 text-[15px] font-bold text-cream transition-colors hover:bg-forest-dark disabled:opacity-60"
            >
              {loading ? 'Please wait…' : isAdmin ? 'Enter console' : isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          {!isAdmin ? (
            <>
              <div className="my-[22px] flex items-center gap-3">
                <div className="h-px flex-1 bg-sand" />
                <span className="text-[11.5px] font-semibold uppercase tracking-[.08em] text-[#b3ac98]">
                  or try a demo
                </span>
                <div className="h-px flex-1 bg-sand" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => demo('renter1@orchardlease.com', 'Password123')}
                  className="rounded-[11px] border border-sand bg-cream py-2.5 text-[13px] font-semibold text-ink hover:border-forest"
                >
                  Demo renter
                </button>
                <button
                  onClick={() => demo('seller1@orchardlease.com', 'Password123')}
                  className="rounded-[11px] border border-sand bg-cream py-2.5 text-[13px] font-semibold text-ink hover:border-forest"
                >
                  Demo seller
                </button>
              </div>
              <div className="mt-[18px] text-center">
                <span
                  onClick={() => setMode('admin')}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] font-semibold text-faint hover:text-forest"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin? Open the operations console →
                </span>
              </div>
            </>
          ) : (
            <div className="mt-[18px] text-center">
              <span
                onClick={() => setMode('signin')}
                className="cursor-pointer text-[12.5px] font-semibold text-faint hover:text-forest"
              >
                ← Back to user sign in
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-[15px]">
      <label className="mb-1.5 block text-[12.5px] font-semibold">{label}</label>
      {children}
    </div>
  );
}
