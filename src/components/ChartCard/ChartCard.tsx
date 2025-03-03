import React from 'react';
import { ChartEntry } from '../../types/chart';
import styles from './ChartCard.module.css';

interface ChartCardProps {
  chart: ChartEntry;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

const ChartCard: React.FC<ChartCardProps> = ({ chart, onClick, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when deleting
    if (onDelete && window.confirm('Are you sure you want to delete this chart?')) {
      onDelete(chart.id);
    }
  };

  return (
    <div className={styles.card} onClick={onClick}>
      {onDelete && (
        <button 
          className={styles.deleteButton}
          onClick={handleDelete}
          title="Delete chart"
          aria-label="Delete chart"
        >
          ×
        </button>
      )}
      <img
        src={chart.imageUrl}
        alt={chart.chartName}
        className={styles.image}
      />
      <div className={styles.content}>
        <h3 className={styles.title}>{chart.chartName}</h3>
        <p className={styles.symbol}>{chart.stockSymbol}</p>
      </div>
    </div>
  );
};

export default ChartCard;
