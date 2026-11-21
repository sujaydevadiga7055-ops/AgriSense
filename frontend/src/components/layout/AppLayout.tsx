import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine title based on route
  const getHeaderInfo = () => {
    const path = location.pathname;
    if (path.includes('crop-recommendation')) {
      return {
        title: 'Crop Recommendation System',
        subtitle: 'AI-assisted soil & environmental crop suitability analysis',
      };
    }
    if (path.includes('yield-prediction')) {
      return {
        title: 'Crop Yield Estimation',
        subtitle: 'Multi-variable agricultural harvest forecasting',
      };
    }
    if (path.includes('fertilizer-recommendation')) {
      return {
        title: 'Fertilizer Recommendation',
        subtitle: 'Nutrient deficit assessment & application guidance',
      };
    }
    if (path.includes('history')) {
      return {
        title: 'Prediction Records & History',
        subtitle: 'Your isolated historical model outputs & inputs',
      };
    }
    if (path.includes('profile')) {
      return {
        title: 'Farmer Profile & Security',
        subtitle: 'Account details and credential management',
      };
    }
    return {
      title: 'Farmer Dashboard',
      subtitle: 'Real-time decision support overview',
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
