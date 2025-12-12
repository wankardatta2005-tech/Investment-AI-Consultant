import React from 'react';
import { X, ChevronRight, Check } from 'lucide-react';
import { OnboardingStep, ViewState } from '../types';

interface OnboardingTutorialProps {
  onClose: () => void;
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
}

const STEPS: OnboardingStep[] = [
  {
    targetView: ViewState.DASHBOARD,
    title: "Welcome to QuantAI",
    content: "Let's get you set up. QuantAI integrates global market data with AI to give you an edge. This is your main Command Center."
  },
  {
    targetView: ViewState.DASHBOARD,
    title: "Key Metrics",
    content: "Track your Total Equity and daily performance here. Your watchlist on the right gives you quick access to the assets you care about most."
  },
  {
    targetView: ViewState.NEWS_ANALYSIS,
    title: "AI News Intelligence",
    content: "This is the brain of the operation. We scan global news and our Gemini AI analyzes sentiment (Bullish/Bearish). You can click 'AI Insight' for a deeper dive."
  },
  {
    targetView: ViewState.ALGO_BOT,
    title: "Algorithmic Execution",
    content: "Automate your strategy. Monitor logs, start/stop the engine, and configure risk parameters. Always start with Paper Trading first!"
  },
  {
    targetView: ViewState.SETTINGS,
    title: "Paper Trading & Personalization",
    content: "Configure your alerts, manage your watchlist, and most importantly, toggle 'Paper Trading' to test strategies without financial risk.",
  }
];

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onClose, onNavigate, currentView }) => {
  const [stepIndex, setStepIndex] = React.useState(0);
  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  // Auto-navigate when step changes
  React.useEffect(() => {
    if (currentStep.targetView !== currentView) {
      onNavigate(currentStep.targetView);
    }
  }, [stepIndex, currentStep, currentView, onNavigate]);

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setStepIndex(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden flex flex-col">
        {/* Header with progress */}
        <div className="bg-gray-800 p-6 border-b border-gray-700 relative">
          <div className="flex justify-between items-center mb-4">
             <div className="flex space-x-1">
               {STEPS.map((_, idx) => (
                 <div 
                   key={idx} 
                   className={`h-1.5 rounded-full transition-all duration-300 ${
                     idx <= stepIndex ? 'w-8 bg-primary-500' : 'w-2 bg-gray-600'
                   }`} 
                 />
               ))}
             </div>
             <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
               <X className="w-5 h-5" />
             </button>
          </div>
          <h2 className="text-2xl font-bold text-white">{currentStep.title}</h2>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 bg-gradient-to-b from-gray-900 to-gray-950">
          <p className="text-gray-300 text-lg leading-relaxed">
            {currentStep.content}
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end">
          <button 
            onClick={handleNext}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20"
          >
            <span>{isLastStep ? 'Get Started' : 'Next Step'}</span>
            {isLastStep ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;