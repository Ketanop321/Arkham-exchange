import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, Share2, Shield, Hash, Trophy, Search, ArrowUp, ArrowDown, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../Toast';

interface VirtualAsset {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'real-estate' | 'startup-token' | 'crypto';
  price: number;
  change24h: number;
  changePercent: number;
  marketCap?: number;
  volume24h?: number;
  description: string;
  riskScore: number;
  sector?: string;
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high52w: number;
  low52w: number;
  marketCap: number;
  pe: number;
  dividend: number;
  beta: number;
  lastUpdated: string;
}

interface LeaderboardEntry {
  playFabId: string;
  position: number;
  statValue: number;
  displayName: string;
}

interface PortfolioPosition {
  assetId: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
}

interface VirtualPortfolio {
  id: string;
  name: string;
  description: string;
  owner: string;
  ownerAvatar: string;
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  positions: PortfolioPosition[];
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    maxDrawdown: number;
    sharpeRatio: number;
    winRate: number;
  };
  strategy: {
    type: string;
    description: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    timeHorizon: string;
  };
  blockchain: {
    hash: string;
    version: number;
    verified: boolean;
    createdAt: string;
    lastUpdated: string;
  };
  social: {
    followers: number;
    copiers: number;
    likes: number;
    isPublic: boolean;
  };
  reputation: {
    score: number;
    badges: string[];
    rank: string;
    achievements: string[];
  };
  aiAnalysis: {
    riskScore: number;
    diversificationScore: number;
    momentumScore: number;
    valueScore: number;
    recommendations: string[];
  };
}

