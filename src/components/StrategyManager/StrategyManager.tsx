import React, { useState, useEffect } from 'react';
import styles from './StrategyManager.module.css';

interface Strategy {
  _id?: string;
  value: string;
  label: string;
}

interface StrategyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const StrategyManager: React.FC<StrategyManagerProps> = ({
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [newStrategy, setNewStrategy] = useState({ value: '', label: '' });
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchStrategies();
    }
  }, [isOpen]);

  const fetchStrategies = async () => {
    try {
      const response = await fetch('/api/strategies');
      if (!response.ok) throw new Error('Failed to fetch strategies');
      const data = await response.json();
      setStrategies(data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
      setError('Failed to load strategies');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingStrategy?._id) {
        // Update existing strategy
        const response = await fetch('/api/strategies', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingStrategy._id,
            value: editingStrategy.value,
            label: editingStrategy.label,
          }),
        });

        if (!response.ok) throw new Error('Failed to update strategy');
      } else {
        // Add new strategy
        const response = await fetch('/api/strategies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStrategy),
        });

        if (!response.ok) throw new Error('Failed to add strategy');
      }

      await fetchStrategies();
      setNewStrategy({ value: '', label: '' });
      setEditingStrategy(null);
      onUpdate();
    } catch (error) {
      console.error('Error saving strategy:', error);
      setError('Failed to save strategy');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/strategies?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete strategy');

      await fetchStrategies();
      onUpdate();
    } catch (error) {
      console.error('Error deleting strategy:', error);
      setError('Failed to delete strategy');
    }
  };

  const handleEdit = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setNewStrategy({ value: '', label: '' });
  };

  const handleClose = () => {
    setNewStrategy({ value: '', label: '' });
    setEditingStrategy(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Manage Trading Strategies</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {editingStrategy ? (
            <>
              <input
                type="text"
                placeholder="Strategy ID (e.g., momentum)"
                value={editingStrategy.value}
                onChange={(e) =>
                  setEditingStrategy({ ...editingStrategy, value: e.target.value })
                }
                className="form-input"
                required
              />
              <input
                type="text"
                placeholder="Display Name (e.g., Momentum Trading)"
                value={editingStrategy.label}
                onChange={(e) =>
                  setEditingStrategy({ ...editingStrategy, label: e.target.value })
                }
                className="form-input"
                required
              />
              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.submitButton}>
                  Update Strategy
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStrategy(null)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Strategy ID (e.g., momentum)"
                value={newStrategy.value}
                onChange={(e) =>
                  setNewStrategy({ ...newStrategy, value: e.target.value })
                }
                className="form-input"
                required
              />
              <input
                type="text"
                placeholder="Display Name (e.g., Momentum Trading)"
                value={newStrategy.label}
                onChange={(e) =>
                  setNewStrategy({ ...newStrategy, label: e.target.value })
                }
                className="form-input"
                required
              />
              <button type="submit" className={styles.submitButton}>
                Add Strategy
              </button>
            </>
          )}
        </form>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.strategyList}>
          {strategies.map((strategy) => (
            <div key={strategy._id} className={styles.strategyItem}>
              <div className={styles.strategyInfo}>
                <div className={styles.strategyValue}>{strategy.value}</div>
                <div className={styles.strategyLabel}>{strategy.label}</div>
              </div>
              <div className={styles.strategyActions}>
                <button
                  onClick={() => handleEdit(strategy)}
                  className={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => strategy._id && handleDelete(strategy._id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StrategyManager;
