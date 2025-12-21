import { useStore } from '../../store/useStore';
import { AgencyDashboard } from '../agency/AgencyDashboard';
import { CivilianDashboard } from './CivilianDashboard';

export function DashboardPage() {
  const { user } = useStore();

  // ROUTING LOGIC
  if (user?.role === 'agency') {
    return <AgencyDashboard />;
  }

  return <CivilianDashboard />;
}