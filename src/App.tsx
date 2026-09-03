import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { RoleGuard } from './guards/RoleGuard';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ThreatDetectionCenter } from './pages/ThreatDetectionCenter';
import { BudgetIntelligence } from './pages/BudgetIntelligence';
import { TransactionLedger } from './pages/TransactionLedger';
import { VendorIntelligencePage } from './pages/VendorIntelligence';
import { RulesEngine } from './pages/RulesEngine';
import { StressSimulationLab } from './pages/StressSimulationLab';
import { ComplianceReports } from './pages/ComplianceReports';
import { SettingsGovernance } from './pages/SettingsGovernance';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Authenticated Application Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="threats" element={<ThreatDetectionCenter />} />
              <Route path="budgets" element={<BudgetIntelligence />} />
              <Route path="ledger" element={<TransactionLedger />} />
              <Route path="vendors" element={<VendorIntelligencePage />} />

              {/* Role Restricted Routes */}
              <Route
                path="rules"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'FINANCE_OFFICER']}>
                    <RulesEngine />
                  </RoleGuard>
                }
              />
              <Route
                path="simulation"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'FINANCE_OFFICER']}>
                    <StressSimulationLab />
                  </RoleGuard>
                }
              />
              <Route
                path="compliance"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'FINANCE_OFFICER']}>
                    <ComplianceReports />
                  </RoleGuard>
                }
              />
              <Route path="settings" element={<SettingsGovernance />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
