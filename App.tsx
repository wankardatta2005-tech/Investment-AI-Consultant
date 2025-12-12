import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Newspaper, Bot, Settings, Bell, User, HelpCircle, Check, Trash2, X, Info, AlertTriangle, CheckCircle, LogOut, Lock } from 'lucide-react';
import { ViewState, UserSettings, Notification, ManualTrade, Position, UserProfile } from './types';
import DashboardView from './components/DashboardView';
import NewsAnalysisView from './components/NewsAnalysisView';
import AlgoBotView from './components/AlgoBotView';
import SettingsView from './components/SettingsView';
import OnboardingTutorial from './components/OnboardingTutorial';
import AiAssistant from './components/AiAssistant';
import AuthView from './components/AuthView';
import PinLockView from './components/PinLockView';
import UserProfileModal from './components/UserProfileModal';
import { MarketDataProvider } from './contexts/MarketDataContext';

const DEFAULT_SETTINGS: UserSettings = {
  watchlist: ['NVDA', 'TSLA', 'AAPL'],
  alertThreshold: 0.8,
  chartType: 'area',
  isPaperTrading: true,
  botRiskLevel: 'Moderate',
  botMaxDrawdown: 5.0,
  notificationsEnabled: true,
  realBalance: 124592.50,
  paperBalance: 500000.00
};

