// FILE: src/components/LoginPage.tsx

import { LogIn, Sparkles, Loader2, Lock, Zap, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export const LoginPage = () => {
  const { signInWithLinkedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithLinkedIn();
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float-slow"
          style={{
            transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`
          }}
        />
        <div 
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float-delayed"
          style={{
            transform: `translate(${-mousePosition.x * 2}px, ${-mousePosition.y * 2}px)`
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]" />

      {/* Main content card */}
      <div 
        className="relative max-w-5xl w-full z-10"
        style={{
          transform: `perspective(1000px) rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`
        }}
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden md:block space-y-8 animate-fade-in-left">
            {/* Logo with 3D effect */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
              <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 transform-gpu transition-all duration-500 hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-md opacity-60" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">LinkedIn Studio</h1>
                    <p className="text-sm text-white/40 font-medium">Enterprise Grade</p>
                  </div>
                </div>
                
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  Professional automation platform for content creation and distribution across LinkedIn networks.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="text-2xl font-bold text-white mb-1">99.9%</div>
                    <div className="text-xs text-white/40">Uptime</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="text-2xl font-bold text-white mb-1">10k+</div>
                    <div className="text-xs text-white/40">Posts</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="text-2xl font-bold text-white mb-1">24/7</div>
                    <div className="text-xs text-white/40">Support</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 pl-2">
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Enterprise Security</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>OAuth 2.0</span>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="animate-fade-in-right">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              
              {/* Card */}
              <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 mb-6">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-xs text-blue-400 font-medium">Secure Authentication</span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-white/50 text-sm">
                    Sign in to access your automation dashboard
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <FeatureItem
                    icon={Zap}
                    title="AI-Powered Automation"
                    description="Intelligent content generation with advanced algorithms"
                    delay="0s"
                  />
                  <FeatureItem
                    icon={TrendingUp}
                    title="Real-Time Analytics"
                    description="Monitor performance metrics and engagement data"
                    delay="0.1s"
                  />
                  <FeatureItem
                    icon={Lock}
                    title="Enterprise Security"
                    description="Bank-level encryption and data protection"
                    delay="0.2s"
                  />
                </div>

                {/* Login button */}
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="relative w-full group/btn overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl opacity-100 group-hover/btn:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl opacity-0 group-hover/btn:opacity-100 blur-xl transition-all duration-500" />
                  
                  <div className="relative flex items-center justify-center gap-3 py-4 px-6 text-white font-semibold">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                        <span>Sign in with LinkedIn</span>
                      </>
                    )}
                  </div>
                </button>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-center text-xs text-white/30 leading-relaxed">
                    Protected by industry-standard OAuth 2.0 authentication.<br />
                    Your credentials are never stored on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile logo */}
            <div className="md:hidden mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-white/40 text-sm">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span>LinkedIn Studio</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Feature item component with smooth animations
const FeatureItem = ({ 
  icon: Icon, 
  title, 
  description, 
  delay 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  delay: string;
}) => (
  <div 
    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group/item animate-fade-in-up"
    style={{ animationDelay: delay }}
  >
    <div className="relative flex-shrink-0 mt-0.5">
      <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-md opacity-0 group-hover/item:opacity-100 transition-opacity" />
      <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center group-hover/item:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-blue-400" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-semibold text-white mb-0.5">{title}</h3>
      <p className="text-xs text-white/40 leading-relaxed">{description}</p>
    </div>
  </div>
);