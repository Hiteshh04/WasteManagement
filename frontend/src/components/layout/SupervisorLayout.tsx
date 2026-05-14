import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck, LayoutDashboard, Clock, CheckCircle,
  Menu, ChevronLeft, HelpCircle
} from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';

const navLinks = [
  { to: '/supervisor/dashboard', label: 'Dashboard',          icon: LayoutDashboard },
  { to: '/supervisor/pending',   label: 'Pending Requests',   icon: Clock },
  { to: '/supervisor/completed', label: 'Completed Requests', icon: CheckCircle },
];

export default function SupervisorLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activePage = navLinks.find(l => l.to === location.pathname)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 bg-white flex flex-col
        transition-all duration-300 ease-in-out overflow-hidden shadow-sm
        ${sidebarOpen ? 'w-[200px]' : 'w-0 lg:w-[70px]'}
      `}>
        {/* Logo */}
        <div className={`flex items-center h-14 border-b border-gray-100 flex-shrink-0 ${sidebarOpen ? 'px-4 gap-2.5' : 'justify-center'}`}>
          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={15} className="text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">EcoCampus</p>
              <p className="text-gray-400 text-[10px]">Supervisor Panel</p>
            </div>
          )}
        </div>

        {/* Nav label */}
        {sidebarOpen && (
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 pt-4 pb-1">Management</p>
        )}

        {/* Nav */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                title={!sidebarOpen ? label : undefined}
                onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                className={`
                  flex items-center rounded-xl text-[13px] font-medium transition-all
                  ${sidebarOpen ? 'gap-2.5 px-3 py-2.5' : 'justify-center py-2.5 px-0'}
                  ${active
                    ? 'bg-slate-800 text-white'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
                `}
              >
                <Icon size={17} className={`flex-shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                {sidebarOpen && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Help section */}
        <div className={`border-t border-gray-100 py-3 ${sidebarOpen ? 'px-4' : 'px-2 flex justify-center'}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle size={14} className="text-gray-400" />
              <div>
                <p className="text-[11px] font-semibold text-gray-700">Need Help?</p>
                <a 
                  href="mailto:hiteshparida614@gmail.com" 
                  className="text-[10px] text-slate-600 hover:text-slate-800 font-medium transition-colors underline decoration-slate-200"
                >
                  Contact admin
                </a>
              </div>
            </div>
          ) : (
            <a href="mailto:hiteshparida614@gmail.com" title="Contact Admin">
              <HelpCircle size={16} className="text-gray-400 hover:text-slate-600 transition-colors" />
            </a>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-[200px]' : 'lg:ml-[70px]'} ml-0`}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-3 shadow-none">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
          <span className="font-semibold text-gray-800 text-sm">{activePage}</span>
          <div className="flex-1" />
          <ProfileDropdown isSupervisor={true} />
        </header>

        <main className="flex-1 p-4 lg:p-5">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
import Footer from './Footer';
