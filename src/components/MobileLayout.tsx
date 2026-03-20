import React from 'react';
import { Menu, X } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  sidebarOpen,
  setSidebarOpen,
  sidebar,
  header
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {header}
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-black/20 backdrop-blur-md border-r border-white/10 z-50 transform transition-transform duration-300 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {sidebar}
      </div>
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-20 w-64 h-[calc(100vh-80px)] bg-black/10 backdrop-blur-md border-r border-white/10">
        {sidebar}
      </div>
      
      {/* Main Content */}
      <main className="lg:ml-64 pt-4 lg:pt-6 px-4 lg:px-6 pb-6">
        {children}
      </main>
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg z-30"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

export default MobileLayout;