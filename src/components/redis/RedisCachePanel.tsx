import React, { useState, useEffect } from 'react';
import { redisService, RedisCacheStats, ActiveMemberPresence } from '../../services/redisService';
import { useJourney } from '../../context/JourneyContext';
import {
  Database,
  Zap,
  Activity,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Key,
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const RedisCachePanel: React.FC = () => {
  const { showToast, milestones, ideas, publicContent, user } = useJourney();

  const [stats, setStats] = useState<RedisCacheStats>(redisService.getStats());
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<ActiveMemberPresence[]>([]);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [isFlushing, setIsFlushing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Config inputs
  const [redisUrl, setRedisUrl] = useState(() => {
    return localStorage.getItem('my_journey_redis_url') || '';
  });
  const [redisToken, setRedisToken] = useState(() => {
    return localStorage.getItem('my_journey_redis_token') || '';
  });

  const refreshData = async () => {
    setStats(redisService.getStats());
    const keys = await redisService.keys('*');
    setActiveKeys(keys);
    const members = await redisService.getOnlineMembers();
    setOnlineMembers(members);
  };

  useEffect(() => {
    refreshData();
    // Heartbeat every 60s
    if (user?.email) {
      redisService.sendMemberHeartbeat(user.email, user.name, user.role || 'admin');
    }
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handlePing = async () => {
    setIsPinging(true);
    try {
      const res = await redisService.ping();
      setPingResult(res.message);
      refreshData();
      if (res.ok) {
        showToast(`Redis PONG received in ${res.latencyMs}ms!`, 'success');
      } else {
        showToast(res.message, 'warning');
      }
    } finally {
      setIsPinging(false);
    }
  };

  const handleFlush = async () => {
    if (!window.confirm('Are you sure you want to flush all cached data in Redis?')) return;
    setIsFlushing(true);
    try {
      await redisService.flushAll();
      showToast('Redis cache cleared successfully!', 'info');
      refreshData();
    } finally {
      setIsFlushing(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    redisService.updateConfig(redisUrl.trim(), redisToken.trim());
    showToast('Redis configuration saved. Testing connection...', 'info');
    handlePing();
  };

  const handleWarmCache = async () => {
    showToast('Syncing workspace data into Redis cache...', 'info');
    await redisService.cacheMilestones('projects', milestones);
    await redisService.cacheIdeas(ideas);
    await redisService.cachePublicContent(publicContent);
    if (user?.email) {
      await redisService.sendMemberHeartbeat(user.email, user.name, user.role || 'admin');
    }
    refreshData();
    showToast('✨ Redis cache warmed with fresh application state!', 'success');
  };

  const handleDeleteKey = async (key: string) => {
    await redisService.del(key);
    showToast(`Key "${key}" deleted from Redis.`, 'info');
    refreshData();
  };

  const hitRatio =
    stats.hits + stats.misses > 0
      ? Math.round((stats.hits / (stats.hits + stats.misses)) * 100)
      : 100;

  return (
    <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 shrink-0">
            <Database className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Centralized Redis Cache &amp; Data Store
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                  stats.status === 'connected'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                }`}
              >
                {stats.status === 'connected' ? 'Upstash Redis Live' : 'Local Fast Cache'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Acts as a single high-speed shared cache eliminating redundant database queries across servers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleWarmCache}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors cursor-pointer"
            title="Warm cache with current projects and ideas"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Warm Cache</span>
          </button>
          <button
            onClick={handlePing}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>{isPinging ? 'Pinging...' : 'Ping Test'}</span>
          </button>
        </div>
      </div>

      {/* Ping Status Toast/Banner */}
      {pingResult && (
        <div className="px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs font-mono flex items-center justify-between text-neutral-700 dark:text-neutral-300">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{pingResult}</span>
          </span>
          <button
            onClick={() => setPingResult(null)}
            className="text-neutral-400 hover:text-neutral-600 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-center">
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
            {stats.keysCount}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Active Keys</div>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-center">
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {hitRatio}%
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Hit Ratio</div>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-center">
          <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {stats.hits}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Cache Hits</div>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-center">
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {stats.lastPingMs > 0 ? `${stats.lastPingMs}ms` : '< 1ms'}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">Latency</div>
        </div>
      </div>

      {/* Online Member Presence (Shared across clients via Redis) */}
      {onlineMembers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Team Presence in Redis ({onlineMembers.length} active)</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {onlineMembers.map((m) => (
              <div
                key={m.email}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {m.name.slice(0, 1).toUpperCase()}
                </div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{m.name}</span>
                <span className="text-[10px] font-mono text-neutral-400 uppercase">({m.role})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Redis Keys Viewer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-rose-500" />
            <span>Active Keys in Shared Redis ({activeKeys.length})</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
            {activeKeys.length > 0 && (
              <button
                onClick={handleFlush}
                disabled={isFlushing}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer ml-2"
              >
                <Trash2 className="w-3 h-3" />
                <span>Flush Cache</span>
              </button>
            )}
          </div>
        </div>

        {activeKeys.length === 0 ? (
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-center text-xs text-neutral-500">
            No keys currently stored. Click <strong>Warm Cache</strong> above to pre-populate Redis with shared data.
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {activeKeys.map((key) => (
              <div
                key={key}
                className="flex items-center justify-between px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-mono group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Key className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="text-neutral-800 dark:text-neutral-200 truncate">{key}</span>
                </div>
                <button
                  onClick={() => handleDeleteKey(key)}
                  className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upstash Redis Credentials Toggle */}
      <div className="pt-2 border-t border-neutral-150 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center justify-between w-full text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-rose-600 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-rose-500" />
            <span>Connect Remote Upstash Redis (Vercel / Cloud)</span>
          </span>
          {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showConfig && (
          <form onSubmit={handleSaveConfig} className="mt-4 space-y-3 animate-in fade-in">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Upstash Redis REST URL
              </label>
              <input
                type="text"
                value={redisUrl}
                onChange={(e) => setRedisUrl(e.target.value)}
                placeholder="https://your-database.upstash.io"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Upstash Redis REST Token
              </label>
              <input
                type="password"
                value={redisToken}
                onChange={(e) => setRedisToken(e.target.value)}
                placeholder="AX... (REST token)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href="https://upstash.com/docs/redis/overall/getstarted"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
              >
                <span>Get a free Upstash Redis database</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors cursor-pointer"
              >
                Save &amp; Connect Redis
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
