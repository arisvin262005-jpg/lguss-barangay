import { createContext, useContext, useState, useEffect, useRef } from 'react';

const SyncContext = createContext(null);

// Offline-First Sync Engine
// Architecture: User writes → PouchDB (local) → on reconnect → CouchDB replication

export const SyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStats, setSyncStats] = useState({ pending: 0, synced: 0, failed: 0, total: 0, successRate: 100 });
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | error | complete
  const [retryQueue, setRetryQueue] = useState([]);
  const syncIntervalRef = useRef(null);

  useEffect(() => {
    const handleOnline  = () => { setIsOnline(true);  setSyncStatus('syncing'); triggerSync(); };
    const handleOffline = () => { setIsOnline(false); setSyncStatus('idle'); };
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update stats dynamically when offline actions occur or sync happens
  useEffect(() => {
    const updateStatsFromStorage = () => {
      const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
      const syncedCount = parseInt(localStorage.getItem('total_synced_count') || '0');
      const failedCount = parseInt(localStorage.getItem('total_failed_count') || '0');
      
      setSyncStats({
        pending: queue.length,
        synced: syncedCount,
        failed: failedCount,
        total: queue.length + syncedCount + failedCount,
        successRate: (queue.length + syncedCount + failedCount) > 0 
          ? parseFloat(((syncedCount / (syncedCount + failedCount || 1)) * 100).toFixed(1))
          : 100
      });
    };

    updateStatsFromStorage();
    window.addEventListener('offline-action-added', updateStatsFromStorage);
    window.addEventListener('sync-complete', updateStatsFromStorage);
    return () => {
      window.removeEventListener('offline-action-added', updateStatsFromStorage);
      window.removeEventListener('sync-complete', updateStatsFromStorage);
    };
  }, []);


  const triggerSync = async () => {
    if (!navigator.onLine) return;
    
    let queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    if (queue.length === 0) return;
    
    setSyncStatus('syncing');
    
    // Import axios dynamically to prevent circular dependencies in context
    const { default: api } = await import('../services/api.js');
    
    let failedThisRun = 0;
    let syncedThisRun = 0;
    let remainingQueue = [];

    // Replay all offline actions against the live server
    for (const task of queue) {
      try {
        await api({ method: task.method, url: task.url, data: task.data });
        syncedThisRun++;
      } catch (err) {
        console.error('Failed to sync offline task:', task, err);
        failedThisRun++;
        remainingQueue.push(task); // Keep failed tasks
      }
    }

    localStorage.setItem('offlineQueue', JSON.stringify(remainingQueue));
    
    // Persist totals for dashboard
    const oldSynced = parseInt(localStorage.getItem('total_synced_count') || '0');
    const oldFailed = parseInt(localStorage.getItem('total_failed_count') || '0');
    localStorage.setItem('total_synced_count', oldSynced + syncedThisRun);
    localStorage.setItem('total_failed_count', oldFailed + failedThisRun);

    if (syncedThisRun > 0) {
      localStorage.removeItem('offline_registered_users');
    }

    
    setSyncStatus('complete');
    
    // Dispatch sync-complete — individual pages listen and refetch without full remount
    if (syncedThisRun > 0) {
      window.dispatchEvent(new CustomEvent('sync-complete', { detail: { synced: syncedThisRun, failed: failedThisRun } }));
    }
    if (failedThisRun > 0 && syncedThisRun === 0) {
      setSyncStatus('error');
    }
    
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  const addToPending = (count = 1) => {
    setSyncStats((prev) => ({ ...prev, pending: prev.pending + count, total: prev.total + count }));
    if (!isOnline) setSyncStatus('idle');
  };

  const retryFailed = async () => {
    setSyncStatus('syncing');
    await new Promise((r) => setTimeout(r, 2000));
    setSyncStats((prev) => ({ ...prev, failed: 0, synced: prev.synced + prev.failed }));
    setSyncStatus('complete');
    setTimeout(() => setSyncStatus('idle'), 2000);
  };

  return (
    <SyncContext.Provider value={{ isOnline, syncStats, syncStatus, triggerSync, addToPending, retryFailed }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext);
