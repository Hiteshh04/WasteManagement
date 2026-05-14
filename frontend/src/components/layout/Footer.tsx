import { Leaf, Globe, Code, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Leaf size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">EcoCampus</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-xs">
              Smart waste tracking for sustainable university campuses. Join the movement for a greener future.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4 opacity-50">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/student/dashboard" className="text-xs hover:text-green-400 transition-colors">Dashboard</Link></li>
              <li><Link to="/student/my-reports" className="text-xs hover:text-green-400 transition-colors">My Impact</Link></li>
              <li><Link to="/student/report-waste" className="text-xs hover:text-green-400 transition-colors">Report Waste</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4 opacity-50">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-xs hover:text-green-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-xs hover:text-green-400 transition-colors">Terms of Use</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-4 opacity-50">Connect</h4>
            <div className="flex items-center gap-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50">
                <Code size={16} />
              </a>
              <a href="https://ecocampus.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50">
                <Globe size={16} />
              </a>
              <a href="mailto:hiteshparida614@gmail.com" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700/50">
                <Mail size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-medium text-slate-500">
            © {currentYear} EcoCampus Initiative. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Status: Active</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
