
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { authService } from '../services/auth.service';
import Button from '../components/Button';
import Input from '../components/Input';
import { GraduationCap, Lock, CheckCircle2 } from 'lucide-react';
import '../styles/ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('The password reset link is missing its token.');
      return;
    }

    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to reset your password. The link may have expired.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        <div className="reset-brand">
          <GraduationCap size={30} />
          <span>RSU Lecture Portal</span>
        </div>

        <div className="reset-icon">
          <Lock size={30} />
        </div>

        <h1>Reset your password</h1>
        <p>Choose a new password for your account.</p>

        {success ? (
          <div className="reset-success-panel" role="status">
            <CheckCircle2 size={30} />
            <h2>Password updated</h2>
            <p>Your password has been reset successfully.</p>
            <Button fullWidth onClick={() => navigate('/login')}>
              Continue to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reset-form">
            {error && (
              <div className="reset-error" role="alert">
                {error}
              </div>
            )}

            <Input
              label="New password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              leftIcon={<Lock size={18} />}
              minLength={8}
              required
            />

            <Input
              label="Confirm new password"
              type="password"
              placeholder="Enter your new password again"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              leftIcon={<Lock size={18} />}
              minLength={8}
              required
            />

            <Button type="submit" fullWidth loading={loading}>
              Reset password
            </Button>
          </form>
        )}

        <div className="reset-footer">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
