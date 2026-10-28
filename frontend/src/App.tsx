import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DashboardOverview } from './features/dashboard/DashboardOverview';
import { OrganizationsPage } from './features/organizations/OrganizationsPage';
import { BadapatraPage } from './features/badapatra/BadapatraPage';
import { ComplaintsPage } from './features/complaints/ComplaintsPage';
import { PublicLayout } from './layouts/PublicLayout';
import { Home } from './pages/public/Home';
import { AIDemoPage } from './pages/public/AIDemoPage';
import { Agriculture } from './pages/public/Agriculture';
import { Education } from './pages/public/Education';
import { Health } from './pages/public/Health';
import { Profile } from './pages/public/Profile';
import { Demographics } from './pages/public/Demographics';
import { Geography } from './pages/public/Geography';
import { CitizenServices } from './pages/public/CitizenServices';
import { CitizenPortal } from './pages/public/CitizenPortal';
import { Complaints } from './pages/public/Complaints';
import { Tourism } from './pages/public/Tourism';
import { Disaster } from './pages/public/Disaster';
import { Projects } from './pages/public/Projects';
import { OpenData } from './pages/public/OpenData';
import { CitizenPwa } from './pages/public/CitizenPwa';
import { AnnualReport } from './pages/public/AnnualReport';
import { BusinessRegistration } from './pages/public/BusinessRegistration';
import { ChallengesAchievements } from './pages/public/ChallengesAchievements';
import { CultureInfo } from './pages/public/CultureInfo';
import { DigitalGovernance } from './pages/public/DigitalGovernance';
import { DigitalReport } from './pages/public/DigitalReport';
import { Disability } from './pages/public/Disability';
import { EconomicDev } from './pages/public/EconomicDev';
import { Enterprise } from './pages/public/Enterprise';
import { GoodPractices } from './pages/public/GoodPractices';
import { Library } from './pages/public/Library';
import { Livestock } from './pages/public/Livestock';
import { LongTermPlan } from './pages/public/LongTermPlan';
import { MTED } from './pages/public/MTED';
import { Museum } from './pages/public/Museum';
import { FacilityDetailPage } from './pages/public/FacilityDetailPage';
import { Organizations } from './pages/public/Organizations';
import { SocialDev } from './pages/public/SocialDev';
import { StrategicPriorities } from './pages/public/StrategicPriorities';
import { WomenChildrenSenior } from './pages/public/WomenChildrenSenior';
import { ProjectAgreement } from './pages/public/ProjectAgreement';
import { PublicProcurement } from './pages/public/PublicProcurement';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { PublicBuildingPermit } from './pages/public/PublicBuildingPermit';
import { LegalRepository } from './pages/public/LegalRepository';
import { BudgetTrackerPage } from './pages/public/BudgetTracker';
import { MeetingDecisionPage } from './pages/public/MeetingDecision';
import { EventCalendarPage } from './pages/public/EventCalendar';
import { CertificateVerification } from './pages/public/CertificateVerification';
import { DartaChalaniPage } from './features/darta-chalani/DartaChalaniPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { PalikaProfileMasterPage } from './features/palika-profile/PalikaProfileMasterPage';
import { RepresentativesPage } from './features/profile/RepresentativesPage';
import { WardsPage } from './features/profile/WardsPage';
import { DemographicsPage } from './features/demographics/DemographicsPage';
import { HouseholdMasterPage } from './features/demographics/HouseholdMasterPage';
import { TourismPage } from './features/tourism/TourismPage';
import { GisMapPage } from './features/gis/GisMapPage';
import { AgriculturePage } from './features/agriculture/AgriculturePage';
import { VetMedicinePage } from './features/agriculture/VetMedicinePage';
import { AgriMarketAdminPage } from './features/agriculture/AgriMarketAdminPage';
import { AgriAdvisoryAdminPage } from './features/agriculture/AgriAdvisoryAdminPage';
import { FarmerProfileAdminPage } from './features/agriculture/FarmerProfileAdminPage';
import { WasteManagementDashboard } from './features/waste-management/WasteManagementDashboard';
import { ProjectsPage } from './features/projects/ProjectsPage';
import { DisasterPage } from './features/disaster/DisasterPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegistrationPage } from './features/auth/RegistrationPage';
import { PublicRegistrationPage } from './features/auth/PublicRegistrationPage';
import { AiAssistantPage } from './features/ai/AiAssistantPage';
import { CameraModule } from './features/camera/CameraModule';
import { AdminInfoPage } from './features/admin-info/AdminInfoPage';
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
import { PalikaSettingsPage } from './features/settings/PalikaSettingsPage';
import { FaqHelpPage } from './features/help/FaqHelpPage';
import { ProgressReportsPage } from './features/progress-reports/ProgressReportsPage';
import { OnePagerPublicReportPage } from './features/progress-reports/OnePagerPublicReportPage';
import { SocialSecurityPage } from './features/social-security/SocialSecurityPage';
import { EmploymentPage } from './features/employment/EmploymentPage';
import { RecruitmentPage } from './features/recruitment/RecruitmentPage';
import { BuildingPermitPage } from './features/building-permit/BuildingPermitPage';
import { RevenueTaxPage } from './features/revenue/RevenueTaxPage';
import { ProcurementPage } from './features/procurement/ProcurementPage';
import { AssetsPamsPage } from './features/assets/AssetsPamsPage';
import { JudicialCommitteePage } from './features/judicial/JudicialCommitteePage';
import { VitalRegistrationPage } from './features/vital-registration/VitalRegistrationPage';
import { BusinessRegistrationPage } from './features/business/BusinessRegistrationPage';
import { EngineersDirectoryPage } from './features/engineers/EngineersDirectoryPage';
import { EmployeeManagementPage } from './features/hrms/EmployeeManagementPage';
import { TaskBoardPage } from './features/hrms/TaskBoardPage';
import { ITBranchPage } from './features/admin-info/ITBranchPage';
import { CooperativesPage } from './features/cooperatives/CooperativesPage';
import MasterDataManagement from './pages/public/MasterDataManagement';
import EOfficeManagement from './pages/public/EOfficeManagement';
import ProjectLifecycle from './pages/public/ProjectLifecycle';
import DigitalSifaris from './pages/public/DigitalSifaris';
import DigitalEBPS from './pages/public/DigitalEBPS';
import AssetGisTwin from './pages/public/AssetGisTwin';
import AiAssistantPortal from './pages/public/AiAssistantPortal';
import ExecutiveDashboard from './pages/public/ExecutiveDashboard';
import { LandClassificationPage } from './features/land-classification/LandClassificationPage';
import { SecurityAuditPage } from './features/security-audit/SecurityAuditPage';
import { DocumentArchivePage } from './features/document-archive/DocumentArchivePage';
import { Citizen360Page } from './features/citizen-360/Citizen360Page';
import { WashPage } from './features/wash/WashPage';
import { RoadsPage } from './features/roads/RoadsPage';
import { EnvironmentPage } from './features/environment/EnvironmentPage';
import { MarketInspectionPage } from './features/market-inspection/MarketInspectionPage';
import { CflgSportsPage } from './features/cflg-sports/CflgSportsPage';
import { SocialAuditPage } from './features/social-audit/SocialAuditPage';

