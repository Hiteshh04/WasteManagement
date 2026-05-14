import { Outlet } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import Footer from './Footer';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between pt-12">
      {/* Centered Content Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#16a34a] flex items-center justify-center shadow-lg shadow-green-100 mb-4">
              <Leaf size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              EcoCampus
            </h2>
            <p className="mt-1 text-sm text-gray-500 font-medium">
              University Waste Management Platform
            </p>
          </div>

          {/* Content Card */}
          <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-xl shadow-slate-100 border border-gray-100">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Full Width Footer Section */}
      <div className="w-full mt-12">
        <Footer />
      </div>
    </div>
  );
}
