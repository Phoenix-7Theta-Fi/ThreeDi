import React, { useState } from 'react';
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
  const [currentMonth, setCurrentMonth] = useState(new Date(startDate || getTodayString()));
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  // Get day of week of first day (0-6)
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  // Format display date (e.g., "Feb 3, 2024")
  const formatDisplayDate = (date: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format date as YYYY-MM-DD for API
  const formatDate = (date: Date) => {
    if (!date) return '';
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().split('T')[0];
    console.log('Normalized date:', normalized); // Debug log
    return normalized;
  };
  
  const handleDateClick = (day: number) => {
    const selectedDate = formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    
    if (!startDate || (startDate && endDate)) {
      onStartDateChange(selectedDate);
      if (!singleDate && onEndDateChange) {
        onEndDateChange('');
      }
    } else if (!singleDate && onEndDateChange) {
      const start = new Date(startDate);
      const selected = new Date(selectedDate);
      
      if (selected < start) {
        onEndDateChange(startDate);
        onStartDateChange(selectedDate);
      } else {
        onEndDateChange(selectedDate);
      }
      setIsCalendarVisible(false);
    }
  };
  
  const isDateInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date >= new Date(startDate) && date <= new Date(endDate);
  };
  
  const isStartDate = (day: number) => {
    if (!startDate) return false;
    const date = formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    return date === startDate;
  };
  
  const isEndDate = (day: number) => {
    if (!endDate) return false;
    const date = formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    return date === endDate;
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className={styles.dayCell} />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const formattedDate = formatDate(date);
      const isDisabled = (minDate && formattedDate < minDate) || (maxDate && formattedDate > maxDate);
      
      let className = styles.dayCell;
      
      if (isDisabled) {
        className += ' ' + styles.disabled;
      } else if (isStartDate(day) || isEndDate(day)) {
        className += ' ' + styles.selected;
      } else if (isDateInRange(day)) {
        className += ' ' + styles.inRange;
      } else {
        className += ' ' + styles.default;
      }
      
      days.push(
        <div 
          key={day} 
          className={className}
          onClick={() => !isDisabled && handleDateClick(day)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const toggleCalendar = () => {
    setIsCalendarVisible(!isCalendarVisible);
  };

  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}</div>
      <div className={styles.pickerContainer} onClick={toggleCalendar}>
        <div className={styles.dateDisplay}>
          <span>{startDate ? formatDisplayDate(new Date(startDate)) : "Start"}</span>
          {!singleDate && <span className={styles.separator}>→</span>}
          {!singleDate && <span>{endDate ? formatDisplayDate(new Date(endDate)) : "End"}</span>}
        </div>
      </div>

      {isCalendarVisible && (
        <>
          <div 
            className={styles.calendar}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.calendarHeader}>
              <button 
                onClick={prevMonth}
                className={styles.navigationButton}
                aria-label="Previous month"
              >
                ←
              </button>
              <div className={styles.monthDisplay}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
              <button 
                onClick={nextMonth}
                className={styles.navigationButton}
                aria-label="Next month"
              >
                →
              </button>
            </div>
            
            <div className={styles.calendarGrid}>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                <div key={day} className={styles.dayHeader}>
                  {day}
                </div>
              ))}
            </div>
            
            <div className={styles.calendarGrid}>
              {renderCalendarDays()}
            </div>
          </div>
          <div 
            className={styles.overlay}
            onClick={() => setIsCalendarVisible(false)}
            aria-hidden="true"
          />
        </>
      )}
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