const ADMIN_ROLES = [
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

export const App: React.FC = () => {
  const location = useLocation();
  const isSuperAdmin = location.pathname.startsWith('/super-admin');

  // Public One Pager Report page - accessible directly without authentication/login
  if (
    location.pathname.startsWith('/public-report') ||
    location.pathname === '/public' ||
    location.pathname === '/one-pager' ||
    location.pathname === '/pragati-pratiwedan'
  ) {
    return (
      <TenantProvider>
        <ErrorBoundary>
          <OnePagerPublicReportPage />
        </ErrorBoundary>
      </TenantProvider>
    );
  }

  // Public Dedicated Facility Profile Pages (Schools SMEPMS, Health HMIS, Wards, Tourism)
  if (
    location.pathname.startsWith('/schools/') ||
    location.pathname.startsWith('/facilities/') ||
    location.pathname === '/schools' ||
    location.pathname === '/facilities'
  ) {
    return (
      <TenantProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/schools/:id" element={<FacilityDetailPage forcedType="school" />} />
            <Route path="/facilities/:id" element={<FacilityDetailPage />} />
            <Route path="/facilities/:category/:id" element={<FacilityDetailPage />} />
            <Route path="*" element={<FacilityDetailPage />} />
          </Routes>
        </ErrorBoundary>
      </TenantProvider>
    );
  }

  // Super Admin uses its own dedicated full-page administrative layout
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
        </Routes>
      </TenantProvider>
    );
  }

  // Login page has its own clean, centered layout
  if (location.pathname === '/login') {
    return (
      <TenantProvider>
        <LoginPage />
      </TenantProvider>
    );
  }

  // Tenant Registration page (standalone layout)
  if (location.pathname === '/register-tenant') {
    return (
      <TenantProvider>
        <RegistrationPage />
      </TenantProvider>
    );
  }

  return (
    <TenantProvider>
      <Routes>
        {/* PUBLIC PORTAL ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/ai-demo" element={<AIDemoPage />} />
          <Route path="/register" element={<PublicRegistrationPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/agriculture" element={<Agriculture />} />
          <Route path="/education" element={<Education />} />
          <Route path="/health" element={<Health />} />
          <Route path="/engineers-directory" element={<EngineersDirectoryPage />} />
          <Route path="/profile" element={<ErrorBoundary><PalikaProfileMasterPage /></ErrorBoundary>} />
          <Route path="/demographics" element={<Navigate to="/profile?tab=demographics" replace />} />
          <Route path="/geography" element={<Geography />} />
          <Route path="/citizen-services" element={<CitizenServices />} />
          <Route path="/citizen-portal" element={<CitizenPortal />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/tourism" element={<Tourism />} />
          <Route path="/disaster" element={<Disaster />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/opendata" element={<Navigate to="/open-data" replace />} />
          <Route path="/procurement" element={<PublicProcurement />} />
          <Route path="/revenue" element={<ErrorBoundary><RevenueTaxPage /></ErrorBoundary>} />
          <Route path="/tax" element={<ErrorBoundary><RevenueTaxPage /></ErrorBoundary>} />
          <Route path="/revenue.html" element={<Navigate to="/revenue" replace />} />
          <Route path="/tax.html" element={<Navigate to="/tax" replace />} />
          <Route path="/ebps" element={<PublicBuildingPermit />} />
          <Route path="/building-permit" element={<PublicBuildingPermit />} />
          <Route path="/ebps-admin" element={<Navigate to="/app/ebps-admin" replace />} />
          <Route path="/building-permits" element={<Navigate to="/building-permit" replace />} />
          <Route path="/building-permits.html" element={<Navigate to="/building-permit" replace />} />
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="/ebps.html" element={<Navigate to="/ebps" replace />} />
          <Route path="/building-permit.html" element={<Navigate to="/building-permit" replace />} />
          <Route path="/citizen-portal.html" element={<Navigate to="/citizen-portal" replace />} />
          <Route path="/agriculture.html" element={<Navigate to="/agriculture" replace />} />
          <Route path="/education.html" element={<Navigate to="/education" replace />} />
          <Route path="/health.html" element={<Navigate to="/health" replace />} />
          <Route path="/profile.html" element={<Navigate to="/profile" replace />} />
          <Route path="/demographics.html" element={<Navigate to="/demographics" replace />} />
          <Route path="/geography.html" element={<Navigate to="/geography" replace />} />
          <Route path="/citizen-services.html" element={<Navigate to="/citizen-services" replace />} />
          <Route path="/pwa" element={<CitizenPwa />} />
          <Route path="/mobile" element={<CitizenPwa />} />
          <Route path="/badapatra" element={<ErrorBoundary><BadapatraPage readOnly={true} /></ErrorBoundary>} />
          <Route path="/badapatra.html" element={<ErrorBoundary><BadapatraPage readOnly={true} /></ErrorBoundary>} />
          <Route path="/recruitment" element={<ErrorBoundary><RecruitmentPage /></ErrorBoundary>} />
          <Route path="/recruitment.html" element={<Navigate to="/recruitment" replace />} />
          <Route path="/complaints.html" element={<Navigate to="/complaints" replace />} />
          <Route path="/tourism.html" element={<Navigate to="/tourism" replace />} />
          <Route path="/disaster.html" element={<Navigate to="/disaster" replace />} />
          <Route path="/projects.html" element={<Navigate to="/projects" replace />} />
          <Route path="/opendata.html" element={<Navigate to="/opendata" replace />} />
          <Route path="/procurement.html" element={<Navigate to="/procurement" replace />} />
          {/* PUBLIC PORTAL REPORTS & CORE MODULES (read-only public access) */}
          <Route path="/progress-reports" element={<ErrorBoundary><ProgressReportsPage isReadOnly={true} /></ErrorBoundary>} />
          <Route path="/ai-assistant" element={<ErrorBoundary><AiAssistantPage /></ErrorBoundary>} />
          <Route path="/open-data" element={<ErrorBoundary><OpenDataReportsPage isReadOnly={true} /></ErrorBoundary>} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/dashboard.html" element={<Navigate to="/" replace />} />
          <Route path="/executive-dashboard" element={<Navigate to="/" replace />} />
          <Route path="/executive-dashboard.html" element={<Navigate to="/" replace />} />

          {/* Public-readable pages (no data entry) */}
          <Route path="/representatives" element={<ErrorBoundary><RepresentativesPage isReadOnly={true} /></ErrorBoundary>} />
          <Route path="/businesses" element={<ErrorBoundary><BusinessRegistrationPage isReadOnly={true} /></ErrorBoundary>} />

          {/* Admin-only routes redirected to login if not authenticated */}
          {/* /vital-events → now has public page, see below */}
          <Route path="/employees" element={<Navigate to="/app/employees" replace />} />
          <Route path="/tasks" element={<Navigate to="/app/tasks" replace />} />
          <Route path="/darta-chalani" element={<Navigate to="/app/darta-chalani" replace />} />
          <Route path="/judicial" element={<Navigate to="/app/judicial" replace />} />
          <Route path="/assets" element={<Navigate to="/app/assets" replace />} />
          <Route path="/social-security" element={<Navigate to="/app/vital-events?tab=beneficiaries" replace />} />
          {/* /employment → now has public page, see below */}
          <Route path="/it-branch" element={<Navigate to="/app/it-branch" replace />} />
          {/* /social-inclusion → now has public page, see below */}
          <Route path="/farmer-profile" element={<Navigate to="/app/farmer-profile" replace />} />
          <Route path="/agri-market" element={<Navigate to="/app/agri-market" replace />} />
          <Route path="/agri-advisory" element={<Navigate to="/app/agri-advisory" replace />} />
          <Route path="/household-system" element={<Navigate to="/app/households" replace />} />
          <Route path="/households" element={<Navigate to="/app/households" replace />} />
          <Route path="/cooperatives" element={<ErrorBoundary><CooperativesPage isPublic={true} /></ErrorBoundary>} />
          <Route path="/cooperatives.html" element={<Navigate to="/cooperatives" replace />} />
          <Route path="/copomis" element={<Navigate to="/cooperatives" replace />} />
          <Route path="/copomis.html" element={<Navigate to="/cooperatives" replace />} />
          <Route path="/audit-logs" element={<Navigate to="/app/audit-logs" replace />} />
          <Route path="/audit-logs.html" element={<Navigate to="/app/audit-logs" replace />} />
          <Route path="/audit" element={<Navigate to="/app/audit-logs" replace />} />
          <Route path="/audit.html" element={<Navigate to="/app/audit-logs" replace />} />
          <Route path="/document-archive" element={<Navigate to="/app/document-archive" replace />} />
          <Route path="/document-archive.html" element={<Navigate to="/app/document-archive" replace />} />
          <Route path="/documents.html" element={<Navigate to="/app/document-archive" replace />} />



          {/* Phase 4 – Final Pages */}
          <Route path="/annual-report" element={<AnnualReport />} />
          <Route path="/business-registration" element={<BusinessRegistrationPage />} />
          <Route path="/challenges-achievements" element={<ChallengesAchievements />} />
          <Route path="/culture-info" element={<CultureInfo />} />
          <Route path="/digital-governance" element={<DigitalGovernance />} />
          <Route path="/digital-report" element={<DigitalReport />} />
          <Route path="/disability" element={<Disability />} />
          <Route path="/economic-dev" element={<EconomicDev />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/good-practices" element={<GoodPractices />} />
          <Route path="/library" element={<Library />} />
          <Route path="/livestock" element={<Livestock />} />
          <Route path="/long-term-plan" element={<LongTermPlan />} />
          <Route path="/mted" element={<MTED />} />
          <Route path="/museum" element={<Museum />} />
          <Route path="/legal-repository" element={<ErrorBoundary><LegalRepository /></ErrorBoundary>} />
          <Route path="/budget-tracker" element={<ErrorBoundary><BudgetTrackerPage /></ErrorBoundary>} />
          <Route path="/meetings" element={<ErrorBoundary><MeetingDecisionPage /></ErrorBoundary>} />
          <Route path="/verify-certificate" element={<ErrorBoundary><CertificateVerification /></ErrorBoundary>} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/social-dev" element={<SocialDev />} />
          <Route path="/strategic-priorities" element={<StrategicPriorities />} />
          <Route path="/women-children-senior" element={<WomenChildrenSenior />} />
          <Route path="/project-agreement" element={<ProjectAgreement />} />
          <Route path="/waste-management" element={<ErrorBoundary><WasteManagementDashboard /></ErrorBoundary>} />
          <Route path="/project-lifecycle" element={<ErrorBoundary><ProjectLifecycle /></ErrorBoundary>} />
          <Route path="/project-lifecycle.html" element={<Navigate to="/project-lifecycle" replace />} />
          <Route path="/asset-twin" element={<ErrorBoundary><AssetGisTwin /></ErrorBoundary>} />
          <Route path="/asset-twin.html" element={<Navigate to="/asset-twin" replace />} />
          <Route path="/vital-events" element={<ErrorBoundary><VitalRegistrationPage /></ErrorBoundary>} />
          <Route path="/vital-events.html" element={<Navigate to="/vital-events" replace />} />
          <Route path="/employment" element={<ErrorBoundary><EmploymentPage /></ErrorBoundary>} />
          <Route path="/employment.html" element={<Navigate to="/employment" replace />} />
          <Route path="/social-inclusion" element={<ErrorBoundary><SocialInclusionPage /></ErrorBoundary>} />
          <Route path="/gis-map" element={<ErrorBoundary><GisMapPage isPublic={true} /></ErrorBoundary>} />
          <Route path="/land-classification" element={<ErrorBoundary><LandClassificationPage /></ErrorBoundary>} />
          <Route path="/land-classification.html" element={<Navigate to="/land-classification" replace />} />
          <Route path="/event-calendar" element={<ErrorBoundary><EventCalendarPage /></ErrorBoundary>} />
          <Route path="/vet-medicine" element={<ErrorBoundary><VetMedicinePage isPublic={true} /></ErrorBoundary>} />
          <Route path="/vet-medicine.html" element={<Navigate to="/vet-medicine" replace />} />
          <Route path="/gis-map.html" element={<Navigate to="/gis-map" replace />} />
          <Route path="/gis" element={<Navigate to="/gis-map" replace />} />
          <Route path="/app/gis" element={<Navigate to="/app/gis-map" replace />} />
          {/* .html redirects */}
          <Route path="/progress-reports.html" element={<Navigate to="/progress-reports" replace />} />
          <Route path="/ai-assistant.html" element={<Navigate to="/ai-assistant" replace />} />
          <Route path="/vital-events.html" element={<Navigate to="/vital-events" replace />} />
          <Route path="/businesses.html" element={<Navigate to="/businesses" replace />} />
          <Route path="/representatives.html" element={<Navigate to="/representatives" replace />} />
          <Route path="/employees.html" element={<Navigate to="/employees" replace />} />
          <Route path="/tasks.html" element={<Navigate to="/tasks" replace />} />
          <Route path="/waste-management.html" element={<Navigate to="/waste-management" replace />} />
          <Route path="/open-data.html" element={<Navigate to="/open-data" replace />} />
          <Route path="/faq-help" element={<ErrorBoundary><FaqHelpPage /></ErrorBoundary>} />
          <Route path="/faq-help.html" element={<Navigate to="/faq-help" replace />} />
          <Route path="/annual-report.html" element={<Navigate to="/annual-report" replace />} />
          <Route path="/business-registration.html" element={<Navigate to="/business-registration" replace />} />
          <Route path="/challenges-achievements.html" element={<Navigate to="/challenges-achievements" replace />} />
          <Route path="/culture-info.html" element={<Navigate to="/culture-info" replace />} />
          <Route path="/digital-governance.html" element={<Navigate to="/digital-governance" replace />} />
          <Route path="/digital-report.html" element={<Navigate to="/digital-report" replace />} />
          <Route path="/disability.html" element={<Navigate to="/disability" replace />} />
          <Route path="/economic-dev.html" element={<Navigate to="/economic-dev" replace />} />
          <Route path="/enterprise.html" element={<Navigate to="/enterprise" replace />} />
          <Route path="/good-practices.html" element={<Navigate to="/good-practices" replace />} />
          <Route path="/library.html" element={<Navigate to="/library" replace />} />
          <Route path="/livestock.html" element={<Navigate to="/livestock" replace />} />
          <Route path="/long-term-plan.html" element={<Navigate to="/long-term-plan" replace />} />
          <Route path="/mted.html" element={<Navigate to="/mted" replace />} />
          <Route path="/museum.html" element={<Navigate to="/museum" replace />} />
          <Route path="/organizations.html" element={<Navigate to="/organizations" replace />} />
          <Route path="/social-dev.html" element={<Navigate to="/social-dev" replace />} />
          <Route path="/strategic-priorities.html" element={<Navigate to="/strategic-priorities" replace />} />
          <Route path="/women-children-senior.html" element={<Navigate to="/women-children-senior" replace />} />
          <Route path="/project-agreement.html" element={<Navigate to="/project-agreement" replace />} />

          {/* Comprehensive Sectoral Modules (Public Citizen Access) */}
          <Route path="/wash" element={<ErrorBoundary><WashPage isPublic={true} /></ErrorBoundary>} />
          <Route path="/wash.html" element={<Navigate to="/wash" replace />} />
          <Route path="/roads" element={<ErrorBoundary><RoadsPage isPublic={true} /></ErrorBoundary>} />
          <Route path="/roads.html" element={<Navigate to="/roads" replace />} />
          <Route path="/environment" element={<ErrorBoundary><EnvironmentPage isPublic={true} /></ErrorBoundary>} />
          <Route path="/environment.html" element={<Navigate to="/environment" replace />} />
          <Route path="/market-inspection" element={<ErrorBoundary><MarketInspectionPage isPublic={true} /></ErrorBoundary>} />
          <Route path="/market-inspection.html" element={<Navigate to="/market-inspection" replace />} />
          <Route path="/cflg-sports" element={<ErrorBoundary><CflgSportsPage isPublic={true} /></ErrorBoundary>} />
          <Route path="/cflg-sports.html" element={<Navigate to="/cflg-sports" replace />} />
          <Route path="/social-audit" element={<ErrorBoundary><SocialAuditPage isPublic={true} /></ErrorBoundary>} />
          <Route path="/social-audit.html" element={<Navigate to="/social-audit" replace />} />
        </Route>

        {/* ADMIN DASHBOARD ROUTES */}
        <Route
          element={
            <PrivateRoute requiredRoles={ADMIN_ROLES}>
              <div className="app-container">
                <div className="main-content">
                  <Navbar />
                  <div style={{ display: 'flex', flex: 1 }}>
                    <Sidebar />
                    <main className="page-body">
                      <Outlet />
                    </main>
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        >
          <Route path="/app" element={<ErrorBoundary><DashboardOverview /></ErrorBoundary>} />
          <Route path="/app/dashboard" element={<ErrorBoundary><DashboardOverview /></ErrorBoundary>} />
          <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
          <Route path="/admin.html" element={<Navigate to="/app" replace />} />
          <Route path="/app.html" element={<Navigate to="/app" replace />} />
          <Route path="/households" element={<Navigate to="/app/households" replace />} />

          {/* Admin Feature Routes under /app/... */}
          <Route path="/app/progress-reports" element={<ErrorBoundary><ProgressReportsPage /></ErrorBoundary>} />
          <Route path="/app/admin" element={<ErrorBoundary><AdminConsolePage /></ErrorBoundary>} />
          <Route path="/app/fiscal-years" element={<ErrorBoundary><AdminConsolePage defaultTab="fiscal-year" /></ErrorBoundary>} />
          <Route path="/fiscal-years" element={<ErrorBoundary><AdminConsolePage defaultTab="fiscal-year" /></ErrorBoundary>} />
          <Route path="/app/mdm" element={<ErrorBoundary><MasterDataManagement /></ErrorBoundary>} />
          <Route path="/app/e-office" element={<ErrorBoundary><EOfficeManagement /></ErrorBoundary>} />
          <Route path="/app/project-lifecycle" element={<ErrorBoundary><ProjectLifecycle /></ErrorBoundary>} />
          <Route path="/app/sifaris" element={<ErrorBoundary><DigitalSifaris /></ErrorBoundary>} />
          <Route path="/app/engineers" element={<ErrorBoundary><EngineersDirectoryPage /></ErrorBoundary>} />
          <Route path="/app/ebps-admin" element={<ErrorBoundary><BuildingPermitPage /></ErrorBoundary>} />
          <Route path="/app/ebps" element={<ErrorBoundary><BuildingPermitPage /></ErrorBoundary>} />
          <Route path="/app/executive-dashboard" element={<ErrorBoundary><ExecutiveDashboard /></ErrorBoundary>} />
          <Route path="/app/asset-twin" element={<ErrorBoundary><AssetGisTwin /></ErrorBoundary>} />
          <Route path="/app/ai-portal" element={<ErrorBoundary><AiAssistantPortal /></ErrorBoundary>} />
          <Route path="/app/badapatra" element={<ErrorBoundary><BadapatraPage /></ErrorBoundary>} />
          <Route path="/app/citizen-portal" element={<ErrorBoundary><CitizenPortalPage /></ErrorBoundary>} />
          <Route path="/app/citizen-services" element={<ErrorBoundary><CitizenServicesPage /></ErrorBoundary>} />
          <Route path="/app/health" element={<ErrorBoundary><HealthPage /></ErrorBoundary>} />
          <Route path="/app/education" element={<ErrorBoundary><EducationPage /></ErrorBoundary>} />
          <Route path="/app/library" element={<ErrorBoundary><LibraryPage /></ErrorBoundary>} />
          <Route path="/app/museum" element={<ErrorBoundary><MuseumPage /></ErrorBoundary>} />
          <Route path="/app/legal-repository" element={<ErrorBoundary><LegalRepository /></ErrorBoundary>} />
          <Route path="/app/budget-tracker" element={<ErrorBoundary><BudgetTrackerPage /></ErrorBoundary>} />
          <Route path="/app/meetings" element={<ErrorBoundary><MeetingDecisionPage /></ErrorBoundary>} />
          <Route path="/app/verify-certificate" element={<ErrorBoundary><CertificateVerification /></ErrorBoundary>} />
          <Route path="/app/social-inclusion" element={<ErrorBoundary><SocialInclusionPage /></ErrorBoundary>} />
          <Route path="/app/open-data" element={<ErrorBoundary><OpenDataReportsPage /></ErrorBoundary>} />
          <Route path="/app/tourism" element={<ErrorBoundary><TourismPage /></ErrorBoundary>} />
          <Route path="/tourism" element={<ErrorBoundary><TourismPage /></ErrorBoundary>} />
          <Route path="/app/waste-management" element={<ErrorBoundary><WasteManagementDashboard /></ErrorBoundary>} />
          <Route path="/app/gis-map" element={<ErrorBoundary><GisMapPage /></ErrorBoundary>} />
          <Route path="/app/land-classification" element={<ErrorBoundary><LandClassificationPage /></ErrorBoundary>} />
          <Route path="/app/event-calendar" element={<ErrorBoundary><EventCalendarPage /></ErrorBoundary>} />
          <Route path="/app/agriculture" element={<ErrorBoundary><AgriculturePage /></ErrorBoundary>} />
          <Route path="/app/farmer-profile" element={<ErrorBoundary><FarmerProfileAdminPage /></ErrorBoundary>} />
          <Route path="/app/vet-medicine" element={<ErrorBoundary><VetMedicinePage isPublic={false} /></ErrorBoundary>} />
          <Route path="/app/agri-market" element={<ErrorBoundary><AgriMarketAdminPage /></ErrorBoundary>} />
          <Route path="/app/agri-advisory" element={<ErrorBoundary><AgriAdvisoryAdminPage /></ErrorBoundary>} />
          <Route path="/app/projects" element={<ErrorBoundary><ProjectsPage /></ErrorBoundary>} />
          <Route path="/app/disaster" element={<ErrorBoundary><DisasterPage /></ErrorBoundary>} />
          <Route path="/app/profile" element={<ErrorBoundary><PalikaProfileMasterPage /></ErrorBoundary>} />
          <Route path="/app/palika-profile" element={<ErrorBoundary><PalikaProfileMasterPage /></ErrorBoundary>} />
          <Route path="/app/representatives" element={<ErrorBoundary><RepresentativesPage /></ErrorBoundary>} />
          <Route path="/app/wards" element={<ErrorBoundary><PalikaProfileMasterPage /></ErrorBoundary>} />
          <Route path="/app/demographics" element={<ErrorBoundary><DemographicsPage /></ErrorBoundary>} />
          <Route path="/app/households" element={<ErrorBoundary><HouseholdMasterPage /></ErrorBoundary>} />
          <Route path="/app/organizations" element={<ErrorBoundary><OrganizationsPage /></ErrorBoundary>} />
          <Route path="/app/ai-assistant" element={<ErrorBoundary><AiAssistantPage /></ErrorBoundary>} />
          <Route path="/app/camera" element={<ErrorBoundary><CameraModule /></ErrorBoundary>} />
          <Route path="/app/admin-info" element={<ErrorBoundary><AdminInfoPage /></ErrorBoundary>} />

          <Route path="/ai.html" element={<Navigate to="/app/ai-assistant" replace />} />
          <Route path="/camera.html" element={<Navigate to="/app/camera" replace />} />
          <Route path="/darta-chalani.html" element={<Navigate to="/app/darta-chalani" replace />} />
          <Route path="/admin-info.html" element={<Navigate to="/app/admin-info" replace />} />
          <Route path="/app/complaints" element={<ErrorBoundary><ComplaintsPage /></ErrorBoundary>} />
          <Route path="/app/darta-chalani" element={<ErrorBoundary><DartaChalaniPage /></ErrorBoundary>} />
          <Route path="/app/businesses" element={<ErrorBoundary><BusinessRegistrationPage /></ErrorBoundary>} />
          <Route path="/app/cooperatives" element={<ErrorBoundary><CooperativesPage isPublic={false} /></ErrorBoundary>} />
          <Route path="/app/social-security" element={<Navigate to="/app/vital-events?tab=beneficiaries" replace />} />
          <Route path="/app/employment" element={<ErrorBoundary><EmploymentPage /></ErrorBoundary>} />
          <Route path="/app/recruitment" element={<ErrorBoundary><RecruitmentPage /></ErrorBoundary>} />
          <Route path="/app/building-permits" element={<ErrorBoundary><BuildingPermitPage /></ErrorBoundary>} />
          <Route path="/app/revenue" element={<ErrorBoundary><RevenueTaxPage /></ErrorBoundary>} />
          <Route path="/app/procurement" element={<ErrorBoundary><ProcurementPage /></ErrorBoundary>} />
          <Route path="/app/assets" element={<ErrorBoundary><AssetsPamsPage /></ErrorBoundary>} />
          <Route path="/app/judicial" element={<ErrorBoundary><JudicialCommitteePage /></ErrorBoundary>} />
          <Route path="/app/vital-events" element={<ErrorBoundary><VitalRegistrationPage /></ErrorBoundary>} />
          <Route path="/app/employees" element={<ErrorBoundary><EmployeeManagementPage /></ErrorBoundary>} />
          <Route path="/app/tasks" element={<ErrorBoundary><TaskBoardPage /></ErrorBoundary>} />
          <Route path="/app/palika-settings" element={<ErrorBoundary><PalikaSettingsPage /></ErrorBoundary>} />
          <Route path="/app/faq-help" element={<ErrorBoundary><FaqHelpPage /></ErrorBoundary>} />
          <Route path="/app/it-branch" element={<ErrorBoundary><ITBranchPage /></ErrorBoundary>} />
          <Route path="/app/audit-logs" element={<ErrorBoundary><SecurityAuditPage /></ErrorBoundary>} />
          <Route path="/app/audit" element={<Navigate to="/app/audit-logs" replace />} />
          <Route path="/app/document-archive" element={<ErrorBoundary><DocumentArchivePage /></ErrorBoundary>} />
          <Route path="/app/documents" element={<Navigate to="/app/document-archive" replace />} />
          <Route path="/app/citizen-360" element={<ErrorBoundary><Citizen360Page /></ErrorBoundary>} />
          <Route path="/citizen-360" element={<Navigate to="/app/citizen-360" replace />} />
          <Route path="/app/c360" element={<Navigate to="/app/citizen-360" replace />} />

          {/* New Comprehensive Sectoral Modules (Admin Management) */}
          <Route path="/app/wash" element={<ErrorBoundary><WashPage isPublic={false} /></ErrorBoundary>} />
          <Route path="/app/roads" element={<ErrorBoundary><RoadsPage isPublic={false} /></ErrorBoundary>} />
          <Route path="/app/environment" element={<ErrorBoundary><EnvironmentPage isPublic={false} /></ErrorBoundary>} />
          <Route path="/app/market-inspection" element={<ErrorBoundary><MarketInspectionPage isPublic={false} /></ErrorBoundary>} />
          <Route path="/app/cflg-sports" element={<ErrorBoundary><CflgSportsPage isPublic={false} /></ErrorBoundary>} />
          <Route path="/app/social-audit" element={<ErrorBoundary><SocialAuditPage isPublic={false} /></ErrorBoundary>} />

          {/* Fallback for any other route inside admin */}
          <Route path="/app/*" element={<Navigate to="/app" replace />} />
        </Route>

        {/* Global Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TenantProvider>
  );
};

export default App;
