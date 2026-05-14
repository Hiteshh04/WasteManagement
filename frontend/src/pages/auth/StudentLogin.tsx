import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import axios from 'axios';

export default function StudentLogin() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (tokenResponse: any) => {
    console.log('Google Login Success:', tokenResponse);
    try {
      setLoading(true);
      // Fetch user profile info from Google
      console.log('Fetching user info with token:', tokenResponse.access_token);
      const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      
      const { name, given_name, family_name, email, picture } = userInfo.data;
      const fullName = name || `${given_name} ${family_name}`.trim();
      console.log('User info fetched:', { fullName, email });

      // Send to backend
      const response = await authService.studentGoogleLogin(tokenResponse.access_token, fullName, email);
      console.log('Backend login response:', response);
      
      // Update context and local storage — include Google profile photo
      login({ ...response.user, picture }, response.token);
      
      toast.success('Successfully logged in!');
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Google Auth detailed error:', err);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (error) => {
      console.error('Google Login Error:', error);
      toast.error('Google Login Failed');
    },
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-600 text-[10px] font-bold uppercase tracking-widest mb-4">
          👋 Student Access
        </div>
        <h3 className="text-xl font-bold text-gray-900">Welcome to EcoCampus</h3>
        <p className="text-sm text-gray-500 mt-1">Sign in with your university account to start reporting</p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => loginWithGoogle()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          {loading ? 'Connecting...' : 'Sign in with Google'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-medium">Or restricted access</span>
          </div>
        </div>

        <button 
          disabled
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-400 cursor-not-allowed"
        >
          University ID Login <LogIn size={14} />
        </button>
      </div>

      <div className="pt-4 text-center">
        <Link 
          to="/supervisor/login" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
        >
          Staff & Supervisor Login <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
