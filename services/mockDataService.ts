import { NewsItem, TradeSignal, StockData } from '../types';
import { MOCK_STOCKS } from '../constants';

const NEWS_SOURCES = ['Global Finance Wire', 'Tech Daily', 'Energy Markets Report', 'Crypto Insider', 'BioTech Weekly'];
const REGIONS = ['Global', 'US', 'EU', 'Asia'] as const;
const TICKERS = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMD', 'GOOGL', 'AMZN', 'META'];

const TEMPLATES = [
  { title: '{ticker} Reports Q3 Earnings Beat', summary: 'Revenue exceeds expectations by 15% driven by AI sector demand.', sentiment: 'Bullish' },
  { title: 'Regulatory Scrutiny Increases for {ticker}', summary: 'Antitrust investigation launched regarding recent acquisitions.', sentiment: 'Bearish' },
  { title: '{ticker} Announces Strategic Partnership', summary: 'New collaboration aims to accelerate next-gen product development.', sentiment: 'Bullish' },
  { title: 'Supply Chain Disruptions Hit {ticker}', summary: 'Component shortages may delay shipments for the upcoming quarter.', sentiment: 'Bearish' },
  { title: 'Analyst Upgrade for {ticker}', summary: 'Price target raised due to strong market positioning.', sentiment: 'Bullish' },
  { title: 'Market Volatility Impacts {ticker}', summary: 'Shares slide amidst broader tech sector sell-off.', sentiment: 'Bearish' },
  { title: '{ticker} Unveils New AI Chip', summary: 'Revolutionary architecture promises 2x performance gains.', sentiment: 'Bullish' },
  { title: 'CEO of {ticker} Steps Down', summary: 'Unexpected leadership change causes minor market turbulence.', sentiment: 'Neutral' },
];

export const fetchMockNewsUpdate = (): Promise<NewsItem> => {
  return new Promise((resolve) => {
    // Simulate network latency
    setTimeout(() => {
      const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
      const ticker = TICKERS[Math.floor(Math.random() * TICKERS.length)];
      const sentimentScore = template.sentiment === 'Bullish' ? 0.6 + Math.random() * 0.3 : 
                             template.sentiment === 'Bearish' ? -0.6 - Math.random() * 0.3 : 
                             Math.random() * 0.2 - 0.1;

      const newsItem: NewsItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: template.title.replace('{ticker}', ticker),
        source: NEWS_SOURCES[Math.floor(Math.random() * NEWS_SOURCES.length)],
        time: 'Just now',
        summary: template.summary.replace('{ticker}', ticker),
        sentiment: template.sentiment as 'Bullish' | 'Bearish' | 'Neutral',
        sentimentScore: parseFloat(sentimentScore.toFixed(2)),
        relatedTickers: [ticker],
        region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      };
      resolve(newsItem);
    }, 500);
  });
};

export const generateMockTrade = (): { profit: number; symbol: string; action: 'BUY' | 'SELL' } => {
  const isProfit = Math.random() > 0.35; // 65% win rate simulation
  const profit = isProfit ? (Math.random() * 150 + 50) : -(Math.random() * 80 + 20);
  const symbol = TICKERS[Math.floor(Math.random() * TICKERS.length)];
  const action = Math.random() > 0.5 ? 'BUY' : 'SELL';
  
  return {
    profit: parseFloat(profit.toFixed(2)),
    symbol,
    action
  };
};

export const getInitialMarketData = (): StockData[] => {
  return [...MOCK_STOCKS];
};

export const simulateMarketUpdates = (currentStocks: StockData[]): StockData[] => {
  return currentStocks.map(stock => {
    // Simulate slight price movement (volatility around 0.3%)
    const volatility = 0.003; 
    const changePercent = (Math.random() * volatility * 2) - volatility;
    const changeAmount = stock.price * changePercent;
    let newPrice = stock.price + changeAmount;
    
    // Sanity check to prevent negative prices
    if (newPrice < 0.01) newPrice = 0.01;

    // Update history - keep last 20 points
    const now = new Date();
    const timeString = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
    
    const newHistoryPoint = {
        time: timeString,
        value: parseFloat(newPrice.toFixed(2))
    };
    
    // Shift old history, push new. Assuming mocked data has enough history points.
    const newHistory = [...stock.history.slice(1), newHistoryPoint];

    const startPrice = stock.history[0].value;
    const totalChange = newPrice - startPrice;
    const totalChangePercent = (totalChange / startPrice) * 100;

    return {
      ...stock,
      price: parseFloat(newPrice.toFixed(2)),
      change: parseFloat(totalChange.toFixed(2)),
      changePercent: parseFloat(totalChangePercent.toFixed(2)),
      history: newHistory
    };
  });
};