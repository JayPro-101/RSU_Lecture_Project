
import { useAuth } from '../services/auth-context';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import {
  CalendarDays,
  MapPin,
  MessageSquareWarning,
  Bell,
  ArrowRight,
  Clock,
} from 'lucide-react';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Upcoming Lectures',
      value: '0',
      description: 'Your next scheduled lectures',
      icon: CalendarDays,
      color: 'blue',
    },
    {
      title: 'Available Venues',
      value: '0',
      description: 'Venues currently listed',
      icon: MapPin,
      color: 'green',
    },
    {
      title: 'Pending Reports',
      value: '0',
      description: 'Reports awaiting review',
      icon: MessageSquareWarning,
      color: 'orange',
    },
    {
      title: 'Notifications',
      value: '0',
      description: 'Unread notifications',
      icon: Bell,
      color: 'purple',
    },
  ];

  return (
    <div className="dashboard-page">
      <PageHeader
        title={`Welcome${user?.displayName ? `, ${user.displayName}` : ''}`}
        description="Here's an overview of lecture activities and updates."
      />

      <section className="dashboard-stats">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card key={stat.title} className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                <div className={`dashboard-stat-icon ${stat.color}`}>
                  <Icon size={21} />
                </div>
                <Badge variant="neutral">Overview</Badge>
              </div>

              <div className="dashboard-stat-value">{stat.value}</div>
              <h3>{stat.title}</h3>
              <p>{stat.description}</p>
            </Card>
          );
        })}
      </section>

      <section className="dashboard-sections">
        <Card className="dashboard-section-card">
          <div className="dashboard-section-heading">
            <div>
              <h2>Upcoming Lectures</h2>
              <p>Your next scheduled classes</p>
            </div>
            <CalendarDays size={21} />
          </div>

          <EmptyState
            icon={CalendarDays}
            title="No lectures available"
            description="Your upcoming lecture schedule will appear here."
          />
        </Card>

        <Card className="dashboard-section-card">
          <div className="dashboard-section-heading">
            <div>
              <h2>Recent Updates</h2>
              <p>Latest announcements and changes</p>
            </div>
            <Clock size={21} />
          </div>

          <EmptyState
            icon={Bell}
            title="No recent updates"
            description="Important lecture updates will appear here."
          />
        </Card>
      </section>
    </div>
  );
};

export default DashboardPage;
