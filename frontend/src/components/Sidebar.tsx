
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  FileText,
  Bell,
  Settings,
  GraduationCap,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Lecture Schedule',
    path: '/lectures',
    icon: CalendarDays,
  },
  {
    label: 'Venues',
    path: '/venues',
    icon: MapPin,
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: FileText,
  },
  {
    label: 'Notifications',
    path: '/notifications',
    icon: Bell,
  },
];

export default function Sidebar({
  isOpen = false,
  onClose,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <GraduationCap size={25} />
          </div>

          <div className="sidebar__brand-text">
            <strong>RSU Portal</strong>
            <span>Lecture Information</span>
          </div>

          <button
            type="button"
            className="sidebar__close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__navigation" aria-label="Main navigation">
          <p className="sidebar__section-label">MENU</p>

          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
                onClick={onClose}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <p className="sidebar__section-label sidebar__section-label--bottom">
            PREFERENCES
          </p>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
            onClick={onClose}
          >
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar__footer">
          <span className="sidebar__footer-dot" />
          <span>RSU Lecture Portal</span>
        </div>
      </aside>
    </>
  );
}
