import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MessageSquare, TrendingUp, Star, Award, Crown, Shield, Hash, GitBranch, Copy, Share2, Heart, Eye, Lock, Unlock, Zap, Target, Trophy, Gem, Medal } from 'lucide-react';
import { useToast } from '../Toast';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  verified: boolean;
  reputation: {
    score: number;
    rank: string;
    badges: string[];
    level: number;
  };
  stats: {
    followers: number;
    following: number;
    totalReturn: number;
    winRate: number;
    portfolios: number;
    copiers: number;
  };
  blockchain: {
    walletAddress: string;
    nftProfile?: string;
    tokenGating: {
      requiredTokens: number;
      tokenType: string;
      hasAccess: boolean;
    };
  };
  social: {
    isFollowing: boolean;
    mutualFollowers: number;
    lastActive: string;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
    unlockedAt: string;
    nftTokenId?: string;
  }>;
}

interface Post {
  id: string;
  author: User;
  content: string;
  type: 'text' | 'portfolio-share' | 'trade-alert' | 'achievement';
  timestamp: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    hasLiked: boolean;
  };
  portfolio?: {
    id: string;
    name: string;
    performance: number;
    value: number;
  };
  trade?: {
    symbol: string;
    action: 'buy' | 'sell';
    price: number;
    quantity: number;
  };
  achievement?: {
    name: string;
    rarity: string;
    nftTokenId?: string;
  };
  tokenGated?: {
    required: boolean;
    tokenType: string;
    minTokens: number;
  };
}

interface LeaderboardEntry {
  rank: number;
  user: User;
  metric: number;
  change: number;
}

