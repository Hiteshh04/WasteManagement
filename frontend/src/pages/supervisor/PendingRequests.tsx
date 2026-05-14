import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reportService } from '../../services/reportService';
import { MapPin, AlertCircle, Clock, ArrowRight, Info } from 'lucide-react';

export default function PendingRequests() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportService.getSupervisorPendingReports();
        setReports(data.reports || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load pending reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Fetching pending reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
          <p className="text-sm text-gray-500 mt-1">Found {reports.length} reports that require cleanup action.</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Pending Requests</h3>
          <p className="text-gray-500 mt-1">Excellent! All reported waste has been handled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id || report._id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col group">
              {/* Photo Header */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={report.image_url}
                  alt="Waste"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                    (report.severity === 'high' || report.severity === 'critical') ? 'bg-red-600 text-white' :
                    report.severity === 'medium' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {report.severity} Severity
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md font-medium">
                    {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-gray-900 capitalize">{report.waste_type} Waste</h3>
                  {report.smell && (
                    <div title="Foul smell reported" className="text-red-500 bg-red-50 p-1 rounded-md">
                      <AlertCircle size={16} />
                    </div>
                  )}
                </div>

                <div className="mt-3 space-y-2 flex-1 text-sm text-gray-500">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="leading-tight">
                      Lat: {report.latitude?.toFixed(4)}, Lng: {report.longitude?.toFixed(4)}
                    </p>
                  </div>
                  {report.note && (
                    <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="italic text-gray-600 leading-snug line-clamp-2">"{report.note}"</p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Link
                    to={`/supervisor/complete/${report.id || report._id}`}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-sm"
                  >
                    Take Action <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
