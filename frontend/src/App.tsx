
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

function LoginPage() {
  return (
    <main className="app-shell">
      <section className="login-panel">
        <div className="brand-mark">RSU</div>

        <p className="eyebrow">RIVERS STATE UNIVERSITY</p>

        <h1>Stay informed.<br />Stay on schedule.</h1>

        <p className="login-description">
          Your central platform for lecture schedules, venue updates
          and important academic announcements.
        </p>

        <div className="login-card">
          <h2>Welcome to RSU Lecture Portal</h2>
          <p>Sign in to access your academic information.</p>

          <form>
            <label htmlFor="email">University email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your university email"
              autoComplete="email"
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <button type="button" disabled>
              Sign-in integration coming soon
            </button>
          </form>
        </div>

        <footer>
          © {new Date().getFullYear()} Rivers State University
        </footer>
      </section>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="not-found">
      <h1>404</h1>
      <p>The page you're looking for doesn't exist.</p>
    </main>
  );
}

export default App;