const VirtualPortfolio: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'market-data' | 'discover' | 'leaderboard'>('portfolio');
  const [selectedPortfolio, setSelectedPortfolio] = useState<VirtualPortfolio | null>(null);
  const [userPortfolios, setUserPortfolios] = useState<VirtualPortfolio[]>([]);
  const [availableAssets, setAvailableAssets] = useState<VirtualAsset[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<VirtualAsset | null>(null);
  const [virtualBalance, setVirtualBalance] = useState(1000000);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sessionReady, setSessionReady] = useState(false);
  const [gcBalance, setGcBalance] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addQty, setAddQty] = useState<number>(1);
  const [discover, setDiscover] = useState<any[]>([]);
  const [loadingDiscover, setLoadingDiscover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareSaving, setShareSaving] = useState(false);
  const [targetPortfolioId, setTargetPortfolioId] = useState<string>('');

  useEffect(() => {
    ensurePlayFabSession().then(() => {
      claimWelcomeBonus();
    }).finally(() => setSessionReady(true));
    loadAllData();
    const interval = setInterval(() => {
      updateMarketPrices();
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function claimWelcomeBonus() {
    try {
      await fetch('/api/playfab/welcome', { method: 'POST' });
    } catch {}
  }

  useEffect(() => {
    // initialize target to currently selected
    setTargetPortfolioId(selectedPortfolio?.id || '');
  }, [selectedPortfolio?.id]);

  useEffect(() => {
    if (!sessionReady) return;
    fetchGcBalance();
  }, [sessionReady]);

  useEffect(() => {
    if (!sessionReady) return;
    if (selectedPortfolio?.totalValue) {
      updatePortfolioValueStat(selectedPortfolio.totalValue);
    }
  }, [sessionReady, selectedPortfolio?.totalValue]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'discover') {
      fetchDiscover();
    }
  }, [activeTab]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await loadAssets();
      loadUserPortfolios();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ensurePlayFabSession = async () => {
    try {
      await fetch('/api/playfab/session', { method: 'POST' });
    } catch (e) {
      console.warn('playfab session failed', e);
    }
  };

  const updatePortfolioValueStat = async (value: number) => {
    try {
      await fetch('/api/playfab/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stat: 'PortfolioValue', value: Math.round(value) }),
      });
    } catch (e) {
      console.warn('update PortfolioValue failed', e);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const r = await fetch('/api/playfab/leaderboard?stat=PortfolioValue&limit=25');
      if (!r.ok) throw new Error(`status ${r.status}`);
      const j = await r.json();
      setLeaderboard(Array.isArray(j.entries) ? j.entries : []);
    } catch (e) {
      console.warn('fetchLeaderboard failed', e);
      setLeaderboard([]);
    }
  };

  const fetchGcBalance = async () => {
    try {
      const r = await fetch('/api/playfab/currency');
      if (!r.ok) throw new Error(`status ${r.status}`);
      const j = await r.json();
      setGcBalance(Number(j.balances?.GC || 0));
    } catch (e) {
      console.warn('fetchGcBalance failed', e);
      setGcBalance(0);
    }
  };

  const loadAssets = async () => {
    // Rate limiting: Don't fetch if we fetched less than 10 seconds ago
    const now = Date.now();
    if (now - lastFetchTime < 10000) {
      console.log('Rate limited: Skipping asset fetch');
      return;
    }

    try {
      setLastFetchTime(now);
      
      // Fetch crypto data
      const cryptoIds = 'bitcoin,ethereum,solana';
      
      const crRes = await fetch(`/api/crypto/quotes?ids=${encodeURIComponent(cryptoIds)}&vs_currency=usd`);
      
      if (!crRes.ok) {
        throw new Error(`API error: ${crRes.status}`);
      }

      const crJson = await crRes.json();
      console.log('API Response:', crJson); // Debug log

      const cryptoAssets: VirtualAsset[] = (crJson.coins || []).map((c: any) => {
        console.log('Processing coin:', c); // Debug log
        return {
          id: `cr-${c.id}`,
          symbol: c.symbol || '',
          name: c.name || c.id,
          type: 'crypto',
          price: Number(c.price) || 0,
          change24h: c.price ? (c.price * (c.change24hPct || 0)) / 100 : 0,
          changePercent: c.change24hPct || 0,
          marketCap: Number(c.marketCap) || undefined,
          volume24h: Number(c.volume24h) || undefined,
          description: `${c.name} cryptocurrency`,
          riskScore: 8,
          sector: 'Crypto',
        };
      });

      console.log('Crypto assets:', cryptoAssets); // Debug log

      // US equities (live via Alpaca or AlphaVantage)
      let usAssets: VirtualAsset[] = [];
      try {
        const usRes = await fetch(`/api/markets/us?symbols=AAPL,MSFT,NVDA,TSLA`);
        if (usRes.ok) {
          const usJson = await usRes.json();
          usAssets = (usJson.quotes || []).map((q: any) => ({
            id: `us-${String(q.symbol)}`,
            symbol: String(q.symbol),
            name: String(q.symbol),
            type: 'stock' as const,
            price: Number(q.price || 0),
            change24h: Number(q.change || 0),
            changePercent: Number(q.changePercent || 0),
            volume24h: Number(q.volume || 0),
            description: `${String(q.symbol)} equity`,
            riskScore: 5,
            sector: 'Technology',
          }));
        }
      } catch (e) {
        console.warn('us quotes failed', e);
      }

      const combined = [...cryptoAssets, ...usAssets];
      console.log('Combined assets:', combined); // Debug log
      setAvailableAssets(combined);
      
      setMarketData(
        combined.map((asset) => ({
          symbol: asset.symbol,
          price: asset.price,
          change: asset.change24h,
          changePercent: asset.changePercent,
          volume: asset.volume24h || 0,
          high52w: asset.price * 1.25,
          low52w: asset.price * 0.75,
          marketCap: asset.marketCap || 1000000000,
          pe: 25,
          dividend: 1.5,
          beta: 1.2,
          lastUpdated: new Date().toISOString(),
        }))
      );
      
      if (!selectedAsset && combined.length) {
        setSelectedAsset(combined[0]);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      // No fallback - show empty state with error message
      setAvailableAssets([]);
      setSelectedAsset(null);
    }
  };

  const loadUserPortfolios = async () => {
    if (availableAssets.length > 0) {
      // Try load from PlayFab userdata first
      try {
        const r = await fetch('/api/playfab/userdata?keys=portfolios');
        if (r.ok) {
          const j = await r.json();
          const cloud = j?.data?.portfolios;
          if (Array.isArray(cloud) && cloud.length > 0) {
            setUserPortfolios(cloud);
            if (!selectedPortfolio) setSelectedPortfolio(cloud[0]);
            return;
          }
        }
      } catch (e) {
        console.warn('load portfolios from cloud failed', e);
      }
      // No cloud portfolios found - user needs to create one
      // Don't set sample portfolio - start fresh
      setUserPortfolios([]);
      setSelectedPortfolio(null);
    }
  };

  const updateMarketPrices = async () => {
    await loadAssets();
    loadUserPortfolios();
  };

  async function persistPortfolios(next: VirtualPortfolio[]) {
    try {
      setSaving(true);
      await fetch('/api/playfab/userdata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { portfolios: next } }),
      });
    } catch (e) {
      console.warn('persistPortfolios failed', e);
    } finally { setSaving(false); }
  }

  function recalcPortfolio(p: VirtualPortfolio): VirtualPortfolio {
    const positions = p.positions.map((pos) => {
      const latest = availableAssets.find((a) => a.symbol === pos.symbol)?.price ?? pos.currentPrice;
      const currentPrice = Number(latest || pos.currentPrice || 0);
      const value = currentPrice * pos.quantity;
      const pnl = (currentPrice - pos.avgPrice) * pos.quantity;
      const pnlPercent = pos.avgPrice ? ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100 : 0;
      return { ...pos, currentPrice, value, pnl, pnlPercent };
    });
    const totalValue = positions.reduce((s, x) => s + x.value, 0);
    const totalPnL = positions.reduce((s, x) => s + x.pnl, 0);
    const totalPnLPercent = totalValue ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;
    const withAlloc = positions.map((x) => ({ ...x, allocation: totalValue ? (x.value / totalValue) * 100 : 0 }));
    return { ...p, positions: withAlloc, totalValue, totalPnL, totalPnLPercent };
  }

  function createPortfolio(): VirtualPortfolio {
    const id = `pf-${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();
    return {
      id,
      name: `My Portfolio ${userPortfolios.length + 1}`,
      description: 'User created portfolio',
      owner: 'You',
      ownerAvatar: 'https://ui-avatars.com/api/?name=You&background=22c55e&color=fff',
      totalValue: 0,
      totalPnL: 0,
      totalPnLPercent: 0,
      positions: [],
      performance: { daily: 0, weekly: 0, monthly: 0, yearly: 0, maxDrawdown: 0, sharpeRatio: 0, winRate: 0 },
      strategy: { type: 'Custom', description: 'User-defined strategy', riskLevel: 'Low', timeHorizon: '1 year' },
      blockchain: { hash: id, version: 1, verified: false, createdAt: now, lastUpdated: now },
      social: { followers: 0, copiers: 0, likes: 0, isPublic: true },
      reputation: { score: 0, badges: [], rank: 'New', achievements: [] },
      aiAnalysis: { riskScore: 0, diversificationScore: 0, momentumScore: 0, valueScore: 0, recommendations: [] },
    };
  }

  async function addSelectedAssetToPortfolio(qty: number, portfolioId?: string) {
    if (!selectedAsset) return;
    let target = selectedPortfolio;
    if (portfolioId) {
      const found = userPortfolios.find((p) => p.id === portfolioId);
      if (found) target = found;
    }
    if (!target) {
      target = createPortfolio();
    }
    const idx = target.positions.findIndex((p) => p.symbol === selectedAsset.symbol);
    if (idx >= 0) {
      const pos = target.positions[idx];
      const newQty = pos.quantity + qty;
      const newAvg = ((pos.avgPrice * pos.quantity) + (selectedAsset.price * qty)) / newQty;
      target.positions[idx] = {
        ...pos,
        quantity: newQty,
        avgPrice: newAvg,
        currentPrice: selectedAsset.price,
      };
    } else {
      target.positions.push({
        assetId: selectedAsset.id,
        symbol: selectedAsset.symbol,
        quantity: qty,
        avgPrice: selectedAsset.price,
        currentPrice: selectedAsset.price,
        value: selectedAsset.price * qty,
        pnl: 0,
        pnlPercent: 0,
        allocation: 0,
      });
    }
    target.blockchain.lastUpdated = new Date().toISOString();
    const updated = recalcPortfolio({ ...target });
    let next = userPortfolios.slice();
    const pIndex = next.findIndex((p) => p.id === updated.id);
    if (pIndex >= 0) next[pIndex] = updated; else next = [updated, ...next];
    setUserPortfolios(next);
    setSelectedPortfolio(updated);
    await persistPortfolios(next);
    showToast(`Added ${qty} ${selectedAsset.symbol} to portfolio!`, 'success');
    try { await updatePortfolioValueStat(updated.totalValue); } catch {}
  }

  async function fetchDiscover() {
    try {
      setLoadingDiscover(true);
      const [r1, r2] = await Promise.all([
        fetch('/api/social/feed'),
        fetch('/api/playfab/userdata?keys=socialPosts'),
      ]);
      let posts = [] as any[];
      if (r1.ok) {
        const j = await r1.json();
        posts = Array.isArray(j.posts) ? j.posts : [];
      }
      if (r2.ok) {
        const k = await r2.json();
        const mine = Array.isArray(k?.data?.socialPosts) ? k.data.socialPosts : [];
        posts = [...mine, ...posts];
      }
      setDiscover(posts);
    } catch (e) {
      console.warn('discover feed failed', e);
      setDiscover([]);
    } finally { setLoadingDiscover(false); }
  }

  async function copyTradeToPortfolio(post: any) {
    const trade = post?.trade;
    if (!trade || !trade.symbol || !selectedAsset) {
      // Try to set selected asset to trade symbol if present in available assets
      const a = availableAssets.find((x) => x.symbol.toUpperCase() === String(trade?.symbol || '').toUpperCase());
      if (a) setSelectedAsset(a);
    }
    const qty = Number(trade?.quantity || 1);
    const a = availableAssets.find((x) => x.symbol.toUpperCase() === String(trade?.symbol || '').toUpperCase());
    if (a) {
      // temporarily set selectedAsset so price is used
      setSelectedAsset(a);
      await addSelectedAssetToPortfolio(qty, targetPortfolioId || selectedPortfolio?.id);
    }
  }

  async function shareSelectedPortfolio() {
    if (!selectedPortfolio || shareSaving) return;
    try {
      setShareSaving(true);
      const p = selectedPortfolio;
      await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'portfolio-share',
          content: `Sharing portfolio ${p.name} with value ${p.totalValue.toLocaleString()}`,
          portfolio: { id: p.id, name: p.name, performance: Number(p.totalPnLPercent || 0), value: Number(p.totalValue || 0) },
        }),
      });
      // soft refresh discover to show the shared item
      fetchDiscover();
    } catch (e) {
      console.warn('shareSelectedPortfolio failed', e);
    } finally { setShareSaving(false); }
  }

  useEffect(() => {
    if (availableAssets.length > 0 && userPortfolios.length === 0) {
      loadUserPortfolios();
    }
  }, [availableAssets]);

  const filteredAssets = availableAssets.filter(asset => {
    const matchesSearch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === 'all' || asset.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full p-6 bg-black/90 flex items-center justify-center">
        <div className="text-white">Loading portfolio data...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 bg-black/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-mono text-white/90 protocol-text">Trading Sandbox</h2>
          <div className="flex items-center space-x-4">
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">Virtual Balance: </span>
              <span className="text-white font-medium">${virtualBalance.toLocaleString()}</span>
            </div>
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">GC: </span>
              <span className="text-white font-medium">{gcBalance.toLocaleString()}</span>
            </div>
            <button
              onClick={() => {
                const np = createPortfolio();
                const next = [np, ...userPortfolios];
                setUserPortfolios(next);
                setSelectedPortfolio(np);
                persistPortfolios(next);
                showToast('Portfolio created successfully!', 'success');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
            >
              <Plus size={16} />
              <span>Create Portfolio</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'portfolio' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            My Portfolios
          </button>
          <button
            onClick={() => setActiveTab('market-data')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'market-data' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Live Market Data
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'discover' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Discover Strategies
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'leaderboard' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Leaderboard
          </button>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userPortfolios.length > 0 ? (
                    userPortfolios.map(portfolio => (
                      <div 
                        key={portfolio.id}
                        className="glass-effect rounded-lg p-6 hover:bg-white/5 transition-all cursor-pointer"
                        onClick={() => setSelectedPortfolio(portfolio)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={portfolio.ownerAvatar}
                              alt={portfolio.owner}
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <h3 className="text-lg font-medium text-white">{portfolio.name}</h3>
                              <p className="text-sm text-white/60">by {portfolio.owner}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {portfolio.blockchain.verified && (
                              <Shield size={16} className="text-green-400" />
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-white/60">Total Value</div>
                            <div className="text-lg font-medium text-white">
                              ${portfolio.totalValue.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-white/60">P&L</div>
                            <div className={`text-lg font-medium ${portfolio.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {portfolio.totalPnL >= 0 ? '+' : ''}${portfolio.totalPnL.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-white/60">Return</div>
                            <div className={`text-lg font-medium flex items-center ${portfolio.totalPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {portfolio.totalPnLPercent >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                              {formatPercent(portfolio.totalPnLPercent)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-white/60">
                            Risk: <span className={`${portfolio.strategy.riskLevel === 'Low' ? 'text-green-400' : portfolio.strategy.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                              {portfolio.strategy.riskLevel}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-white/60">
                            <Hash size={14} />
                            <span className="font-mono">{portfolio.blockchain.hash.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 glass-effect rounded-lg p-6">
                      <div className="text-center py-8">
                        <div className="text-white/60 mb-4">No portfolios found</div>
                        <button className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                          Create Your First Portfolio
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'market-data' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search stocks, ETFs, crypto..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40"
                    />
                  </div>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="all">All Assets</option>
                    <option value="Technology">Technology</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Crypto">Crypto</option>
                  </select>
                  <button
                    onClick={updateMarketPrices}
                    className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10"
                  >
                    <RefreshCw size={18} className="text-white/60" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset) => (
                      <div 
                        key={asset.id}
                        className={`glass-effect rounded-lg p-6 cursor-pointer transition-all ${
                          selectedAsset?.id === asset.id ? 'ring-2 ring-white/50' : 'hover:bg-white/5'
                        }`}
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-white">{asset.symbol}</h3>
                            <p className="text-sm text-white/60">{asset.name}</p>
                            {asset.sector && (
                              <p className="text-xs text-white/40">{asset.sector}</p>
                            )}
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            asset.type === 'stock' ? 'bg-blue-500/20 text-blue-400' :
                            asset.type === 'crypto' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-white/20 text-white'
                          }`}>
                            {asset.type.toUpperCase()}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-white">
                              {formatCurrency(asset.price)}
                            </span>
                            <div className={`flex items-center space-x-1 ${asset.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {asset.changePercent >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                              <span className="font-medium">{formatPercent(asset.changePercent)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-white/60">24h Change</div>
                              <div className={`font-medium ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {asset.change24h >= 0 ? '+' : ''}{formatCurrency(asset.change24h)}
                              </div>
                            </div>
                            <div>
                              <div className="text-white/60">Volume</div>
                              <div className="text-white">{formatCurrency(asset.volume24h || 0)}</div>
                            </div>
                          </div>

                          {asset.marketCap && (
                            <div className="text-sm pt-3 border-t border-white/10">
                              <div className="text-white/60">Market Cap</div>
                              <div className="text-white">{formatCurrency(asset.marketCap)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 glass-effect rounded-lg p-6">
                      <div className="text-center py-8 text-white/60">
                        No assets found matching your search
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'discover' && (
              <div className="glass-effect rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Discover Professional Strategies</h3>
                  <button onClick={fetchDiscover} className="px-3 py-1 bg-white/10 rounded hover:bg-white/20 text-sm">Refresh</button>
                </div>
                {loadingDiscover ? (
                  <div className="text-white/60 py-8 text-center">Loading strategies...</div>
                ) : discover.length === 0 ? (
                  <div className="text-white/60 py-8 text-center">No strategies available right now.</div>
                ) : (
                  <div className="space-y-3">
                    {discover.map((p: any) => (
                      <div key={p.id} className="p-4 bg-white/5 rounded">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-white font-medium">{p.author?.displayName || 'Trader'}</div>
                            <div className="text-sm text-white/60">{p.type}</div>
                          </div>
                          <div className="text-xs text-white/40">{new Date(p.timestamp || Date.now()).toLocaleString()}</div>
                        </div>
                        <div className="text-sm text-white/80 mt-2">{p.content}</div>
                        {p.trade && (
                          <div className="mt-3 flex items-center justify-between text-sm">
                            <div className="text-white/70">{p.trade.action.toUpperCase()} {p.trade.quantity} {p.trade.symbol} @ ${p.trade.price}</div>
                            <button onClick={() => copyTradeToPortfolio(p)} className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">Copy Trade</button>
                          </div>
                        )}
                        {p.portfolio && (
                          <div className="mt-3 text-xs text-white/60">Portfolio: {p.portfolio.name} · Perf: {p.portfolio.performance}% · ${p.portfolio.value}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="glass-effect rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Performance Leaderboard</h3>
                {leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy size={48} className="mx-auto text-white/40 mb-4" />
                    <p className="text-white/60">No leaderboard data yet</p>
                    <p className="text-sm text-white/40">Make trades or refresh after a minute</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((e) => (
                      <div key={`${e.playFabId}-${e.position}`} className="flex items-center justify-between p-3 bg-white/5 rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white/70">#{e.position + 1}</div>
                          <div>
                            <div className="text-white font-medium">{e.displayName}</div>
                            <div className="text-xs text-white/50">{e.playFabId}</div>
                          </div>
                        </div>
                        <div className="text-white font-mono">${e.statValue.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          {selectedPortfolio && activeTab === 'portfolio' && (
            <div className="w-96 glass-effect rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">{selectedPortfolio.name}</h3>
                <div className="flex items-center space-x-2">
                  <button onClick={shareSelectedPortfolio} disabled={shareSaving} className="p-2 hover:bg-white/10 rounded">
                    <Share2 size={16} className="text-white/60" />
                  </button>
                  {selectedPortfolio.social.isPublic ? (
                    <Eye size={16} className="text-green-400" />
                  ) : (
                    <EyeOff size={16} className="text-white/40" />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-effect rounded-lg p-4">
                    <div className="text-sm text-white/60 mb-1">Total Value</div>
                    <div className="text-xl font-medium text-white">
                      ${selectedPortfolio.totalValue.toLocaleString()}
                    </div>
                  </div>
                  <div className="glass-effect rounded-lg p-4">
                    <div className="text-sm text-white/60 mb-1">P&L</div>
                    <div className={`text-xl font-medium ${selectedPortfolio.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedPortfolio.totalPnL >= 0 ? '+' : ''}${selectedPortfolio.totalPnL.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Positions</h4>
                  <div className="space-y-3">
                    {selectedPortfolio.positions.map((position, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-white/10">
                        <div>
                          <div className="text-white font-medium">{position.symbol}</div>
                          <div className="text-sm text-white/60">{position.quantity} units</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white">{formatCurrency(position.value)}</div>
                          <div className={`text-sm ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Daily</span>
                      <span className={selectedPortfolio.performance.daily >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatPercent(selectedPortfolio.performance.daily)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Monthly</span>
                      <span className={selectedPortfolio.performance.monthly >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatPercent(selectedPortfolio.performance.monthly)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Yearly</span>
                      <span className={selectedPortfolio.performance.yearly >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatPercent(selectedPortfolio.performance.yearly)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Sharpe Ratio</span>
                      <span className="text-white">{selectedPortfolio.performance.sharpeRatio.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Win Rate</span>
                      <span className="text-white">{selectedPortfolio.performance.winRate}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">AI Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Risk Score</span>
                      <span className="text-white">{selectedPortfolio.aiAnalysis.riskScore}/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Diversification</span>
                      <span className="text-white">{selectedPortfolio.aiAnalysis.diversificationScore}/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Momentum</span>
                      <span className="text-white">{selectedPortfolio.aiAnalysis.momentumScore}/10</span>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-white/60">
                    <h5 className="mb-1">Recommendations:</h5>
                    <ul className="space-y-1">
                      {selectedPortfolio.aiAnalysis.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedAsset && activeTab === 'market-data' && (
            <div className="w-96 glass-effect rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-white">{selectedAsset.symbol}</h3>
                  <p className="text-sm text-white/60">{selectedAsset.name}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  selectedAsset.type === 'stock' ? 'bg-blue-500/20 text-blue-400' :
                  selectedAsset.type === 'crypto' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-white/20 text-white'
                }`}>
                  {selectedAsset.type.toUpperCase()}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatCurrency(selectedAsset.price)}
                  </div>
                  <div className={`flex items-center space-x-2 ${selectedAsset.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedAsset.changePercent >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    <span>{formatPercent(selectedAsset.changePercent)}</span>
                    <span>({selectedAsset.change24h >= 0 ? '+' : ''}{formatCurrency(selectedAsset.change24h)})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-white/60">Type</div>
                    <div className="text-white">{selectedAsset.type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white/60">Risk Score</div>
                    <div className="text-white">{selectedAsset.riskScore}/10</div>
                  </div>
                  {selectedAsset.volume24h && (
                    <div className="col-span-2">
                      <div className="text-sm text-white/60">24h Volume</div>
                      <div className="text-white">{formatCurrency(selectedAsset.volume24h)}</div>
                    </div>
                  )}
                  {selectedAsset.marketCap && (
                    <div className="col-span-2">
                      <div className="text-sm text-white/60">Market Cap</div>
                      <div className="text-white">{formatCurrency(selectedAsset.marketCap)}</div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Description</h4>
                  <p className="text-sm text-white/60">{selectedAsset.description}</p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  {!showAddForm ? (
                    <button onClick={() => setShowAddForm(true)} className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      Add to Portfolio
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="number" min={1} value={addQty} onChange={(e) => setAddQty(Math.max(1, Number(e.target.value || 1)))} className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-white" />
                        <span className="text-white/60 text-sm">units · Target:</span>
                        <select value={targetPortfolioId} onChange={(e) => setTargetPortfolioId(e.target.value)} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white">
                          <option value="">New Portfolio</option>
                          {userPortfolios.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button disabled={saving} onClick={() => addSelectedAssetToPortfolio(addQty, targetPortfolioId || undefined)} className="flex-1 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">
                          {saving ? 'Adding...' : 'Confirm Add'}
                        </button>
                        <button onClick={() => setShowAddForm(false)} className="px-3 py-2 bg-white/10 rounded hover:bg-white/20">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualPortfolio;