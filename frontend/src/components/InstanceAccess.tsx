import { useState, useEffect, useCallback, useRef } from 'react';
import { instanceService } from '../services/instanceService';
import { useI18n } from '../contexts/I18nContext';

interface InstanceAccessProps {
  instanceId: number;
  instanceName: string;
  isRunning: boolean;
}

export function InstanceAccess({ instanceId, instanceName, isRunning }: InstanceAccessProps) {
  const { t } = useI18n();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [accessUrl, setAccessUrl] = useState<string | null>(null);
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

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

  const generateAccess = useCallback(async () => {
    if (!isRunning) {
      setError(t('instances.instanceMustBeRunning'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await instanceService.generateAccessToken(instanceId);
      setAccessToken(data.token);
      setAccessUrl(data.access_url);
      setProxyUrl(data.proxy_url);
      setExpiresAt(new Date(data.expires_at));
    } catch (err: any) {
      setError(err.response?.data?.error || t('instances.failedToGenerateAccessToken'));
    } finally {
      setLoading(false);
    }
  }, [instanceId, isRunning]);

  // Auto-generate access on mount if running
  useEffect(() => {
    if (isRunning && !accessToken) {
      generateAccess();
    }
  }, [isRunning, accessToken, generateAccess]);

  // Check token expiration
  useEffect(() => {
    if (!expiresAt) return;

    const checkExpiration = setInterval(() => {
      if (new Date() >= expiresAt) {
        setAccessToken(null);
        setAccessUrl(null);
        setProxyUrl(null);
        setExpiresAt(null);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkExpiration);
  }, [expiresAt]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    const fullscreenTarget = iframeRef.current ?? containerRef.current;
    if (!fullscreenTarget) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await fullscreenTarget.requestFullscreen();
      }
    } catch (fullscreenError) {
      console.error('Failed to toggle fullscreen', fullscreenError);
    }
  };

  const embedUrl = resolveEmbedUrl(proxyUrl || accessUrl);
  const frameHeightClass = 'h-[calc(100vh-180px)] min-h-[780px] max-h-[1280px] md:h-[calc(100vh-160px)]';

  const formatTimeRemaining = () => {
    if (!expiresAt) return '';
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return t('instances.expired');
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (!isRunning) {
    return (
      <div className="app-panel border-dashed p-12 text-center">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('instances.startTheInstance')}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('instances.startToAccessDesktop')}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-panel flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('instances.generatingToken')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-center shadow-[0_24px_70px_-52px_rgba(72,44,24,0.4)]">
        <svg 
          className="mx-auto h-12 w-12 text-red-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-red-800">{t('instances.accessError')}</h3>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button
          onClick={generateAccess}
          className="mt-4 inline-flex items-center rounded-2xl border border-red-200 bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (!accessUrl) {
    return (
      <div className="app-panel border-dashed p-12 text-center">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('instances.readyToAccess')}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('instances.generateAccessPrompt', { name: instanceName })}
        </p>
        <button
          onClick={generateAccess}
          className="app-button-primary mt-4 inline-flex"
        >
          {t('instances.generateAccess')}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#111827] ${isFullscreen ? 'rounded-none' : 'rounded-[28px] border border-[#1f2937] shadow-[0_30px_90px_-56px_rgba(17,24,39,0.9)]'}`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">{instanceName}</span>
          {expiresAt && (
            <span className="text-xs text-gray-400">
              {t('instances.expiresIn')}: {formatTimeRemaining()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={generateAccess}
            className="rounded-xl bg-[#243041] px-3 py-1 text-xs font-medium text-gray-300 hover:bg-[#31415a] hover:text-white"
          >
            {t('instances.refreshToken')}
          </button>
          <button
            onClick={toggleFullscreen}
            className="rounded-xl bg-[#243041] px-3 py-1 text-xs font-medium text-gray-300 hover:bg-[#31415a] hover:text-white"
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* iframe */}
      <div className={frameHeightClass}>
        <iframe
          ref={iframeRef}
          src={embedUrl || undefined}
          title={`${instanceName} Desktop`}
          className="w-full h-full border-0"
          allow="clipboard-read; clipboard-write; fullscreen; autoplay"
          allowFullScreen
        />
      </div>

      {/* Overlay when token expired */}
      {!accessToken && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center">
          <div className="text-center text-white">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className="text-lg mb-4">{t('instances.accessTokenExpired')}</p>
            <button
              onClick={generateAccess}
            className="app-button-primary inline-flex"
            >
              {t('instances.regenerateToken')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
