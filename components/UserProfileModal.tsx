import React from 'react';
import { X, User, Shield, Wallet, TrendingUp, TrendingDown, Mail, Hash, Phone } from 'lucide-react';
import { UserProfile, UserSettings, Position } from '../types';
import { useMarketData } from '../contexts/MarketDataContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  settings: UserSettings;
  portfolio: Position[];
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  userProfile, 
  settings, 
  portfolio 
}) => {
  const { getStock } = useMarketData();

  if (!isOpen) return null;

  // Calculate Finances
  const cashBalance = settings.isPaperTrading ? settings.paperBalance : settings.realBalance;
  
  let portfolioValue = 0;
  let costBasis = 0;

  portfolio.forEach(pos => {
    const stock = getStock(pos.symbol);
    const currentPrice = stock ? stock.price : pos.avgPrice;
    
    portfolioValue += pos.quantity * currentPrice;
    costBasis += pos.quantity * pos.avgPrice;
  });

  const totalEquity = cashBalance + portfolioValue;
  const unrealizedPnL = portfolioValue - costBasis;
  const isPnLPositive = unrealizedPnL >= 0;
  const pnlPercent = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary-900/50 to-gray-900 z-0"></div>

        {/* Header */}
        <div className="p-6 relative z-10 flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border-4 border-gray-800 shadow-xl">
               <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
                 <User className="w-10 h-10 text-white" />
               </div>
            </div>
            <div className="mt-2">
              <h2 className="text-xl font-bold text-white">Administrator</h2>
              <div className="flex items-center text-primary-400 text-sm font-medium">
                <Shield className="w-3 h-3 mr-1" />
                <span>Super Admin Access</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-gray-800/80 backdrop-blur rounded-lg p-2 hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-6 relative z-10">
          
          {/* User Details */}
          <div className="space-y-3">
             <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-700/50 rounded-lg mr-3">
                    <Mail className="w-4 h-4 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Email Address</p>
                    <p className="text-sm text-white font-medium">{userProfile?.email || 'admin@quantai.com'}</p>
                  </div>
                </div>
             </div>
             
             {userProfile?.mobile && (
               <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-700/50 rounded-lg mr-3">
                      <Phone className="w-4 h-4 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Mobile Number</p>
                      <p className="text-sm text-white font-medium">{userProfile.mobile}</p>
                    </div>
                  </div>
               </div>
             )}
             
             <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-700/50 rounded-lg mr-3">
                    <Hash className="w-4 h-4 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Security PIN</p>
                    <p className="text-sm text-white font-mono font-medium tracking-widest">••••</p>
                  </div>
                </div>
                <span className="text-xs text-green-500 font-medium px-2 py-1 bg-green-900/20 rounded">Active</span>
             </div>
          </div>

          {/* Divider */}
          <div className="flex items-center space-x-2 text-gray-500 text-xs uppercase font-bold tracking-wider">
            <div className="h-px bg-gray-800 flex-1"></div>
            <span>Portfolio Health</span>
            <div className="h-px bg-gray-800 flex-1"></div>
          </div>

          {/* Financial Overview */}
          <div>
            <div className={`p-5 rounded-2xl border ${isPnLPositive ? 'bg-gradient-to-r from-green-900/20 to-gray-900 border-green-900/50' : 'bg-gradient-to-r from-red-900/20 to-gray-900 border-red-900/50'} mb-4`}>
              <div className="flex justify-between items-start mb-2">
                 <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Net PnL (Open)</div>
                 <div className={`p-1.5 rounded-lg ${isPnLPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                   {isPnLPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                 </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <h3 className={`text-3xl font-bold font-mono ${isPnLPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPnLPositive ? '+' : ''}{unrealizedPnL.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </h3>
                <span className={`text-sm font-bold ${isPnLPositive ? 'text-green-500' : 'text-red-500'}`}>
                   {pnlPercent.toFixed(2)}%
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                 <div className="flex items-center mb-2">
                   <Wallet className="w-3 h-3 text-primary-500 mr-2" />
                   <p className="text-xs text-gray-500 uppercase font-bold">Remaining Funds</p>
                 </div>
                 <p className="text-lg font-bold text-white font-mono">
                   ${cashBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                 </p>
                 <p className="text-[10px] text-gray-500 mt-1">{settings.isPaperTrading ? 'Virtual Cash' : 'Real Cash'}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                 <div className="flex items-center mb-2">
                   <Shield className="w-3 h-3 text-accent-500 mr-2" />
                   <p className="text-xs text-gray-500 uppercase font-bold">Total Equity</p>
                 </div>
                 <p className="text-lg font-bold text-white font-mono">
                   ${totalEquity.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                 </p>
                 <p className="text-[10px] text-gray-500 mt-1">Cash + Positions</p>
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="bg-gray-800/80 p-3 border-t border-gray-700 flex justify-between items-center px-6">
          <p className="text-[10px] text-gray-500">
            Session ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}
          </p>
          <p className="text-[10px] text-gray-500">
            QuantAI v2.1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;