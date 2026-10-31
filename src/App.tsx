/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SolarProvider, useSolar } from './context/SolarContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FloatingAiAssistant } from './components/FloatingAiAssistant';
import { LoginPage } from './components/LoginPage';

// Views
import { DashboardView } from './components/views/DashboardView';
import { CustomersView } from './components/views/CustomersView';
import { SiteSurveysView } from './components/views/SiteSurveysView';
import { QuotationsView } from './components/views/QuotationsView';
import { OrdersView } from './components/views/OrdersView';
import { InventoryView } from './components/views/InventoryView';
import { SerialDispatchView } from './components/views/SerialDispatchView';
import { InstallationsView } from './components/views/InstallationsView';
import { WarrantyView } from './components/views/WarrantyView';
import { ServiceTicketsView } from './components/views/ServiceTicketsView';
import { FinanceView } from './components/views/FinanceView';
import { AiAssistantView } from './components/views/AiAssistantView';
import { SettingsView } from './components/views/SettingsView';
import { ProjectOverviewView } from './components/views/ProjectOverviewView';

function MainApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('sunflow_auth_session') === 'true';
  });

  const [targetSurveyIdForQuote, setTargetSurveyIdForQuote] = useState<string | undefined>(undefined);
  const [targetOrderIdForDispatch, setTargetOrderIdForDispatch] = useState<string | undefined>(undefined);

  const handleLogout = () => {
    localStorage.removeItem('sunflow_auth_session');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => setIsAuthenticated(true)} />;
  }

  const navigateTo = (viewId: string) => {
    setCurrentView(viewId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartSurvey = (customerId: string) => {
    navigateTo('surveys');
  };

  const handleStartQuote = (surveyId: string) => {
    setTargetSurveyIdForQuote(surveyId);
    navigateTo('quotations');
  };

  const handleStartDispatch = (orderId: string) => {
    setTargetOrderIdForDispatch(orderId);
    navigateTo('dispatch');
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Desktop & Tablet Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          currentView={currentView}
          onSelectView={navigateTo}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-slate-900 h-full flex flex-col z-10 shadow-2xl">
            <Sidebar
              currentView={currentView}
              onSelectView={navigateTo}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileMenuOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onNavigate={navigateTo}
          onLogout={handleLogout}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && <DashboardView onNavigate={navigateTo} />}
            {currentView === 'customers' && (
              <CustomersView
                onScheduleSurvey={handleStartSurvey}
                onNavigate={navigateTo}
              />
            )}
            {currentView === 'surveys' && (
              <SiteSurveysView onGenerateQuotation={handleStartQuote} />
            )}
            {currentView === 'quotations' && (
              <QuotationsView
                preselectedSurveyId={targetSurveyIdForQuote}
                onNavigateToOrders={() => navigateTo('orders')}
              />
            )}
            {currentView === 'orders' && (
              <OrdersView onNavigateToDispatch={handleStartDispatch} />
            )}
            {currentView === 'inventory' && (
              <InventoryView onNavigateToSerial={() => navigateTo('dispatch')} />
            )}
            {currentView === 'dispatch' && (
              <SerialDispatchView
                initialOrderId={targetOrderIdForDispatch}
                onNavigateToInstallations={() => navigateTo('installations')}
              />
            )}
            {currentView === 'installations' && (
              <InstallationsView onNavigateToWarranty={() => navigateTo('warranty')} />
            )}
            {currentView === 'warranty' && <WarrantyView />}
            {currentView === 'service' && <ServiceTicketsView />}
            {currentView === 'finance' && <FinanceView />}
            {currentView === 'ai' && <AiAssistantView />}
            {currentView === 'overview' && <ProjectOverviewView onNavigate={navigateTo} />}
            {currentView === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Persistent Floating AI Assistant across all views */}
      <FloatingAiAssistant />
    </div>
  );
}

export default function App() {
  return (
    <SolarProvider>
      <MainApp />
    </SolarProvider>
  );
}