const App: React.FC = () => {
  // Helper to safely get user from storage
  const getUserFromStorage = (): UserProfile | null => {
    try {
      const stored = localStorage.getItem('quantai_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email && parsed.pin) {
           return { 
             email: parsed.email, 
             pin: parsed.pin, 
             isAdmin: true,
             mobile: parsed.mobile 
           };
        }
      }
      return null;
    } catch (e) {
      console.error("Failed to parse user storage", e);
      return null;
    }
  };

  const getSettingsFromStorage = (): UserSettings => {
    try {
      const stored = localStorage.getItem('quantai_settings');
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error("Failed to parse settings", e);
    }
    return DEFAULT_SETTINGS;
  };

  // Auth State - Initialize lazily to prevent flash of content
  const [userProfile, setUserProfile] = useState<UserProfile | null>(getUserFromStorage);
  
  // If user exists in storage, they are authenticated but locked by default on app open
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getUserFromStorage());
  const [isLocked, setIsLocked] = useState<boolean>(() => !!getUserFromStorage());

  // App State
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [settings, setSettings] = useState<UserSettings>(getSettingsFromStorage);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Welcome to QuantAI', message: 'System initialized successfully.', time: 'Just now', type: 'success', read: false }
  ]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Manual Trade History & Portfolio State
  const [manualTrades, setManualTrades] = useState<ManualTrade[]>([]);
  const [portfolio, setPortfolio] = useState<Position[]>([]);

  // Persist settings whenever they change
  useEffect(() => {
    localStorage.setItem('quantai_settings', JSON.stringify(settings));
  }, [settings]);

  const handleAuthSuccess = (profile: UserProfile, initialSettings?: Partial<UserSettings>, isNewUser?: boolean) => {
    setUserProfile(profile);
    if (initialSettings) {
      setSettings(prev => ({ ...prev, ...initialSettings }));
    }
    setIsAuthenticated(true);
    setIsLocked(false); // Unlock immediately on login/signup
    
    if (isNewUser) {
      setShowTutorial(true); // Only show tutorial for new user signup
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLocked(true);
  };

  const addNotification = (title: string, message: string, type: Notification['type'] = 'info') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      time: 'Just now',
      type,
      read: false
    };
    
    // Add to history
    setNotifications(prev => [newNotif, ...prev]);

    // Show toast if enabled
    if (settings.notificationsEnabled) {
      setToasts(prev => [...prev, newNotif]);
      setTimeout(() => {
        removeToast(newNotif.id);
      }, 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  const handleAddManualTrade = (trade: ManualTrade) => {
    setManualTrades(prev => [trade, ...prev]);

    // Update Portfolio Position
    setPortfolio(prev => {
      const existing = prev.find(p => p.symbol === trade.symbol);
      
      if (trade.action === 'BUY') {
        if (existing) {
          // Weighted Average Price calculation
          const totalCost = (existing.quantity * existing.avgPrice) + (trade.quantity * trade.price);
          const newQty = existing.quantity + trade.quantity;
          return prev.map(p => p.symbol === trade.symbol ? { ...p, quantity: newQty, avgPrice: totalCost / newQty } : p);
        } else {
          return [...prev, { symbol: trade.symbol, quantity: trade.quantity, avgPrice: trade.price }];
        }
      } else {
        // SELL Logic (FIFO/Avg Cost simplified: just reduce qty)
        if (existing) {
          const newQty = existing.quantity - trade.quantity;
          if (newQty <= 0) {
            return prev.filter(p => p.symbol !== trade.symbol);
          }
          return prev.map(p => p.symbol === trade.symbol ? { ...p, quantity: newQty } : p);
        }
        return prev;
      }
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderView = () => {
    switch(currentView) {
      case ViewState.DASHBOARD: 
        return <DashboardView 
                  settings={settings} 
                  onNavigate={setCurrentView} 
                  onUpdateSettings={setSettings}
                  addNotification={addNotification}
                  manualTrades={manualTrades}
                  portfolio={portfolio}
                  onAddTrade={handleAddManualTrade}
               />;
      case ViewState.NEWS_ANALYSIS: 
        return <NewsAnalysisView onNavigate={setCurrentView} />;
      case ViewState.ALGO_BOT: 
        return <AlgoBotView 
                  settings={settings} 
                  onNavigate={setCurrentView} 
                  addNotification={addNotification}
                  onUpdateSettings={setSettings}
               />;
      case ViewState.SETTINGS: 
        return <SettingsView settings={settings} onUpdateSettings={setSettings} />;
      default: return null;
    }
  };

  // Auth Flow Rendering
  if (!isAuthenticated) {
    return <AuthView onAuthentication={handleAuthSuccess} />;
  }

  if (isLocked && userProfile) {
    return (
      <PinLockView 
        correctPin={userProfile.pin} 
        onUnlock={() => setIsLocked(false)} 
        email={userProfile.email}
      />
    );
  }

  return (
    <MarketDataProvider>
      <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans relative">
        {/* Toast Notifications */}
        <div className="fixed top-20 right-6 z-[60] flex flex-col space-y-3 pointer-events-none">
          {toasts.map((toast) => (
            <div 
              key={toast.id} 
              className="pointer-events-auto w-80 bg-gray-900/95 backdrop-blur-md border border-gray-700 p-4 rounded-xl shadow-2xl flex items-start space-x-3 animate-in slide-in-from-right-full fade-in duration-300"
            >
              <div className={`mt-0.5 ${
                toast.type === 'error' ? 'text-red-500' :
                toast.type === 'success' ? 'text-green-500' :
                toast.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
              }`}>
                {toast.type === 'error' && <AlertTriangle className="w-5 h-5" />}
                {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                {toast.type === 'info' && <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white mb-1">{toast.title}</h4>
                <p className="text-xs text-gray-300 leading-snug break-words">{toast.message}</p>
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Onboarding Overlay */}
        {showTutorial && (
          <OnboardingTutorial 
            currentView={currentView}
            onNavigate={setCurrentView}
            onClose={() => setShowTutorial(false)}
          />
        )}
        
        {/* Profile Modal */}
        <UserProfileModal 
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userProfile={userProfile}
          settings={settings}
          portfolio={portfolio}
        />

        {/* AI Assistant Floating Widget */}
        <AiAssistant />

        {/* Sidebar */}
        <aside className="w-20 md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0 transition-all duration-300">
          <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-800">
            <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/30">
              Q
            </div>
            <span className="ml-3 font-bold text-xl hidden md:block bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              QuantAI
            </span>
          </div>

          <nav className="flex-1 py-6 px-2 md:px-4 space-y-2">
            <NavItem 
              icon={<LayoutDashboard />} 
              label="Dashboard" 
              isActive={currentView === ViewState.DASHBOARD}
              onClick={() => setCurrentView(ViewState.DASHBOARD)}
            />
            <NavItem 
              icon={<Newspaper />} 
              label="Intelligence" 
              isActive={currentView === ViewState.NEWS_ANALYSIS}
              onClick={() => setCurrentView(ViewState.NEWS_ANALYSIS)}
            />
            <NavItem 
              icon={<Bot />} 
              label="Algo Bot" 
              isActive={currentView === ViewState.ALGO_BOT}
              onClick={() => setCurrentView(ViewState.ALGO_BOT)}
            />
            <div className="pt-4 mt-4 border-t border-gray-800">
              <NavItem 
                icon={<Settings />} 
                label="Settings" 
                isActive={currentView === ViewState.SETTINGS}
                onClick={() => setCurrentView(ViewState.SETTINGS)}
              />
            </div>
          </nav>

          <div className="p-4 border-t border-gray-800 hidden md:block">
            <button 
              onClick={() => setShowTutorial(true)}
              className="w-full flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-xs font-bold transition-colors mb-3"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Restart Tutorial</span>
            </button>
            
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 uppercase font-bold mb-1">API Status</div>
              <div className="flex items-center text-green-400 text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Gemini Online
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Header */}
          <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 z-10">
            <div>
              <h1 className="text-xl font-semibold text-white">
                {currentView === ViewState.DASHBOARD && 'Market Overview'}
                {currentView === ViewState.NEWS_ANALYSIS && 'Global Intelligence'}
                {currentView === ViewState.ALGO_BOT && 'Algorithmic Execution'}
                {currentView === ViewState.SETTINGS && 'System Configuration'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              
              {/* Animated Trading Mode Switch */}
              <button 
                onClick={() => setSettings(s => ({...s, isPaperTrading: !s.isPaperTrading}))}
                className={`hidden sm:flex items-center px-3 py-1.5 rounded-full border transition-all duration-300 group ${
                  settings.isPaperTrading 
                  ? 'bg-primary-900/30 border-primary-500/50 hover:bg-primary-900/50' 
                  : 'bg-emerald-900/30 border-emerald-500/50 hover:bg-emerald-900/50'
                }`}
                title="Toggle Trading Mode"
              >
                <div className={`w-2 h-2 rounded-full mr-2 transition-colors ${settings.isPaperTrading ? 'bg-primary-400' : 'bg-emerald-400'}`}></div>
                <span className={`text-xs font-bold transition-colors ${settings.isPaperTrading ? 'text-primary-200' : 'text-emerald-200'}`}>
                  {settings.isPaperTrading ? 'Paper Trading' : 'Real Trading'}
                </span>
                <span className="ml-2 text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">Switch</span>
              </button>
              
              {/* Notification Bell */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                      <h3 className="font-bold text-sm text-white">Notifications</h3>
                      <div className="flex space-x-2">
                        <button onClick={markAllRead} className="text-xs text-gray-400 hover:text-white" title="Mark all read">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={clearNotifications} className="text-xs text-gray-400 hover:text-white" title="Clear all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">No new notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${!n.read ? 'bg-gray-800/20' : ''}`}>
                            <div className="flex items-start justify-between">
                              <h4 className={`text-sm font-semibold mb-1 ${
                                n.type === 'error' ? 'text-red-400' :
                                n.type === 'success' ? 'text-green-400' :
                                n.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                              }`}>{n.title}</h4>
                              <span className="text-[10px] text-gray-500">{n.time}</span>
                            </div>
                            <p className="text-xs text-gray-400 leading-snug">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div 
                className="flex items-center space-x-3 pl-4 border-l border-gray-800 cursor-pointer hover:bg-gray-800/50 p-2 rounded-lg transition-colors group"
                onClick={() => setShowProfileModal(true)}
              >
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">{userProfile?.email || 'Admin'}</div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-gray-600 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                
                <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors" title="Lock System">
                  <Lock className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* View Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-gray-950 to-gray-900">
            {renderView()}
          </div>
        </main>
      </div>
    </MarketDataProvider>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center md:justify-start p-3 rounded-lg transition-all duration-200 group ${
      isActive 
      ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' 
      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}
  >
    <div className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <span className={`ml-3 font-medium hidden md:block`}>{label}</span>
  </button>
);

export default App;