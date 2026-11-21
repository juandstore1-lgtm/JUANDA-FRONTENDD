import { useState, useEffect } from 'react';
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
  Ticket,
  ShieldCheck,
  Briefcase,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Edit3,
  History,
  BarChart3,
  Boxes,
  ArrowLeftRight,
  CalendarCheck,
  DollarSign,
  FileSpreadsheet,
  Landmark,
  HandCoins
} from 'lucide-react';

import Logo from '../../components/Logo';

function TikTokIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.32a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 0 0 0 6.34-6.34V9.45a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.88z"/>
    </svg>
  );
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isGlobal = user?.role.name === 'GLOBAL_ADMIN';
  const isCommercialActive = location.pathname.startsWith('/admin/commercial');
  const [commercialOpen, setCommercialOpen] = useState(isCommercialActive);

  const isFinancialActive = location.pathname.startsWith('/admin/financial');
  const [financialOpen, setFinancialOpen] = useState(isFinancialActive);

  useEffect(() => {
    if (isCommercialActive) {
      setCommercialOpen(true);
    }
  }, [isCommercialActive]);

  useEffect(() => {
    if (isFinancialActive) {
      setFinancialOpen(true);
    }
  }, [isFinancialActive]);

  const currentTab = new URLSearchParams(location.search).get('tab') || 'resumen';

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Productos', path: '/admin/products', icon: Package, exact: false },
    { name: 'Categorías', path: '/admin/categories', icon: Tag, exact: false },
    ...(isGlobal ? [
      { name: 'Sedes', path: '/admin/stores', icon: Store, exact: false },
      { name: 'Auditoría de Catálogos', path: '/admin/audit', icon: ShieldCheck, exact: false },
      { name: 'Usuarios', path: '/admin/users', icon: Users, exact: false },
      { name: 'Reclutamiento', path: '/admin/recruitment', icon: Briefcase, exact: false },
      { name: 'Control TikTok', path: '/admin/tiktok', icon: TikTokIcon, exact: false },
      { name: 'Concursos', path: '/admin/contests', icon: Trophy, exact: false },
      { name: 'Rifas', path: '/admin/raffles', icon: Ticket, exact: false },
      { name: 'Inicio', path: '/admin/home', icon: Sliders, exact: false },
    ] : [])
  ];

  const commercialSubItems = [
    { name: 'Resumen general', tab: 'resumen', icon: LayoutDashboard },
    { name: 'Cargar ventas (IA)', tab: 'cargar-ia', icon: Sparkles },
    { name: 'Registro manual', tab: 'registro-manual', icon: Edit3 },
    { name: 'Historial de ventas', tab: 'historial', icon: History },
    { name: 'Ventas mensuales', tab: 'ventas-mensuales', icon: BarChart3 },
    { name: 'Inventario y costos', tab: 'inventario', icon: Boxes },
    { name: 'Movimientos (Entradas/Salidas)', tab: 'movimientos', icon: ArrowLeftRight },
    { name: 'Cuadres de ventas', tab: 'cuadres', icon: CalendarCheck },
    { name: 'Importar Excel', tab: 'importar', icon: FileSpreadsheet },
    { name: 'Reportes', tab: 'reportes', icon: BarChart3 },
  ];

  const financialSubItems = [
    { name: 'Resumen financiero', tab: 'resumen', icon: LayoutDashboard },
    { name: 'Gastos mensuales', tab: 'gastos', icon: DollarSign },
    { name: 'Deudas proveedores', tab: 'proveedores', icon: Package },
    { name: 'Deudas bancarias', tab: 'bancos', icon: Landmark },
    { name: 'Cuentas por cobrar', tab: 'cobrar', icon: HandCoins },
    { name: 'Calendario de pagos', tab: 'calendario', icon: CalendarCheck },
    { name: 'Reportes', tab: 'reportes', icon: BarChart3 },
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
      <div className="p-5 border-b border-white/10 flex flex-col items-center">
        <Logo className="h-14 mb-1" />
        <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Admin Panel</p>
      </div>

      <div className="flex-1 px-3 space-y-1.5 mt-3 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg transition-colors ${
                isActive ? 'bg-white text-black font-bold shadow-sm' : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}

        {/* Módulo Control Comercial (Solo Administrador Global) */}
        {isGlobal && (
          <div className="pt-2 border-t border-gray-800/80">
            <div
              onClick={() => setCommercialOpen(!commercialOpen)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg cursor-pointer transition-colors ${
                isCommercialActive 
                  ? 'bg-emerald-700 text-white font-bold shadow-md shadow-emerald-900/30' 
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span className="text-xs uppercase tracking-wider">Control Comercial</span>
              </div>
              {commercialOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {commercialOpen && (
              <div className="ml-3 pl-2 border-l border-emerald-900/40 space-y-1 mt-1.5 pb-2">
                {commercialSubItems.map((sub) => {
                  const isSubActive = isCommercialActive && currentTab === sub.tab;
                  return (
                    <Link
                      key={sub.tab}
                      to={`/admin/commercial?tab=${sub.tab}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                        isSubActive 
                          ? 'bg-emerald-950/80 text-emerald-300 font-bold border-l-2 border-emerald-400' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-900/60'
                      }`}
                    >
                      <sub.icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSubActive ? 'text-emerald-400' : 'text-gray-500'}`} />
                      <span className="truncate">{sub.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Módulo Control Financiero (Solo Administrador Global) */}
        {isGlobal && (
          <div className="pt-2 border-t border-gray-800/80">
            <div
              onClick={() => setFinancialOpen(!financialOpen)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg cursor-pointer transition-colors ${
                isFinancialActive 
                  ? 'bg-emerald-700 text-white font-bold shadow-md shadow-emerald-900/30' 
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Landmark className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span className="text-xs uppercase tracking-wider">Control Financiero</span>
              </div>
              {financialOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {financialOpen && (
              <div className="ml-3 pl-2 border-l border-emerald-900/40 space-y-1 mt-1.5 pb-2">
                {financialSubItems.map((sub) => {
                  const isSubActive = isFinancialActive && currentTab === sub.tab;
                  return (
                    <Link
                      key={sub.tab}
                      to={`/admin/financial?tab=${sub.tab}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                        isSubActive 
                          ? 'bg-emerald-950/80 text-emerald-300 font-bold border-l-2 border-emerald-400' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-900/60'
                      }`}
                    >
                      <sub.icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSubActive ? 'text-emerald-400' : 'text-gray-500'}`} />
                      <span className="truncate">{sub.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="mb-3 px-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Usuario</p>
          <p className="text-xs font-bold truncate">{user?.name}</p>
          <p className="text-[9px] text-emerald-400 font-semibold uppercase tracking-widest">{user?.role.name}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2 w-full text-left text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">Cerrar Sesión</span>
        </button>
      </div>
      </div>
    </>
  );
}
