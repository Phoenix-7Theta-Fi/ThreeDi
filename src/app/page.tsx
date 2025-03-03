'use client';

import React, { useState, useEffect } from 'react';
import { ChartEntry, TradingStrategy, MarketCap, TradeExecution } from '../types/chart';
import { useModal } from '../hooks/useModal';
import ChartGrid from '../components/ChartGrid/ChartGrid';
import UploadModal from '../components/UploadModal/UploadModal';
import FilterBar from '../components/FilterBar/FilterBar';
import styles from './page.module.css';

export default function Home() {
  const [charts, setCharts] = useState<ChartEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [strategy, setStrategy] = useState<TradingStrategy | 'all'>('all');
  const [marketCap, setMarketCap] = useState<MarketCap | 'all'>('all');
  const [execution, setExecution] = useState<TradeExecution | 'all'>('all');

  const fetchCharts = async () => {
    try {
      setError(null);
      setLoading(true);
      const params = new URLSearchParams({
        search: searchQuery,
        strategy: strategy,
        marketCap: marketCap,
        execution: execution,
      });
      const response = await fetch(`/api/charts?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch charts');
      }
      
      const data = await response.json();
      setCharts(data);
    } catch (error) {
      console.error('Error fetching charts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load charts');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCharts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced fetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCharts();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, strategy, marketCap, execution]); // eslint-disable-line react-hooks/exhaustive-deps

  // Retry on error
  useEffect(() => {
    if (error) {
      const retryTimer = setTimeout(fetchCharts, 5000);
      return () => clearTimeout(retryTimer);
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle chart upload completion
  const handleUpload = async () => {
    fetchCharts();
  };

  const handleDeleteChart = async (id: string) => {
    try {
      const response = await fetch(`/api/charts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chart');
      }

      // Remove the deleted chart from state
      setCharts(charts => charts.filter(chart => chart.id !== id));
    } catch (error) {
      console.error('Error deleting chart:', error);
      alert('Failed to delete chart. Please try again.');
    }
  };

  const handleChartClick = async (chart: ChartEntry) => {
    try {
      const response = await fetch(`/api/charts?id=${chart.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chart details');
      }
      const data = await response.json();
      console.log('Chart details:', data);
      // In a real app, you would show a detail view or edit modal
    } catch (error) {
      console.error('Error fetching chart details:', error);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>StockJournal</h1>
        <button className={styles.uploadButton} onClick={openModal}>
          <span className={styles.uploadIcon}>+</span>
          Upload Chart
        </button>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        strategy={strategy}
        marketCap={marketCap}
        execution={execution}
        onSearchChange={setSearchQuery}
        onStrategyChange={setStrategy}
        onMarketCapChange={setMarketCap}
        onExecutionChange={setExecution}
      />

      {error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchCharts} className={styles.retryButton}>
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <p>Loading charts...</p>
        </div>
      ) : (
        <ChartGrid
          charts={charts}
          onChartClick={handleChartClick}
          onAddChart={openModal}
          onDeleteChart={handleDeleteChart}
          isFiltered={searchQuery !== '' || strategy !== 'all' || marketCap !== 'all' || execution !== 'all'}
          onResetFilters={() => {
            setSearchQuery('');
            setStrategy('all');
            setMarketCap('all');
            setExecution('all');
          }}
        />
      )}

      <UploadModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleUpload}
      />
    </main>
  );
}
