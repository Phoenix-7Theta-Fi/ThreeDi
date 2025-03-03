import React from 'react';
import { TradingStrategy, MarketCap, TradeExecution } from '../../types/chart';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  searchQuery: string;
  strategy: TradingStrategy | 'all';
  marketCap: MarketCap | 'all';
  execution: TradeExecution | 'all';
  onSearchChange: (query: string) => void;
  onStrategyChange: (strategy: TradingStrategy | 'all') => void;
  onMarketCapChange: (marketCap: MarketCap | 'all') => void;
  onExecutionChange: (execution: TradeExecution | 'all') => void;
}

const TRADING_STRATEGIES = [
  { value: 'all', label: 'All Strategies' },
  { value: 'momentum', label: 'Momentum Trading' },
  { value: 'price_action', label: 'Price Action' },
  { value: 'swing', label: 'Swing Trading' },
  { value: 'scalping', label: 'Scalping' },
  { value: 'breakout', label: 'Breakout Trading' },
  { value: 'trend_following', label: 'Trend Following' },
  { value: 'reversal', label: 'Reversal Trading' },
  { value: 'support_resistance', label: 'Support & Resistance' },
  { value: 'channel', label: 'Channel Trading' },
  { value: 'gap', label: 'Gap Trading' },
  { value: 'vwap', label: 'VWAP Trading' },
  { value: 'other', label: 'Other' },
];

const MARKET_CAP_OPTIONS = [
  { value: 'all', label: 'All Market Caps' },
  { value: 'small_cap', label: 'Small Cap' },
  { value: 'large_cap', label: 'Large Cap' },
];

const EXECUTION_OPTIONS = [
  { value: 'all', label: 'All Trades' },
  { value: 'executed', label: 'Executed' },
  { value: 'not_executed', label: 'Not Executed' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  strategy,
  marketCap,
  execution,
  onSearchChange,
  onStrategyChange,
  onMarketCapChange,
  onExecutionChange,
}) => {
  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Search by chart name or symbol..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />
      
      <div className={styles.filters}>
        <div className={styles.select}>
          <label className={styles.selectLabel}>Strategy</label>
          <select
            value={strategy}
            onChange={(e) => onStrategyChange(e.target.value as TradingStrategy | 'all')}
            className={styles.selectInput}
          >
            {TRADING_STRATEGIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.select}>
          <label className={styles.selectLabel}>Market Cap</label>
          <select
            value={marketCap}
            onChange={(e) => onMarketCapChange(e.target.value as MarketCap | 'all')}
            className={styles.selectInput}
          >
            {MARKET_CAP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.select}>
          <label className={styles.selectLabel}>Execution</label>
          <select
            value={execution}
            onChange={(e) => onExecutionChange(e.target.value as TradeExecution | 'all')}
            className={styles.selectInput}
          >
            {EXECUTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
