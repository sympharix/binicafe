import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { ROUTES } from '../../config/constants';

const PAGE_TITLES = {
  [ROUTES.dashboard]: { title: 'Dashboard', subtitle: 'Overview of your restaurant' },
  [ROUTES.menu]: { title: 'Menu', subtitle: 'Categories and items' },
  [ROUTES.tables]: { title: 'Tables', subtitle: 'Floor plan and status' },
  [ROUTES.orders]: { title: 'Orders', subtitle: 'Active and history' },
  [ROUTES.kitchen]: { title: 'Kitchen', subtitle: 'Order queue and prep' },
  [ROUTES.inventory]: { title: 'Inventory', subtitle: 'Stock and movements' },
  [ROUTES.analytics]: { title: 'Analytics', subtitle: 'Sales and reports' },
  [ROUTES.executive]: { title: 'Executive', subtitle: 'Multi-branch overview' },
};

export default function AppLayout({ children }) {
  const location = useLocation();
  const { title, subtitle } = PAGE_TITLES[location.pathname] || { title: 'RMS', subtitle: '' };

  return (
    <div className="min-h-screen bg-rms-dark">
      <Sidebar />
      <div className="pl-64">
        <Header title={title} subtitle={subtitle} />
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
