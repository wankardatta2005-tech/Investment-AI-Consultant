import React, { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, TrendingUp, BarChart2, Plus, CreditCard, X, Briefcase, History, TrendingDown, Layers, Brain, Lock } from 'lucide-react';
import { UserSettings, ViewState, Notification, ManualTrade, Position } from '../types';
import { useMarketData } from '../contexts/MarketDataContext';
import { generateMarketStrategy } from '../services/geminiService';

interface DashboardViewProps {
  settings: UserSettings;
  onNavigate: (view: ViewState) => void;
  onUpdateSettings: (settings: UserSettings) => void;
  addNotification: (title: string, message: string, type: Notification['type']) => void;
  manualTrades: ManualTrade[];
  portfolio: Position[];
  onAddTrade: (trade: ManualTrade) => void;
}

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-gray-800/50 rounded-lg ${className}`} />
);

const DashboardView: React.FC<DashboardViewProps> = ({ settings, onNavigate, onUpdateSettings, addNotification, manualTrades, portfolio, onAddTrade }) => {
  const { stocks, getStock, isLoading } = useMarketData();
  
  const [aiStrategy, setAiStrategy] = useState<string>('Analyzing market structure and volatility parameters...');
  const [timeframe, setTimeframe] = useState('1D');
  const [selectedStock, setSelectedStock] = useState(settings.watchlist[0] || 'NVDA');
  
  // Deposit Modal State
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  // Trade Modal State
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeQuantity, setTradeQuantity] = useState('10');

  useEffect(() => {
    let mounted = true;
    const fetchStrategy = async () => {
      const strategy = await generateMarketStrategy(settings.watchlist);
      if (mounted) {
        setAiStrategy(strategy);
      }
    };
    if (!isLoading) {
       fetchStrategy();
    }
    return () => { mounted = false; };
  }, [settings.watchlist, isLoading]);

  // Calculate Finances
  const cashBalance = settings.isPaperTrading ? settings.paperBalance : settings.realBalance;
  
  // Calculate Market Value of Portfolio
  let portfolioValue = 0;
  let costBasis = 0;

  portfolio.forEach(pos => {
    const stock = getStock(pos.symbol);
    const currentPrice = stock ? stock.price : pos.avgPrice; // Fallback to avgPrice if not in data
    
    portfolioValue += pos.quantity * currentPrice;
    costBasis += pos.quantity * pos.avgPrice;
  });

  const totalEquity = cashBalance + portfolioValue;
  const unrealizedPnL = portfolioValue - costBasis;
  const isPnLPositive = unrealizedPnL >= 0;

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      addNotification('Deposit Failed', 'Please enter a valid positive amount.', 'error');
      return;
    }

    if (settings.isPaperTrading) {
      onUpdateSettings({ ...settings, paperBalance: settings.paperBalance + amount });
      addNotification('Paper Funds Added', `$${amount.toLocaleString()} added to simulation account.`, 'success');
    } else {
      onUpdateSettings({ ...settings, realBalance: settings.realBalance + amount });
      addNotification('Deposit Successful', `$${amount.toLocaleString()} has been deposited to your real account.`, 'success');
    }
    setDepositAmount('');
    setShowDepositModal(false);
  };

  // Filter stocks based on watchlist, default to all if empty or mock data missing
  // We use the 'stocks' from context now
  const activeStockData = getStock(selectedStock) || stocks[0];
  const isStockLoaded = !isLoading && !!activeStockData;

  // Manual Trade Execution
  const handleExecuteTrade = () => {
    if (!isStockLoaded) return;

    const qty = parseFloat(tradeQuantity);
    const price = activeStockData.price;
    const totalCost = qty * price;

    if (isNaN(qty) || qty <= 0) {
      addNotification('Invalid Quantity', 'Please enter a valid quantity.', 'error');
      return;
    }

    if (tradeAction === 'BUY') {
      if (totalCost > cashBalance) {
        addNotification('Insufficient Funds', `You need $${totalCost.toFixed(2)} but only have $${cashBalance.toFixed(2)}.`, 'error');
        return;
      }
      
      // Update Balance
      if (settings.isPaperTrading) {
        onUpdateSettings({ ...settings, paperBalance: settings.paperBalance - totalCost });
      } else {
        onUpdateSettings({ ...settings, realBalance: settings.realBalance - totalCost });
      }
    } else {
      // Check if we have enough shares to sell
      const position = portfolio.find(p => p.symbol === selectedStock);
      if (!position || position.quantity < qty) {
        addNotification('Insufficient Holdings', `You only have ${position?.quantity || 0} shares.`, 'error');
        return;
      }

      // For SELL, add cash
      if (settings.isPaperTrading) {
        onUpdateSettings({ ...settings, paperBalance: settings.paperBalance + totalCost });
      } else {
        onUpdateSettings({ ...settings, realBalance: settings.realBalance + totalCost });
      }
    }

    // Record Trade
    const newTrade: ManualTrade = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: selectedStock,
      action: tradeAction,
      quantity: qty,
      price: price,
      total: totalCost,
      timestamp: new Date().toLocaleTimeString(),
      status: 'FILLED'
    };
    onAddTrade(newTrade);
    addNotification('Order Executed', `${tradeAction} ${qty} ${selectedStock} @ $${price.toFixed(2)}`, 'success');
    setShowTradeModal(false);
  };

  // Adjust chart data based on timeframe (simplified for demo)
  const getChartData = () => {
    if (!isStockLoaded) return [];
    const baseData = activeStockData.history;
    if (timeframe === '1H') return baseData.slice(-5);
    return baseData;
  };

  const renderChart = () => {
    if (!isStockLoaded) return <Skeleton className="w-full h-full" />;

    const ChartComponent = settings.chartType === 'line' ? LineChart : settings.chartType === 'bar' ? BarChart : AreaChart;
    const DataComponent = settings.chartType === 'line' ? Line : settings.chartType === 'bar' ? Bar : Area;
    const commonProps = {
      dataKey: "value",
      stroke: "#3b82f6",
      strokeWidth: 2,
      fill: settings.chartType === 'area' ? "url(#colorValue)" : "#3b82f6",
      isAnimationActive: true,
      animationDuration: 1000
    };

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={getChartData()}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis dataKey="time" stroke="#9ca3af" tick={{fontSize: 12}} />
          <YAxis stroke="#9ca3af" tick={{fontSize: 12}} domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
            itemStyle={{ color: '#3b82f6' }}
          />
          {/* @ts-ignore */}
          <DataComponent {...commonProps} type="monotone" />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 relative">
      {!settings.isPaperTrading && (
         <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-lg p-3 text-center text-emerald-200 font-bold text-sm flex items-center justify-center animate-pulse">
           <Lock className="w-4 h-4 mr-2" />
           REAL TRADING MODE ACTIVE - LIVE CAPITAL AT RISK
         </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Equity Card - Refined */}
        <div className={`glass-panel p-5 rounded-xl border-l-4 relative group transition-all duration-300 hover:scale-[1.02] ${settings.isPaperTrading ? 'border-primary-500 shadow-primary-900/10' : 'border-emerald-500 shadow-emerald-900/10'}`}>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    {settings.isPaperTrading ? 'Simulated Equity' : 'Real Net Equity'}
                  </p>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                </div>
                <div className={`p-2 rounded-lg ${settings.isPaperTrading ? 'bg-primary-500/20' : 'bg-emerald-500/20'}`}>
                  <DollarSign className={`w-5 h-5 ${settings.isPaperTrading ? 'text-primary-500' : 'text-emerald-500'}`} />
                </div>
              </div>
              
              <div className="mt-3 flex justify-between items-end">
                 <div className={`flex items-center text-sm ${isPnLPositive ? 'text-success' : 'text-danger'}`}>
                   {isPnLPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                   <span className="font-medium">${Math.abs(unrealizedPnL).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 </div>
                 <div className="text-[10px] text-gray-500 text-right">
                    <div>Cash: ${cashBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div>Held: ${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                 </div>
              </div>
              
              {/* Deposit Button Overlay */}
              <div className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setShowDepositModal(true)}
                  className={`text-white text-xs px-3 py-1.5 rounded shadow-lg flex items-center ${settings.isPaperTrading ? 'bg-primary-600 hover:bg-primary-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                >
                  <Plus className="w-3 h-3 mr-1" /> Deposit
                </button>
              </div>
            </>
          )}
        </div>

        <div className="glass-panel p-5 rounded-xl border-l-4 border-accent-500 transition-all duration-300 hover:translate-y-[-2px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Active Signals</p>
              <h2 className="text-2xl font-bold text-white mt-1">{isLoading ? <Skeleton className="h-8 w-12 inline-block"/> : '12'}</h2>
            </div>
            <div className="p-2 bg-accent-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-accent-500" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-400">
            8 Buy / 4 Sell signals active
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border-l-4 border-green-500 transition-all duration-300 hover:translate-y-[-2px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Win Rate (24h)</p>
              <h2 className="text-2xl font-bold text-white mt-1">{isLoading ? <Skeleton className="h-8 w-16 inline-block"/> : '68.5%'}</h2>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-400">
            Algo performance index
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border-l-4 border-orange-500 transition-all duration-300 hover:translate-y-[-2px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Market Volatility</p>
              <h2 className="text-2xl font-bold text-white mt-1">{isLoading ? <Skeleton className="h-8 w-16 inline-block"/> : 'High'}</h2>
            </div>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <BarChart2 className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-400">
            VIX Index: 24.5
          </div>
        </div>
      </div>

      {/* Main Chart & Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl relative transition-all hover:shadow-2xl hover:shadow-primary-900/5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              {isLoading || !activeStockData ? (
                 <Skeleton className="h-8 w-48" />
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-white">{activeStockData.name} ({activeStockData.symbol})</h3>
                  <span className={`text-sm font-bold ${activeStockData.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {activeStockData.price.toFixed(2)} ({activeStockData.changePercent}%)
                  </span>
                </>
              )}
            </div>
            <div className="flex space-x-2 items-center">
              {['1H', '1D', '1W', '1M', '1Y'].map((tf) => (
                <button 
                  key={tf} 
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs rounded-md transition-all duration-200 ${timeframe === tf ? 'bg-gray-700 text-white font-bold scale-105' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  {tf}
                </button>
              ))}
              <div className="h-6 w-px bg-gray-700 mx-2"></div>
              <button 
                onClick={() => setShowTradeModal(true)}
                disabled={!isStockLoaded}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95"
              >
                <Briefcase className="w-3 h-3" />
                <span>Place Order</span>
              </button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            {renderChart()}
          </div>
          
          {/* AI Strategy Section */}
          <div className="mt-6 pt-4 border-t border-gray-800 flex items-start space-x-4">
            <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30 shrink-0 animate-bounce-slow">
               <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
               <h4 className="text-sm font-bold text-white mb-1 flex items-center">
                 AI Strategic Session Outlook
                 <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded border border-purple-800 animate-pulse">GEMINI 2.5 FLASH</span>
               </h4>
               <p className="text-sm text-gray-300 leading-relaxed">
                 {isLoading ? <Skeleton className="h-4 w-full mt-2" /> : aiStrategy}
               </p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-white">Your Watchlist</h3>
             <button onClick={() => onNavigate(ViewState.SETTINGS)} className="text-primary-400 hover:text-primary-300 transition-colors">
               <Plus className="w-5 h-5" />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[400px]">
            {isLoading ? (
              Array.from({length: 5}).map((_, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-800 bg-gray-900/50">
                   <div className="flex justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-8 ml-auto" />
                      </div>
                   </div>
                </div>
              ))
            ) : settings.watchlist.map((ticker) => {
              const stock = getStock(ticker);
              // Fallback for demo if stock not in mock data
              const price = stock ? stock.price : 0;
              const change = stock ? stock.changePercent : 0;
              const isUp = parseFloat(change.toString()) >= 0;

              if (!stock) return null;

              return (
                <div 
                  key={ticker} 
                  onClick={() => setSelectedStock(ticker)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    selectedStock === ticker 
                    ? 'bg-gray-700/50 border-primary-500/50 shadow-lg' 
                    : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">{ticker}</span>
                      <span className="text-xs text-gray-400">{stock.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-mono">${price.toFixed(2)}</div>
                      <div className={`text-xs ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                        {isUp ? '+' : ''}{change}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Positions and History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Positions */}
        <div className="glass-panel p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-2 mb-4">
             <Layers className="w-5 h-5 text-gray-400" />
             <h3 className="text-lg font-semibold text-white">Your Positions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Symbol</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Avg Price</th>
                  <th className="px-4 py-3">Current</th>
                  <th className="px-4 py-3 rounded-r-lg">Unrealized PnL</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500 italic">
                      No active positions.
                    </td>
                  </tr>
                ) : (
                  portfolio.map((pos) => {
                    const stock = getStock(pos.symbol);
                    const currentPrice = stock ? stock.price : pos.avgPrice;
                    const pnl = (currentPrice - pos.avgPrice) * pos.quantity;
                    const pnlPercent = ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100;
                    
                    return (
                      <tr key={pos.symbol} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3 font-bold text-white">{pos.symbol}</td>
                        <td className="px-4 py-3 text-gray-300">{pos.quantity}</td>
                        <td className="px-4 py-3 text-gray-300">${pos.avgPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-300">${currentPrice.toFixed(2)}</td>
                        <td className={`px-4 py-3 font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent.toFixed(1)}%)
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trade History */}
        <div className="glass-panel p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-2 mb-4">
             <History className="w-5 h-5 text-gray-400" />
             <h3 className="text-lg font-semibold text-white">Recent Trade History</h3>
          </div>
          <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Time</th>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Side</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3 rounded-r-lg">Total</th>
                </tr>
              </thead>
              <tbody>
                {manualTrades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500 italic">
                      No manual trades recorded yet.
                    </td>
                  </tr>
                ) : (
                  manualTrades.slice(0, 10).map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{trade.timestamp}</td>
                      <td className="px-4 py-3 font-bold text-white">{trade.symbol}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          trade.action === 'BUY' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                        }`}>
                          {trade.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs">${trade.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-300 font-mono text-xs">${trade.total.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-primary-500" />
                Deposit Funds
              </h3>
              <button onClick={() => setShowDepositModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Amount (USD)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-bold">$</span>
                </div>
                <input 
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 text-lg font-mono transition-colors"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Adding to: <span className="font-bold text-gray-300">{settings.isPaperTrading ? 'Paper Trading Account' : 'Real Trading Account'}</span>
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDepositModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeposit}
                className="px-6 py-2 rounded-lg text-sm font-bold bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Trade Modal - Wrapped logic with loading check */}
      {showTradeModal && isStockLoaded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
             <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center">
                    Place Order: <span className="text-primary-400 ml-2">{activeStockData.symbol}</span>
                  </h3>
                  <p className="text-xs text-gray-400">Current Price: ${activeStockData.price.toFixed(2)}</p>
                </div>
                <button onClick={() => setShowTradeModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
             </div>

             <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
               <button 
                 onClick={() => setTradeAction('BUY')}
                 className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                   tradeAction === 'BUY' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-white'
                 }`}
               >
                 Buy
               </button>
               <button 
                 onClick={() => setTradeAction('SELL')}
                 className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                   tradeAction === 'SELL' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                 }`}
               >
                 Sell
               </button>
             </div>

             <div className="space-y-4 mb-6">
               <div>
                  <label className="block text-sm text-gray-400 mb-2">Quantity (Shares)</label>
                  <input 
                    type="number"
                    value={tradeQuantity}
                    onChange={(e) => setTradeQuantity(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 font-mono"
                  />
               </div>
               
               <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-400">Estimated Total</span>
                    <span className="font-bold text-white font-mono">
                      ${(parseFloat(tradeQuantity || '0') * activeStockData.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Buying Power</span>
                    <span className="text-gray-400">${cashBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
               </div>
             </div>

             <button 
               onClick={handleExecuteTrade}
               className={`w-full py-3 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center ${
                 tradeAction === 'BUY' 
                   ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20' 
                   : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
               }`}
             >
               {tradeAction === 'BUY' ? <TrendingUp className="w-5 h-5 mr-2" /> : <TrendingDown className="w-5 h-5 mr-2" />}
               Confirm {tradeAction} Order
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;