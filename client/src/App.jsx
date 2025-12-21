import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TacticalMapPage } from './pages/map/TacticalMapPage';
import { useStore } from './store/useStore';
import { FamilyPage } from './pages/family/FamilyPage';
import { SOSPage } from './pages/emergency/SOSPage';
import { FirstAidPage } from './pages/guide/FirstAidPage';
import { DocumentPage } from './pages/documents/DocumentPage';
import { CommunityPage } from './pages/community/CommunityPage';
import { GlobalChatPage } from './pages/social/GlobalChatPage';
import { AgenciesPage } from './pages/social/AgenciesPage';
import { MissingPersonPage } from './pages/social/MissingPersonPage';
import { LogisticsPage } from './pages/agency/LogisticsPage';
import { ProfilePage } from './pages/settings/ProfilePage';

function App() {
  const { isAuthenticated } = useStore();

  return (
    <BrowserRouter>
      {/* Global Toaster Configuration */}
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            zIndex: 99999,
          },
        }} 
      />
      
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />

        {/* Dashboard (Home) */}
        <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
        
        {/* Legacy redirect for /dashboard to home */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        {/* Core Features */}
        <Route path="/map" element={isAuthenticated ? <TacticalMapPage /> : <Navigate to="/login" />} />
        <Route path="/family" element={isAuthenticated ? <FamilyPage /> : <Navigate to="/login" />} />
        <Route path="/sos" element={isAuthenticated ? <SOSPage /> : <Navigate to="/login" />} />
        <Route path="/first-aid" element={isAuthenticated ? <FirstAidPage /> : <Navigate to="/login" />} />
        <Route path="/documents" element={isAuthenticated ? <DocumentPage /> : <Navigate to="/login" />} />

        {/* --- FIXED SECTION --- */}
        {/* 1. Volunteer -> Hazard/Help/Rumor Page */}
        <Route path="/volunteer" element={isAuthenticated ? <CommunityPage /> : <Navigate to="/login" />} />

        {/* 2. Community -> Global Chat Page */}
        <Route path="/community" element={isAuthenticated ? <GlobalChatPage /> : <Navigate to="/login" />} />
        {/* ------------------- */}

        <Route path="/agencies" element={isAuthenticated ? <AgenciesPage /> : <Navigate to="/login" />} />
        <Route path="/missing" element={isAuthenticated ? <MissingPersonPage /> : <Navigate to="/login" />} />
        <Route path="/logistics" element={isAuthenticated ? <LogisticsPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;