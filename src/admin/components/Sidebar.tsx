import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Store, 
  Users, 
  Image, 
  Video, 
  MessageSquare,
  LogOut,
  Tag,
  Sliders,
  Trophy,
  Ticket
} from 'lucide-react';

import Logo from '../../components/Logo';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isGlobal = user?.role.name === 'GLOBAL_ADMIN';

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Productos', path: '/admin/products', icon: Package, exact: false },
    { name: 'Categorías', path: '/admin/categories', icon: Tag, exact: false },
    ...(isGlobal ? [
      { name: 'Sedes', path: '/admin/stores', icon: Store, exact: false },
      { name: 'Usuarios', path: '/admin/users', icon: Users, exact: false },
      { name: 'Inicio', path: '/admin/home', icon: Sliders, exact: false },
      { name: 'Concursos', path: '/admin/contests', icon: Trophy, exact: false },
      { name: 'Rifas', path: '/admin/raffles', icon: Ticket, exact: false },
    ] : [])
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-50 w-64 bg-black text-white h-full flex flex-col transition-transform duration-300 ease-in-out`}>
      <div className="p-6 border-b border-white/10 flex flex-col items-center">
        <Logo className="h-16 mb-2" />
        <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Admin Panel</p>
      </div>

      <div className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-none transition-colors ${
                isActive ? 'bg-white text-black font-bold' : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="mb-4 px-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Usuario</p>
          <p className="text-sm font-bold truncate">{user?.name}</p>
          <p className="text-[10px] text-red-500 uppercase tracking-widest">{user?.role.name}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm uppercase tracking-wider">Cerrar Sesión</span>
        </button>
      </div>
      </div>
    </>
  );
}
