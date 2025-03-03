import React from 'react';
import { ChartEntry } from '../../types/chart';
import ChartCard from '../ChartCard/ChartCard';
import EmptyState from '../EmptyState/EmptyState';
import styles from './ChartGrid.module.css';

interface ChartGridProps {
  charts: ChartEntry[];
  onChartClick: (chart: ChartEntry) => void;
  onAddChart: () => void;
  onDeleteChart?: (id: string) => Promise<void>;
  isFiltered?: boolean;
  onResetFilters?: () => void;
}

const ChartGrid: React.FC<ChartGridProps> = ({
  charts,
  onChartClick,
  onAddChart,
  onDeleteChart,
  isFiltered = false,
  onResetFilters,
}) => {
  if (charts.length === 0) {
    return (
      <EmptyState
        isFiltered={isFiltered}
        onAddClick={onAddChart}
        onResetFilters={onResetFilters}
      />
    );
  }

  return (
    <div className={styles.grid}>
      {charts.map((chart) => (
        <ChartCard
          key={chart.id}
          chart={chart}
          onClick={() => onChartClick(chart)}
          onDelete={onDeleteChart}
        />
      ))}
    </div>
  );
};

export default ChartGrid;
