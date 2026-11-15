
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { authService } from '../services/auth.service';
import Button from '../components/Button';
import { GraduationCap, MailCheck, CircleCheck, CircleX } from 'lucide-react';
import '../styles/VerifyEmailPage.css';

type VerificationStatus = 'loading' | 'success' | 'error';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('The verification link is missing its token.');
        return;
      }

      try {
        await authService.verifyEmail(token);

        if (!cancelled) {
          setStatus('success');
          setMessage('Your email address has been verified successfully.');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setMessage(
            err instanceof Error
              ? err.message
              : 'This verification link is invalid or has expired.',
          );
        }
      }
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const StatusIcon =
    status === 'success'
      ? CircleCheck
      : status === 'error'
        ? CircleX
        : MailCheck;

  return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="verify-brand">
          <GraduationCap size={30} />
          <span>RSU Lecture Portal</span>
        </div>

        <div className={`verify-status-icon ${status}`}>
          <StatusIcon size={34} />
        </div>

        <h1>
          {status === 'loading'
            ? 'Verifying your email'
            : status === 'success'
              ? 'Email verified'
              : 'Verification failed'}
        </h1>

        <p>{message}</p>

        {status === 'success' && (
          <Button fullWidth>
            <Link to="/login" className="verify-button-link">
              Continue to sign in
            </Link>
          </Button>
        )}

        {status === 'error' && (
          <Button fullWidth>
            <Link to="/resend-verification" className="verify-button-link">
              Request a new verification link
            </Link>
          </Button>
        )}

        {status === 'loading' && (
          <div className="verify-loading">
            Please wait while we check your link.
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
