import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SuperAdminPage } from './features/super-admin/SuperAdminPage';

const SUPER_ADMIN_ROLES = ['super_admin', 'it_admin'];

export const SuperAdminApp: React.FC = () => {
  return (
    <TenantProvider>
      <Routes>
        <Route
          path="/*"
          element={
            <PrivateRoute requiredRoles={SUPER_ADMIN_ROLES} redirectTo="/login">
              <ErrorBoundary>
                <SuperAdminPage />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </TenantProvider>
  );
};

export default SuperAdminApp;
