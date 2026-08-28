import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  DownloadCloud, 
  CheckCircle2, 
  Smartphone, 
  Trash2, 
  X, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { pwaManager, OfflineSyncProgress } from '../lib/pwa';
import { useLanguage } from '../i18n/LanguageContext';

export function OfflineModal() {
  const { t, lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(pwaManager.isOnline);
  const [isInstallable, setIsInstallable] = useState(pwaManager.isInstallable);
  const [isSyncing, setIsSyncing] = useState(pwaManager.isSyncing);
  const [syncProgress, setSyncProgress] = useState<OfflineSyncProgress>(pwaManager.syncProgress);
  const [cachedCount, setCachedCount] = useState(pwaManager.cachedArticlesCount);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    const win = window as any;
    win.toggleOfflineModal = (show?: boolean) => {
      setIsOpen(typeof show === 'boolean' ? show : (prev) => !prev);
    };

    const update = () => {
      setIsOnline(pwaManager.isOnline);
      setIsInstallable(pwaManager.isInstallable);
      setIsSyncing(pwaManager.isSyncing);
      setSyncProgress(pwaManager.syncProgress);
      setCachedCount(pwaManager.cachedArticlesCount);
      const savedSync = localStorage.getItem('slonology_last_sync');
      if (savedSync) {
        try {
          const date = new Date(savedSync);
          setLastSync(date.toLocaleDateString(lang === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }));
        } catch(e) {}
      }
    };

    update();
    const unsub = pwaManager.subscribe(update);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsub();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lang]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => setIsOpen(false);

  const handleSyncAll = () => {
    pwaManager.syncAllArticles();
  };

  const handleInstall = async () => {
    await pwaManager.promptInstall();
  };

  const handleClear = async () => {
    if (window.confirm(lang === 'en' ? 'Clear cached articles from offline storage?' : 'Очистить сохраненные статьи из оффлайн-памяти?')) {
      await pwaManager.clearOfflineCache();
      setLastSync(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#1b1d24] border border-[#34384a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#121318]/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
              isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                {t.offline.title}
              </h2>
              <p className="text-xs text-gray-400">
                {isOnline ? (lang === 'en' ? '🟢 Online connection active' : '🟢 Подключение к сети активно') : (lang === 'en' ? '🟠 Offline mode' : '🟠 Автономный режим (Оффлайн)')}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* PWA Install Banner */}
          {isInstallable && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-kingdom-gold/10 to-amber-500/5 border border-kingdom-gold/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-kingdom-gold/20 flex items-center justify-center text-kingdom-gold shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">{lang === 'en' ? 'Install as App' : 'Установить как приложение'}</h4>
                  <p className="text-[11px] text-gray-300">{lang === 'en' ? 'Quick launch from home screen and full-screen reading' : 'Быстрый запуск с рабочего стола и полноэкранный режим'}</p>
                </div>
              </div>
              <button
                onClick={handleInstall}
                className="px-3.5 py-2 bg-kingdom-gold hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow transition-all shrink-0 cursor-pointer"
              >
                {lang === 'en' ? 'Install' : 'Установить'}
              </button>
            </div>
          )}

          {/* Sync Progress / Action */}
          <div className="p-5 rounded-xl bg-[#121318]/70 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-kingdom-gold" />
                <span className="font-bold text-sm text-white">{lang === 'en' ? 'Offline Article Cache' : 'Оффлайн-хранилище статей'}</span>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-kingdom-gold/10 text-kingdom-gold border border-kingdom-gold/20">
                {cachedCount > 0 ? (lang === 'en' ? `${cachedCount} cached` : `${cachedCount} статей в кэше`) : (lang === 'en' ? 'Cache empty' : 'Кэш пуст')}
              </span>
            </div>

            {isSyncing ? (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-gray-300">
                  <span className="flex items-center gap-1.5 text-kingdom-gold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {t.offline.syncing}
                  </span>
                  <span className="font-mono">{syncProgress.completed} / {syncProgress.total} ({syncProgress.percent}%)</span>
                </div>
                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-kingdom-gold to-amber-400 transition-all duration-300 rounded-full"
                    style={{ width: `${syncProgress.percent}%` }}
                  ></div>
                </div>
                {syncProgress.currentTitle && (
                  <p className="text-[10px] text-gray-400 truncate">
                    {lang === 'en' ? 'Saving:' : 'Сохранение:'} {syncProgress.currentTitle}
                  </p>
                )}
              </div>
            ) : (
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleSyncAll}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-kingdom-gold/15 hover:bg-kingdom-gold/25 border border-kingdom-gold/40 hover:border-kingdom-gold text-kingdom-gold font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>{cachedCount > 0 ? (lang === 'en' ? 'Update offline database' : 'Обновить всю оффлайн-базу') : t.offline.downloadAll}</span>
                </button>
                {cachedCount > 0 && (
                  <button
                    onClick={handleClear}
                    title={lang === 'en' ? 'Clear cached articles' : 'Очистить сохраненные статьи'}
                    className="px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {lastSync && (
              <p className="text-[10px] text-gray-400 text-right">
                {lang === 'en' ? 'Last synchronized:' : 'Последняя синхронизация:'} {lastSync}
              </p>
            )}
          </div>

          {/* Offline capabilities summary */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {lang === 'en' ? 'Offline Availability' : 'Доступность без интернета'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">{lang === 'en' ? '60+ Academic Articles' : '60+ научных статей'}</span>
                  <span className="text-[10px] text-gray-400">{lang === 'en' ? 'Anatomy, ethology, evolution' : 'Анатомия, этология, эволюция'}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">{lang === 'en' ? 'Diagrams & Tables' : 'Схемы и таблицы'}</span>
                  <span className="text-[10px] text-gray-400">{lang === 'en' ? 'Anatomy, metrics and references' : 'Анатомия, метрики и источники'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#121318]/50 flex justify-end">
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            {t.offline.close}
          </button>
        </div>
      </div>
    </div>
  );
}
