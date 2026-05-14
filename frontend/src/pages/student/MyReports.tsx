import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reportService } from '../../services/reportService';
import { MapPin, Trash2, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function MyReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getMyReports();
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this report? It will be permanently deleted.')) {
      return;
    }

    try {
      setRevokingId(id);
      await reportService.revokeReport(id);
      toast.success('Report revoked successfully');
      // Refresh the list
      setReports(prev => prev.filter(r => (r.id || r._id) !== id));
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to revoke report');
    } finally {
      setRevokingId(null);
    }
  };

  const getSeverityStyles = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'high':
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16a34a]"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading your reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">My Waste Reports</h2>
        <div className="flex gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider shadow-sm">
            Total: {reports.length}
          </span>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Clock size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No reports found</h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">
            You haven't submitted any waste reports yet. Be the first to help keep our campus clean!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const reportId = report.id || report._id;
            const isPending = report.status === 'pending';
            
            return (
              <div key={reportId} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="relative">
                  <img src={report.image_url} alt="Waste" className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  
                  {/* Status Tag */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-lg ${
                      report.status === 'completed' 
                        ? 'bg-green-500/90 text-white' 
                        : 'bg-orange-500/90 text-white'
                    }`}>
                      {report.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {report.status}
                    </span>
                  </div>

                  {/* Severity Tag */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border shadow-sm backdrop-blur-sm ${getSeverityStyles(report.severity)}`}>
                      <AlertTriangle size={10} />
                      {report.severity}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest px-2 py-0.5 rounded-md bg-green-50">
                      {report.waste_type}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-0.5 rounded-md bg-gray-50">
                      {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                    Waste Reported near Campus
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <MapPin size={14} className="text-green-500" />
                    <span>Location Verified • {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-xs font-medium text-gray-400 italic">
                      {isPending ? 'Waiting for supervisor...' : 'Issue resolved ✅'}
                    </div>
                    
                    {isPending && (
                      <button
                        onClick={() => handleRevoke(reportId)}
                        disabled={revokingId === reportId}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all duration-200 shadow-sm shadow-red-100 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        {revokingId === reportId ? 'Revoking...' : 'Revoke'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
