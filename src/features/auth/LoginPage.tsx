import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { 
  Lock, 
  Mail, 
  ShieldAlert, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@sheride.app');
  const [password, setPassword] = useState('admin@sheride.app');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [justFilled, setJustFilled] = useState(false);

  const { login, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Subtle interactive parallax / ambient glow tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    setMousePosition({
      x: (clientX / innerWidth - 0.5) * 30,
      y: (clientY / innerHeight - 0.5) * 30,
    });
  };

  const handleQuickFill = () => {
    setEmail('admin@sheride.app');
    setPassword('admin@sheride.app');
    clearError();
    setJustFilled(true);
    setTimeout(() => setJustFilled(false), 1800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      // Handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#F6F6FE] relative flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-purple-100 selection:text-purple-900 overflow-hidden"
    >
      {/* Dynamic Interactive Ambient Brand Glow Elements */}
      <div 
        className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-purple-500/15 rounded-full blur-3xl pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 1.5}px, ${mousePosition.y * 1.5}px)`,
        }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-amber-400/15 rounded-full blur-3xl pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${-mousePosition.x * 1.2}px, ${-mousePosition.y * 1.2}px)`,
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-white rounded-3xl shadow-xl shadow-purple-500/10 border border-purple-100/80 mb-5 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 group cursor-default">
            <img 
              src="/bannerlog.png" 
              alt="Lady Pilot" 
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#180D2B] tracking-tight font-serif">
            Admin Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium max-w-xs mx-auto leading-relaxed">
            100% Female Verified Fleet, Live Dispatch & Operations Console
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-7 sm:p-8 shadow-2xl shadow-purple-900/5 border border-purple-100/90 hover:border-purple-200 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-rose-50/90 border border-rose-200/90 rounded-2xl flex items-start gap-3 text-rose-800 text-xs font-medium animate-shake shadow-sm">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            <Input
              label="Admin Email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) clearError();
              }}
              placeholder="admin@sheride.app"
              leftIcon={<Mail className="w-4 h-4 text-slate-400 group-focus-within:text-primary" />}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-700 transition-colors"
                >
                  {justFilled ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Filled!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Quick Demo Fill</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-11 py-2.5 transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 focus:outline-none rounded-lg transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Security Status */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary-500/20 border-slate-300 cursor-pointer accent-primary"
                />
                <span className="font-medium">Remember credentials</span>
              </label>

              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                SSL Secured
              </span>
            </div>

            <Button
              type="submit"
              variant="golden"
              size="lg"
              className="w-full font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 mt-2 text-[#180D2B]"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
            >
              Sign In to Command Center
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-400 font-medium">
          Lady Pilot Real-Time Fleet Platform • Secured with Firebase Auth & RTDB
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
