import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useToast } from '@/context/ToastContext';
import { Button, Input, Card } from '@/components/ui';
import { getErrorMessage } from '@/lib/apiClient';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const toast = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reset password</h1>
        {!token ? (
          <p className="mt-4 text-sm text-red-500">
            Invalid or missing reset token. Please request a new link.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint="Min 8 chars with upper, lower and a number"
              required
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              Reset password
            </Button>
          </form>
        )}
        <Link to="/login" className="mt-6 block text-center text-sm text-brand-600 hover:underline">
          Back to login
        </Link>
      </Card>
    </div>
  );
}
