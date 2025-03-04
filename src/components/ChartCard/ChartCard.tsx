import React, { useState, useEffect } from 'react';
import ImageCarousel from '../ImageCarousel/ImageCarousel';
import { ChartEntry } from '../../types/chart';
import styles from './ChartCard.module.css';

interface ChartCardProps {
  chart: ChartEntry;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

const ChartCard: React.FC<ChartCardProps> = ({ chart, onClick, onDelete }) => {
  const [showInfo, setShowInfo] = useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const infoButtonRef = React.useRef<HTMLButtonElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showInfo && 
          popoverRef.current && 
          infoButtonRef.current &&
          !popoverRef.current.contains(event.target as Node) &&
          !infoButtonRef.current.contains(event.target as Node)) {
        setShowInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInfo]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when deleting
    if (onDelete && window.confirm('Are you sure you want to delete this chart?')) {
      onDelete(chart.id);
    }
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when showing info
    setShowInfo(!showInfo);
  };

  const handleCardClick = () => {
    setShowInfo(false); // Hide info when card is clicked
    onClick();
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.imageWrapper}>
        {chart.notes && (
          <>
            <button
              ref={infoButtonRef}
              className={styles.infoButton}
              onClick={handleInfoClick}
              title="View notes"
              aria-label="View notes"
            >
              i
            </button>
            <div 
              ref={popoverRef}
              className={`${styles.popover} ${showInfo ? styles.visible : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.popoverHeader}>Chart Notes</div>
              <div className={styles.popoverContent}>{chart.notes}</div>
            </div>
          </>
        )}
        <ImageCarousel
          images={chart.imageUrls}
          onImageClick={(imageUrl) => {
            window.open(imageUrl, '_blank');
          }}
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <div className={styles.contentText}>
          <h3 className={styles.title}>{chart.chartName}</h3>
          <p className={styles.symbol}>{chart.stockSymbol}</p>
        </div>
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
      </div>
    </div>
  );
};

export default ChartCard;
