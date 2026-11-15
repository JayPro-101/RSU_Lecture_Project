
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../services/auth-context';
import Button from '../components/Button';
import Input from '../components/Input';
import { GraduationCap, User, Mail, Lock } from 'lucide-react';
import '../styles/RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      await register({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      });

      navigate('/verify-email', {
        replace: true,
        state: { email: email.trim() },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create your account. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-brand">
          <div className="register-brand-icon">
            <GraduationCap size={28} />
          </div>
          <h1>RSU Lecture Portal</h1>
          <p>Create an account to get started.</p>
        </div>

        <div className="register-heading">
          <h2>Create your account</h2>
          <p>Enter your details to register as a student.</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {error && (
            <div className="register-error" role="alert">
              {error}
            </div>
          )}

          <Input
            label="Full name"
            placeholder="Enter your full name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            leftIcon={<User size={18} />}
            required
          />

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            leftIcon={<Mail size={18} />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            leftIcon={<Lock size={18} />}
            required
            minLength={8}
          />

          <Input
            label="Confirm password"
            type="password"
            placeholder="Enter your password again"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            leftIcon={<Lock size={18} />}
            required
            minLength={8}
          />

          <Button type="submit" fullWidth loading={loading}>
            Create account
          </Button>
        </form>

        <div className="register-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
