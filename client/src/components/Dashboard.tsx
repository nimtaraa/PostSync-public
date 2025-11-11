// FILE: src/components/Dashboard.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCronJobStatus } from '../hooks/useCronJobStatus';
import { useAgentStart } from '../hooks/useAgentStart';
import { JobStatusCard } from './JobStatusCard';
import {
  LogOut,
  TrendingUp,
  Activity,
  CheckCircle2,
  Loader2,
  PlayCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Zap,
  Sparkles,
  Radio,
  Database,
  Send,
} from 'lucide-react';
import React from 'react';

interface Post {
  _id: string;
  user_email: string;
  niche: string;
  topic: string;
  posted_date: string;
}

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { jobs, loading, error } = useCronJobStatus(user?.id || null);
  const { startAgent, starting, startError, startMessage } = useAgentStart();
  const [userPostCount, setUserPostCount] = useState(0);
  const [niche, setNiche] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const completedJobs = jobs.filter((job) => job.status === 'completed').length;
  const runningJobs = jobs.filter((job) => job.status === 'running').length;
  const failedJobs = jobs.filter((job) => job.status === 'failed').length;
  const successRate = jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0;

  const executionSteps = [
  { label: 'Initializing Agent', icon: Activity, description: 'Setting up execution environment' },
  { label: 'Analyzing Niche', icon: Database, description: 'Processing target parameters' },
  { label: 'Generating Content', icon: Zap, description: 'AI content synthesis in progress' },
  { label: 'Optimizing Post', icon: CheckCircle2, description: 'Applying optimization algorithms' },
  { label: 'Scheduling Upload', icon: Clock, description: 'Configuring delivery schedule' },
  { label: 'Finalizing', icon: Send, description: 'Completing execution sequence' },
];

  // Pulse animation for running jobs
  useEffect(() => {
    if (runningJobs > 0) {
      const interval = setInterval(() => {
        setPulseScale(prev => prev === 1 ? 1.1 : 1);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [runningJobs]);

  // Execution animation sequence
  useEffect(() => {
    if (starting && showExecutionModal) {
      setExecutionStep(0);
      setExecutionProgress(0);
      
      const stepDuration = 1500; // 1.5 seconds per step
      const progressInterval = setInterval(() => {
        setExecutionProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 2;
        });
      }, 30);

      const stepInterval = setInterval(() => {
        setExecutionStep(prev => {
          if (prev >= executionSteps.length - 1) {
            clearInterval(stepInterval);
            clearInterval(progressInterval);
            setTimeout(() => {
              setShowExecutionModal(false);
              setExecutionStep(0);
              setExecutionProgress(0);
            }, 2000);
            return prev;
          }
          return prev + 1;
        });
      }, stepDuration);

      return () => {
        clearInterval(stepInterval);
        clearInterval(progressInterval);
      };
    }
  }, [starting, showExecutionModal, executionSteps.length]);

  const handleStartAgentClick = () => {
    if (!user || !user.accessToken) {
      alert("Error: You are not logged in or your token is missing.");
      return;
    }
    if (!niche.trim()) {
      alert("Please enter a niche for the agent.");
      return;
    }
    setShowExecutionModal(true);
    startAgent(niche, user.accessToken);
  };

  // Fetch user's post count
  useEffect(() => {
    const fetchUserPostCount = async () => {
      if (user?.email) {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/agent/user/post-count/${encodeURIComponent(user.email)}`);
          const data = await response.json();
          setUserPostCount(data.count);
        } catch (error) {
          console.error('Failed to fetch user post count:', error);
        }
      }
    };

    fetchUserPostCount();
  }, [user?.email]);

  // Fetch user's posts
useEffect(() => {
  if (!user || !user.email) return; // 🚫 Don't run until user is ready

  const fetchUserPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/agent/user-posts/${encodeURIComponent(user.email)}`
      );
      const data = await response.json();
      setUserPosts(data.posts);
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  fetchUserPosts();
}, [user]);


  return (
    <div className="min-h-screen bg-[#0a0a0b] relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />
      
      {/* Navbar */}
      <nav className="relative border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-semibold text-white tracking-tight">LinkedIn Studio</h1>
                <p className="text-[10px] text-white/40 font-medium flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  Live Production
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 hover:bg-white/[0.07] transition-all group">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-white/60 font-medium group-hover:text-white/80 transition-colors">{user?.email}</span>
              </div>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 rounded-lg transition-all text-sm font-medium border border-white/5 group"
              >
                <LogOut className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-6">
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-white/40" />
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Analytics Dashboard</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-1 tracking-tight">Automation Control</h2>
            <p className="text-sm text-white/50">Real-time monitoring and intelligent execution</p>
          </div>

          {/* Interactive Control Panel */}
          <div className="relative">
            {/* Animated rings around control panel */}
            {isInputFocused && (
              <>
                <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/30 animate-ping-slow" />
                <div className="absolute inset-0 rounded-2xl border border-blue-500/20 animate-pulse" />
              </>
            )}
            
            <div className="relative bg-white/[0.02] border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/40 font-medium flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    Target Niche
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="e.g., Artificial Intelligence"
                    className="w-64 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:bg-white/[0.07] focus:border-blue-500/50 focus:outline-none transition-all focus:scale-[1.02]"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleStartAgentClick}
                    disabled={starting}
                    className="relative inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-blue-600/50 disabled:to-cyan-600/50 text-white rounded-lg transition-all text-sm font-semibold shadow-lg shadow-blue-600/20 disabled:cursor-not-allowed group overflow-hidden transform hover:scale-105 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    {starting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Initializing</span>
                        <div className="absolute inset-0 animate-pulse bg-blue-400/20 rounded-lg" />
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Execute Agent</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {(startMessage || startError) && (
          <div className={`mb-6 p-4 rounded-lg border backdrop-blur-sm animate-slide-down ${
            startError
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="w-4 h-4 animate-bounce-subtle" />
              {startError ? startError : startMessage}
            </div>
          </div>
        )}

        {/* Metrics Grid with Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {/* Total Jobs */}
          <div className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:bg-white/[0.04] transition-all hover:scale-105 hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-white/5 rounded-lg group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5 text-white/60 group-hover:text-white/80 transition-colors" />
                </div>
                <span className="text-3xl font-bold text-white tracking-tight group-hover:scale-110 transition-transform">{jobs.length}</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Total Executions</p>
                <p className="text-xs text-white/30">All time</p>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:bg-white/[0.04] transition-all hover:scale-105 hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="relative p-2.5 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div className="absolute inset-0 rounded-lg bg-emerald-400/20 animate-ping-slow opacity-0 group-hover:opacity-100" />
                </div>
                <span className="text-3xl font-bold text-white tracking-tight group-hover:scale-110 transition-transform">{userPostCount}</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Posts Created</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-1000 ease-out" style={{width: '100%'}} />
                  </div>
                  <span className="text-xs text-emerald-400/60 font-semibold">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Running with animated rings */}
          <div className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:bg-white/[0.04] transition-all hover:scale-105 hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {runningJobs > 0 && (
              <>
                <div className="absolute inset-0 rounded-xl border-2 border-blue-500/20 animate-ping-slow" />
                <div className="absolute inset-0 rounded-xl border border-blue-500/30 animate-pulse" />
              </>
            )}
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="relative p-2.5 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform" style={{transform: `scale(${pulseScale})`, transition: 'transform 1.5s ease-in-out'}}>
                  <Clock className="w-5 h-5 text-blue-400" />
                  {runningJobs > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-3xl font-bold text-white tracking-tight group-hover:scale-110 transition-transform">{runningJobs}</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-white/40 uppercase tracking-wide">In Progress</p>
                <div className="flex items-center gap-1.5">
                  {runningJobs > 0 ? (
                    <>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" style={{animationDelay: '0s'}} />
                        <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" style={{animationDelay: '0.2s'}} />
                        <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" style={{animationDelay: '0.4s'}} />
                      </div>
                      <span className="text-xs text-blue-400/60">Active</span>
                    </>
                  ) : (
                    <span className="text-xs text-white/30">Idle</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:bg-white/[0.04] transition-all hover:scale-105 hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-purple-400 group-hover:translate-y-[-2px] transition-transform" />
                </div>
                <span className="text-3xl font-bold text-white tracking-tight group-hover:scale-110 transition-transform">{successRate}%</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Success Rate</p>
                <p className="text-xs text-white/30">{failedJobs} failed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <h3 className="text-lg font-semibold text-white mb-0.5">Execution History</h3>
              <p className="text-xs text-white/40">Recent posts and automation status</p>
            </div>
            {userPosts.length > 0 && (
              <span className="text-xs text-white/30 font-medium px-3 py-1 bg-white/5 rounded-full border border-white/5">
                {userPosts.length} posts
              </span>
            )}
          </div>

          {loadingPosts ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] border border-white/5 rounded-xl">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-2 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin-slow" />
                <div className="absolute inset-0 animate-ping">
                  <div className="w-16 h-16 border border-blue-500/20 rounded-full" />
                </div>
              </div>
              <p className="text-sm text-white/60 font-medium">Loading execution data...</p>
              <p className="text-xs text-white/30 mt-1">Please wait</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 animate-shake">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="text-sm font-semibold text-red-400 mb-1">Failed to load data</p>
                  <p className="text-xs text-red-400/70">{error}</p>
                </div>
              </div>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-xl p-12 text-center animate-fade-in">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-white/5 rounded-2xl animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-10 h-10 text-white/20" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-white/80 mb-1">No posts yet</h3>
              <p className="text-sm text-white/40">Start your first post to see history here</p>
            </div>
          ) : (
            <div className="space-y-3">
  {userPosts.map((post, index) => (
    <div
      key={post._id}
      className="group relative bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Header row: Niche + Date */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white tracking-wide">
            {post.niche}
          </span>
          <span className="text-xs text-white/50">
            {new Date(post.posted_date).toLocaleDateString()}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-white/80 leading-relaxed">
          {post.topic}
        </p>
      </div>
    </div>
  ))}
</div>
          )}
        </div>
      </div>

      {/* Super Animated Execution Modal */}
      {/* Professional Execution Modal */}
{showExecutionModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
    {/* Subtle grid background */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px]" />
    
    <div className="relative max-w-2xl w-full mx-6">
      {/* Main card */}
      <div className="relative bg-[#0d0d0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Subtle top border accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        {/* Header section */}
        <div className="px-8 pt-8 pb-6 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                    {React.createElement(executionSteps[executionStep].icon || Activity, { className: "w-5 h-5 text-blue-400" })}
                  </div>
                  {!(executionStep === executionSteps.length - 1 && executionProgress >= 100) && (
                    <div className="absolute -inset-1 rounded-lg border border-blue-500/30 animate-ping-slow" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">
                    {executionSteps[executionStep].label}
                  </h3>
                  <p className="text-sm text-white/40 mt-0.5">
                    {executionSteps[executionStep].description}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-medium text-white/60">Processing</span>
            </div>
          </div>
        </div>

        {/* Progress section */}
        <div className="px-8 py-6">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white/60">Execution Progress</span>
              <span className="text-sm font-semibold text-white tabular-nums">{Math.min(Math.round(executionProgress), 100)}%</span>
            </div>
            <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(executionProgress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-fast" />
              </div>
            </div>
          </div>

          {/* Steps timeline */}
          <div className="space-y-3">
            {executionSteps.map((step, index) => {
              const StepIcon = step.icon || Activity;
              const isCurrentStep = index === executionStep;
              const isPastStep = index < executionStep;

              return (
                <div 
                  key={index}
                  className={`flex items-center gap-4 transition-all duration-300 ${
                    isCurrentStep ? 'opacity-100' : isPastStep ? 'opacity-60' : 'opacity-30'
                  }`}
                >
                  {/* Step indicator */}
                  <div className="relative flex-shrink-0">
                    {isPastStep ? (
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      </div>
                    ) : isCurrentStep ? (
                      <div className="relative w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                        <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping-slow" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <StepIcon className="w-3.5 h-3.5 text-white/30" />
                      </div>
                    )}
                    
                    {/* Connection line */}
                    {index < executionSteps.length - 1 && (
                      <div className="absolute top-8 left-1/2 w-[1px] h-5 -translate-x-1/2">
                        <div className={`w-full h-full ${isPastStep ? 'bg-blue-500/30' : 'bg-white/10'}`} />
                      </div>
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium transition-colors ${
                        isCurrentStep ? 'text-white' : isPastStep ? 'text-white/60' : 'text-white/40'
                      }`}>
                        {step.label}
                      </span>
                      {isCurrentStep && (
                        <div className="flex gap-0.5">
                          {[0, 1, 2].map((i) => (
                            <div 
                              key={i}
                              className="w-1 h-1 rounded-full bg-blue-400 animate-pulse"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer section */}
        <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">Target: <span className="text-white/60 font-medium">{niche}</span></span>
            <span className="text-white/40">Estimated time: <span className="text-white/60 font-medium">~15s</span></span>
          </div>
        </div>

        {/* Success overlay */}
        {executionStep === executionSteps.length - 1 && executionProgress >= 100 && (
          <div className="absolute inset-0 bg-[#0d0d0f]/95 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping-slow" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-1">Execution Complete</h4>
              <p className="text-sm text-white/50">Agent successfully deployed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
};