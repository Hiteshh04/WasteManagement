import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { LogOut, User, ChevronDown, Mail, Shield } from 'lucide-react';

interface ProfileDropdownProps {
  isSupervisor?: boolean;
}

export default function ProfileDropdown({ isSupervisor = false }: ProfileDropdownProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authService.logout(isSupervisor);
    logout();
    navigate(isSupervisor ? '/supervisor/login' : '/');
  };

  // Generate avatar initials
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // Google avatar URL — students log in with Google so they usually have a picture
  // We store the google token as google_id, not a photo URL, so we use initials instead
  const avatarBg = isSupervisor
    ? 'from-blue-500 to-indigo-600'
    : 'from-green-500 to-emerald-600';

  return (
    <div className="relative" ref={ref}>
      {/* Avatar trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-full pr-2 pl-1 py-1 hover:bg-white/10 transition-colors focus:outline-none"
      >
        {/* Avatar circle - show Google photo or initials */}
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover shadow-md ring-2 ring-white/30"
          />
        ) : (
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarBg} flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white/30`}>
            {initials}
          </div>
        )}
        <span className={`text-sm font-medium hidden sm:block ${isSupervisor ? 'text-gray-200' : 'text-gray-700'}`}>
          {user?.name?.split(' ')[0] || 'Profile'}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isSupervisor ? 'text-gray-300' : 'text-gray-500'}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
          {/* Header gradient banner */}
          <div className={`h-16 bg-gradient-to-r ${avatarBg}`} />

          {/* Avatar overlapping the banner */}
          <div className="px-5 pb-4 -mt-8">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-4 ring-white mb-3"
              />
            ) : (
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarBg} flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white mb-3`}>
                {initials}
              </div>
            )}

            {/* Name & Role badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-gray-900 font-bold text-lg leading-tight">{user?.name || 'User'}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                isSupervisor
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                <Shield size={10} />
                {isSupervisor ? 'Supervisor' : 'Student'}
              </span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Mail size={13} className="flex-shrink-0" />
              <span className="truncate">{user?.email || 'No email'}</span>
            </div>

            {/* Username for supervisor */}
            {isSupervisor && (user as any)?.username && (
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <User size={13} className="flex-shrink-0" />
                <span>@{(user as any).username}</span>
              </div>
            )}

            {/* Divider */}
            <div className="my-3 border-t border-gray-100" />

            {/* Stats row */}
            <div className={`flex rounded-xl overflow-hidden border ${isSupervisor ? 'border-blue-100 bg-blue-50' : 'border-green-100 bg-green-50'} mb-3`}>
              <div className="flex-1 py-2 text-center">
                <p className={`text-lg font-bold ${isSupervisor ? 'text-blue-700' : 'text-green-700'}`}>
                  {isSupervisor ? '🏢' : '🌿'}
                </p>
                <p className="text-xs text-gray-500">{isSupervisor ? 'Supervisor' : 'Eco Warrior'}</p>
              </div>
              <div className={`w-px ${isSupervisor ? 'bg-blue-100' : 'bg-green-100'}`} />
              <div className="flex-1 py-2 text-center">
                <p className={`text-lg font-bold ${isSupervisor ? 'text-blue-700' : 'text-green-700'}`}>
                  {isSupervisor ? '🛡️' : '📍'}
                </p>
                <p className="text-xs text-gray-500">{isSupervisor ? 'Active' : 'Reporter'}</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
