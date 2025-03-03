import React, { useState } from 'react';
import { ChartFormData, TradingStrategy, MarketCap, TradeExecution } from '../../types/chart';
import { UploadDropzone, uploadDropzoneConfig } from '../../lib/uploadthing';
import { getTodayString } from '../../utils/dateHelpers';
import DateFilter from '../DateFilter/DateFilter';
import styles from './UploadModal.module.css';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ChartFormData) => void;
}

const TRADING_STRATEGIES: { value: TradingStrategy; label: string }[] = [
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

export const UploadModal: React.FC<UploadModalProps> = ({
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
      onSubmit({
        ...formData,
        imageUrl: uploadedImageUrl,
      } as ChartFormData);
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
              // Clear any previous errors and show upload in progress
              setUploadedImageUrl(null);
            }}
          />
          {uploadedImageUrl && (
            <div className={styles.preview}>
              <img
                src={uploadedImageUrl}
                alt="Chart preview"
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
            
            <select
              name="strategy"
              value={formData.strategy}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              {TRADING_STRATEGIES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

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
    </div>
  );
};

export default UploadModal;
