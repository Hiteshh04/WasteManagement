import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { User, Lock, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const schema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
}).required();

type FormData = yup.InferType<typeof schema>;

export default function SupervisorLogin() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const response = await authService.supervisorLogin(data.username, data.password);
      login(response.supervisor, response.token);
      toast.success('Successfully logged in!');
      navigate('/supervisor/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">
          <Shield size={12} /> Supervisor Access
        </div>
        <h3 className="text-xl font-bold text-gray-900">Welcome Back</h3>
        <p className="text-sm text-gray-500 mt-1">Sign in to manage the campus ecosystem</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Username</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-slate-800 transition-colors">
              <User size={18} />
            </div>
            <input 
              type="text" 
              {...register('username')}
              placeholder="Enter your username"
              className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border ${errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-100 focus:ring-slate-800'} rounded-2xl text-sm transition-all focus:bg-white focus:ring-2 focus:ring-offset-0 outline-none`} 
            />
          </div>
          {errors.username && <p className="mt-1 text-xs text-red-600 font-medium ml-1">{errors.username.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-slate-800 transition-colors">
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              {...register('password')}
              placeholder="••••••••"
              className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-100 focus:ring-slate-800'} rounded-2xl text-sm transition-all focus:bg-white focus:ring-2 focus:ring-offset-0 outline-none`} 
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600 font-medium ml-1">{errors.password.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all shadow-lg shadow-slate-100 disabled:bg-gray-200 disabled:shadow-none"
        >
          {loading ? 'Authenticating...' : (
            <>Sign In <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <div className="pt-2">
        <Link 
          to="/student/login" 
          className="flex items-center justify-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
        >
          Student Login Portal <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
