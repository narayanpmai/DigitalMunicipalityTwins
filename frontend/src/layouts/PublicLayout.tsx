import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { CitizenLiveChatWidget } from '../components/chat/CitizenLiveChatWidget';

export const PublicLayout: React.FC = () => {
  return (
    <div className="app-container public-portal-layout">
      <div className="main-content" style={{ minWidth: 0, width: '100%' }}>
        <Navbar isPublic={true} />
        <div style={{ display: 'flex', flex: 1, minWidth: 0, width: '100%' }}>
          <Sidebar isPublic={true} />
          <main className="page-body public-page-body">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
      {/* 24/7 Citizen AI, Grievance Live Chat & WhatsApp Integration */}
      <CitizenLiveChatWidget />
    </div>
  );
};
