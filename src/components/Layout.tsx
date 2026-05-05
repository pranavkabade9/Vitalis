import React, { useState } from 'react';
import { ICONS, ROUTES } from '../constants';
import { cn } from '../lib/utils';
import { useTheme } from './ThemeProvider';
import { motion } from 'motion/react';
import { useAuth } from '../lib/auth';
import Clock from './Clock';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (val: string) => void;
}

export default function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="relative z-20 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300"
      >
        <div className="flex items-center gap-3 p-6 h-20">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20 text-white shrink-0">
            <ICONS.Activity size={24} />
          </div>
          {isSidebarOpen && (
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Vitalis</span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          {ROUTES.map((route) => (
            <button
              key={route.name}
              onClick={() => setActiveTab(route.name)}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-xl transition-all group",
                activeTab === route.name
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <route.icon size={22} className="shrink-0" />
              {isSidebarOpen && <span className="font-medium whitespace-nowrap">{route.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn(
               "flex items-center gap-3 w-full p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all",
               !isSidebarOpen && "justify-center"
            )}
          >
            {theme === 'dark' ? <ICONS.Sun size={22} className="shrink-0" /> : <ICONS.Moon size={22} className="shrink-0" />}
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button 
            onClick={signOut}
            className={cn(
              "flex items-center gap-3 w-full p-3 mt-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <ICONS.LogOut size={22} className="shrink-0" />
            {isSidebarOpen && <span className="font-medium whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
        
        {/* Toggle Collapse */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-brand-500 transition-all shadow-md z-30"
        >
          <ICONS.ChevronRight size={14} className={cn("transition-transform", isSidebarOpen && "rotate-180")} />
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto no-scrollbar">
        {/* Header */}
        <header className="sticky top-0 z-10 h-20 flex items-center justify-between px-4 md:px-8 glass border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white truncate">{activeTab}</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden md:block">
               <Clock />
            </div>
            
            <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all shrink-0">
              <ICONS.Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{user?.user_metadata?.full_name || 'Anonymous'}</p>
                <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">{user?.is_guest ? 'Guest Session' : 'Verified Member'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-brand-500 shrink-0">
                <ICONS.User size={24} className="text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
          {children}
        </div>
        
        {/* Mobile Navigation bar */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-16 w-[90%] max-w-[400px] glass border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-around px-4 z-40 shadow-2xl">
          {ROUTES.slice(0, 4).map(route => (
            <button 
              key={route.name}
              onClick={() => setActiveTab(route.name)}
              className={cn(
                "p-3 rounded-2xl transition-all",
                activeTab === route.name ? "text-brand-500 bg-brand-50 dark:bg-brand-500/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              <route.icon size={24} />
            </button>
          ))}
          <button 
            onClick={() => setActiveTab('Settings')}
            className={cn(
               "p-3 rounded-2xl transition-all",
               activeTab === 'Settings' ? "text-brand-500 bg-brand-50 dark:bg-brand-500/10" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
             <ICONS.Settings size={24} />
          </button>
        </div>

        {/* SOS FAB */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-30 w-14 h-14 md:w-16 md:h-16 rounded-full bg-red-600 text-white shadow-2xl shadow-red-600/40 flex items-center justify-center group"
          onClick={() => alert("SOS Triggered! Notifying emergency contacts and displaying medical info.")}
        >
          <ICONS.ShieldAlert size={28} className="md:w-8 md:h-8" />
          <span className="absolute right-20 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
            EMERGENCY SOS
          </span>
        </motion.button>
      </main>
    </div>
  );
}
