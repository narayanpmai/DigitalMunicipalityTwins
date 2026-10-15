import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * PrivateRoute — Authentication Guard Component
 *
 * Protects pages like /admin and /super-admin from unauthorized access.
 * - If user is not logged in → redirect to /login
 * - If user doesn't have required role → show Access Denied screen
 * - If still loading session → show spinner
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredRoles = [],
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading, hasRole, user, logout } = useAuth();
  const location = useLocation();

  // Show spinner while checking stored session
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--background)',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <Loader2 size={40} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>सत्र प्रमाणीकरण भइरहेको छ...</p>
      </div>
    );
  }

  // Not authenticated → check if visiting a public-facing report or service, otherwise redirect to login
  if (!isAuthenticated) {
    const publicRouteMap: Record<string, string> = {
      '/app/profile': '/profile',
      '/app/palika-profile': '/profile',
      '/app/progress-reports': '/progress-reports',
      '/app/ai-assistant': '/ai-assistant',
      '/app/gis-map': '/gis-map',
      '/app/gis': '/gis-map',
      '/app/citizen-portal': '/citizen-portal',
      '/app/citizen-services': '/citizen-services',
      '/app/badapatra': '/badapatra',
      '/app/complaints': '/complaints',
      '/app/representatives': '/representatives',
      '/app/revenue': '/revenue',
      '/app/procurement': '/procurement',
      '/app/health': '/health',
      '/app/education': '/education',
      '/app/library': '/library',
      '/app/museum': '/museum',
      '/app/agriculture': '/agriculture',
      '/app/projects': '/projects',
      '/app/disaster': '/disaster',
      '/app/tourism': '/tourism',
      '/app/waste-management': '/waste-management',
      '/app/open-data': '/open-data',
      '/app/legal-repository': '/legal-repository',
      '/app/budget-tracker': '/budget-tracker',
      '/app/meetings': '/meetings',
      '/app/verify-certificate': '/verify-certificate',
      '/app/organizations': '/organizations',
      '/app/businesses': '/businesses',
      '/app/event-calendar': '/event-calendar',
    };

    const targetPublic = publicRouteMap[location.pathname];
    if (targetPublic) {
      return <Navigate to={targetPublic + location.search} replace />;
    }

    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Role check — if specific roles required
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          gap: '1.5rem',
          textAlign: 'center',
          padding: '2rem',
          fontFamily: "'Outfit', 'Noto Sans Devanagari', sans-serif",
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Shield size={40} style={{ color: '#ef4444' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            पहुँच अस्वीकृत (Access Denied)
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '460px', margin: '0 auto 1rem' }}>
            तपाईंलाई यो पृष्ठ हेर्ने अनुमति छैन। कृपया उच्च अधिकार भएको खाताबाट लगइन गर्नुहोस्।
          </p>

          {user && (
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 18px',
                display: 'inline-block',
                fontSize: '0.85rem',
                color: '#334155',
                marginBottom: '0.5rem',
              }}
            >
              हाल लगइन भएको खाता: <strong style={{ color: '#0f172a' }}>{user.email}</strong>
              <span
                style={{
                  display: 'inline-block',
                  marginLeft: '8px',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                }}
              >
                भूमिका: {user.role || 'user'}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            }}
          >
            Super Admin खाताबाट लगइन गर्नुहोस्
          </button>

          <a
            href="/app.html"
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              fontWeight: 700,
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            पालिका Admin ड्यासबोर्डमा जानुहोस्
          </a>

          <button
            onClick={() => window.history.back()}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              backgroundColor: 'transparent',
              color: '#64748b',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            फिर्ता जानुहोस्
          </button>
        </div>
      </div>
    );
  }

  // Authenticated and authorized
  return <>{children}</>;
};
