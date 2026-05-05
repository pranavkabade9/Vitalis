import React, { useState } from 'react';
import Layout from './components/Layout';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './lib/auth';
import { HealthProvider, useHealth } from './lib/store';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Vitals from './pages/Vitals';
import Lifestyle from './pages/Lifestyle';
import Medications from './pages/Medications';
import History from './pages/History';
import Settings from './pages/Settings';
import { AnimatePresence, motion } from 'motion/react';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: healthLoading } = useHealth();
  const [activeTab, setActiveTab] = useState('Dashboard');

  if (authLoading || healthLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 rounded-2xl bg-brand-500 shadow-xl shadow-brand-500/20 flex items-center justify-center text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Check if onboarding is needed
  const isProfileIncomplete = !profile.profileCompleted;
  const hasSkippedOnboarding = sessionStorage.getItem('vitalis-onboarding-skipped') === 'true';

  // For Google users, we allow skip. For Guest users, we don't (required mini setup).
  const showOnboarding = isProfileIncomplete && (user.is_guest || !hasSkippedOnboarding);

  if (showOnboarding) {
    return <Onboarding />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <Dashboard />;
      case 'Vitals': return <Vitals />;
      case 'Lifestyle': return <Lifestyle />;
      case 'Medications': return <Medications />;
      case 'History': return <History />;
      case 'Settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <HealthProvider>
          <AppContent />
        </HealthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
