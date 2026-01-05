import React, { useState, useEffect } from 'react';
import { GraduationCap, Target, TrendingUp, Building2, Briefcase, Lock, CheckCircle, PieChart, Trophy, Rocket, Clapperboard } from 'lucide-react';

interface CareerTrack {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  duration: string;
  fundType: 'hedge-fund' | 'investment-bank' | 'real-estate' | 'venture-capital' | 'private-equity' | 'mutual-fund' | 'movie-music';
  startingCapital: number;
  targetCapital: number;
  currentProgress: number;
  modules: Array<{
    id: string;
    name: string;
    description: string;
    completed: boolean;
    locked: boolean;
    estimatedTime: string;
  }>;
  achievements: string[];
  skills: string[];
}


interface DailyGoal {
  id: string;
  title: string;
  description: string;
  type: 'learning' | 'trading' | 'research' | 'networking';
  progress: number;
  target: number;
  reward: {
    xp: number;
    badge?: string;
  };
  dueDate: string;
}

interface MarketSimulation {
  id: string;
  name: string;
  description: string;
  scenario: string;
  difficulty: string;
  duration: string;
  participants: number;
  status: 'upcoming' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  rewards: {
    winner: string;
    participation: string;
  };
  sources?: {
    news?: string[];
    notes?: string;
  };
  subquests?: Array<{ role: string; taskId: string; hint: string }>;
}

