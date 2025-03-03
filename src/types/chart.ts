export type TradingStrategy =
  | 'momentum'
  | 'price_action'
  | 'swing'
  | 'scalping'
  | 'breakout'
  | 'trend_following'
  | 'reversal'
  | 'support_resistance'
  | 'channel'
  | 'gap'
  | 'vwap'
  | 'other';

export type MarketCap = 'small_cap' | 'large_cap';
export type TradeExecution = 'executed' | 'not_executed';

export interface ChartEntry {
  id: string;
  chartName: string;
  stockSymbol: string;
  date: string;
  imageUrl: string;
  strategy: TradingStrategy;
  execution: TradeExecution;
  marketCap: MarketCap;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChartFormData {
  chartName: string;
  stockSymbol: string;
  date: string;
  strategy: TradingStrategy;
  execution: TradeExecution;
  marketCap: MarketCap;
  tags: string;
  notes: string;
  imageFile?: File | null;
  imageUrl?: string;
}

export interface DateFilter {
  startDate: string;
  endDate: string;
}
