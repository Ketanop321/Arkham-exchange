import React, { useEffect, useState } from 'react';
import { Gift, Coins, RefreshCw, Shield, Sparkles } from 'lucide-react';
import { useToast } from '../../Toast';

interface Balances { [code: string]: number }

const Exchange: React.FC = () => {
  const [balances, setBalances] = useState<Balances>({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    ensureSession().then(() => {
      fetchBalances();
      claimWelcomeBonus();
    });
  }, []);

  async function ensureSession() {
    try { await fetch('/api/playfab/session', { method: 'POST' }); } catch {}
  }

  async function claimWelcomeBonus() {
    try {
      const r = await fetch('/api/playfab/welcome', { method: 'POST' });
      if (r.ok) {
        const j = await r.json();
        if (j.granted && !j.alreadyClaimed) {
          showToast('success', j.message || 'Welcome bonus claimed! 🎉');
          fetchBalances(); // Refresh balances after bonus
        }
      }
    } catch {}
  }

  async function fetchBalances() {
    try {
      const r = await fetch('/api/playfab/currency');
      if (!r.ok) throw new Error(`status ${r.status}`);
      const j = await r.json();
      setBalances(j.balances || {});
    } catch (e) {
      setBalances({});
    }
  }

  async function buy(packId: string) {
    if (loading) return;
    setLoading(true);
    try {
      const r = await fetch('/api/store/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      });
      const j = await r.json().catch(() => ({}));
      console.log('[Exchange] Response:', r.status, j);
      if (!r.ok || j?.error) {
        const errMsg = j?.message || j?.error || `status ${r.status}`;
        const detail = j?.detail ? ` (${JSON.stringify(j.detail)})` : '';
        throw new Error(`${errMsg}${detail}`);
      }
      showToast('success', `+${j.grantGC || 0} GC purchased successfully! 🪙`);
      await fetchBalances();
    } catch (e: any) {
      console.error('[Exchange] Purchase error:', e);
      showToast('error', `Purchase failed: ${e?.message || 'unknown error'}`);
    } finally { setLoading(false); }
  }

  const pt = Number(balances.PT || 0);
  const gc = Number(balances.GC || 0);

  return (
    <div className="w-full h-full p-6 bg-black/90">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Gift size={24} className="text-white/80" />
            <h2 className="text-2xl font-mono text-white/90">Store</h2>
          </div>
          <button onClick={() => { fetchBalances(); showToast('info', 'Balances refreshed'); }} className="p-2 bg-white/10 rounded hover:bg-white/20">
            <RefreshCw size={16} className="text-white/60" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-effect rounded p-4">
            <div className="text-sm text-white/60">Premium Tokens (PT)</div>
            <div className="text-2xl font-bold text-white">{pt.toLocaleString()}</div>
          </div>
          <div className="glass-effect rounded p-4">
            <div className="text-sm text-white/60">Game Coins (GC)</div>
            <div className="text-2xl font-bold text-white">{gc.toLocaleString()}</div>
          </div>
          <div className="glass-effect rounded p-4 flex items-center space-x-2">
            <Shield size={18} className="text-green-400" />
            <div className="text-white/60 text-sm">PlayFab-secured balances</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-effect rounded-lg p-6">
            <div className="text-sm text-white/60">Starter Pack</div>
            <div className="text-white text-2xl font-bold flex items-center space-x-2 mt-1">
              <Coins size={18} className="text-yellow-400" />
              <span>100 GC</span>
            </div>
            <div className="text-xs text-white/50 mt-1">Cost: 1 PT</div>
            <button disabled={loading || pt < 1} onClick={() => buy('gc_pack_starter')} className="mt-4 w-full py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Processing...' : 'Buy'}</button>
          </div>
          <div className="glass-effect rounded-lg p-6">
            <div className="text-sm text-white/60">Pro Pack</div>
            <div className="text-white text-2xl font-bold flex items-center space-x-2 mt-1">
              <Coins size={18} className="text-yellow-400" />
              <span>400 GC</span>
            </div>
            <div className="text-xs text-white/50 mt-1">Cost: 3 PT</div>
            <button disabled={loading || pt < 3} onClick={() => buy('gc_pack_pro')} className="mt-4 w-full py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Processing...' : 'Buy'}</button>
          </div>
          <div className="glass-effect rounded-lg p-6">
            <div className="text-sm text-white/60">Elite Pack</div>
            <div className="text-white text-2xl font-bold flex items-center space-x-2 mt-1">
              <Coins size={18} className="text-yellow-400" />
              <span>1000 GC</span>
            </div>
            <div className="text-xs text-white/50 mt-1">Cost: 5 PT</div>
            <button disabled={loading || pt < 5} onClick={() => buy('gc_pack_elite')} className="mt-4 w-full py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Processing...' : 'Buy'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exchange;