const SocialGraph: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'leaderboard' | 'profile'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showTokenGateModal, setShowTokenGateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadSocialData();
  }, []);

  const iconForRarity = (rarity: string): React.ElementType => {
    switch ((rarity || '').toLowerCase()) {
      case 'legendary': return Crown;
      case 'epic': return Gem;
      case 'rare': return Medal;
      default: return Trophy;
    }
  };

  const loadSocialData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/social/feed');
      if (!res.ok) throw new Error(`Failed to load social data (${res.status})`);
      const data = await res.json();

      const usersParsed: User[] = (Array.isArray(data.users) ? data.users : []).map((u: any, i: number) => ({
        id: String(u.id || `user-${i+1}`),
        username: String(u.username || `user${i+1}`),
        displayName: String(u.displayName || `User ${i+1}`),
        avatar: String(u.avatar || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'),
        bio: String(u.bio || ''),
        verified: Boolean(u.verified || false),
        reputation: {
          score: Number(u.reputation?.score || 0),
          rank: String(u.reputation?.rank || 'Trader'),
          badges: Array.isArray(u.reputation?.badges) ? u.reputation.badges.map(String) : [],
          level: Number(u.reputation?.level || 1),
        },
        stats: {
          followers: Number(u.stats?.followers || 0),
          following: Number(u.stats?.following || 0),
          totalReturn: Number(u.stats?.totalReturn || 0),
          winRate: Number(u.stats?.winRate || 0),
          portfolios: Number(u.stats?.portfolios || 0),
          copiers: Number(u.stats?.copiers || 0),
        },
        blockchain: {
          walletAddress: String(u.blockchain?.walletAddress || '0x0000...0000'),
          nftProfile: u.blockchain?.nftProfile ? String(u.blockchain.nftProfile) : undefined,
          tokenGating: {
            requiredTokens: Number(u.blockchain?.tokenGating?.requiredTokens || 0),
            tokenType: String(u.blockchain?.tokenGating?.tokenType || 'ARKHAM'),
            hasAccess: Boolean(u.blockchain?.tokenGating?.hasAccess || false),
          },
        },
        social: {
          isFollowing: Boolean(u.social?.isFollowing || false),
          mutualFollowers: Number(u.social?.mutualFollowers || 0),
          lastActive: String(u.social?.lastActive || new Date().toISOString()),
        },
        achievements: Array.isArray(u.achievements) ? u.achievements.map((a: any, j: number) => ({
          id: String(a.id || `ach-${i+1}-${j+1}`),
          name: String(a.name || 'Achievement'),
          description: String(a.description || ''),
          icon: iconForRarity(String(a.rarity || '')),
          rarity: (['Common','Rare','Epic','Legendary'].includes(a.rarity) ? a.rarity : 'Common') as any,
          unlockedAt: String(a.unlockedAt || new Date().toISOString()),
          nftTokenId: a.nftTokenId ? String(a.nftTokenId) : undefined,
        })) : [],
      }));

      const byId = new Map(usersParsed.map((u) => [u.id, u]));

      const postsParsed: Post[] = (Array.isArray(data.posts) ? data.posts : []).map((p: any, k: number) => ({
        id: String(p.id || `post-${k+1}`),
        author: byId.get(String(p.author?.id || p.authorId)) || usersParsed[0],
        content: String(p.content || ''),
        type: ['text','portfolio-share','trade-alert','achievement'].includes(p.type) ? p.type : 'text',
        timestamp: String(p.timestamp || new Date().toISOString()),
        engagement: {
          likes: Number(p.engagement?.likes || 0),
          comments: Number(p.engagement?.comments || 0),
          shares: Number(p.engagement?.shares || 0),
          hasLiked: Boolean(p.engagement?.hasLiked || false),
        },
        portfolio: p.portfolio ? {
          id: String(p.portfolio.id || 'portfolio-1'),
          name: String(p.portfolio.name || 'Portfolio'),
          performance: Number(p.portfolio.performance || 0),
          value: Number(p.portfolio.value || 0),
        } : undefined,
        trade: p.trade ? {
          symbol: String(p.trade.symbol || 'AAPL'),
          action: p.trade.action === 'sell' ? 'sell' : 'buy',
          price: Number(p.trade.price || 0),
          quantity: Number(p.trade.quantity || 0),
        } : undefined,
        achievement: p.achievement ? {
          name: String(p.achievement.name || 'Milestone'),
          rarity: String(p.achievement.rarity || 'Common'),
          nftTokenId: p.achievement.nftTokenId ? String(p.achievement.nftTokenId) : undefined,
        } : undefined,
        tokenGated: p.tokenGated ? {
          required: Boolean(p.tokenGated.required || false),
          tokenType: String(p.tokenGated.tokenType || 'ARKHAM'),
          minTokens: Number(p.tokenGated.minTokens || 0),
        } : undefined,
      })).filter((p: any) => p.author);

      const leaderboardParsed: LeaderboardEntry[] = (Array.isArray(data.leaderboard) ? data.leaderboard : []).map((e: any, i: number) => ({
        rank: Number(e.rank || i + 1),
        user: byId.get(String(e.user?.id || e.userId)) || usersParsed[i % Math.max(usersParsed.length,1)],
        metric: Number(e.metric || 0),
        change: Number(e.change || 0),
      })).filter((e: any) => e.user);

      setUsers(usersParsed);
      setPosts(postsParsed);
      setLeaderboard(leaderboardParsed);
      setCurrentUser(usersParsed[0] || null);
    } catch (e) {
      console.error('loadSocialData error', e);
      setLoadError(e instanceof Error ? e.message : 'Failed to load social data');
      setUsers([]);
      setPosts([]);
      setLeaderboard([]);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const trendingTags = (() => {
    const counts: Record<string, number> = {};
    for (const p of posts) {
      const tags = (p.content.match(/#[A-Za-z0-9_]+/g) || []).map((t) => t.toLowerCase());
      for (const t of tags) counts[t] = (counts[t] || 0) + 1;
      if (p.trade?.symbol) {
        const t = `#${p.trade.symbol.toUpperCase()}`;
        counts[t] = (counts[t] || 0) + 1;
      }
    }
    const arr = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,4).map(([t]) => t);
    return arr.length ? arr : ['#markets', '#trading', '#finance', '#crypto'];
  })();

  // Mock data function removed - using real API data only

  const followUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    const isNowFollowing = user ? !user.social.isFollowing : true;
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            social: { ...user.social, isFollowing: !user.social.isFollowing },
            stats: { 
              ...user.stats, 
              followers: user.social.isFollowing ? user.stats.followers - 1 : user.stats.followers + 1 
            }
          }
        : user
    ));
    showToast(isNowFollowing ? 'Followed user!' : 'Unfollowed user', isNowFollowing ? 'success' : 'info');
  };

  const likePost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    const isNowLiked = post ? !post.engagement.hasLiked : true;
    setPosts(prev => prev.map(post =>
      post.id === postId
        ? {
            ...post,
            engagement: {
              ...post.engagement,
              hasLiked: !post.engagement.hasLiked,
              likes: post.engagement.hasLiked ? post.engagement.likes - 1 : post.engagement.likes + 1
            }
          }
        : post
    ));
    if (isNowLiked) showToast('Post liked!', 'success');
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Bronze Trader': return 'text-orange-600';
      case 'Silver Trader': return 'text-gray-400';
      case 'Gold Trader': return 'text-yellow-400';
      case 'Platinum Trader': return 'text-blue-400';
      case 'Diamond Trader': return 'text-purple-400';
      default: return 'text-white';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400';
      case 'Rare': return 'text-blue-400';
      case 'Epic': return 'text-purple-400';
      case 'Legendary': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  const canViewPost = (post: Post) => {
    if (!post.tokenGated?.required) return true;
    if (!currentUser) return false;
    return currentUser.blockchain.tokenGating.hasAccess;
  };

  const renderPost = (post: Post) => (
    <div key={post.id} className="glass-effect rounded-lg p-6 mb-6">
      <div className="flex items-start space-x-4">
        <img
          src={post.author.avatar}
          alt={post.author.displayName}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-white">{post.author.displayName}</span>
            <span className="text-white/60">@{post.author.username}</span>
            {post.author.verified && (
              <Shield size={16} className="text-blue-400" />
            )}
            <span className="text-white/40">•</span>
            <span className="text-white/40 text-sm">
              {new Date(post.timestamp).toLocaleTimeString()}
            </span>
            {post.tokenGated?.required && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <Lock size={14} />
                <span className="text-xs">Token Gated</span>
              </div>
            )}
          </div>

          {canViewPost(post) ? (
            <>
              <p className="text-white/80 mb-4">{post.content}</p>

              {post.type === 'portfolio-share' && post.portfolio && (
                <div className="glass-effect rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{post.portfolio.name}</h4>
                      <p className="text-white/60 text-sm">Portfolio Value: ${post.portfolio.value.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-medium">+{post.portfolio.performance}%</div>
                      <button className="text-sm text-white/60 hover:text-white flex items-center space-x-1 mt-1">
                        <Copy size={14} />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {post.type === 'achievement' && post.achievement && (
                <div className="glass-effect rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <Trophy size={24} className="text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{post.achievement.name}</h4>
                      <p className={`text-sm ${getRarityColor(post.achievement.rarity)}`}>
                        {post.achievement.rarity} Achievement
                      </p>
                      {post.achievement.nftTokenId && (
                        <p className="text-xs text-white/60 font-mono">
                          NFT: {post.achievement.nftTokenId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-6 text-white/60">
                <button
                  onClick={() => likePost(post.id)}
                  className={`flex items-center space-x-2 hover:text-white ${
                    post.engagement.hasLiked ? 'text-red-400' : ''
                  }`}
                >
                  <Heart size={16} fill={post.engagement.hasLiked ? 'currentColor' : 'none'} />
                  <span>{post.engagement.likes}</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-white">
                  <MessageSquare size={16} />
                  <span>{post.engagement.comments}</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-white">
                  <Share2 size={16} />
                  <span>{post.engagement.shares}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="glass-effect rounded-lg p-6 text-center">
              <Lock size={32} className="mx-auto mb-3 text-white/40" />
              <p className="text-white/60 mb-2">This post is token gated</p>
              <p className="text-sm text-white/40 mb-4">
                Requires {post.tokenGated?.minTokens} {post.tokenGated?.tokenType} tokens to view
              </p>
              <button
                onClick={() => setShowTokenGateModal(true)}
                className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm"
              >
                Get Access
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderUserCard = (user: User) => (
    <div key={user.id} className="glass-effect rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.displayName}
            className="w-16 h-16 rounded-full"
          />
          {user.blockchain.nftProfile && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Gem size={12} className="text-purple-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-medium text-white">{user.displayName}</h3>
            {user.verified && (
              <Shield size={16} className="text-blue-400" />
            )}
          </div>
          <p className="text-white/60 text-sm mb-1">@{user.username}</p>
          <div className={`text-sm ${getRankColor(user.reputation.rank)} mb-2`}>
            {user.reputation.rank} • Level {user.reputation.level}
          </div>
          <p className="text-white/80 text-sm mb-4">{user.bio}</p>

          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <div className="text-white/60">Followers</div>
              <div className="text-white font-medium">{user.stats.followers.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-white/60">Return</div>
              <div className="text-green-400 font-medium">+{user.stats.totalReturn}%</div>
            </div>
            <div>
              <div className="text-white/60">Win Rate</div>
              <div className="text-white font-medium">{user.stats.winRate}%</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {user.reputation.badges.slice(0, 3).map((badge, index) => (
              <span key={index} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                {badge}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-white/40">
              {user.social.mutualFollowers} mutual followers
            </div>
            <button
              onClick={() => followUser(user.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                user.social.isFollowing
                  ? 'bg-white/20 text-white hover:bg-white/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {user.social.isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full h-full p-6 bg-black/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p className="text-white/60 font-mono">Loading Social Network...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadError && posts.length === 0) {
    return (
      <div className="w-full h-full p-6 bg-black/90 flex items-center justify-center">
        <div className="text-center glass-effect p-8 rounded-lg">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h3 className="text-white text-xl mb-2 font-mono">Failed to Load</h3>
          <p className="text-white/60 mb-4">{loadError}</p>
          <button 
            onClick={loadSocialData}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 bg-black/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-mono text-white/90 protocol-text">Social Trading Network</h2>
          <div className="flex items-center space-x-4">
            {currentUser && (
              <div className="glass-effect px-4 py-2 rounded-lg">
                <span className="text-sm text-white/60">Reputation: </span>
                <span className="text-white font-medium">{currentUser.reputation.score}/10</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'feed' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'discover' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'leaderboard' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'profile' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Profile
          </button>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            {activeTab === 'feed' && (
              <div className="space-y-6">
                <div className="glass-effect rounded-lg p-6">
                  <textarea
                    placeholder="Share your trading insights..."
                    className="w-full bg-transparent text-white placeholder-white/40 resize-none border-none outline-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <button className="text-white/60 hover:text-white">
                        <Hash size={16} />
                      </button>
                      <button className="text-white/60 hover:text-white">
                        <Share2 size={16} />
                      </button>
                    </div>
                    <button className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                      Post
                    </button>
                  </div>
                </div>

                {posts.map(renderPost)}
              </div>
            )}

            {activeTab === 'discover' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search traders..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/40"
                  />
                  <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                    <option value="all">All Traders</option>
                    <option value="verified">Verified Only</option>
                    <option value="top-performers">Top Performers</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {users.map(renderUserCard)}
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Top Performers</h3>
                  <div className="space-y-4">
                    {leaderboard.map((entry) => (
                      <div key={entry.user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                            entry.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                            entry.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                            'bg-white/10 text-white/60'
                          }`}>
                            {entry.rank <= 3 ? <Trophy size={16} /> : entry.rank}
                          </div>
                          <img
                            src={entry.user.avatar}
                            alt={entry.user.displayName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="text-white font-medium">{entry.user.displayName}</div>
                            <div className="text-sm text-white/60">@{entry.user.username}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-medium text-green-400">
                            +{entry.metric}%
                          </div>
                          <div className={`text-sm ${entry.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {entry.change >= 0 ? '+' : ''}{entry.change}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && currentUser && (
              <div className="space-y-6">
                <div className="glass-effect rounded-lg p-6">
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.displayName}
                        className="w-24 h-24 rounded-full"
                      />
                      {currentUser.blockchain.nftProfile && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                          <Gem size={16} className="text-purple-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-medium text-white">{currentUser.displayName}</h2>
                        {currentUser.verified && (
                          <Shield size={20} className="text-blue-400" />
                        )}
                      </div>
                      <p className="text-white/60 mb-1">@{currentUser.username}</p>
                      <div className={`text-lg ${getRankColor(currentUser.reputation.rank)} mb-3`}>
                        {currentUser.reputation.rank} • Level {currentUser.reputation.level}
                      </div>
                      <p className="text-white/80 mb-4">{currentUser.bio}</p>

                      <div className="grid grid-cols-4 gap-6 mb-4">
                        <div>
                          <div className="text-white/60 text-sm">Followers</div>
                          <div className="text-xl font-medium text-white">{currentUser.stats.followers.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-white/60 text-sm">Following</div>
                          <div className="text-xl font-medium text-white">{currentUser.stats.following.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-white/60 text-sm">Total Return</div>
                          <div className="text-xl font-medium text-green-400">+{currentUser.stats.totalReturn}%</div>
                        </div>
                        <div>
                          <div className="text-white/60 text-sm">Copiers</div>
                          <div className="text-xl font-medium text-white">{currentUser.stats.copiers.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-white/60">
                          Wallet: <span className="font-mono">{currentUser.blockchain.walletAddress}</span>
                        </div>
                        {currentUser.blockchain.tokenGating.hasAccess && (
                          <div className="flex items-center space-x-1 text-green-400">
                            <Unlock size={14} />
                            <span className="text-xs">Premium Access</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Achievements & NFTs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentUser.achievements.map((achievement) => (
                      <div key={achievement.id} className="glass-effect rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg ${
                            achievement.rarity === 'Legendary' ? 'bg-yellow-500/20' :
                            achievement.rarity === 'Epic' ? 'bg-purple-500/20' :
                            achievement.rarity === 'Rare' ? 'bg-blue-500/20' :
                            'bg-white/10'
                          }`}>
                            <achievement.icon size={24} className={getRarityColor(achievement.rarity)} />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{achievement.name}</h4>
                            <p className="text-sm text-white/60">{achievement.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                                {achievement.rarity}
                              </span>
                              {achievement.nftTokenId && (
                                <span className="text-xs text-white/40 font-mono">
                                  {achievement.nftTokenId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-6">
            <div className="glass-effect rounded-lg p-4">
              <h3 className="text-sm font-medium text-white/80 mb-3">Trending Topics</h3>
              <div className="space-y-2">
                {['#DeFiSummer', '#AITrading', '#QuantStrategy', '#CryptoWinter'].map((tag, index) => (
                  <button key={index} className="block w-full text-left p-2 hover:bg-white/5 rounded text-sm text-white/80">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-effect rounded-lg p-4">
              <h3 className="text-sm font-medium text-white/80 mb-3">Suggested Follows</h3>
              <div className="space-y-3">
                {users.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{user.displayName}</div>
                      <div className="text-white/60 text-xs">@{user.username}</div>
                    </div>
                    <button
                      onClick={() => followUser(user.id)}
                      className="px-3 py-1 bg-white/10 rounded text-xs hover:bg-white/20"
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-effect rounded-lg p-4">
              <h3 className="text-sm font-medium text-white/80 mb-3">Token Gating</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">ARKHAM Tokens</span>
                  <span className="text-white">1,250</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Access Level</span>
                  <span className="text-green-400">Premium</span>
                </div>
                <div className="text-xs text-white/40">
                  Hold 1000+ ARKHAM tokens for exclusive content access
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Gate Modal */}
      {showTokenGateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Get Premium Access</h3>
            <div className="space-y-4">
              <div className="glass-effect rounded-lg p-4">
                <div className="text-sm text-white/60 mb-2">Required Tokens</div>
                <div className="text-2xl font-medium text-white">1,000 ARKHAM</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-white/60">Benefits:</div>
                <ul className="text-sm text-white/80 space-y-1">
                  <li>• Access to premium trading content</li>
                  <li>• Exclusive strategy discussions</li>
                  <li>• Early access to new features</li>
                  <li>• Direct messaging with top traders</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setShowTokenGateModal(false)}
                className="px-4 py-2 text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowTokenGateModal(false)}
                className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
              >
                Buy Tokens
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialGraph;