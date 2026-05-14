import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, CheckCircle, Clock, Star, FileText, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';

// ── Sparkline SVG ────────────────────────────────────────────────────────────
function Sparkline({ color }: { color: string }) {
  const pts = [
    [0, 20], [8, 14], [16, 18], [24, 8], [32, 12], [40, 6], [48, 10]
  ];
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  return (
    <svg viewBox="0 0 48 24" className="w-12 h-6">
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { value: number; color: string }[] }) {
  const total = segments.reduce((a, b) => a + b.value, 0) || 1;
  const r = 36, cx = 44, cy = 44, stroke = 12;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map(seg => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const arc = { dash, gap: circumference - dash, offset, color: seg.color };
    offset += dash;
    return arc;
  });
  return (
    <svg viewBox="0 0 88 88" className="w-28 h-28">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      {arcs.map((arc, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={arc.color} strokeWidth={stroke}
          strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
          strokeDashoffset={-arc.offset + circumference / 4}
          strokeLinecap="butt"
        />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="#9ca3af">Total</text>
    </svg>
  );
}

// ── Eco Score Ring ───────────────────────────────────────────────────────────
function EcoRing({ score }: { score: number }) {
  const r = 52, c = 2 * Math.PI * r;
  const pct = Math.min(score, 100) / 100;
  return (
    <svg viewBox="0 0 120 120" className="w-36 h-36">
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="10" />
      <circle cx="60" cy="60" r={r} fill="none"
        stroke="white" strokeWidth="10"
        strokeDasharray={`${pct * c} ${c}`}
        strokeLinecap="round" transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x="60" y="55" textAnchor="middle" fontSize="24" fontWeight="800" fill="white">{score}</text>
      <text x="60" y="71" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.75)">/100</text>
    </svg>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
function getBadge(total: number) {
  if (total >= 20) return 'Eco Legend';
  if (total >= 10) return 'Eco Hero';
  if (total >= 5)  return 'Eco Warrior';
  return 'Eco Starter';
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const WASTE_COLORS: Record<string, string> = {
  plastic: '#22c55e', mixed: '#3b82f6', organic: '#f59e0b',
  paper: '#8b5cf6', metal: '#06b6d4', other: '#ef4444',
};
function colorFor(type: string) {
  return WASTE_COLORS[type?.toLowerCase()] || '#64748b';
}

// ─────────────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getMyReports()
      .then(d => setReports(d.reports || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  const total    = reports.length;
  const resolved = reports.filter(r => r.status === 'completed').length;
  const pending  = reports.filter(r => r.status === 'pending').length;
  const ecoScore = Math.min(100, total * 8 + resolved * 5);
  const badge    = getBadge(total);
  const firstName = user?.name?.split(' ')[0] || 'there';

  // Donut segments by waste type
  const typeCounts: Record<string, number> = {};
  reports.forEach(r => { typeCounts[r.waste_type] = (typeCounts[r.waste_type] || 0) + 1; });
  const segments = Object.entries(typeCounts).map(([type, count]) => ({
    type, count, color: colorFor(type), pct: total ? Math.round(count / total * 100) : 0
  }));
  if (segments.length === 0) {
    segments.push({ type: 'none', count: 0, color: '#e5e7eb', pct: 0 });
  }

  return (
    <div className="space-y-5 w-full">

      {/* ── Welcome Banner ─────────────────────────────────────── */}
      <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        {/* gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-blue-50/50 to-cyan-50/80 pointer-events-none" />
        {/* city illustration (pure CSS) */}
        <div className="absolute right-0 top-0 bottom-0 w-56 overflow-hidden pointer-events-none">
          {/* sky gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-100/60 to-transparent" />
          {/* buildings */}
          {[
            { w: 20, h: 60, x: 10,  color: '#bfdbfe' },
            { w: 28, h: 80, x: 36,  color: '#93c5fd' },
            { w: 18, h: 45, x: 70,  color: '#a5f3fc' },
            { w: 30, h: 95, x: 94,  color: '#6ee7b7' },
            { w: 22, h: 55, x: 130, color: '#bfdbfe' },
            { w: 16, h: 38, x: 158, color: '#a5f3fc' },
          ].map((b, i) => (
            <div key={i} className="absolute bottom-0 rounded-t"
              style={{ width: b.w, height: b.h, left: b.x, backgroundColor: b.color, opacity: 0.7 }} />
          ))}
          {/* hills */}
          <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 224 50" preserveAspectRatio="none">
            <ellipse cx="80" cy="60" rx="90" ry="50" fill="#bbf7d0" opacity="0.8" />
            <ellipse cx="170" cy="65" rx="80" ry="48" fill="#86efac" opacity="0.7" />
          </svg>
          {/* windmills */}
          <div className="absolute bottom-8 left-6 text-green-400 text-2xl select-none">⚙</div>
          <div className="absolute bottom-10 left-20 text-green-300 text-xl select-none">⚙</div>
        </div>

        <div className="relative px-7 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {firstName}! 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">Here's what's happening with your campus today.</p>
            </div>
            {/* Eco badge */}
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0fdf4] border border-green-200 rounded-full text-[12px] font-semibold text-[#16a34a]">
              <Leaf size={11} /> {badge}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Reports', value: total, sub: 'Across all time',
            icon: <Leaf size={18} className="text-[#16a34a]" />, iconBg: 'bg-green-50',
            sparkColor: '#22c55e',
          },
          {
            label: 'Resolved', value: resolved, sub: 'This month',
            icon: <CheckCircle size={18} className="text-blue-500" />, iconBg: 'bg-blue-50',
            sparkColor: '#3b82f6',
          },
          {
            label: 'Pending', value: pending, sub: 'Needs attention',
            icon: <Clock size={18} className="text-orange-500" />, iconBg: 'bg-orange-50',
            sparkColor: '#f59e0b',
          },
          {
            label: 'Eco Score', value: ecoScore, sub: 'Keep going!',
            icon: <Star size={18} className="text-purple-500" />, iconBg: 'bg-purple-50',
            sparkColor: '#8b5cf6',
          },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                {card.icon}
              </div>
              <Sparkline color={card.sparkColor} />
            </div>
            <p className="text-xs text-gray-400 font-medium">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {loading ? '—' : card.value}
              {card.label === 'Eco Score' && !loading && <span className="text-sm text-gray-400 font-normal">/100</span>}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Middle Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Waste Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Waste Overview</h2>
              <p className="text-[11px] text-gray-400">Reports by waste type</p>
            </div>
            <span className="text-[11px] text-gray-400 border border-gray-200 rounded-lg px-2 py-1">This Month ▾</span>
          </div>

          <div className="flex items-center gap-8 mt-4">
            <DonutChart segments={segments.map(s => ({ value: s.count, color: s.color }))} />

            <div className="flex-1 space-y-3">
              {segments.filter(s => s.type !== 'none').map(s => (
                <div key={s.type} className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-sm text-gray-700 capitalize flex-1 flex items-center gap-1">
                    {s.type} <span className="text-gray-300 text-xs">🗑</span>
                  </span>
                  {/* progress bar */}
                  <div className="w-24 bg-gray-100 rounded-full h-1.5 flex-shrink-0">
                    <div className="h-1.5 rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                  </div>
                  <span className="text-xs text-gray-500 w-4 flex-shrink-0">{s.count}</span>
                  <span className="text-[11px] text-gray-400 w-8 text-right flex-shrink-0">{s.pct}%</span>
                </div>
              ))}
              {segments[0]?.type === 'none' && (
                <p className="text-sm text-gray-400 italic">No reports yet</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-2 text-[11px] text-gray-400">
            <Leaf size={12} className="text-[#16a34a]" />
            Every report helps make our campus greener. Thank you!
          </div>
        </div>

        {/* Eco Score Card */}
        <div className="bg-gradient-to-b from-[#4ade80] to-[#16a34a] rounded-xl shadow-sm p-5 flex flex-col items-center justify-center relative overflow-hidden">
          {/* decorative leaves */}
          <div className="absolute bottom-4 left-4 text-green-300/40 text-5xl select-none rotate-12">🌿</div>
          <div className="absolute top-4 right-3 text-green-200/30 text-3xl select-none -rotate-12">🌿</div>

          <p className="text-white font-semibold text-sm mb-3 z-10">Your Eco Score</p>
          <div className="z-10">
            <EcoRing score={ecoScore} />
          </div>
          <p className="text-green-100 text-xs mt-3 z-10">
            {ecoScore >= 100 ? '🎉 Max level!' : `${100 - ecoScore} pts to next level`}
          </p>
        </div>
      </div>

      {/* ── Bottom Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Reports */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">Recent Reports</h2>
            <button onClick={() => navigate('/student/my-reports')} className="text-[12px] text-[#16a34a] font-medium hover:underline">
              View all
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-500">No complaints yet</p>
              <p className="text-xs text-gray-400 mt-0.5">Be the first to report! 🌿</p>
              <button onClick={() => navigate('/student/report-waste')}
                className="mt-3 px-4 py-1.5 bg-[#16a34a] text-white text-xs rounded-lg hover:bg-green-700 transition-colors">
                Report Waste
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {reports.slice(0, 4).map(r => (
                <div key={r.id || r._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <img src={r.image_url} alt="waste" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium capitalize truncate">
                      {r.waste_type} waste near campus
                    </p>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    r.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {r.status === 'completed' ? 'Resolved' : 'Pending'}
                  </span>
                  <span className="flex-shrink-0 text-[11px] text-gray-400 ml-1">
                    {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Report Waste', sub: 'Submit a new report', icon: <Leaf size={20} className="text-[#16a34a]" />, iconBg: 'bg-green-50', to: '/student/report-waste' },
              { label: 'My Reports', sub: 'Track your reports', icon: <FileText size={20} className="text-blue-500" />, iconBg: 'bg-blue-50', to: '/student/my-reports' },
              { label: 'Leaderboard', sub: 'See top contributors', icon: <Trophy size={20} className="text-purple-500" />, iconBg: 'bg-purple-50', to: '/student/leaderboard' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.to)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center">
                <div className={`w-10 h-10 ${a.iconBg} rounded-xl flex items-center justify-center`}>
                  {a.icon}
                </div>
                <p className="text-xs font-semibold text-gray-800">{a.label}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{a.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
