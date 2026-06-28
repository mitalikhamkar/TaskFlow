import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { motion } from 'motion/react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Route guarding: Send unauthorized users back to Landing Page
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // prevent rendering during redirection
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex overflow-hidden font-sans">
      {/* Background elegant shader mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/5 blur-[120px]" />
      </div>

      {/* Sidebar Panel */}
      <Sidebar />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col ml-64 min-h-screen relative z-10 overflow-y-auto">
        <Header />

        <main className="flex-1 p-8 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-7xl mx-auto h-full flex flex-col"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
