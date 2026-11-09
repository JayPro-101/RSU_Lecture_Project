
import { Link } from 'react-router';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  return (
    <main className="unauthorized-page">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">
          <ShieldAlert size={36} />
        </div>

        <p className="unauthorized-label">ACCESS RESTRICTED</p>

        <h1>You don't have permission to access this page.</h1>

        <p className="unauthorized-description">
          Your current account role does not have access to this section.
          If you believe this is a mistake, contact the platform administrator.
        </p>

        <Link to="/" className="unauthorized-button">
          <ArrowLeft size={17} />
          Return to home
        </Link>
      </div>
    </main>
  );
}
