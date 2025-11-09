import React, { useState } from 'react';
import { Activity, AlertCircle, CheckCircle2, Calendar, Tag, TrendingUp, Clock } from 'lucide-react';

const EnhancedPostsDisplay = () => {
  // Demo states
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState(null);
  const [userPosts, setUserPosts] = useState([
    {
      _id: '1',
      niche: 'Technology',
      description: 'Exploring the future of AI and machine learning in modern applications',
      posted_date: new Date('2024-11-08'),
      engagement: 1247
    },
    {
      _id: '2',
      niche: 'Design',
      description: 'Minimal UI patterns that create maximum impact in user experiences',
      posted_date: new Date('2024-11-07'),
      engagement: 892
    },
    {
      _id: '3',
      niche: 'Business',
      description: 'Strategic approaches to scaling startups in competitive markets',
      posted_date: new Date('2024-11-05'),
      engagement: 1583
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          
          @keyframes slide-up {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          
          .animate-slide-up {
            animation: slide-up 0.5s ease-out forwards;
          }
          
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
          
          .glass-card {
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
          }
          
          .glass-card:hover {
            background: rgba(15, 23, 42, 0.6);
            border-color: rgba(255, 255, 255, 0.1);
          }
        `}</style>

        {loadingPosts ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <div className="relative w-24 h-24 mx-auto mb-8 animate-float">
              {/* Outer ring */}
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
              
              {/* Spinning gradient ring */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-0 border-4 border-transparent rounded-full"
                  style={{
                    borderTopColor: '#3b82f6',
                    borderRightColor: '#06b6d4',
                    animation: 'spin 1.5s linear infinite'
                  }}
                />
              </div>
              
              {/* Inner pulse */}
              <div className="absolute inset-3 border-4 border-transparent border-t-cyan-400 rounded-full opacity-60" 
                   style={{animation: 'spin 2s linear infinite reverse'}} />
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse-glow" />
            </div>
            
            <div className="space-y-3">
              <p className="text-base text-slate-300 font-semibold">Loading execution data</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0s'}} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card rounded-2xl p-8 border-red-500/20 bg-red-950/20 animate-shake">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-red-500/10 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-400 animate-pulse" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to load data</h3>
                <p className="text-sm text-red-400/70 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="glass-card rounded-2xl p-20 text-center">
            <div className="relative w-32 h-32 mx-auto mb-8 animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl opacity-50 blur-2xl" />
              <div className="relative bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50">
                <Activity className="w-20 h-20 text-slate-600" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-300 mb-3">No posts yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Start your first post to see your execution history here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post, index) => (
              <div 
                key={post._id} 
                className="group glass-card rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] cursor-pointer animate-slide-up overflow-hidden relative"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
                      style={{width: '200%'}}
                    />
                  </div>
                </div>

                {/* Gradient border glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 blur-xl" />
                </div>

                <div className="relative">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      {/* Header with tags */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50 group-hover:border-blue-500/30 transition-colors">
                          <Tag className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-xs font-semibold text-slate-300">
                            {post.niche}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs text-slate-400">
                            {new Date(post.posted_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {post.engagement && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-medium text-emerald-400">
                              {post.engagement.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                        {post.description}
                      </p>
                    </div>

                    {/* Status indicator */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom progress bar */}
                  <div className="mt-4 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Posted {Math.floor((new Date() - new Date(post.posted_date)) / (1000 * 60 * 60 * 24))} days ago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{width: '100%'}} />
                        </div>
                        <span className="text-slate-500 font-medium">Complete</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Demo Controls */}
        <div className="mt-8 glass-card rounded-2xl p-6">
          <p className="text-sm text-slate-400 mb-4 font-medium">Demo Controls:</p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setLoadingPosts(!loadingPosts)}
              className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg text-sm text-blue-400 font-medium transition-all"
            >
              Toggle Loading
            </button>
            <button
              onClick={() => setError(error ? null : 'Network connection failed. Please try again.')}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg text-sm text-red-400 font-medium transition-all"
            >
              Toggle Error
            </button>
            <button
              onClick={() => setUserPosts(userPosts.length ? [] : [
                {
                  _id: '1',
                  niche: 'Technology',
                  description: 'Exploring the future of AI and machine learning in modern applications',
                  posted_date: new Date('2024-11-08'),
                  engagement: 1247
                },
                {
                  _id: '2',
                  niche: 'Design',
                  description: 'Minimal UI patterns that create maximum impact in user experiences',
                  posted_date: new Date('2024-11-07'),
                  engagement: 892
                },
                {
                  _id: '3',
                  niche: 'Business',
                  description: 'Strategic approaches to scaling startups in competitive markets',
                  posted_date: new Date('2024-11-05'),
                  engagement: 1583
                }
              ])}
              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg text-sm text-emerald-400 font-medium transition-all"
            >
              Toggle Posts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPostsDisplay;