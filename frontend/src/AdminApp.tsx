import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import { FiscalYearProvider } from './context/FiscalYearContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DashboardOverview } from './features/dashboard/DashboardOverview';
import { OrganizationsPage } from './features/organizations/OrganizationsPage';
import { BadapatraPage } from './features/badapatra/BadapatraPage';
import { ComplaintsPage } from './features/complaints/ComplaintsPage';
import { DartaChalaniPage } from './features/darta-chalani/DartaChalaniPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { DemographicsPage } from './features/demographics/DemographicsPage';
import { HouseholdMasterPage } from './features/demographics/HouseholdMasterPage';
import { TourismPage } from './features/tourism/TourismPage';
import { GisMapPage } from './features/gis/GisMapPage';
import { AgriculturePage } from './features/agriculture/AgriculturePage';
import { ProjectsPage } from './features/projects/ProjectsPage';
import { DisasterPage } from './features/disaster/DisasterPage';
import { LoginPage } from './features/auth/LoginPage';
import { AiAssistantPage } from './features/ai/AiAssistantPage';
import { AdminConsolePage } from './features/admin/AdminConsolePage';
import { HealthPage } from './features/health/HealthPage';
import { EducationPage } from './features/education/EducationPage';
import { LibraryPage } from './features/library/LibraryPage';
import { MuseumPage } from './features/museum/MuseumPage';
import { CitizenServicesPage } from './features/citizen-services/CitizenServicesPage';
import { CitizenPortalPage } from './features/citizen-portal/CitizenPortalPage';
import { SocialInclusionPage } from './features/social-inclusion/SocialInclusionPage';
import { OpenDataReportsPage } from './features/open-data/OpenDataReportsPage';
import { SuperAdminPage } from './features/super-admin/SuperAdminPage';
import { ITBranchPage } from './features/admin-info/ITBranchPage';
import { CooperativesPage } from './features/cooperatives/CooperativesPage';
import { JudicialCommitteePage } from './features/judicial/JudicialCommitteePage';
import { WasteManagementDashboard } from './features/waste-management/WasteManagementDashboard';
import { VetMedicinePage } from './features/agriculture/VetMedicinePage';
import { WashPage } from './features/wash/WashPage';
import { RoadsPage } from './features/roads/RoadsPage';
import { EnvironmentPage } from './features/environment/EnvironmentPage';
import { MarketInspectionPage } from './features/market-inspection/MarketInspectionPage';
import { CflgSportsPage } from './features/cflg-sports/CflgSportsPage';
import { SocialAuditPage } from './features/social-audit/SocialAuditPage';

const ALL_ADMIN_ROLES = [
  'super_admin',
  'admin',
  'cao',
  'it_admin',
  'planning_officer',
  'revenue_officer',
  'ward_secretary',
  'ward_user',
  'disaster_officer',
  'tourism_officer',
  'data_entry',
  'health_officer',
  'medical_officer',
  'lab_technician',
  'pharmacist',
  'education_officer',
  'agriculture_officer',
  'accountant',
  'engineer',
];
const SUPER_ADMIN_ROLES = ['super_admin', 'it_admin'];

// Admin Dashboard Layout wrapper
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-container">
    <div className="main-content">
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main className="page-body">{children}</main>
      </div>
    </div>
  </div>
);

