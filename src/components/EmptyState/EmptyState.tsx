import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  isFiltered: boolean;
  onAddClick: () => void;
  onResetFilters?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ isFiltered, onAddClick, onResetFilters }) => {
  return (
    <div className={styles.container}>
      {isFiltered ? (
        <>
          <h3 className={styles.title}>No charts match your filters</h3>
          <p className={styles.description}>
            Try adjusting your search criteria or clear the filters to see more charts.
          </p>
          {onResetFilters && (
            <button onClick={onResetFilters} className={styles.button}>
              Clear Filters
            </button>
          )}
        </>
      ) : (
        <>
          <h3 className={styles.title}>No charts yet</h3>
          <p className={styles.description}>
            Start by uploading your first trading chart to begin building your journal.
          </p>
          <button onClick={onAddClick} className={styles.button}>
            Upload Chart
          </button>
        </>
      )}
    </div>
  );
};

export default EmptyState;
