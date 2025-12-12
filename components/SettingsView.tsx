import React, { useState } from 'react';
import { Save, Plus, X, Bell, Layout, Shield, Wallet, BarChart2, RotateCcw, AlertTriangle } from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [newTicker, setNewTicker] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const addTicker = () => {
    if (newTicker && !localSettings.watchlist.includes(newTicker.toUpperCase())) {
      setLocalSettings({
        ...localSettings,
        watchlist: [...localSettings.watchlist, newTicker.toUpperCase()]
      });
      setNewTicker('');
    }
  };

  const removeTicker = (ticker: string) => {
    setLocalSettings({
      ...localSettings,
      watchlist: localSettings.watchlist.filter(t => t !== ticker)
    });
  };

  const resetPaperBalance = () => {
    setLocalSettings({
      ...localSettings,
      paperBalance: 500000.00
    });
  };

  const resetToDefaults = () => {
    // We only reset preferences, keeping balances intact usually, but for a full factory reset:
    setLocalSettings({
      watchlist: ['NVDA', 'TSLA', 'AAPL'],
      alertThreshold: 0.8,
      chartType: 'area',
      isPaperTrading: true,
      botRiskLevel: 'Moderate',
      botMaxDrawdown: 5.0,
      notificationsEnabled: true,
      realBalance: localSettings.realBalance, // Preserve real money
      paperBalance: 500000.00
    });
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Personalization Hub</h2>
          <p className="text-gray-400 text-sm">Configure your trading environment and algorithmic preferences</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold transition-all transform active:scale-95 ${
            isSaved ? 'bg-green-600 text-white' : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? 'Changes Saved' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Watchlist Management */}
        <div className="glass-panel p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><BarChart2 className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-white">Watchlist Manager</h3>
          </div>
          
          <div className="flex space-x-2 mb-4">
            <input 
              type="text" 
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTicker()}
              placeholder="Add Symbol (e.g. MSFT)"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors uppercase"
            />
            <button onClick={addTicker} className="bg-gray-800 hover:bg-gray-700 text-white px-4 rounded-lg border border-gray-700">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {localSettings.watchlist.map(ticker => (
              <div key={ticker} className="flex items-center bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-sm text-gray-300">
                <span className="font-mono font-bold mr-2">{ticker}</span>
                <button onClick={() => removeTicker(ticker)} className="hover:text-red-400 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {localSettings.watchlist.length === 0 && (
              <p className="text-gray-500 text-sm italic">No assets in watchlist.</p>
            )}
          </div>
        </div>

        {/* Account Mode */}
        <div className="glass-panel p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Wallet className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-white">Account Mode</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div>
                <div className="font-bold text-white">Paper Trading</div>
                <div className="text-xs text-gray-400 mt-1">Use virtual funds for simulation</div>
              </div>
              <button 
                onClick={() => setLocalSettings({...localSettings, isPaperTrading: !localSettings.isPaperTrading})}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${localSettings.isPaperTrading ? 'bg-primary-500' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${localSettings.isPaperTrading ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
            
            <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/50">
              <p className="text-xs text-yellow-200">
                <span className="font-bold">Note:</span> Live trading requires API connection to a brokerage. Currently in simulation mode.
              </p>
            </div>

            <div className="pt-2 border-t border-gray-700">
              <button 
                onClick={resetPaperBalance}
                className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Paper Balance to $500k</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alert Configuration */}
        <div className="glass-panel p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><Bell className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-white">Smart Alerts</h3>
          </div>

          <div className="space-y-6">
             <div>
               <label className="block text-sm text-gray-400 mb-2">Sentiment Threshold (Bullish/Bearish)</label>
               <div className="flex items-center space-x-4">
                 <input 
                   type="range" 
                   min="0.1" 
                   max="1.0" 
                   step="0.1"
                   value={localSettings.alertThreshold}
                   onChange={(e) => setLocalSettings({...localSettings, alertThreshold: parseFloat(e.target.value)})}
                   className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                 />
                 <span className="font-mono text-white font-bold w-12">{localSettings.alertThreshold}</span>
               </div>
               <p className="text-xs text-gray-500 mt-2">Notify when AI sentiment score exceeds this value.</p>
             </div>

             <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Push Notifications</span>
                <input 
                  type="checkbox" 
                  checked={localSettings.notificationsEnabled}
                  onChange={(e) => setLocalSettings({...localSettings, notificationsEnabled: e.target.checked})}
                  className="w-4 h-4 accent-primary-500 bg-gray-700 border-gray-600 rounded"
                />
             </div>
          </div>
        </div>

        {/* Algo Bot Parameters */}
        <div className="glass-panel p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Shield className="w-5 h-5" /></div>
            <h3 className="text-lg font-bold text-white">Bot Parameters</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Risk Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['Low', 'Moderate', 'High'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setLocalSettings({...localSettings, botRiskLevel: level as any})}
                    className={`py-2 text-sm rounded-lg border transition-all ${
                      localSettings.botRiskLevel === level 
                        ? 'bg-primary-600 border-primary-500 text-white' 
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Max Drawdown Limit (%)</label>
              <input 
                type="number" 
                value={localSettings.botMaxDrawdown}
                onChange={(e) => setLocalSettings({...localSettings, botMaxDrawdown: parseFloat(e.target.value)})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Chart Preference</label>
              <select 
                value={localSettings.chartType}
                onChange={(e) => setLocalSettings({...localSettings, chartType: e.target.value as any})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              >
                <option value="area">Area Gradient</option>
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Reset Zone */}
        <div className="md:col-span-2 mt-4 pt-6 border-t border-gray-800 flex justify-end">
           <button 
             onClick={resetToDefaults}
             className="text-gray-500 hover:text-red-400 text-sm flex items-center transition-colors"
           >
             <AlertTriangle className="w-4 h-4 mr-2" />
             Reset All Preferences to Defaults
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;