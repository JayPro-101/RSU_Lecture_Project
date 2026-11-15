
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { authService } from '../services/auth.service';
import Button from '../components/Button';
import Input from '../components/Input';
import { GraduationCap, Mail, CheckCircle2 } from 'lucide-react';
import '../styles/ResendVerificationPage.css';

const ResendVerificationPage = () => {
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
      await authService.resendVerification(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to send a verification email. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resend-page">
      <div className="resend-card">
        <div className="resend-brand">
          <GraduationCap size={30} />
          <span>RSU Lecture Portal</span>
        </div>

        <div className="resend-icon">
          <Mail size={30} />
        </div>

        <h1>Resend verification email</h1>
        <p>
          Enter the email address you used to register. We'll request another
          verification link.
        </p>

        <form onSubmit={handleSubmit} className="resend-form">
          {error && (
            <div className="resend-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="resend-success" role="status">
              <CheckCircle2 size={18} />
              If the account can receive a verification email, one has been
              requested.
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
            Send verification email
          </Button>
        </form>

        <div className="resend-footer">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default ResendVerificationPage;
