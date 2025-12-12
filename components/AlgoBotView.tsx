import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Terminal, Shield, TrendingUp, DollarSign, Activity, Settings, Save, Check } from 'lucide-react';
import { BotLog, UserSettings, ViewState, Notification } from '../types';
import { generateMockTrade } from '../services/mockDataService';

interface AlgoBotViewProps {
  settings: UserSettings;
  onNavigate: (view: ViewState) => void;
  addNotification: (title: string, message: string, type: Notification['type']) => void;
  onUpdateSettings: (settings: UserSettings) => void;
}

const AlgoBotView: React.FC<AlgoBotViewProps> = ({ settings, onNavigate, addNotification, onUpdateSettings }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<BotLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Strategy Config State
  const [strategyConfig, setStrategyConfig] = useState({
    name: 'Momentum Alpha v1',
    stopLoss: 2.5,
    takeProfit: 5.0,
    indicators: { rsi: true, macd: false, bb: true, sentiment: true }
  });
  const [isConfigSaved, setIsConfigSaved] = useState(false);
  
  // Keep a ref to settings to access latest values inside the interval closure without resetting the interval
  const settingsRef = useRef(settings);
  
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Live Metrics
  const [sessionPnL, setSessionPnL] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);
  const [winCount, setWinCount] = useState(0);

  const addLog = (message: string, type: BotLog['type'] = 'info') => {
    const newLog: BotLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      action: 'SYSTEM',
      details: message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleToggleEngine = () => {
    const newState = !isRunning;
    setIsRunning(newState);
    if (newState) {
      addNotification('Algo Engine Started', `Strategy "${strategyConfig.name}" is now active.`, 'success');
      addLog(`Strategy initialized: ${strategyConfig.name}`, 'info');
    } else {
      addNotification('Algo Engine Stopped', 'Trading has been paused manually.', 'warning');
    }
  };

  const handleSaveConfig = () => {
    setIsConfigSaved(true);
    addNotification('Strategy Updated', 'Parameters have been saved successfully.', 'success');
    addLog(`Updated Parameters: SL ${strategyConfig.stopLoss}%, TP ${strategyConfig.takeProfit}%`, 'warning');
    setTimeout(() => setIsConfigSaved(false), 2000);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      addLog(`Bot engine started. Risk Level: ${settings.botRiskLevel}`, 'success');
      if (settings.isPaperTrading) addLog('Running in PAPER TRADING MODE. No real capital at risk.', 'warning');
      
      interval = setInterval(() => {
        const rand = Math.random();
        
        // 30% chance to execute a trade
        if (rand > 0.7) {
            const trade = generateMockTrade();
            const profitStr = trade.profit > 0 ? `+$${trade.profit.toFixed(2)}` : `-$${Math.abs(trade.profit).toFixed(2)}`;
            const type = trade.profit > 0 ? 'success' : 'error'; // Error style for loss for visibility
            
            // Update local session stats
            setSessionPnL(prev => prev + trade.profit);
            setTradeCount(prev => prev + 1);
            if (trade.profit > 0) setWinCount(prev => prev + 1);

            // Update Global Settings (Balance) to reflect on Dashboard
            const currentSettings = settingsRef.current;
            const isPaper = currentSettings.isPaperTrading;
            const balanceKey = isPaper ? 'paperBalance' : 'realBalance';
            const currentBalance = currentSettings[balanceKey];
            const newBalance = currentBalance + trade.profit;

            onUpdateSettings({
              ...currentSettings,
              [balanceKey]: newBalance
            });

            const msg = `EXECUTED: ${trade.action} ${trade.symbol} | PnL: ${profitStr}`;
            addLog(msg, type);

            // Push Notification for trade execution
            if (currentSettings.notificationsEnabled) {
              addNotification(
                `Trade Executed: ${trade.symbol}`, 
                `${trade.action} order filled. Result: ${profitStr} (New Balance: $${newBalance.toFixed(2)})`, 
                type === 'success' ? 'success' : 'warning'
              );
            }
        } else {
            // Other events
            const events = [
                { msg: 'Scanning US Tech sector for volatility...', type: 'info' },
                { msg: 'Analyzing sentiment matrix. No high-confidence signals.', type: 'info' },
                { msg: 'Price anomaly detected. Checking correlations.', type: 'warning' },
                { msg: 'Holding positions. Risk parameters within safe range.', type: 'info' }
            ];
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            addLog(randomEvent.msg, randomEvent.type as BotLog['type']);
        }
      }, 2000);
    } else if (logs.length > 0 && !isRunning) {
      addLog('Bot engine stopped by user.', 'warning');
    }
    return () => clearInterval(interval);
  }, [isRunning, addNotification, onUpdateSettings]); // Removed specific settings dependencies to rely on settingsRef

  // Scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const winRate = tradeCount > 0 ? ((winCount / tradeCount) * 100).toFixed(1) : '0.0';

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 pb-10">
      {/* Controls Column */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6 rounded-xl border border-gray-800 relative overflow-hidden transition-all duration-300 hover:border-gray-700">
          <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${isRunning ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
          <h3 className="text-xl font-bold text-white mb-1">Execution Engine</h3>
          <p className="text-sm text-gray-400 mb-6">Status: <span className={`font-bold transition-colors ${isRunning ? 'text-green-400' : 'text-red-400'}`}>{isRunning ? 'LIVE TRADING' : 'STOPPED'}</span></p>
          
          <button
            onClick={handleToggleEngine}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 duration-200 ${
              isRunning 
              ? 'bg-red-900/50 text-red-400 border border-red-800 hover:bg-red-900' 
              : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/50 hover:shadow-green-900/70'
            }`}
          >
            {isRunning ? <><Square className="fill-current w-5 h-5 mr-2" /> STOP ENGINE</> : <><Play className="fill-current w-5 h-5 mr-2" /> START ENGINE</>}
          </button>

          <div className="mt-6 space-y-3">
             <div className="flex justify-between items-center text-sm p-3 bg-gray-800/50 rounded-lg">
               <span className="text-gray-400">Mode</span>
               <span className={`${settings.isPaperTrading ? 'text-blue-400' : 'text-purple-400'} font-mono font-bold transition-colors`}>
                 {settings.isPaperTrading ? 'Paper Trading' : 'REAL MONEY'}
               </span>
             </div>
             
             {/* Live PnL Box */}
             <div className={`p-4 rounded-lg border transition-all duration-500 ${sessionPnL >= 0 ? 'bg-green-900/20 border-green-900' : 'bg-red-900/20 border-red-900'}`}>
                <div className="text-gray-400 text-xs uppercase font-bold mb-1">Session Profit</div>
                <div className={`text-3xl font-mono font-bold transition-colors ${sessionPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {sessionPnL >= 0 ? '+' : ''}{sessionPnL.toFixed(2)}
                </div>
             </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-primary-500"/> Live Performance</h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                <div className="text-gray-400 text-xs">Trades</div>
                <div className="text-xl font-bold text-white">{tradeCount}</div>
             </div>
             <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                <div className="text-gray-400 text-xs">Win Rate</div>
                <div className="text-xl font-bold text-white">{winRate}%</div>
             </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center"><Shield className="w-5 h-5 mr-2 text-primary-500"/> Risk Parameters</h3>
          <div className="space-y-4">
             <div>
               <div className="flex justify-between text-xs text-gray-400 mb-1">
                 <span>Max Drawdown Limit</span>
                 <span>{settings.botMaxDrawdown}%</span>
               </div>
               <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                 <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${settings.botMaxDrawdown * 5}%` }}></div>
               </div>
             </div>
             <button 
               onClick={() => onNavigate(ViewState.SETTINGS)}
               className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:bg-gray-800 rounded-lg transition-colors"
             >
               Configure Limits
             </button>
          </div>
        </div>
      </div>

      {/* Terminal Column */}
      <div className="lg:col-span-2 flex flex-col space-y-6">
         {/* Strategy Configuration Panel */}
         <div className="glass-panel p-6 rounded-xl border border-gray-800 animate-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-400" />
                Strategy Configuration
              </h3>
              <div className="flex items-center space-x-2">
                 <span className="text-xs text-purple-400 bg-purple-900/20 px-2 py-1 rounded border border-purple-500/30">AI Optimized</span>
              </div>
            </div>

            <div className="space-y-6">
               <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Strategy Name</label>
                 <input 
                   type="text" 
                   value={strategyConfig.name}
                   onChange={(e) => setStrategyConfig({...strategyConfig, name: e.target.value})}
                   className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none transition-colors"
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Take Profit (%)</label>
                   <div className="flex items-center space-x-3">
                     <input 
                       type="range" min="1" max="20" step="0.5"
                       value={strategyConfig.takeProfit}
                       onChange={(e) => setStrategyConfig({...strategyConfig, takeProfit: parseFloat(e.target.value)})}
                       className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                     />
                     <span className="text-white font-mono font-bold w-12 text-right">{strategyConfig.takeProfit}%</span>
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Stop Loss (%)</label>
                   <div className="flex items-center space-x-3">
                     <input 
                       type="range" min="0.5" max="10" step="0.5"
                       value={strategyConfig.stopLoss}
                       onChange={(e) => setStrategyConfig({...strategyConfig, stopLoss: parseFloat(e.target.value)})}
                       className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                     />
                     <span className="text-white font-mono font-bold w-12 text-right">{strategyConfig.stopLoss}%</span>
                   </div>
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Active Indicators</label>
                 <div className="flex space-x-4">
                   {Object.entries(strategyConfig.indicators).map(([key, isActive]) => (
                     <button
                       key={key}
                       onClick={() => setStrategyConfig({
                         ...strategyConfig, 
                         indicators: {...strategyConfig.indicators, [key]: !isActive}
                       })}
                       className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                         isActive 
                           ? 'bg-primary-600 text-white border-primary-500' 
                           : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600'
                       }`}
                     >
                       {key.toUpperCase()}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="flex justify-end pt-2 border-t border-gray-800">
                 <button 
                   onClick={handleSaveConfig}
                   className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                     isConfigSaved 
                       ? 'bg-green-600 text-white' 
                       : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                   }`}
                 >
                   {isConfigSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                   <span>{isConfigSaved ? 'Saved' : 'Save Config'}</span>
                 </button>
               </div>
            </div>
         </div>

         {/* Logs Console */}
         <div className="glass-panel rounded-xl border border-gray-800 flex flex-col overflow-hidden flex-1 animate-in slide-in-from-bottom-4 duration-700">
           <div className="bg-gray-900 p-3 border-b border-gray-800 flex justify-between items-center">
             <div className="flex items-center space-x-2 text-gray-400">
               <Terminal className="w-4 h-4" />
               <span className="text-xs font-mono">/var/logs/quantai_exec.log</span>
             </div>
             <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
             </div>
           </div>
           <div className="flex-1 bg-black/50 p-4 font-mono text-sm overflow-y-auto min-h-[400px]">
             {logs.length === 0 && <div className="text-gray-600 italic">Waiting for engine start...</div>}
             {logs.map((log) => (
               <div key={log.id} className="mb-1.5 break-words border-b border-gray-800/50 pb-1 last:border-0 animate-in fade-in slide-in-from-left-2 duration-200">
                 <span className="text-gray-600 mr-2">[{log.timestamp}]</span>
                 <span className={`mr-2 font-bold ${
                   log.type === 'error' ? 'text-red-500' : 
                   log.type === 'success' ? 'text-green-400' :
                   log.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                 }`}>
                   {log.type.toUpperCase()}
                 </span>
                 <span className="text-gray-300">{log.details}</span>
               </div>
             ))}
             <div ref={logsEndRef} />
           </div>
         </div>
      </div>
    </div>
  );
};

export default AlgoBotView;