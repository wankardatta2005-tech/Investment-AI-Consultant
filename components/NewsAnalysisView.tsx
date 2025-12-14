import React, { useState, useEffect } from 'react';
import { Search, Globe, Zap, Cpu, Bell, Loader } from 'lucide-react';
import { INITIAL_NEWS } from '../constants';
import { analyzeNewsImpact } from '../services/geminiService';
import { fetchMockNewsUpdate } from '../services/mockDataService';
import { NewsItem, ViewState } from '../types';

interface NewsAnalysisViewProps {
  onNavigate: (view: ViewState) => void;
}

const NewsAnalysisView: React.FC<NewsAnalysisViewProps> = ({ onNavigate }) => {
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time news updates
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isLive) {
      interval = setInterval(async () => {
        const newItem = await fetchMockNewsUpdate();
        setNews(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50 items
      }, 8000); // New news every 8 seconds
    }

    return () => clearInterval(interval);
  }, [isLive]);

  const handleAnalyze = async (id: string) => {
    setAnalyzingId(id);
    const item = news.find(n => n.id === id);
    if (item) {
    const analysis = await analyzeNewsImpact(item.title + ". " + item.summary);
      setNews(prev => prev.map(n => n.id === id ? { ...n, impactAnalysis: analysis } : n));
    }
    setAnalyzingId(null);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            Global Intelligence
            {isLive && (
              <span className="ml-3 flex items-center px-2 py-0.5 rounded text-[10px] bg-red-900/50 text-red-400 border border-red-800 animate-pulse">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
                LIVE FEED
              </span>
            )}
          </h2>
          <p className="text-gray-400 text-sm">Real-time news processing with Gemini AI sentiment analysis</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search global issues..." 
              className="bg-gray-800 border border-gray-700 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
          </div>
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
              isLive ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-900 text-gray-500 border-gray-800'
            }`}
          >
            {isLive ? 'PAUSE' : 'RESUME'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-6 pr-2 custom-scrollbar">
        {news.map((item) => (
          <div key={item.id} className="glass-panel p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all animate-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.sentiment === 'Bullish' ? 'bg-green-900/50 text-green-400' :
                    item.sentiment === 'Bearish' ? 'bg-red-900/50 text-red-400' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {item.sentiment} ({item.sentimentScore > 0 ? '+' : ''}{item.sentimentScore})
                  </span>
                  <span className="text-gray-500 text-xs flex items-center">
                    <Globe className="w-3 h-3 mr-1" /> {item.region}
                  </span>
                  <span className="text-gray-500 text-xs">{item.source} • {item.time}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{item.summary}</p>
                
                {item.impactAnalysis && (
                  <div className="bg-primary-900/20 border border-primary-500/30 rounded-lg p-4 mb-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center text-primary-400 mb-2">
                      <Cpu className="w-4 h-4 mr-2" />
                      <span className="text-xs font-bold uppercase tracking-wider">QuantAI Impact Assessment</span>
                    </div>
                    <p className="text-primary-100 text-sm">{item.impactAnalysis}</p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Related Assets:</span>
                  {item.relatedTickers.map(ticker => (
                    <span key={ticker} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs border border-gray-700 font-mono cursor-pointer hover:text-white">
                      ${ticker}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-3 min-w-[150px]">
                <button 
                  onClick={() => handleAnalyze(item.id)}
                  disabled={!!item.impactAnalysis || analyzingId === item.id}
                  className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    item.impactAnalysis 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  }`}
                >
                   {analyzingId === item.id ? (
                     <span className="flex items-center"><Loader className="w-3 h-3 animate-spin mr-2"/> Processing</span>
                   ) : (
                     <>
                      <Zap className="w-4 h-4" />
                      <span>{item.impactAnalysis ? 'Analyzed' : 'AI Insight'}</span>
                     </>
                   )}
                </button>
                <button 
                  onClick={() => onNavigate(ViewState.SETTINGS)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  <span>Set Alert</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsAnalysisView;
