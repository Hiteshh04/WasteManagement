import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Camera, MapPin, AlertCircle, CheckCircle2, ChevronLeft, Map as MapIcon, Info } from 'lucide-react';
import { reportService } from '../../services/reportService';
import CameraCapture from '../../components/camera/CameraCapture';
import useGeolocation from '../../hooks/useGeolocation';

export default function CompleteRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { latitude, longitude, error: locationError, loading: locationLoading, getLocation } = useGeolocation();
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [imageStr, setImageStr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        if (!id) return;
        const data = await reportService.getReport(id);
        setReport(data.report);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load report details');
        navigate('/supervisor/pending');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
    getLocation(); // Also get location
  }, [id, navigate, getLocation]);

  const onCapture = (base64Str: string) => {
    setImageStr(base64Str);
    setShowCamera(false);
  };

  const validateAndComplete = async () => {
    if (!id || !imageStr || !latitude || !longitude) return;

    try {
      setSubmitting(true);
      await reportService.completeReport(id, {
        image: imageStr,
        latitude,
        longitude
      });

      toast.success('Report successfully marked as completed!');
      navigate('/supervisor/completed');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403 || err.response?.data?.message?.includes('distance')) {
        toast.error(err.response.data.message || 'You are too far from the reported location.');
      } else {
        toast.error('Failed to complete report. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Fetching report details...</p>
      </div>
    );
  }

  if (!report) return null;

  if (showCamera) {
    return <CameraCapture onCapture={onCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/supervisor/pending')}
          className="p-2 rounded-xl bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Finalize Cleanup</h2>
          <p className="text-sm text-gray-500">Provide proof of cleanup to resolve this report.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Report Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center gap-2">
              <Info size={16} className="text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Original Report</span>
            </div>
            <img src={report.image_url} alt="Waste" className="w-full h-48 object-cover" />
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 capitalize">{report.waste_type} Waste</h3>
                <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  report.severity === 'high' ? 'bg-red-50 text-red-600' :
                  report.severity === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {report.severity} Severity
                </span>
              </div>

              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <p>Lat: {report.latitude?.toFixed(4)}<br/>Lng: {report.longitude?.toFixed(4)}</p>
                </div>
                {report.note && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 italic text-gray-600 text-xs leading-relaxed">
                    "{report.note}"
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex gap-3">
              <MapIcon size={20} className="text-blue-500 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-blue-900 leading-tight">Proximity Check</h4>
                <p className="text-xs text-blue-700 mt-1">You must be at the physical site to mark this as complete. Verification is handled via GPS.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 space-y-8">
            {/* Step 1: GPS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">1</div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">GPS Verification</h3>
              </div>
              
              <div className={`p-4 rounded-2xl border transition-colors ${
                locationLoading ? 'bg-gray-50 border-gray-100' : 
                locationError ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
              }`}>
                {locationLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-500">Acquiring satellite signal...</span>
                  </div>
                ) : locationError ? (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-red-500" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-red-700 font-medium">{locationError}</p>
                      <button type="button" onClick={getLocation} className="text-xs text-red-600 font-bold hover:underline mt-0.5">Try Again</button>
                    </div>
                  </div>
                ) : latitude && longitude ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCircle2 className="text-green-500" size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 tracking-tight">Signal Locked</p>
                        <p className="text-xs text-slate-500">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
                      </div>
                    </div>
                    <button type="button" onClick={getLocation} className="text-xs font-bold text-slate-400 hover:text-slate-600">Refresh</button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Step 2: Photo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">2</div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Proof of Cleanup</h3>
              </div>

              {imageStr ? (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 group">
                  <img src={imageStr} alt="Cleaned area" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="px-6 py-2 bg-white text-slate-800 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                    >
                      Retake Photo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="w-full h-64 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-slate-800 hover:text-slate-800 transition-all bg-slate-50 group"
                >
                  <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera size={32} />
                  </div>
                  <span className="font-bold">Capture Cleaned Area</span>
                  <span className="text-xs mt-1">Take a photo of the resolved site</span>
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={validateAndComplete}
              disabled={submitting || !imageStr || !latitude}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg shadow-slate-200 transition-all ${
                submitting || !imageStr || !latitude 
                ? 'bg-gray-200 cursor-not-allowed shadow-none' 
                : 'bg-slate-800 hover:bg-slate-900 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Evidence...</span>
                </div>
              ) : 'Submit Final Resolution'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