const GameProgress: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'career-tracks' | 'daily-goals' | 'simulations' | 'achievements'>('overview');
  const [careerTracks, setCareerTracks] = useState<CareerTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<CareerTrack | null>(null);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [marketSimulations, setMarketSimulations] = useState<MarketSimulation[]>([]);
  const [userStats, setUserStats] = useState({
    level: 15,
    xp: 7500,
    nextLevelXp: 10000,
    totalFundsManaged: 3,
    totalAUM: 25000000,
    careerRank: 'Senior Associate',
    specializations: ['Quantitative Analysis', 'Risk Management', 'Portfolio Construction']
  });
  // PlayFab session is ensured on mount; no need to gate with a flag here
  const [claimedGoals, setClaimedGoals] = useState<Record<string, boolean>>({});
  const [generating, setGenerating] = useState(false);
  const [gcBalance, setGcBalance] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [careerProgress, setCareerProgress] = useState<Record<string, Record<string, boolean>>>({});
  const [showTeams, setShowTeams] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [myTeam, setMyTeam] = useState<{ name: string; joinedAt: string } | null>(null);
  const [simRuns, setSimRuns] = useState<Record<string, { subquests?: Record<string, { done: boolean; updatedAt: number }>; teamName?: string; lastUpdated?: number }>>({});

  useEffect(() => {
    ensurePlayFabSession();
    loadCareerData();
    loadPlayerMeta();
  }, []);

  const iconForFundType = (fundType: string): React.ElementType => {
    switch (fundType) {
      case 'hedge-fund': return TrendingUp;
      case 'investment-bank': return Building2;
      case 'real-estate': return Building2;
      case 'venture-capital': return Rocket;
      case 'private-equity': return Briefcase;
      case 'mutual-fund': return PieChart;
      case 'movie-music': return Clapperboard;
      default: return Target;
    }
  };
  async function toggleSubquest(simId: string, taskId: string, nextDone: boolean) {
    try {
      await fetch('/api/simulations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simId, subquestId: taskId, done: nextDone, teamName: myTeam?.name || undefined }),
      });
      setSimRuns((prev) => {
        const cur = { ...(prev[simId] || { subquests: {} }) };
        cur.subquests = cur.subquests || {};
        cur.subquests[taskId] = { done: nextDone, updatedAt: Date.now() };
        return { ...prev, [simId]: cur };
      });
    } catch {}
  }
  function diffXpByDifficulty(d: CareerTrack['difficulty']) {
    switch (d) {
      case 'Beginner': return 75;
      case 'Intermediate': return 125;
      case 'Advanced': return 175;
      case 'Expert': return 225;
      default: return 100;
    }
  }

  async function saveMyTeam(name: string) {
    try {
      await fetch('/api/playfab/userdata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { teamStats: { name, joinedAt: new Date().toISOString() } } }),
      });
      setMyTeam({ name, joinedAt: new Date().toISOString() });
    } catch {}
  }

  async function completeModule(track: CareerTrack, moduleId: string) {
    try {
      // Already completed? no-op
      const t = careerTracks.find((x) => x.id === track.id);
      const mod = t?.modules.find((m) => m.id === moduleId);
      if (!mod || mod.completed || mod.locked) return;

      // Update UI state for tracks
      const updated = careerTracks.map((ct) => ct.id !== track.id ? ct : {
        ...ct,
        modules: ct.modules.map((m) => m.id === moduleId ? { ...m, completed: true } : m),
        currentProgress: Math.min(100, Math.round(((ct.modules.filter(m => m.completed || m.id === moduleId).length) / Math.max(1, ct.modules.length)) * 100))
      });
      setCareerTracks(updated);
      const newSelected = updated.find((x) => selectedTrack && x.id === selectedTrack.id) || null;
      setSelectedTrack(newSelected);

      // Save module completion to PlayFab
      const cp = { ...careerProgress };
      cp[track.id] = cp[track.id] || {};
      cp[track.id][moduleId] = true;
      setCareerProgress(cp);
      fetch('/api/playfab/userdata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { careerProgress: cp } }),
      }).catch(() => {});

      // Award XP + GC
      const xp = diffXpByDifficulty(track.difficulty);
      const gc = 10;
      const qr = await fetch('/api/quests/daily', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ xp, currencyCode: 'GC', currencyAmount: gc }) });
      if (qr.ok) {
        const j = await qr.json().catch(() => ({} as any));
        if (typeof j.newXp === 'number') setUserStats((prev) => ({ ...prev, xp: j.newXp }));
      }
      // refresh GC balance
      try {
        const cr = await fetch('/api/playfab/currency');
        if (cr.ok) { const jc = await cr.json(); setGcBalance(Number(jc?.balances?.GC || 0)); }
      } catch {}

      // Unlock achievement(s)
      const newAch = new Set(achievements);
      newAch.add(`Completed Module: ${mod.name}`);
      const allDone = (newSelected || track).modules.every((m) => m.id === moduleId ? true : m.completed);
      if (allDone) {
        newAch.add(`Track Completed: ${track.name}`);
        // Optionally grant track listed achievements
        for (const a of track.achievements || []) newAch.add(a);
      }
      const arr = Array.from(newAch);
      setAchievements(arr);
      fetch('/api/playfab/userdata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { achievements: arr } }),
      }).catch(() => {});
    } catch (e) {
      console.warn('completeModule failed', e);
    }
  }

  async function ensurePlayFabSession() {
    try {
      await fetch('/api/playfab/session', { method: 'POST' });
    } catch (e) {
      console.warn('playfab session failed', e);
    }
  }

  async function loadPlayerMeta() {
    try {
      // Load achievements, careerProgress, dailyQuests, and currency
      const [udr, cr] = await Promise.all([
        fetch('/api/playfab/userdata?keys=achievements,careerProgress,dailyQuests,teamStats,simRuns'),
        fetch('/api/playfab/currency'),
      ]);
      if (udr.ok) {
        const j = await udr.json();
        if (Array.isArray(j?.data?.achievements)) setAchievements(j.data.achievements);
        if (j?.data?.careerProgress && typeof j.data.careerProgress === 'object') setCareerProgress(j.data.careerProgress);
        if (j?.data?.teamStats && j.data.teamStats.name) setMyTeam({ name: String(j.data.teamStats.name), joinedAt: String(j.data.teamStats.joinedAt || new Date().toISOString()) });
        if (j?.data?.simRuns && typeof j.data.simRuns === 'object') setSimRuns(j.data.simRuns);
        if (j?.data?.dailyQuests && Array.isArray(j.data.dailyQuests.goals)) {
          setDailyGoals(j.data.dailyQuests.goals.map((g: any, i: number) => ({
            id: String(g.id || `goal-${i+1}`),
            title: String(g.title || 'Goal'),
            description: String(g.description || ''),
            type: (['learning','trading','research','networking'].includes(g.type) ? g.type : 'learning') as DailyGoal['type'],
            progress: Number(g.progress || 0),
            target: Number(g.target || 1),
            reward: { xp: Number(g.reward?.xp || 0), badge: g.reward?.badge ? String(g.reward.badge) : undefined },
            dueDate: String(g.dueDate || new Date().toISOString()),
          })));
        } else {
          // Ask backend to generate and persist for today
          try {
            const r = await fetch('/api/quests/daily');
            if (r.ok) {
              const d = await r.json();
              if (Array.isArray(d?.goals)) {
                setDailyGoals(d.goals.map((g: any, i: number) => ({
                  id: String(g.id || `goal-${i+1}`),
                  title: String(g.title || 'Goal'),
                  description: String(g.description || ''),
                  type: (['learning','trading','research','networking'].includes(g.type) ? g.type : 'learning') as DailyGoal['type'],
                  progress: Number(g.progress || 0),
                  target: Number(g.target || 1),
                  reward: { xp: Number(g.reward?.xp || 0), badge: g.reward?.badge ? String(g.reward.badge) : undefined },
                  dueDate: String(g.dueDate || new Date().toISOString()),
                })));
              }
            }
          } catch {}
        }
      }
      if (cr.ok) {
        const jc = await cr.json();
        setGcBalance(Number(jc?.balances?.GC || 0));
      }
    } catch (e) {
      console.warn('loadPlayerMeta failed', e);
    }
  }

  async function claimDailyGoal(goal: DailyGoal) {
    if (claimedGoals[goal.id]) return;
    try {
      const rewardCurrency = goal.type === 'trading' ? 10 : 5;
      const r = await fetch('/api/quests/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp: goal.reward.xp || 0, currencyCode: 'GC', currencyAmount: rewardCurrency }),
      });
      if (r.ok) {
        const j = await r.json().catch(() => ({} as any));
        setClaimedGoals((prev) => ({ ...prev, [goal.id]: true }));
        if (typeof j.newXp === 'number') {
          setUserStats((prev) => ({ ...prev, xp: j.newXp }));
        } else {
          setUserStats((prev) => ({ ...prev, xp: prev.xp + (goal.reward.xp || 0) }));
        }
        // refresh GC balance after claim
        try {
          const cr = await fetch('/api/playfab/currency');
          if (cr.ok) { const jc = await cr.json(); setGcBalance(Number(jc?.balances?.GC || 0)); }
        } catch {}
      }
    } catch (e) {
      console.warn('claimDailyGoal failed', e);
    }
  }

  async function generateSimulation(mode: 'solo' | 'multiplayer') {
    if (generating) return;
    setGenerating(true);
    try {
      const track = selectedTrack?.fundType || 'hedge-fund';
      const r = await fetch(`/api/simulations/generate?track=${encodeURIComponent(track)}&mode=${mode}`);
      if (!r.ok) throw new Error(`status ${r.status}`);
      const s = await r.json();
      const newSim: MarketSimulation = {
        id: s.scenario?.title ? s.scenario.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() : `sim-${Date.now()}`,
        name: s.scenario?.title || 'Generated Simulation',
        description: s.scenario?.summary || 'AI-generated market scenario',
        scenario: (Array.isArray(s.scenario?.macro) ? s.scenario.macro.join('; ') : s.scenario?.macro) || 'Mixed macro environment',
        difficulty: s.scenario?.difficulty || 'Intermediate',
        duration: s.scenario?.duration || '3 days',
        participants: 0,
        status: 'upcoming',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        rewards: { winner: '500 XP + GC', participation: '100 XP' },
        sources: { news: Array.isArray(s?.sources?.news) ? s.sources.news : [] , notes: s?.sources?.notes },
        subquests: Array.isArray(s?.subquests) ? s.subquests.map((q: any) => ({ role: String(q.role || ''), taskId: String(q.taskId || q.id || ''), hint: String(q.hint || '') })) : [],
      };
      setMarketSimulations((prev) => [newSim, ...prev]);
    } catch (e) {
      console.warn('generateSimulation failed', e);
    } finally {
      setGenerating(false);
    }
  }

  const loadCareerData = async () => {
    try {
      const res = await fetch('/api/career/tracks?level=Intermediate');
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();

      setUserStats({
        level: Number(data.userStats?.level || 1),
        xp: Number(data.userStats?.xp || 0),
        nextLevelXp: Number(data.userStats?.nextLevelXp || 1000),
        totalFundsManaged: Number(data.userStats?.totalFundsManaged || 0),
        totalAUM: Number(data.userStats?.totalAUM || 0),
        careerRank: String(data.userStats?.careerRank || 'Associate'),
        specializations: Array.isArray(data.userStats?.specializations) ? data.userStats.specializations.map(String) : [],
      });

      const tracksRaw: CareerTrack[] = (Array.isArray(data.careerTracks) ? data.careerTracks : []).map((t: any) => ({
        id: String(t.id || cryptoRandomId()),
        name: String(t.name || 'Career Track'),
        description: String(t.description || ''),
        icon: iconForFundType(String(t.fundType || '')),
        difficulty: (['Beginner','Intermediate','Advanced','Expert'].includes(t.difficulty) ? t.difficulty : 'Intermediate') as CareerTrack['difficulty'],
        duration: String(t.duration || ''),
        fundType: (['hedge-fund','investment-bank','real-estate','venture-capital','private-equity','mutual-fund','movie-music'].includes(t.fundType) ? t.fundType : 'hedge-fund') as CareerTrack['fundType'],
        startingCapital: Number(t.startingCapital || 0),
        targetCapital: Number(t.targetCapital || 0),
        currentProgress: Number(t.currentProgress || 0),
        modules: (Array.isArray(t.modules) ? t.modules : []).map((m: any, i: number) => ({
          id: String(m.id || `${t.id || 'track'}-mod-${i+1}`),
          name: String(m.name || 'Module'),
          description: String(m.description || ''),
          completed: Boolean(m.completed || false),
          locked: Boolean(m.locked || false),
          estimatedTime: String(m.estimatedTime || ''),
        })),
        achievements: (Array.isArray(t.achievements) ? t.achievements : []).map(String),
        skills: (Array.isArray(t.skills) ? t.skills : []).map(String),
      }));
      const merged = applyCareerProgressToTracks(tracksRaw, careerProgress);
      setCareerTracks(merged);
      setSelectedTrack(merged[0] || null);

      const goals: DailyGoal[] = (Array.isArray(data.dailyGoals) ? data.dailyGoals : []).map((g: any, i: number) => ({
        id: String(g.id || `goal-${i+1}`),
        title: String(g.title || 'Goal'),
        description: String(g.description || ''),
        type: (['learning','trading','research','networking'].includes(g.type) ? g.type : 'learning') as DailyGoal['type'],
        progress: Number(g.progress || 0),
        target: Number(g.target || 1),
        reward: { xp: Number(g.reward?.xp || 0), badge: g.reward?.badge ? String(g.reward.badge) : undefined },
        dueDate: String(g.dueDate || new Date().toISOString()),
      }));
      if (dailyGoals.length === 0 && goals.length) setDailyGoals(goals);

      const sims: MarketSimulation[] = (Array.isArray(data.marketSimulations) ? data.marketSimulations : []).map((s: any, i: number) => ({
        id: String(s.id || `sim-${i+1}`),
        name: String(s.name || 'Simulation'),
        description: String(s.description || ''),
        scenario: String(s.scenario || ''),
        difficulty: String(s.difficulty || 'Intermediate'),
        duration: String(s.duration || ''),
        participants: Number(s.participants || 0),
        status: (['upcoming','active','completed'].includes(s.status) ? s.status : 'upcoming') as MarketSimulation['status'],
        startDate: String(s.startDate || new Date().toISOString()),
        endDate: String(s.endDate || new Date().toISOString()),
        rewards: { winner: String(s.rewards?.winner || ''), participation: String(s.rewards?.participation || '') },
      }));
      setMarketSimulations(sims);
    } catch (e) {
      console.error('loadCareerData error', e);
      setCareerTracks([]);
      setDailyGoals([]);
      setMarketSimulations([]);
    }
  };

  function cryptoRandomId() {
    try { return crypto.randomUUID(); } catch { return `id-${Math.random().toString(36).slice(2)}`; }
  }

  function applyCareerProgressToTracks(tracks: CareerTrack[], progress: Record<string, Record<string, boolean>>): CareerTrack[] {
    return tracks.map((t) => {
      const prog = progress?.[t.id] || {};
      const modules = t.modules.map((m) => ({ ...m, completed: m.completed || !!prog[m.id] }));
      const completedCount = modules.filter((m) => m.completed).length;
      const currentProgress = Math.min(100, Math.round((completedCount / Math.max(1, modules.length)) * 100));
      return { ...t, modules, currentProgress };
    });
  }

  useEffect(() => {
    if (careerTracks.length === 0) return;
    const merged = applyCareerProgressToTracks(careerTracks, careerProgress);
    // Only update if something actually changed to avoid loops
    const changed = JSON.stringify(careerTracks.map(t => ({id: t.id, modules: t.modules.map(m => m.completed)}))) !==
                    JSON.stringify(merged.map(t => ({id: t.id, modules: t.modules.map(m => m.completed)})));
    if (changed) {
      setCareerTracks(merged);
      if (selectedTrack) {
        const ns = merged.find((t) => t.id === selectedTrack.id) || merged[0];
        setSelectedTrack(ns);
      }
    }
  }, [careerProgress]);


  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'Advanced': return 'text-orange-400 bg-orange-400/20';
      case 'Expert': return 'text-red-400 bg-red-400/20';
      default: return 'text-white bg-white/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-400/20';
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'completed': return 'text-white bg-white/20';
      default: return 'text-white bg-white/20';
    }
  };

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
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="w-full h-full p-6 bg-black/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <GraduationCap size={24} className="text-white/80" />
            <h2 className="text-2xl font-mono text-white/90 protocol-text">Career Development Center</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">Level: </span>
              <span className="text-white font-medium">{userStats.level}</span>
            </div>
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">Rank: </span>
              <span className="text-white font-medium">{userStats.careerRank}</span>
            </div>
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">GC: </span>
              <span className="text-white font-medium">{gcBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'overview' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Career Overview
          </button>
          <button
            onClick={() => setActiveTab('career-tracks')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'career-tracks' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Career Tracks
          </button>
          <button
            onClick={() => setActiveTab('daily-goals')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'daily-goals' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Daily Goals
          </button>
          <button
            onClick={() => setActiveTab('simulations')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'simulations' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Market Simulations
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'achievements' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Achievements
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Career Progress Overview */}
            <div className="glass-effect rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium text-white">Career Progression</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(userStats.totalAUM)}
                  </div>
                  <div className="text-sm text-white/60">
                    Assets Under Management
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="h-4 bg-white/10 rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                    style={{ width: `${Math.min((userStats.totalAUM / 100000000) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm mt-2 text-white/60">
                  <span>$0</span>
                  <span>$100M Target</span>
                </div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="glass-effect rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Professional Level</h3>
                <div className="text-right">
                  <div className="text-lg font-medium text-white">Level {userStats.level}</div>
                  <div className="text-sm text-white/60">
                    {userStats.xp} / {userStats.nextLevelXp} XP
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="h-3 bg-white/10 rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${(userStats.xp / userStats.nextLevelXp) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Active Career Tracks */}
            <div className="glass-effect rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Active Career Tracks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careerTracks.filter(track => track.currentProgress > 0).map((track) => (
                  <div key={track.id} className="glass-effect rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-white/10 rounded-lg">
                        <track.icon size={20} className="text-white/60" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{track.name}</h4>
                        <p className="text-sm text-white/60">{track.duration}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Progress</span>
                        <span className="text-white">{track.currentProgress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${track.currentProgress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm mt-3">
                      <span className="text-white/60">AUM Target</span>
                      <span className="text-white">{formatCurrency(track.targetCapital)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div className="glass-effect rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Professional Specializations</h3>
              <div className="flex flex-wrap gap-3">
                {userStats.specializations.map((spec, index) => (
                  <div key={index} className="px-4 py-2 bg-white/10 rounded-full text-sm text-white/80 border border-white/20">
                    {spec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'career-tracks' && (
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {careerTracks.map((track) => (
                  <div 
                    key={track.id}
                    className={`glass-effect rounded-lg p-6 cursor-pointer transition-all ${
                      selectedTrack?.id === track.id ? 'ring-2 ring-white/50' : 'hover:bg-white/5'
                    }`}
                    onClick={() => setSelectedTrack(track)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-white/10 rounded-lg">
                          <track.icon size={24} className="text-white/60" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white">{track.name}</h3>
                          <p className="text-sm text-white/60">{track.duration}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${getDifficultyColor(track.difficulty)}`}>
                        {track.difficulty}
                      </div>
                    </div>

                    <p className="text-sm text-white/80 mb-4">{track.description}</p>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Starting Capital</span>
                        <span className="text-white">{formatCurrency(track.startingCapital)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Target Capital</span>
                        <span className="text-white">{formatCurrency(track.targetCapital)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Progress</span>
                        <span className="text-white">{track.currentProgress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${track.currentProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {track.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                          {skill}
                        </span>
                      ))}
                      {track.skills.length > 3 && (
                        <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60">
                          +{track.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/60">
                        {track.modules.filter(m => m.completed).length} / {track.modules.length} modules
                      </div>
                      {track.currentProgress === 0 ? (
                        <button className="px-3 py-1 bg-white/10 rounded hover:bg-white/20 text-sm">
                          Start Track
                        </button>
                      ) : (
                        <button className="px-3 py-1 bg-white/10 rounded hover:bg-white/20 text-sm">
                          Continue
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedTrack && (
              <div className="w-96 glass-effect rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <selectedTrack.icon size={24} className="text-white/60" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{selectedTrack.name}</h3>
                    <p className="text-sm text-white/60">{selectedTrack.duration}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-3">Learning Modules</h4>
                    <div className="space-y-3">
                      {selectedTrack.modules.map((module, index) => (
                        <div key={module.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              module.completed ? 'bg-green-500/20 text-green-400' :
                              module.locked ? 'bg-white/10 text-white/40' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {module.completed ? (
                                <CheckCircle size={16} />
                              ) : module.locked ? (
                                <Lock size={16} />
                              ) : (
                                <span className="text-xs font-medium">{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${
                                module.locked ? 'text-white/40' : 'text-white'
                              }`}>
                                {module.name}
                              </div>
                              <div className="text-xs text-white/60">{module.estimatedTime}</div>
                            </div>
                          </div>
                          <div>
                            <button
                              onClick={() => completeModule(selectedTrack!, module.id)}
                              disabled={module.locked || module.completed}
                              className={`px-3 py-1 rounded text-sm ${module.completed ? 'bg-white/10 text-white/40' : module.locked ? 'bg-white/10 text-white/40' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                            >
                              {module.completed ? 'Completed' : module.locked ? 'Locked' : 'Complete'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-3">Skills You'll Learn</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTrack.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-3">Career Achievements</h4>
                    <div className="space-y-2">
                      {selectedTrack.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Trophy size={14} className="text-yellow-400" />
                          <span className="text-white/80">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <button className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      {selectedTrack.currentProgress === 0 ? 'Begin Career Track' : 'Continue Learning'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'daily-goals' && (
          <div className="space-y-6">
            <div className="glass-effect rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Today's Professional Goals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dailyGoals.map((goal) => (
                  <div key={goal.id} className="glass-effect rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-medium">{goal.title}</h4>
                        <p className="text-sm text-white/60 mt-1">{goal.description}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        goal.type === 'learning' ? 'bg-blue-500/20 text-blue-400' :
                        goal.type === 'trading' ? 'bg-green-500/20 text-green-400' :
                        goal.type === 'research' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {goal.type}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Progress</span>
                        <span className="text-white">{goal.progress} / {goal.target}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-white/60">
                        Reward: {goal.reward.xp} XP
                        {goal.reward.badge && ` + ${goal.reward.badge}`}
                      </div>
                      <div className="text-white/60">
                        Due: {new Date(goal.dueDate).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="pt-3 flex justify-end">
                      <button
                        onClick={() => claimDailyGoal(goal)}
                        disabled={!!claimedGoals[goal.id]}
                        className={`px-3 py-1 rounded text-sm ${claimedGoals[goal.id] ? 'bg-white/10 text-white/40' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                      >
                        {claimedGoals[goal.id] ? 'Claimed' : 'Claim Reward'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'simulations' && (
          <div className="space-y-6">
            <div className="glass-effect rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Market Simulations</h3>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => generateSimulation('solo')}
                  disabled={generating}
                  className={`px-3 py-2 rounded ${generating ? 'bg-white/10 text-white/40' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                  Generate Solo Simulation
                </button>
                <button
                  onClick={() => generateSimulation('multiplayer')}
                  disabled={generating}
                  className={`px-3 py-2 rounded ${generating ? 'bg-white/10 text-white/40' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                  Generate Multiplayer Campaign
                </button>
                <button
                  onClick={() => setShowTeams((s) => !s)}
                  className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-white"
                >
                  {showTeams ? 'Hide Teams' : 'Open Teams'}
                </button>
              </div>
              {showTeams && (
                <div className="mb-4 glass-effect rounded-lg p-4">
                  {myTeam ? (
                    <div className="flex items-center justify-between">
                      <div className="text-white/80 text-sm">Joined team: <span className="text-white font-medium">{myTeam.name}</span></div>
                      <button onClick={() => { setMyTeam(null); saveMyTeam(''); }} className="px-3 py-1 bg-white/10 rounded hover:bg-white/20 text-sm">Leave</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team name" className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-sm" />
                      <button disabled={!teamName} onClick={() => saveMyTeam(teamName)} className="px-3 py-1 bg-white/10 rounded hover:bg-white/20 text-sm">Create/Join</button>
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-4">
                {marketSimulations.map((simulation) => (
                  <div key={simulation.id} className="glass-effect rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-white">{simulation.name}</h4>
                        <p className="text-sm text-white/60 mt-1">{simulation.description}</p>
                      </div>
                      <div className={`px-3 py-1 rounded text-sm ${getStatusColor(simulation.status)}`}>
                        {simulation.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div>
                        <div className="text-sm text-white/60">Scenario</div>
                        <div className="text-white">{simulation.scenario}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">Duration</div>
                        <div className="text-white">{simulation.duration}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">Participants</div>
                        <div className="text-white">{simulation.participants}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <div className="text-sm text-white/60 mb-2">Start Date</div>
                        <div className="text-white">{new Date(simulation.startDate).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-2">End Date</div>
                        <div className="text-white">{new Date(simulation.endDate).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="glass-effect rounded-lg p-4 mb-4">
                      <div className="text-sm text-white/60 mb-2">Rewards</div>
                      <div className="space-y-1 text-sm">
                        <div className="text-white">Winner: {simulation.rewards.winner}</div>
                        <div className="text-white/80">Participation: {simulation.rewards.participation}</div>
                      </div>
                    </div>
                    {Array.isArray(simulation.subquests) && simulation.subquests.length > 0 && (
                      <div className="glass-effect rounded-lg p-4 mb-4">
                        <div className="text-sm text-white/60 mb-2">Team Subquests</div>
                        <div className="space-y-2">
                          {simulation.subquests.map((q) => {
                            const r = simRuns[simulation.id]?.subquests?.[q.taskId];
                            const done = !!r?.done;
                            return (
                              <label key={q.taskId} className="flex items-start gap-3 text-sm">
                                <input
                                  type="checkbox"
                                  className="mt-0.5"
                                  checked={done}
                                  onChange={(e) => toggleSubquest(simulation.id, q.taskId, e.currentTarget.checked)}
                                />
                                <div>
                                  <div className="text-white">{q.role}: {q.taskId}</div>
                                  {q.hint && <div className="text-white/60 text-xs">{q.hint}</div>}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {simulation.sources?.news && simulation.sources.news.length > 0 && (
                      <div className="glass-effect rounded-lg p-4 mb-4">
                        <div className="text-sm text-white/60 mb-2">Sources</div>
                        <ul className="list-disc list-inside text-sm text-white/80 space-y-1">
                          {simulation.sources.news.slice(0, 6).map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                        {simulation.sources.notes && (
                          <div className="text-xs text-white/50 mt-2">{simulation.sources.notes}</div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className={`px-2 py-1 rounded text-xs ${getDifficultyColor(simulation.difficulty)}`}>
                        {simulation.difficulty}
                      </div>
                      <button className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        simulation.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                        simulation.status === 'active' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' :
                        'bg-white/10 text-white/60'
                      }`}>
                        {simulation.status === 'upcoming' ? 'Register' :
                         simulation.status === 'active' ? 'Join Now' :
                         'View Results'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="glass-effect rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Professional Achievements</h3>
              {achievements.length === 0 ? (
                <div className="glass-effect rounded-lg p-4 text-white/60">No achievements yet. Complete modules and tracks to unlock achievements.</div>
              ) : (
                <div className="space-y-2">
                  {achievements.map((a, i) => (
                    <div key={`${i}-${a}`} className="flex items-center space-x-2 text-sm">
                      <Trophy size={14} className="text-yellow-400" />
                      <span className="text-white/80">{a}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameProgress;