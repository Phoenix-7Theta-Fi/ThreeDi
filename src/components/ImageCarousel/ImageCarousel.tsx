import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useCarousel } from '../../hooks/useCarousel';
import styles from './ImageCarousel.module.css';

interface ImageCarouselProps {
  images: string[];
  onImageClick?: (imageUrl: string) => void;
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  onImageClick,
  className = '',
}) => {
  const { currentIndex, next, prev, goto } = useCarousel(images.length);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;

      const touchEnd = e.touches[0].clientX;
      const diff = touchStart - touchEnd;

      // Minimum swipe distance of 50px
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          next();
        } else {
          prev();
        }
        setTouchStart(null);
      }
    },
    [touchStart, next, prev]
  );

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  return (
    <div
      className={`${styles.carousel} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.imageWrapper}>
        {images.map((image, index) => (
          <div
            key={image}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: index === currentIndex ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              pointerEvents: index === currentIndex ? 'auto' : 'none',
            }}
          >
            <Image
              src={image}
              alt={`Image ${index + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              onClick={() => onImageClick?.(image)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            className={`${styles.navigationButton} ${styles.prev}`}
            onClick={prev}
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            className={`${styles.navigationButton} ${styles.next}`}
            onClick={next}
            aria-label="Next image"
          >
            ›
          </button>

          <div className={styles.dots}>
            {images.map((_, index) => (
              <span
                key={index}
                className={`${styles.dot} ${
                  index === currentIndex ? styles.active : ''
                }`}
                onClick={() => goto(index)}
              />
            ))}
          </div>

          <div className={styles.counter}>
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
