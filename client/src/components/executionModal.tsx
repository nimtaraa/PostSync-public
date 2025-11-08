import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Activity, Zap, Database, Send, Clock } from 'lucide-react';

const ProfessionalExecutionModal = () => {
  const [executionStep, setExecutionStep] = useState(0);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [showModal, setShowModal] = useState(true);

  const executionSteps = [
    { label: 'Initializing Agent', icon: Activity, description: 'Setting up execution environment' },
    { label: 'Analyzing Niche', icon: Database, description: 'Processing target parameters' },
    { label: 'Generating Content', icon: Zap, description: 'AI content synthesis in progress' },
    { label: 'Optimizing Post', icon: CheckCircle2, description: 'Applying optimization algorithms' },
    { label: 'Scheduling Upload', icon: Clock, description: 'Configuring delivery schedule' },
    { label: 'Finalizing', icon: Send, description: 'Completing execution sequence' },
  ];

  useEffect(() => {
    setExecutionStep(0);
    setExecutionProgress(0);
    
    const progressInterval = setInterval(() => {
      setExecutionProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 1.5;
      });
    }, 30);

    const stepInterval = setInterval(() => {
      setExecutionStep(prev => {
        if (prev >= executionSteps.length - 1) {
          clearInterval(stepInterval);
          clearInterval(progressInterval);
          setTimeout(() => {
            setShowModal(false);
          }, 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  if (!showModal) return null;

  const CurrentIcon = executionSteps[executionStep].icon;
  const progressPercentage = Math.min(Math.round(executionProgress), 100);
  const isComplete = executionStep === executionSteps.length - 1 && progressPercentage === 100;

  return (
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
                      <CurrentIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    {!isComplete && (
                      <div className="absolute -inset-1 rounded-lg border border-blue-500/30 animate-ping" style={{ animationDuration: '2s' }} />
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
                <span className="text-sm font-semibold text-white tabular-nums">{progressPercentage}%</span>
              </div>
              <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>

            {/* Steps timeline */}
            <div className="space-y-3">
              {executionSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCurrentStep = index === executionStep;
                const isPastStep = index < executionStep;
                const isFutureStep = index > executionStep;

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
                          <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping" style={{ animationDuration: '2s' }} />
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
              <span className="text-white/40">Target: <span className="text-white/60 font-medium">Artificial Intelligence</span></span>
              <span className="text-white/40">Estimated time: <span className="text-white/60 font-medium">~15s</span></span>
            </div>
          </div>

          {/* Success overlay */}
          {isComplete && (
            <div className="absolute inset-0 bg-[#0d0d0f]/95 backdrop-blur-sm flex items-center justify-center animate-fade-in">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-1">Execution Complete</h4>
                <p className="text-sm text-white/50">Agent successfully deployed</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfessionalExecutionModal;