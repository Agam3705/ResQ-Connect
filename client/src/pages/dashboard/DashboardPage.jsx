import { useStore } from '../../store/useStore';
import { CivilianDashboard } from './CivilianDashboard';
import { AgencyDashboard } from '../../pages/agency/AgencyDashboard';
import { AdminDashboard } from '../../pages/admin/AdminDashboard';

export function DashboardPage() {
  const { user } = useStore();

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'agency':
      return <AgencyDashboard />;
    default:
      return <CivilianDashboard />;
  }
}