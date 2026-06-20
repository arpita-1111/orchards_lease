import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useToast } from '@/context/ToastContext';
import { Button, Input, Card } from '@/components/ui';
import { getErrorMessage } from '@/lib/apiClient';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40">
              <MailCheck className="h-6 w-6 text-brand-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Check your email</h1>
            <p className="mt-2 text-sm text-slate-500">
              If an account exists for <strong>{email}</strong>, a password reset link is on its way.
            </p>
            <Link to="/login" className="mt-6 inline-block text-sm text-brand-600 hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Forgot password</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" loading={loading}>
                Send reset link
              </Button>
            </form>
            <Link to="/login" className="mt-6 block text-center text-sm text-brand-600 hover:underline">
              Back to login
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
