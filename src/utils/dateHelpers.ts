const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
};

export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const isValidDateString = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const compareDates = (a: string, b: string): number => {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return dateA.getTime() - dateB.getTime();
};

export const isDateInRange = (
  date: string,
  startDate: string,
  endDate: string
): boolean => {
  const targetDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return targetDate >= start && targetDate <= end;
};

export const getLastNDays = (n: number): { startDate: string; endDate: string } => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - n);
  
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

// Utility for grouping chart entries by date
export const groupEntriesByDate = <T extends { date: string }>(
  entries: T[]
): { [key: string]: T[] } => {
  return entries.reduce((groups, entry) => {
    const date = entry.date.split('T')[0];
    return {
      ...groups,
      [date]: [...(groups[date] || []), entry],
    };
  }, {} as { [key: string]: T[] });
};
