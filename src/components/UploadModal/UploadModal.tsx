import React, { useState, useEffect, useCallback } from 'react';
import { ChartFormData } from '../../types/chart';
import { UploadDropzone, uploadDropzoneConfig } from '../../lib/uploadthing';
import { getTodayString } from '../../utils/dateHelpers';
import DateFilter from '../DateFilter/DateFilter';
import Image from 'next/image';
import styles from './UploadModal.module.css';
import StrategyManager from '../StrategyManager/StrategyManager';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Omit<ChartFormData, 'imageFile'>>({
    chartName: '',
    stockSymbol: '',
    date: getTodayString(),
    strategy: 'price_action',
    execution: 'not_executed',
    marketCap: 'large_cap',
    tags: '',
    notes: '',
  });

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [strategies, setStrategies] = useState<{ value: string; label: string }[]>([]);
  const [isStrategyManagerOpen, setIsStrategyManagerOpen] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchStrategies = useCallback(async () => {
    try {
      const response = await fetch('/api/strategies');
      if (!response.ok) throw new Error('Failed to fetch strategies');
      const data = await response.json();
      setStrategies(data);
      
      // If current strategy is not in the list, set to first available strategy
      if (data.length > 0 && !data.find((s: { value: string }) => s.value === formData.strategy)) {
        setFormData(prev => ({ ...prev, strategy: data[0].value }));
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
      setError('Failed to load strategies');
    }
  }, [formData.strategy]);

  useEffect(() => {
    if (isOpen) {
      fetchStrategies();
    }
  }, [isOpen, fetchStrategies]);

  const handleStrategyManagerClose = () => {
    setIsStrategyManagerOpen(false);
    fetchStrategies(); // Refresh strategies when StrategyManager is closed
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      chartName: '',
      stockSymbol: '',
      date: getTodayString(),
      strategy: 'price_action',
      execution: 'not_executed',
      marketCap: 'large_cap',
      tags: '',
      notes: '',
    });
    setUploadedImageUrl(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedImageUrl) {
      return;
    }

    try {
      const response = await fetch('/api/charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrl: uploadedImageUrl,
          id: Math.random().toString(36).substring(2) + Date.now().toString(36),
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save chart');
      }

      handleClose();
      onSubmit();
    } catch (error) {
      console.error('Error saving chart:', error);
      alert('Failed to save chart. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Upload Chart</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <UploadDropzone
            endpoint="chartImage"
            config={uploadDropzoneConfig}
            className={styles.uploadDropzone}
            onClientUploadComplete={(res) => {
              if (res?.[0]?.ufsUrl || res?.[0]?.url) {
                setUploadedImageUrl(res[0].ufsUrl || res[0].url);
              }
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error);
              alert(
                error.message === 'Failed to register metadata' 
                  ? 'Upload failed. Retrying...' 
                  : `Upload error: ${error.message}`
              );
            }}
            onUploadBegin={() => {
              setUploadedImageUrl(null);
            }}
          />
          {uploadedImageUrl && (
            <div className={styles.preview}>
              <Image
                src={uploadedImageUrl}
                alt="Chart preview"
                width={300}
                height={169}
                className={styles.previewImage}
              />
            </div>
          )}

          <div className={styles.formSection}>
            <div className={styles.formSectionTitle}>Chart Details</div>
            <input
              type="text"
              name="chartName"
              value={formData.chartName}
              onChange={handleInputChange}
              placeholder="Chart Name"
              className="form-input"
              required
            />

            <input
              type="text"
              name="stockSymbol"
              value={formData.stockSymbol}
              onChange={handleInputChange}
              placeholder="Stock Symbol (e.g., AAPL)"
              className="form-input"
              required
            />

            <DateFilter
              label="Chart Date"
              singleDate
              startDate={formData.date}
              onStartDateChange={(date) => setFormData((prev) => ({ ...prev, date }))}
            />
          </div>

          <div className={styles.formSection}>
            <div className={styles.formSectionTitle}>Strategy & Market Details</div>
            
            <div className={styles.strategySection}>
              <select
                name="strategy"
                value={formData.strategy}
                onChange={handleInputChange}
                className="form-input"
                required
              >
                {strategies.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={styles.editStrategyButton}
                onClick={() => setIsStrategyManagerOpen(true)}
              >
                Edit Strategies
              </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.radioGroup}>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="executed"
                  name="execution"
                  value="executed"
                  checked={formData.execution === 'executed'}
                  onChange={handleInputChange}
                />
                <label htmlFor="executed">Executed</label>
              </div>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="not_executed"
                  name="execution"
                  value="not_executed"
                  checked={formData.execution === 'not_executed'}
                  onChange={handleInputChange}
                />
                <label htmlFor="not_executed">Not Executed</label>
              </div>
            </div>

            <div className={styles.radioGroup}>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="small_cap"
                  name="marketCap"
                  value="small_cap"
                  checked={formData.marketCap === 'small_cap'}
                  onChange={handleInputChange}
                />
                <label htmlFor="small_cap">Small Cap</label>
              </div>
              <div className={styles.radioOption}>
                <input
                  type="radio"
                  id="large_cap"
                  name="marketCap"
                  value="large_cap"
                  checked={formData.marketCap === 'large_cap'}
                  onChange={handleInputChange}
                />
                <label htmlFor="large_cap">Large Cap</label>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formSectionTitle}>Additional Information</div>
            
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Tags (comma separated)"
              className="form-input"
            />

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add your detailed analysis or notes about this chart"
              className="form-input"
              rows={4}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!uploadedImageUrl || !formData.chartName || !formData.stockSymbol}
          >
            Save to Journal
          </button>
        </form>
      </div>

      <StrategyManager
        isOpen={isStrategyManagerOpen}
        onClose={handleStrategyManagerClose}
        onUpdate={fetchStrategies}
      />
    </div>
  );
};

export default UploadModal;
