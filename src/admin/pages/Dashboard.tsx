import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardService } from '../../services/api';
import { Package, MessageSquare, Users, Image, Tag } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (user) {
      DashboardService.getMetrics(user).then(setMetrics);
    }
  }, [user]);

  if (!metrics) return <div>Cargando...</div>;

  const isGlobal = user?.role.name === 'GLOBAL_ADMIN';

  return (
    <div>
      <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Productos" value={metrics.totalProducts} icon={Package} />
        
        {isGlobal && (
          <>
            <MetricCard title="Mensajes Recibidos" value={metrics.totalMessages} icon={MessageSquare} />
            <MetricCard title="Administradores" value={metrics.totalAdmins} icon={Users} />
            <MetricCard title="Promociones Activas" value={metrics.activePromos} icon={Tag} />
          </>
        )}
      </div>


    </div>
  );
}

function MetricCard({ title, value, icon: Icon }: any) {
  return (
    <div className="bg-white p-6 border border-gray-100 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
      <div className="w-12 h-12 bg-gray-50 flex items-center justify-center">
        <Icon className="w-6 h-6 text-black" />
      </div>
    </div>
  );
}