export const AdminApp: React.FC = () => {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/super-admin');

  // Super Admin — full screen, no sidebar/navbar
  if (isSuperAdmin) {
    return (
      <TenantProvider>
        <Routes>
          <Route
            path="/super-admin/*"
            element={
              <PrivateRoute requiredRoles={SUPER_ADMIN_ROLES}>
                <ErrorBoundary>
                  <SuperAdminPage />
                </ErrorBoundary>
              </PrivateRoute>
            }
          />
          <Route
            path="/super-admin"
            element={
              <PrivateRoute requiredRoles={SUPER_ADMIN_ROLES}>
                <ErrorBoundary>
                  <SuperAdminPage />
                </ErrorBoundary>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/super-admin" replace />} />
        </Routes>
      </TenantProvider>
    );
  }

  // Admin Dashboard — ALL routes require login
  return (
    <TenantProvider>
      <FiscalYearProvider>
        <Routes>
          {/* Login page — public within admin app */}
          <Route path="/login" element={<LoginPage />} />

          {/* All admin routes require authentication */}
          <Route
            path="/*"
            element={
              <PrivateRoute requiredRoles={ALL_ADMIN_ROLES}>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<ErrorBoundary><DashboardOverview /></ErrorBoundary>} />
                    <Route path="/admin" element={<ErrorBoundary><AdminConsolePage /></ErrorBoundary>} />
                    <Route path="/fiscal-years" element={<ErrorBoundary><AdminConsolePage defaultTab="fiscal-year" /></ErrorBoundary>} />
                    <Route path="/app/fiscal-years" element={<ErrorBoundary><AdminConsolePage defaultTab="fiscal-year" /></ErrorBoundary>} />
                    <Route path="/judicial" element={<ErrorBoundary><JudicialCommitteePage /></ErrorBoundary>} />
                    <Route path="/app/judicial" element={<ErrorBoundary><JudicialCommitteePage /></ErrorBoundary>} />
                    <Route path="/health" element={<ErrorBoundary><HealthPage /></ErrorBoundary>} />
                    <Route path="/education" element={<ErrorBoundary><EducationPage /></ErrorBoundary>} />
                    <Route path="/library" element={<ErrorBoundary><LibraryPage /></ErrorBoundary>} />
                    <Route path="/museum" element={<ErrorBoundary><MuseumPage /></ErrorBoundary>} />
                    <Route path="/social-inclusion" element={<ErrorBoundary><SocialInclusionPage /></ErrorBoundary>} />
                    <Route path="/open-data" element={<ErrorBoundary><OpenDataReportsPage /></ErrorBoundary>} />
                    <Route path="/badapatra" element={<ErrorBoundary><BadapatraPage /></ErrorBoundary>} />
                    <Route path="/citizen-portal" element={<ErrorBoundary><CitizenPortalPage /></ErrorBoundary>} />
                    <Route path="/citizen-services" element={<ErrorBoundary><CitizenServicesPage /></ErrorBoundary>} />
                    <Route path="/tourism" element={<ErrorBoundary><TourismPage /></ErrorBoundary>} />
                    <Route path="/app/tourism" element={<ErrorBoundary><TourismPage /></ErrorBoundary>} />
                    <Route path="/gis-map" element={<ErrorBoundary><GisMapPage /></ErrorBoundary>} />
                    <Route path="/agriculture" element={<ErrorBoundary><AgriculturePage /></ErrorBoundary>} />
                    <Route path="/vet-medicine" element={<ErrorBoundary><VetMedicinePage /></ErrorBoundary>} />
                    <Route path="/app/vet-medicine" element={<ErrorBoundary><VetMedicinePage /></ErrorBoundary>} />
                    <Route path="/projects" element={<ErrorBoundary><ProjectsPage /></ErrorBoundary>} />
                    <Route path="/disaster" element={<ErrorBoundary><DisasterPage /></ErrorBoundary>} />
                    <Route path="/app/disaster" element={<ErrorBoundary><DisasterPage /></ErrorBoundary>} />
                    <Route path="/waste-management" element={<ErrorBoundary><WasteManagementDashboard /></ErrorBoundary>} />
                    <Route path="/app/waste-management" element={<ErrorBoundary><WasteManagementDashboard /></ErrorBoundary>} />
                    <Route path="/profile" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
                    <Route path="/households" element={<ErrorBoundary><HouseholdMasterPage /></ErrorBoundary>} />
                    <Route path="/demographics" element={<ErrorBoundary><DemographicsPage isPublicMode={false} /></ErrorBoundary>} />
                    <Route path="/organizations" element={<ErrorBoundary><OrganizationsPage /></ErrorBoundary>} />
                    <Route path="/ai-assistant" element={<ErrorBoundary><AiAssistantPage /></ErrorBoundary>} />
                    <Route path="/complaints" element={<ErrorBoundary><ComplaintsPage /></ErrorBoundary>} />
                    <Route path="/darta-chalani" element={<ErrorBoundary><DartaChalaniPage /></ErrorBoundary>} />
                    <Route path="/cooperatives" element={<ErrorBoundary><CooperativesPage /></ErrorBoundary>} />
                    <Route path="/app/cooperatives" element={<ErrorBoundary><CooperativesPage /></ErrorBoundary>} />
                    <Route path="/copomis" element={<Navigate to="/cooperatives" replace />} />
                    <Route path="/app/copomis" element={<Navigate to="/cooperatives" replace />} />
                    <Route path="/it-branch" element={<ErrorBoundary><ITBranchPage /></ErrorBoundary>} />
                    <Route path="/wash" element={<ErrorBoundary><WashPage /></ErrorBoundary>} />
                    <Route path="/app/wash" element={<ErrorBoundary><WashPage /></ErrorBoundary>} />
                    <Route path="/roads" element={<ErrorBoundary><RoadsPage /></ErrorBoundary>} />
                    <Route path="/app/roads" element={<ErrorBoundary><RoadsPage /></ErrorBoundary>} />
                    <Route path="/environment" element={<ErrorBoundary><EnvironmentPage /></ErrorBoundary>} />
                    <Route path="/app/environment" element={<ErrorBoundary><EnvironmentPage /></ErrorBoundary>} />
                    <Route path="/market-inspection" element={<ErrorBoundary><MarketInspectionPage /></ErrorBoundary>} />
                    <Route path="/app/market-inspection" element={<ErrorBoundary><MarketInspectionPage /></ErrorBoundary>} />
                    <Route path="/cflg-sports" element={<ErrorBoundary><CflgSportsPage /></ErrorBoundary>} />
                    <Route path="/app/cflg-sports" element={<ErrorBoundary><CflgSportsPage /></ErrorBoundary>} />
                    <Route path="/social-audit" element={<ErrorBoundary><SocialAuditPage /></ErrorBoundary>} />
                    <Route path="/app/social-audit" element={<ErrorBoundary><SocialAuditPage /></ErrorBoundary>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AdminLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </FiscalYearProvider>
    </TenantProvider>
  );
};

export default AdminApp;
