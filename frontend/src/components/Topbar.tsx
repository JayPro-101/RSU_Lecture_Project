
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  UserRound,
} from 'lucide-react';

import Avatar from './Avatar';
import { useAuth } from '../services/auth-context';

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="topbar__menu"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="topbar__welcome">
          <span>RSU LECTURE PORTAL</span>
          <strong>Welcome{user?.displayName ? `, ${user.displayName}` : ''}</strong>
        </div>
      </div>

      <div className="topbar__actions">
        <Link
          to="/notifications"
          className="topbar__notification"
          aria-label="View notifications"
        >
          <Bell size={20} />
        </Link>

        <div className="topbar__profile-wrapper">
          <button
            type="button"
            className="topbar__profile"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            <Avatar
              name={user?.displayName || 'Student'}
              size="small"
            />

            <span className="topbar__profile-name">
              {user?.displayName || 'Student'}
            </span>

            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <>
              <button
                type="button"
                className="topbar__menu-dismiss"
                aria-label="Close profile menu"
                onClick={() => setProfileOpen(false)}
              />

              <div className="topbar__dropdown" role="menu">
                <div className="topbar__dropdown-user">
                  <strong>{user?.displayName || 'Student'}</strong>
                  <span>{user?.email || ''}</span>
                </div>

                <Link
                  to="/settings"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  <Settings size={17} />
                  Settings
                </Link>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/settings');
                  }}
                >
                  <UserRound size={17} />
                  Account
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="topbar__logout"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
