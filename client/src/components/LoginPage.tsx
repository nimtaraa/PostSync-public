// FILE: src/components/LoginPage.tsx

import { LogIn, Loader2, Shield, Zap, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export const LoginPage = () => {
  const { signInWithLinkedIn } = useAuth();
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-[#0a0a0b] relative flex items-center justify-center p-4">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <div className="relative max-w-md w-full">
        {/* Main card */}
        <div className="bg-[#0d0d0f] border border-white/10 rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </div>
            
            <h1 className="text-2xl font-semibold text-white mb-2">
              LinkedIn Automation
            </h1>
            <p className="text-sm text-white/50">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Features - Simple and clean */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Automated Content</p>
                <p className="text-xs text-white/40 mt-0.5">AI-powered post generation</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Real-Time Analytics</p>
                <p className="text-xs text-white/40 mt-0.5">Track performance metrics</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Secure Platform</p>
                <p className="text-xs text-white/40 mt-0.5">OAuth 2.0 authentication</p>
              </div>
            </div>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium py-3.5 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign in with LinkedIn</span>
              </>
            )}
          </button>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-center text-xs text-white/30">
              Secure OAuth 2.0 authentication • Your data is protected
            </p>
          </div>
        </div>

        {/* Bottom branding */}
        <div className="text-center mt-6">
          <p className="text-xs text-white/30">
            LinkedIn Automation Studio v1.0
          </p>
        </div>
      </div>
    </div>
  );
};