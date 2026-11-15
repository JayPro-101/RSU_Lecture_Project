
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { authService } from '../services/auth.service';
import Button from '../components/Button';
import Input from '../components/Input';
import { GraduationCap, Mail, CheckCircle2 } from 'lucide-react';
import '../styles/ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await authService.forgotPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to process your request. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <div className="forgot-brand">
          <GraduationCap size={30} />
          <span>RSU Lecture Portal</span>
        </div>

        <div className="forgot-icon">
          <Mail size={30} />
        </div>frontend/src/pages/ForgotPasswordPage.tsx

        <h1>Forgot your password?</h1>
        <p>
          Enter your registered email address. If the account is eligible,
          you'll receive instructions to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="forgot-form">
          {error && (
            <div className="forgot-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="forgot-success" role="status">
              <CheckCircle2 size={18} />
              If an eligible account exists, password reset instructions have
              been requested.
            </div>
          )}

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            leftIcon={<Mail size={18} />}
            required
          />

          <Button type="submit" fullWidth loading={loading}>
            Send reset instructions
          </Button>
        </form>

        <div className="forgot-footer">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
