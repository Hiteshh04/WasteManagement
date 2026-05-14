import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Clock, CheckCircle, TrendingUp,
  AlertTriangle, ArrowRight, BarChart3, Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';

// ── Sparkline SVG (Supervisor variant) ──────────────────────────────────────
function Sparkline({ color }: { color: string }) {
  const pts = [
    [0, 10], [8, 18], [16, 12], [24, 20], [32, 14], [40, 22], [48, 12]
  ];
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  return (
    <svg viewBox="0 0 48 24" className="w-12 h-6">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [recentPending, setRecentPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pendingData, completedData] = await Promise.all([
          reportService.getSupervisorPendingReports(),
          reportService.getSupervisorCompletedReports(),
        ]);
        const pCount = pendingData.count ?? (pendingData.reports?.length || 0);
        const cCount = completedData.count ?? (completedData.reports?.length || 0);
        setPendingCount(pCount);
        setCompletedCount(cCount);
        setRecentPending((pendingData.reports || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Supervisor';

  const statCards = [
    {
      label: 'Pending Tasks', value: pendingCount, sub: 'Requires action',
      icon: <Clock size={18} className="text-amber-500" />, iconBg: 'bg-amber-50',
      sparkColor: '#f59e0b', to: '/supervisor/pending'
    },
    {
      label: 'Resolved Today', value: completedCount, sub: 'Efficiency tracking',
      icon: <CheckCircle size={18} className="text-green-500" />, iconBg: 'bg-green-50',
      sparkColor: '#22c55e', to: '/supervisor/completed'
    },
    {
      label: 'Avg Response', value: '2.4h', sub: 'Last 7 days',
      icon: <TrendingUp size={18} className="text-blue-500" />, iconBg: 'bg-blue-50',
      sparkColor: '#3b82f6',
    },
    {
      label: 'Active Users', value: '124', sub: 'Reporting activity',
      icon: <Users size={18} className="text-purple-500" />, iconBg: 'bg-purple-50',
      sparkColor: '#8b5cf6',
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* ── Welcome Section ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}! 🛡️</h1>
            <p className="text-sm text-gray-500 mt-1">Manage campus cleanliness and respond to waste reports.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-white text-sm font-medium">
            <ShieldCheck size={16} /> Supervisor Mode
          </div>
        </div>
      </div>

      {/* ── Stat Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            onClick={() => card.to && navigate(card.to)}
            className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm transition-all ${card.to ? 'hover:shadow-md cursor-pointer' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                {card.icon}
              </div>
              <Sparkline color={card.sparkColor} />
            </div>
            <p className="text-xs text-gray-400 font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {loading ? '—' : card.value}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Urgent Tasks ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Priority Tasks</h2>
              <p className="text-[11px] text-gray-400">Reports waiting for your attention</p>
            </div>
            <button onClick={() => navigate('/supervisor/pending')} className="text-xs text-blue-600 font-semibold hover:underline">
              View all
            </button>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentPending.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle size={32} className="text-green-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">All caught up!</p>
                <p className="text-xs text-gray-400">No pending reports at the moment.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentPending.map(report => (
                  <div key={report.id || report._id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
                    <img src={report.image_url} alt="Waste" className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 capitalize truncate">{report.waste_type} Waste</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          report.severity === 'high' ? 'bg-red-50 text-red-600' :
                          report.severity === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {report.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 italic">
                        {report.note || 'No description provided'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/supervisor/complete/${report.id || report._id}`)}
                      className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-slate-800 group-hover:text-white transition-all"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Summary Card ── */}
        <div className="bg-slate-800 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BarChart3 size={120} />
          </div>
          
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Monthly Performance</p>
            <h3 className="text-3xl font-bold mt-2">92%</h3>
            <p className="text-slate-300 text-sm mt-1 flex items-center gap-1">
              <TrendingUp size={14} className="text-green-400" />
              +12% better than last month
            </p>
          </div>

          <div className="relative z-10 pt-8">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Cleanup Progress</span>
                  <span>{completedCount}/{pendingCount + completedCount}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div
                    className="bg-green-400 h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: `${(completedCount / (pendingCount + completedCount || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                You have resolved {completedCount} reports this session. Great job keeping the campus clean!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
