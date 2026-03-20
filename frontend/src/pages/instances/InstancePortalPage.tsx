import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { instanceService } from '../../services/instanceService';
import type { Instance } from '../../types/instance';
import { useI18n } from '../../contexts/I18nContext';

const InstancePortalPage: React.FC = () => {
  const { t } = useI18n();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const resolveEmbedUrl = useCallback((url: string | null) => {
    if (!url) {
      return null;
    }

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    const explicitOrigin = import.meta.env.VITE_BACKEND_ORIGIN as string | undefined;
    if (explicitOrigin) {
      return new URL(url, explicitOrigin).toString();
    }

    if (window.location.port === '9002' && url.startsWith('/api/')) {
      return `${window.location.protocol}//${window.location.hostname}:9001${url}`;
    }

    return url;
  }, []);

  const loadInstances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instanceService.getInstances(1, 100);
      setInstances(data.instances);
      setSelectedId((currentSelectedId) => {
        if (currentSelectedId && data.instances.some((instance) => instance.id === currentSelectedId)) {
          return currentSelectedId;
        }

        const firstRunning = data.instances.find((instance) => instance.status === 'running');
        return firstRunning?.id ?? data.instances[0]?.id ?? null;
      });
    } catch (err: any) {
      setError(err.response?.data?.error || t('instances.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadInstances();
  }, [loadInstances]);

  const selectedInstance = useMemo(
    () => instances.find((instance) => instance.id === selectedId) ?? null,
    [instances, selectedId],
  );

  const generateAccess = useCallback(async (instanceId: number) => {
    try {
      setAccessLoading(true);
      setAccessError(null);
      const data = await instanceService.generateAccessToken(instanceId);
      setEmbedUrl(resolveEmbedUrl(data.proxy_url || data.access_url));
      setExpiresAt(new Date(data.expires_at));
    } catch (err: any) {
      setEmbedUrl(null);
      setExpiresAt(null);
      setAccessError(err.response?.data?.error || t('instances.failedToGenerateAccessToken'));
    } finally {
      setAccessLoading(false);
    }
  }, [resolveEmbedUrl, t]);

  useEffect(() => {
    if (!selectedInstance) {
      setEmbedUrl(null);
      setExpiresAt(null);
      setAccessError(null);
      return;
    }

    if (selectedInstance.status !== 'running') {
      setEmbedUrl(null);
      setExpiresAt(null);
      setAccessError(t('instances.instanceMustBeRunning'));
      return;
    }

    generateAccess(selectedInstance.id);
  }, [generateAccess, selectedInstance, t]);

  const formatRemaining = () => {
    if (!expiresAt) {
      return '';
    }

    const diff = expiresAt.getTime() - Date.now();
    if (diff <= 0) {
      return t('instances.expired');
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getStatusDot = (status: Instance['status']) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'creating':
        return 'bg-amber-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="mx-auto flex max-w-[min(1960px,calc(100vw-1rem))] items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-2xl font-bold text-[#171212]">{t('instances.portalTitle')}</h1>
            <p className="mt-1 text-sm text-[#8f8681]">{t('instances.portalSubtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadInstances}
              className="app-button-secondary"
            >
              {t('instances.portalRefreshList')}
            </button>
            <Link
              to="/instances"
              className="app-button-primary"
            >
              {t('instances.portalOpenFromList')}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex h-[calc(100vh-89px)] max-w-[min(1960px,calc(100vw-1rem))] min-h-0 gap-4 px-4 py-4 sm:px-6">
        <aside className="app-panel flex w-full max-w-[320px] flex-col">
          <div className="border-b border-[#f1e7e1] px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8f8681]">{t('instances.portalWorkspace')}</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-sm text-[#8f8681]">{t('common.loading')}</div>
            ) : error ? (
              <div className="p-6 text-sm text-red-600">{error}</div>
            ) : instances.length === 0 ? (
              <div className="p-6 text-sm text-[#8f8681]">{t('instances.noInstances')}</div>
            ) : (
              <ul className="divide-y divide-[#f5ebe5]">
                {instances.map((instance) => {
                  const isSelected = instance.id === selectedId;
                  const isRunning = instance.status === 'running';

                  return (
                    <li key={instance.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(instance.id)}
                        className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors ${
                          isSelected ? 'bg-[#fff7f3]' : 'hover:bg-[#fffaf7]'
                        }`}
                      >
                        <span className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${getStatusDot(instance.status)}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className={`truncate text-sm font-semibold ${isSelected ? 'text-[#dc2626]' : 'text-[#171212]'}`}>
                              {instance.name}
                            </p>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              isRunning ? 'bg-green-100 text-green-800' : 'bg-[#f7ece6] text-[#8f5b4b]'
                            }`}>
                              {t(`status.${instance.status}`)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#8f8681]">
                            {instance.os_type} {instance.os_version}
                          </p>
                          <p className="mt-2 text-xs text-[#8f8681]">
                            {instance.cpu_cores} {t('common.cpu')} · {instance.memory_gb} GB · {instance.disk_gb} GB
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-[#1f2937] bg-[#111827] shadow-[0_30px_90px_-56px_rgba(17,24,39,0.9)]">
          <div className="flex items-center justify-between border-b border-[#2b3443] bg-[#182131] px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {selectedInstance?.name || t('instances.portalSelectInstance')}
              </p>
              <p className="mt-1 text-xs text-[#aab4c4]">
                {selectedInstance
                  ? `${t('instances.expiresIn')}: ${formatRemaining()}`
                  : t('instances.portalSelectInstanceSubtitle')}
              </p>
            </div>
            {selectedInstance && selectedInstance.status === 'running' && (
              <button
                onClick={() => generateAccess(selectedInstance.id)}
                className="rounded-lg bg-[#243041] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#31415a]"
              >
                {t('instances.refreshToken')}
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1">
            {accessLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-[#d8dee8]">
                {t('instances.generatingToken')}
              </div>
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                title={selectedInstance ? `${selectedInstance.name} portal` : 'desktop-portal'}
                className="h-full w-full border-0"
                allow="clipboard-read; clipboard-write; fullscreen; autoplay"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center px-8 text-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {selectedInstance ? t('instances.portalUnavailable') : t('instances.portalSelectInstance')}
                  </h3>
                  <p className="mt-2 text-sm text-[#b7c1cf]">
                    {accessError || (selectedInstance ? t('instances.portalUnavailableSubtitle') : t('instances.portalSelectInstanceSubtitle'))}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default InstancePortalPage;



