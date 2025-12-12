import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StockData } from '../types';
import { getInitialMarketData, simulateMarketUpdates } from '../services/mockDataService';

interface MarketDataContextType {
  stocks: StockData[];
  getStock: (symbol: string) => StockData | undefined;
  isLoading: boolean;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export const MarketDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial load
    setStocks(getInitialMarketData());
    setIsLoading(false);

    // Simulation interval
    const interval = setInterval(() => {
      setStocks(prev => simulateMarketUpdates(prev));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const getStock = (symbol: string) => stocks.find(s => s.symbol === symbol);

  return (
    <MarketDataContext.Provider value={{ stocks, getStock, isLoading }}>
      {children}
    </MarketDataContext.Provider>
  );
};

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (context === undefined) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
};