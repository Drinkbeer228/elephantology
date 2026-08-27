// PWA & Service Worker Manager for Elephantology Wiki

export interface OfflineSyncProgress {
  completed: number;
  total: number;
  percent: number;
  currentPath?: string;
  currentTitle?: string;
}

type PWAEventListener = () => void;

class PWAManager {
  private static instance: PWAManager;
  private deferredInstallPrompt: any = null;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private listeners: Set<PWAEventListener> = new Set();
  
  public isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  public isInstallable: boolean = false;
  public isInstalled: boolean = false;
  public isSyncing: boolean = false;
  public syncProgress: OfflineSyncProgress = { completed: 0, total: 0, percent: 0 };
  public cachedArticlesCount: number = 0;

  private constructor() {
    if (typeof window === 'undefined') return;

    // Monitor Online/Offline state
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notify();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notify();
    });

    // Listen for PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      this.isInstallable = true;
      this.notify();
    });

    window.addEventListener('appinstalled', () => {
      this.isInstallable = false;
      this.isInstalled = true;
      this.deferredInstallPrompt = null;
      this.notify();
    });

    // Register Service Worker
    this.registerServiceWorker();

    // Listen for messages from SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'CACHE_PROGRESS') {
          this.isSyncing = true;
          this.syncProgress = {
            completed: data.completed,
            total: data.total,
            percent: data.percent,
            currentPath: data.currentPath,
            currentTitle: data.currentTitle
          };
          this.cachedArticlesCount = data.completed;
          this.notify();
        } else if (data.type === 'CACHE_COMPLETE') {
          this.isSyncing = false;
          this.syncProgress = {
            completed: data.completed,
            total: data.total,
            percent: 100
          };
          this.cachedArticlesCount = data.completed;
          localStorage.setItem('slonology_last_sync', new Date().toISOString());
          localStorage.setItem('slonology_cached_count', String(data.completed));
          this.notify();
        } else if (data.type === 'OFFLINE_STATUS') {
          this.cachedArticlesCount = data.cachedArticlesCount;
          this.notify();
        }
      });
    }

    // Restore cached count from storage
    const savedCount = localStorage.getItem('slonology_cached_count');
    if (savedCount) {
      this.cachedArticlesCount = parseInt(savedCount, 10) || 0;
    }
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  public subscribe(listener: PWAEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public async registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      this.swRegistration = reg;
      console.log('[PWA] Service Worker registered with scope:', reg.scope);

      // Check if update is available
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New version available.');
            }
          });
        }
      });

      // Request current offline status
      this.checkOfflineStatus();
    } catch (err) {
      console.warn('[PWA] Service Worker registration failed:', err);
    }
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredInstallPrompt) return false;
    try {
      this.deferredInstallPrompt.prompt();
      const choiceResult = await this.deferredInstallPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        this.isInstallable = false;
        this.isInstalled = true;
        this.deferredInstallPrompt = null;
        this.notify();
        return true;
      }
    } catch (err) {
      console.error('[PWA] Install prompt error:', err);
    }
    return false;
  }

  public checkOfflineStatus() {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_OFFLINE_STATUS' });
    }
  }

  public async syncAllArticles(articlesList?: Array<{ path: string; title: string }>) {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.syncProgress = { completed: 0, total: articlesList?.length || 50, percent: 0 };
    this.notify();

    try {
      let articles = articlesList;
      if (!articles || articles.length === 0) {
        // We now bundle the articles via Vite, so offline cache fetching is technically obsolete,
        // but we'll fake the array to satisfy the UI.
        articles = [];
      }

      if (!articles || articles.length === 0) {
        throw new Error('Не удалось получить список статей для синхронизации');
      }

      // If SW controller is ready, send message to SW for background caching
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_ALL_ARTICLES',
          articles
        });
      } else {
        // Direct CacheStorage fallback in main thread
        if ('caches' in window) {
          const cache = await caches.open('slonology-articles-v2');
          let count = 0;
          for (const a of articles) {
            try {
              const url = `/api/article?path=${encodeURIComponent(a.path)}`;
              const res = await fetch(url);
              if (res.ok) {
                await cache.put(new Request(url), res);
              }
            } catch (e) {}
            count++;
            this.syncProgress = {
              completed: count,
              total: articles.length,
              percent: Math.round((count / articles.length) * 100),
              currentPath: a.path,
              currentTitle: a.title
            };
            this.cachedArticlesCount = count;
            this.notify();
          }
          this.isSyncing = false;
          this.syncProgress.percent = 100;
          localStorage.setItem('slonology_last_sync', new Date().toISOString());
          localStorage.setItem('slonology_cached_count', String(count));
          this.notify();
        }
      }
    } catch (err) {
      console.error('[PWA] Sync error:', err);
      this.isSyncing = false;
      this.notify();
    }
  }

  public async clearOfflineCache() {
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const k of keys) {
        if (k.includes('slonology-articles')) {
          await caches.delete(k);
        }
      }
      this.cachedArticlesCount = 0;
      localStorage.removeItem('slonology_last_sync');
      localStorage.removeItem('slonology_cached_count');
      this.notify();
    }
  }
}

export const pwaManager = PWAManager.getInstance();
