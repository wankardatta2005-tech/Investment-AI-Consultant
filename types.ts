export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  name: string;
  sector: string;
  history: { time: string; value: number }[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentScore: number; // -1 to 1
  impactAnalysis?: string; // Populated by AI
  relatedTickers: string[];
  region: 'Global' | 'US' | 'EU' | 'Asia';
}

export interface TradeSignal {
  id: string;
  ticker: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  timestamp: string;
  horizon: 'Short-term' | 'Mid-term' | 'Long-term';
}

export interface BotLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  NEWS_ANALYSIS = 'NEWS_ANALYSIS',
  ALGO_BOT = 'ALGO_BOT',
  SETTINGS = 'SETTINGS'
}

export interface UserSettings {
  watchlist: string[];
  alertThreshold: number; // 0 to 1
  chartType: 'area' | 'line' | 'bar';
  isPaperTrading: boolean;
  botRiskLevel: 'Low' | 'Moderate' | 'High';
  botMaxDrawdown: number;
  notificationsEnabled: boolean;
  realBalance: number;
  paperBalance: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

export interface ManualTrade {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  timestamp: string;
  status: 'FILLED' | 'PENDING';
}

export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
}

export interface OnboardingStep {
  targetView: ViewState;
  title: string;
  content: string;
  highlightSelector?: string; // CSS selector to highlight if needed (simplified for this implementation)
}

export interface UserProfile {
  email: string;
  pin: string;
  isAdmin: boolean;
  mobile?: string;
}