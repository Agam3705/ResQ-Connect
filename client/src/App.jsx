import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Auth
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboards
import { DashboardPage } from './pages/dashboard/DashboardPage';

// Core Pages
import { TacticalMapPage } from './pages/map/TacticalMapPage';
import { SOSPage } from './pages/emergency/SOSPage';
import { FamilyPage } from './pages/family/FamilyPage';
import { FirstAidPage } from './pages/guide/FirstAidPage';
import { CommunityPage } from './pages/community/CommunityPage';
import { GlobalChatPage } from './pages/social/GlobalChatPage';
import { AgenciesPage } from './pages/social/AgenciesPage';
import { MissingPersonPage } from './pages/social/MissingPersonPage';
import { DocumentPage } from './pages/documents/DocumentPage';
import { ProfilePage } from './pages/settings/ProfilePage';
import { VolunteerPage } from './pages/volunteer/VolunteerPage';
import { LogisticsPage } from './pages/agency/LogisticsPage';
import { AgencyServicesPage } from './pages/agency/AgencyServicesPage';

// Feature Pages
import { MedicineExchangePage } from './pages/medicine/MedicineExchangePage';
import { TransportPage } from './pages/transport/TransportPage';
import { ResourceExchangePage } from './pages/agency/ResourceExchangePage';
import { AgencyChatPage } from './pages/agency/AgencyChatPage';

function App() {
  const { isAuthenticated } = useStore();

  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 3000,
          style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
        }} 
      />
      
      <Routes>
        {/* Public */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />

        {/* Dashboard — role-based via DashboardPage (admin sees AdminDashboard directly) */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        {/* All Roles */}
        <Route path="/map" element={<ProtectedRoute><TacticalMapPage /></ProtectedRoute>} />
        <Route path="/sos" element={<ProtectedRoute><SOSPage /></ProtectedRoute>} />
        <Route path="/first-aid" element={<ProtectedRoute><FirstAidPage /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><GlobalChatPage /></ProtectedRoute>} />
        <Route path="/agencies" element={<ProtectedRoute><AgenciesPage /></ProtectedRoute>} />
        <Route path="/missing" element={<ProtectedRoute><MissingPersonPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/volunteer" element={<ProtectedRoute><VolunteerPage /></ProtectedRoute>} />
        <Route path="/medicine" element={<ProtectedRoute><MedicineExchangePage /></ProtectedRoute>} />
        <Route path="/transport" element={<ProtectedRoute><TransportPage /></ProtectedRoute>} />
        <Route path="/hazard-report" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />

        {/* Civilian Only */}
        <Route path="/family" element={<ProtectedRoute allowedRoles={['civilian']}><FamilyPage /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute allowedRoles={['civilian']}><DocumentPage /></ProtectedRoute>} />

        {/* Agency + Admin */}
        <Route path="/logistics" element={<ProtectedRoute allowedRoles={['agency', 'admin']}><LogisticsPage /></ProtectedRoute>} />
        <Route path="/exchange" element={<ProtectedRoute allowedRoles={['agency', 'admin']}><ResourceExchangePage /></ProtectedRoute>} />
        <Route path="/agency-chat" element={<ProtectedRoute allowedRoles={['agency', 'admin']}><AgencyChatPage /></ProtectedRoute>} />
        <Route path="/agency-services" element={<ProtectedRoute allowedRoles={['agency']}><AgencyServicesPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;