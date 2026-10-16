import React from 'react';
import { DashboardOverview } from '../../features/dashboard/DashboardOverview';

/**
 * ExecutiveDashboard:
 * Merged into the Unified Command Center (DashboardOverview).
 * Preserves route `/app/executive-dashboard` with `defaultTab="executive"`
 * for seamless backward compatibility and deep linking.
 */
export default function ExecutiveDashboard() {
  return <DashboardOverview defaultTab="executive" />;
}
