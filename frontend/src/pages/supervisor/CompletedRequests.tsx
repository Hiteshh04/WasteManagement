import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reportService } from '../../services/reportService';
import { MapPin, CheckCircle, Calendar } from 'lucide-react';

export default function CompletedRequests() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportService.getSupervisorCompletedReports();
        setReports(data.reports || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load completed reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="text-green-600" /> Completed Requests
          </h2>
          <p className="text-sm text-gray-500 mt-1">History of resolved waste reports.</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No History Found</h3>
          <p className="text-gray-500 mt-1">Once you complete cleanup tasks, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const completion = report.completion;
            return (
              <div key={report.id || report._id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col group">
                {/* Photo Comparison */}
                <div className="flex h-40 border-b border-gray-100 relative">
                  <div className="w-1/2 relative">
                    <img src={report.image_url} alt="Before" className="h-full w-full object-cover" />
                    <span className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Before</span>
                  </div>
                  <div className="w-1/2 relative border-l-2 border-white">
                    {completion?.cleaned_image_url ? (
                      <>
                        <img src={completion.cleaned_image_url} alt="After" className="h-full w-full object-cover" />
                        <span className="absolute top-2 left-2 bg-green-600/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">After</span>
                      </>
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400 text-[10px]">
                        No photo
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                      Completed
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                      <Calendar size={12} />
                      {formatDate(completion?.created_at || report.updated_at)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 mb-4">
                    <h3 className="text-lg font-bold text-gray-900 capitalize">{report.waste_type} Waste</h3>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${
                      (report.severity === 'high' || report.severity === 'critical') ? 'bg-red-50 text-red-600 border-red-100' :
                      report.severity === 'medium' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {report.severity}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">Reported at: {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}</span>
                    </div>
                    {completion && (
                      <div className="flex items-center gap-2 p-2 bg-green-50/50 rounded-lg border border-green-50">
                        <MapPin size={14} className="text-green-500 flex-shrink-0" />
                        <span className="truncate text-green-700">Cleaned at: {completion.supervisor_latitude?.toFixed(4)}, {completion.supervisor_longitude?.toFixed(4)}</span>
                      </div>
                    )}
                  </div>

                  {completion?.distance_meters !== undefined && (
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-400 uppercase">Verification</span>
                      <span className="text-[11px] font-bold text-green-600">
                        {Number(completion.distance_meters).toFixed(1)}m accuracy
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
