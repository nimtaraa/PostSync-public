// FILE: src/components/Dashboard.tsx

import { useState } from 'react';
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
} from 'lucide-react';

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { jobs, loading, error } = useCronJobStatus(user?.id || null);
  const { startAgent, starting, startError, startMessage } = useAgentStart();
  
  const [niche, setNiche] = useState('');

  const completedJobs = jobs.filter((job) => job.status === 'completed').length;
  const runningJobs = jobs.filter((job) => job.status === 'running').length;
  const failedJobs = jobs.filter((job) => job.status === 'failed').length;
  const successRate = jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0;

  const handleStartAgentClick = () => {
    if (!user || !user.accessToken) {
      alert("Error: You are not logged in or your token is missing.");
      return;
    }
    if (!niche.trim()) {
      alert("Please enter a niche for the agent.");
      return;
    }
    startAgent(niche, user.accessToken);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]" />
      
      {/* Navbar */}
      <nav className="relative border-b border-white/5 bg-[#0a0a0b]/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#0a0a0b] rounded-sm" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-semibold text-white tracking-tight">LinkedIn Studio</h1>
                <p className="text-[10px] text-white/40 font-medium">Production Environment</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-white/60 font-medium">{user?.email}</span>
              </div>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 rounded-lg transition-all text-sm font-medium border border-white/5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-white/40" />
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Analytics Dashboard</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">Automation Overview</h2>
            <p className="text-sm text-white/50">Real-time monitoring and execution control</p>
          </div>

          {/* Control Panel */}
          <div className="flex items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 font-medium">Target Niche</label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g., Artificial Intelligence"
                className="w-64 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:bg-white/[0.07] focus:border-blue-500/50 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={handleStartAgentClick}
              disabled={starting}
              className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-lg transition-all text-sm font-semibold shadow-lg shadow-blue-600/20 disabled:cursor-not-allowed group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              {starting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initializing</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Execute Agent</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Message */}
        {(startMessage || startError) && (
          <div className={`mb-6 p-4 rounded-lg border backdrop-blur-sm ${
            startError
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              {startError ? startError : startMessage}
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Jobs */}
          <div className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:bg-white/[0.04] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-white/5 rounded-lg">
                <Activity className="w-5 h-5 text-white/60" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">{jobs.length}</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Total Executions</p>
              <p className="text-xs text-white/30">All time</p>
            </div>
          </div>

          {/* Completed */}
          <div className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:bg-white/[0.04] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">{completedJobs}</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Completed</p>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{width: `${(completedJobs / jobs.length) * 100}%`}} />
                </div>
                <span className="text-xs text-emerald-400/60">{jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0}%</span>
              </div>
            </div>
          </div>

          {/* Running */}
          <div className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:bg-white/[0.04] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">{runningJobs}</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide">In Progress</p>
              <div className="flex items-center gap-1.5">
                {runningJobs > 0 && (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-xs text-blue-400/60">Active</span>
                  </>
                )}
                {runningJobs === 0 && <span className="text-xs text-white/30">Idle</span>}
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="group relative bg-white/[0.02] border border-white/5 rounded-xl p-6 hover:bg-white/[0.04] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">{successRate}%</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-white/40 uppercase tracking-wide">Success Rate</p>
              <p className="text-xs text-white/30">{failedJobs} failed</p>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-0.5">Execution History</h3>
              <p className="text-xs text-white/40">Recent automation jobs and their status</p>
            </div>
            {jobs.length > 0 && (
              <span className="text-xs text-white/30 font-medium">{jobs.length} total records</span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] border border-white/5 rounded-xl">
              <div className="relative mb-4">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <div className="absolute inset-0 animate-ping">
                  <Loader2 className="w-8 h-8 text-blue-500/20" />
                </div>
              </div>
              <p className="text-sm text-white/60 font-medium">Loading execution data...</p>
              <p className="text-xs text-white/30 mt-1">Please wait</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400 mb-1">Failed to load data</p>
                  <p className="text-xs text-red-400/70">{error}</p>
                </div>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-base font-semibold text-white/80 mb-1">No execution history</h3>
              <p className="text-sm text-white/40">Start your first automation to see results here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobStatusCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};