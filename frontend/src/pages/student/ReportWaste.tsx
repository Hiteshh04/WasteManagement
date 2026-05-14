import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { Camera, MapPin, AlertCircle, Info, Wind } from 'lucide-react';
import CameraCapture from '../../components/camera/CameraCapture';
import useGeolocation from '../../hooks/useGeolocation';
import { reportService } from '../../services/reportService';

const schema = yup.object({
  waste_type: yup.string().required('Waste type is required'),
  smell: yup.boolean().required(),
  severity: yup.string().required('Severity is required'),
  note: yup.string().max(500, 'Note must be less than 500 characters'),
}).required();

type FormData = {
  waste_type: string;
  smell: boolean;
  severity: string;
  note?: string;
};

export default function ReportWaste() {
  const navigate = useNavigate();
  const { latitude, longitude, error: locationError, loading: locationLoading, getLocation } = useGeolocation();
  const [showCamera, setShowCamera] = useState(false);
  const [imageStr, setImageStr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      smell: false,
      severity: 'medium'
    }
  });

  const selectedSeverity = watch('severity');

  // Get location automatically when component mounts
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const onCapture = (base64Str: string) => {
    setImageStr(base64Str);
    setShowCamera(false);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!imageStr) {
      toast.error('Please capture an image of the waste first.');
      return;
    }

    if (!latitude || !longitude) {
      toast.error('Location is required. Please ensure location permissions are granted.');
      return;
    }

    try {
      setSubmitting(true);
      await reportService.createReport({
        image: imageStr,
        latitude,
        longitude,
        waste_type: data.waste_type,
        smell: data.smell,
        severity: data.severity,
        note: data.note || ''
      });
      
      toast.success('Waste report submitted successfully!');
      navigate('/student/my-reports');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500 border-green-200 bg-green-50';
      case 'medium': return 'text-blue-500 border-blue-200 bg-blue-50';
      case 'high':
      case 'critical': return 'text-red-500 border-red-200 bg-red-50';
      default: return 'text-gray-500 border-gray-200 bg-gray-50';
    }
  };

  if (showCamera) {
    return <CameraCapture onCapture={onCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Report Waste</h2>
        <p className="text-gray-500 font-medium">Help us keep the campus clean by reporting waste accumulation.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Visuals & Location */}
        <div className="space-y-6">
          {/* Image Capture Section */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Evidence Image</label>
              <Info size={14} className="text-gray-300" />
            </div>
            {imageStr ? (
              <div className="relative rounded-2xl overflow-hidden group">
                <img src={imageStr} alt="Captured waste" className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="px-6 py-2.5 bg-white text-gray-900 font-bold rounded-xl shadow-xl transform transition hover:scale-105 active:scale-95"
                  >
                    Retake Photo
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="w-full h-64 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-600 transition-all bg-gray-50/50 hover:bg-green-50/30 group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:shadow-green-100 group-hover:scale-110 transition-all">
                  <Camera size={28} />
                </div>
                <span className="font-bold text-sm">Capture Waste Image</span>
                <span className="text-xs mt-1 opacity-60">Required for verification</span>
              </button>
            )}
          </div>

          {/* Location Section */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Detection Location</label>
              <MapPin size={14} className={latitude ? 'text-green-500' : 'text-gray-300'} />
            </div>
            
            <div className={`p-4 rounded-2xl border transition-all ${latitude ? 'bg-green-50/30 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
              {locationLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent" />
                  <p className="text-sm text-gray-500 font-medium">Fetching GPS Coordinates...</p>
                </div>
              ) : locationError ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-600 font-medium">{locationError}</p>
                  <button type="button" onClick={getLocation} className="text-xs font-bold text-blue-600 hover:underline underline-offset-4">RETRY FETCH</button>
                </div>
              ) : latitude && longitude ? (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900">Coordinates Locked</p>
                    <p className="text-xs text-gray-500 font-mono">Lat: {latitude.toFixed(6)} • Lng: {longitude.toFixed(6)}</p>
                  </div>
                  <button type="button" onClick={getLocation} className="p-2 bg-white rounded-lg shadow-sm text-blue-600 hover:bg-blue-50 transition-colors">
                    <MapPin size={16} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={getLocation} className="text-sm font-bold text-blue-600 hover:underline">Enable Location Access</button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
            {/* Waste Type */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider block">Waste Category</label>
              <select 
                {...register('waste_type')} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
              >
                <option value="">Select Category</option>
                <option value="plastic">Plastic</option>
                <option value="organic">Organic/Food</option>
                <option value="paper">Paper/Cardboard</option>
                <option value="glass">Glass</option>
                <option value="hazardous">Hazardous (Chemicals, Bio)</option>
                <option value="mixed">Mixed Waste</option>
                <option value="other">Other</option>
              </select>
              {errors.waste_type && <p className="text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {errors.waste_type.message}</p>}
            </div>

            {/* Severity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Severity Level</label>
                <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${getSeverityColor(selectedSeverity)}`}>
                  {selectedSeverity} Impact
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'low', label: 'Low', color: 'peer-checked:bg-green-500 peer-checked:text-white text-green-600 bg-green-50 border-green-100' },
                  { value: 'medium', label: 'Medium', color: 'peer-checked:bg-blue-500 peer-checked:text-white text-blue-600 bg-blue-50 border-blue-100' },
                  { value: 'high', label: 'High', color: 'peer-checked:bg-red-500 peer-checked:text-white text-red-600 bg-red-50 border-red-100' },
                  { value: 'critical', label: 'Critical', color: 'peer-checked:bg-red-700 peer-checked:text-white text-red-700 bg-red-50 border-red-200' },
                ].map((opt) => (
                  <label key={opt.value} className="relative cursor-pointer group">
                    <input type="radio" value={opt.value} {...register('severity')} className="sr-only peer" />
                    <div className={`py-3 px-4 rounded-xl border-2 text-center text-xs font-bold transition-all duration-200 transform peer-checked:scale-[1.02] peer-checked:shadow-lg ${opt.color} border-transparent`}>
                      {opt.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Smell */}
            <label className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer group transition-all hover:bg-white hover:border-orange-200">
              <input type="checkbox" {...register('smell')} className="w-5 h-5 rounded-lg text-orange-500 focus:ring-orange-400 border-gray-200 peer" />
              <div className="flex items-center gap-2">
                <Wind size={18} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                <span className="text-sm font-bold text-gray-700">Foul smell present at location</span>
              </div>
            </label>

            {/* Notes */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider block">Additional Details</label>
              <textarea
                {...register('note')}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all font-medium text-gray-900 resize-none"
                placeholder="Describe the exact location or type of waste..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !imageStr || !latitude}
              className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-green-200 hover:bg-green-700 transform transition active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
            >
              {submitting ? 'Finalizing Submission...' : 'Submit Waste Report'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
