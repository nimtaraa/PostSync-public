// FILE: src/components/Dashboard.tsx

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCronJobStatus } from '../hooks/useCronJobStatus';
import { useAgentStart } from '../hooks/useAgentStart';
import { JobStatusCard } from './JobStatusCard';
import {
  LogOut,
  Sparkles,
  TrendingUp,
  Activity,
  CheckCircle2,
  Loader2,
  PlayCircle,
  Zap,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { jobs, loading, error } = useCronJobStatus(user?.id || null);
  const { startAgent, starting, startError, startMessage } = useAgentStart();
  
  const [niche, setNiche] = useState('');

  const completedJobs = jobs.filter((job) => job.status === 'completed').length;
  const runningJobs = jobs.filter((job) => job.status === 'running').length;
  const failedJobs = jobs.filter((job) => job.status === 'failed').length;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}} />
      </div>

      {/* Navbar with 3D depth */}
      <nav className="relative bg-slate-900/80 border-b border-slate-700/50 shadow-2xl backdrop-blur-2xl sticky top-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-purple-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              {/* Logo with 3D effect */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-2xl transform transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
                  LinkedIn Studio
                </h1>
                <p className="text-xs text-slate-400 font-medium tracking-wide flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Automated Content Pipeline
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-700/50">
                <p className="text-sm font-bold text-white">{user?.email}</p>
                <p className="text-xs text-emerald-400 font-medium">● OAuth Connected</p>
              </div>
              <button
                onClick={signOut}
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all font-semibold border border-slate-700 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Body */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
              Workflow Dashboard
            </h2>
            <p className="text-slate-400 text-lg font-medium">
              Monitor your automated content generation in real-time
            </p>
          </div>

          {/* Input and Button with 3D effect */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Enter your niche (e.g., AI)"
                className="relative px-5 py-3 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all font-medium"
              />
            </div>
            <button
              onClick={handleStartAgentClick}
              disabled={starting}
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-2xl overflow-hidden transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 opacity-100 group-hover:opacity-90 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 blur-xl opacity-75" />
              <div className="relative flex items-center gap-2">
                {starting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Start Agent
                  </>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Agent Start Feedback */}
        {(startMessage || startError) && (
          <div
            className={`mb-8 p-5 rounded-2xl border text-sm font-semibold backdrop-blur-sm shadow-lg ${
              startError
                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                : 'bg-green-500/20 border-green-500/30 text-green-400'
            }`}
          >
            {startError ? startError : startMessage}
          </div>
        )}

        {/* Job Summary Cards with 3D depth */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Completed Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-emerald-500/20 p-4 rounded-2xl border border-emerald-500/30 shadow-lg">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <span className="text-5xl font-black text-white tracking-tight">{completedJobs}</span>
              </div>
              <h3 className="font-bold text-emerald-400 mb-2 text-lg">Completed Jobs</h3>
              <p className="text-sm text-slate-400 font-medium">Successfully published to LinkedIn</p>
            </div>
          </div>

          {/* Running Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-blue-500/20 p-4 rounded-2xl border border-blue-500/30 shadow-lg animate-pulse">
                  <Activity className="w-10 h-10 text-blue-400" />
                </div>
                <span className="text-5xl font-black text-white tracking-tight">{runningJobs}</span>
              </div>
              <h3 className="font-bold text-blue-400 mb-2 text-lg">Running Jobs</h3>
              <p className="text-sm text-slate-400 font-medium">Currently processing content</p>
            </div>
          </div>

          {/* Total Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-purple-500/20 p-4 rounded-2xl border border-purple-500/30 shadow-lg">
                  <TrendingUp className="w-10 h-10 text-purple-400" />
                </div>
                <span className="text-5xl font-black text-white tracking-tight">{jobs.length}</span>
              </div>
              <h3 className="font-bold text-purple-400 mb-2 text-lg">Total Jobs</h3>
              <p className="text-sm text-slate-400 font-medium">{failedJobs} failed • All time stats</p>
            </div>
          </div>
        </div>

        {/* Recent Jobs Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-black text-white mb-2">Recent Jobs</h3>
          <p className="text-slate-400 font-medium">Track your latest automated workflows</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
              <Loader2 className="relative w-16 h-16 text-blue-400 animate-spin mb-6" />
            </div>
            <p className="text-slate-300 font-bold text-lg">Loading job statuses...</p>
            <p className="text-slate-500 text-sm mt-2">Please wait</p>
          </div>
        ) : error ? (
          <div className="relative group">
            <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center backdrop-blur-sm">
              <p className="text-red-400 font-bold text-lg mb-2">Error loading jobs</p>
              <p className="text-red-300/80 text-sm">{error}</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="relative group">
            <div className="absolute inset-0 bg-slate-700/30 rounded-3xl blur-xl opacity-50" />
            <div className="relative bg-slate-800/50 backdrop-blur-xl border-2 border-dashed border-slate-700 rounded-3xl p-16 text-center">
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Activity className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No jobs yet</h3>
              <p className="text-slate-400 font-medium">Start your first agent to see automated jobs here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <JobStatusCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};