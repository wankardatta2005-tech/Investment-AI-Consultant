import { StockData, NewsItem, TradeSignal } from './types';

export const MOCK_STOCKS: StockData[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp',
    sector: 'Technology',
    price: 124.50,
    change: 3.20,
    changePercent: 2.64,
    volume: '45.2M',
    marketCap: '3.1T',
    history: Array.from({ length: 20 }, (_, i) => ({
      time: `${10 + i}:00`,
      value: 120 + Math.random() * 10 - 2
    }))
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc',
    sector: 'Auto',
    price: 175.30,
    change: -1.50,
    changePercent: -0.85,
    volume: '28.1M',
    marketCap: '580B',
    history: Array.from({ length: 20 }, (_, i) => ({
      time: `${10 + i}:00`,
      value: 178 + Math.random() * 8 - 5
    }))
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc',
    sector: 'Consumer Electronics',
    price: 210.15,
    change: 0.45,
    changePercent: 0.21,
    volume: '15.6M',
    marketCap: '3.2T',
    history: Array.from({ length: 20 }, (_, i) => ({
      time: `${10 + i}:00`,
      value: 209 + Math.random() * 4
    }))
  }
];

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Federal Reserve Signals Potential Rate Cut in Q3',
    source: 'Global Finance Wire',
    time: '10 mins ago',
    summary: 'Central bank officials hint at easing monetary policy as inflation metrics stabilize across key sectors.',
    sentiment: 'Bullish',
    sentimentScore: 0.75,
    relatedTickers: ['SPY', 'QQQ', 'TLT'],
    region: 'US'
  },
  {
    id: '2',
    title: 'New Semiconductor Trade Restrictions Announced by EU',
    source: 'Tech Daily',
    time: '45 mins ago',
    summary: 'European Union implements stricter export controls on advanced chip manufacturing equipment.',
    sentiment: 'Bearish',
    sentimentScore: -0.6,
    relatedTickers: ['ASML', 'INTC', 'AMD'],
    region: 'EU'
  },
  {
    id: '3',
    title: 'Oil Prices Surge Amidst Middle East Tensions',
    source: 'Energy Markets Report',
    time: '2 hours ago',
    summary: 'Geopolitical instability in key shipping lanes drives crude oil futures to a 3-month high.',
    sentiment: 'Neutral',
    sentimentScore: 0.1,
    relatedTickers: ['XOM', 'CVX', 'USO'],
    region: 'Global'
  }
];

export const MOCK_SIGNALS: TradeSignal[] = [
  {
    id: 's1',
    ticker: 'NVDA',
    action: 'BUY',
    confidence: 88,
    reasoning: 'Strong momentum interacting with positive sector news regarding AI chip demand.',
    timestamp: '10:45 AM',
    horizon: 'Short-term'
  },
  {
    id: 's2',
    ticker: 'TSLA',
    action: 'HOLD',
    confidence: 60,
    reasoning: 'Price consolidation observed. Waiting for breakout confirmation above 180.',
    timestamp: '09:30 AM',
    horizon: 'Mid-term'
  }
];