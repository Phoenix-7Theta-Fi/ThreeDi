import React, { useState, useEffect } from 'react';
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

const ALL_STRATEGY_OPTION = { value: 'all', label: 'All Strategies' };

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
  const [strategies, setStrategies] = useState<Array<{ value: string; label: string }>>([ALL_STRATEGY_OPTION]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/strategies');
      if (!response.ok) throw new Error('Failed to fetch strategies');
      const data = await response.json();
      
      // Combine "All Strategies" with fetched strategies
      setStrategies([ALL_STRATEGY_OPTION, ...data]);
      setError('');
    } catch (error) {
      console.error('Error fetching strategies:', error);
      setError('Failed to load strategies');
    } finally {
      setIsLoading(false);
    }
  };
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
            className={`${styles.selectInput} ${isLoading ? styles.loading : ''}`}
            disabled={isLoading}
          >
            {strategies.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <div className={styles.error}>{error}</div>}
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
