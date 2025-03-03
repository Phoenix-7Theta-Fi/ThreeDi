import React from 'react';
import { getTodayString, isValidDateString } from '../../utils/dateHelpers';
import styles from './DateFilter.module.css';

interface DateFilterProps {
  label?: string;
  singleDate?: boolean;
  startDate: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  label = 'Filter by Date:',
  singleDate = false,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate = getTodayString(),
}) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (isValidDateString(newDate)) {
      onStartDateChange(newDate);
      
      // If end date is before new start date, update end date
      if (endDate && onEndDateChange && newDate > endDate) {
        onEndDateChange(newDate);
      }
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (isValidDateString(newDate) && onEndDateChange) {
      // If new end date is before start date, update start date
      if (newDate < startDate && onStartDateChange) {
        onStartDateChange(newDate);
      }
      onEndDateChange(newDate);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}</div>
      <div className={styles.pickerContainer}>
        <input
          type="date"
          className={styles.dateInput}
          value={startDate}
          onChange={handleStartDateChange}
          min={minDate}
          max={maxDate}
          aria-label={singleDate ? 'Date' : 'Start date'}
        />
        {!singleDate && onEndDateChange && (
          <input
            type="date"
            className={styles.dateInput}
            value={endDate}
            onChange={handleEndDateChange}
            min={startDate}
            max={maxDate}
            aria-label="End date"
          />
        )}
      </div>
    </div>
  );
};

// Usage example:
// <DateFilter
//   startDate={startDate}
//   endDate={endDate}
//   onStartDateChange={handleStartDateChange}
//   onEndDateChange={handleEndDateChange}
// />
// 
// Or for single date:
// <DateFilter
//   label="Select Date:"
//   singleDate
//   startDate={selectedDate}
//   onStartDateChange={handleDateChange}
// />

export default DateFilter;
