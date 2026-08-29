import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-sm font-bold uppercase tracking-widest animate-pulse">Cargando Panel...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="h-screen w-full flex bg-gray-50 text-black overflow-hidden flex-col md:flex-row">
      {/* Mobile Top Nav */}
      <div className="md:hidden flex items-center justify-between bg-black p-4 text-white z-30 flex-shrink-0 shadow-md">
        <Logo className="h-8" />
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -mr-2"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 overflow-auto">
        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
