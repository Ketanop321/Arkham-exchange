import React, { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, TrendingDown, AlertTriangle, Info, Star, Clock, User, Tag, Search, Filter, Eye, Share2, Bookmark, Bell, Globe, BarChart3, PieChart, LineChart, Activity, Zap, Target, Award, Hash, Shield, Building2, Scale, Home, XCircle, Loader } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  author: string;
  publishedAt: string;
  category: 'market-news' | 'company-news' | 'regulatory' | 'economic' | 'technology' | 'crypto' | 'real-estate';
  impact: 'positive' | 'negative' | 'neutral';
  sentiment: number;
  relevanceScore: number;
  tags: string[];
  relatedAssets: string[];
  imageUrl?: string;
  isPremium: boolean;
  views: number;
  bookmarks: number;
  aiAnalysis: {
    keyPoints: string[];
    marketImpact: string;
    tradingSignals: Array<{
      asset: string;
      signal: 'buy' | 'sell' | 'hold';
      confidence: number;
    }>;
  };
  blockchain: {
    hash: string;
    verified: boolean;
    timestamp: string;
  };
}

interface MarketAlert {
  id: string;
  title: string;
  message: string;
  type: 'price' | 'volume' | 'news' | 'regulatory' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  asset: string;
  triggeredAt: string;
  isRead: boolean;
}

interface NewsFilter {
  category: string;
  impact: string;
  timeframe: string;
  source: string;
  relevanceThreshold: number;
}

const NewsCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'alerts' | 'analysis' | 'watchlist'>('news');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<NewsFilter>({
    category: 'all',
    impact: 'all',
    timeframe: '24h',
    source: 'all',
    relevanceThreshold: 50
  });
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRealNews();
  }, []);

  const fetchRealNews = async () => {
    setLoading(true);
    setError('');
    try {
      // Use your working API endpoint
      const res = await fetch('/api/news?q=markets%20OR%20stocks%20OR%20technology%20OR%20crypto%20OR%20real%20estate%20OR%20venture%20capital&limit=40');
      
      if (!res.ok) throw new Error(`API returned status ${res.status}`);
      
      const data = await res.json();
      
      if (!data.articles || data.articles.length === 0) {
        throw new Error('No articles returned from API');
      }
      
      const mapped: NewsArticle[] = data.articles.map((a: any, i: number) => ({
        id: a.id || a.url || `news-${i}`,
        title: a.title || 'Untitled',
        summary: a.description || 'No description available',
        content: a.description || 'No content available',
        source: a.source || 'Unknown',
        author: a.author || 'Unknown',
        publishedAt: a.publishedAt || new Date().toISOString(),
        category: 'market-news' as const,
        impact: 'neutral' as const,
        sentiment: typeof a.sentiment === 'number' ? a.sentiment : 0,
        relevanceScore: 70,
        tags: [],
        relatedAssets: Array.isArray(a.tickers) ? a.tickers : [],
        imageUrl: a.imageUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        isPremium: false,
        views: Math.floor(Math.random() * 5000),
        bookmarks: Math.floor(Math.random() * 500),
        aiAnalysis: {
          keyPoints: [],
          marketImpact: 'AI analysis coming soon',
          tradingSignals: [],
        },
        blockchain: {
          hash: '',
          verified: false,
          timestamp: a.publishedAt || '',
        },
      }));
      
      setArticles(mapped);
      setAlerts([]);
      setLoading(false);
    } catch (e) {
      console.error('fetchRealNews error:', e);
      setError('Unable to fetch news. Please check your internet connection and try again.');
      setArticles([]);
      setAlerts([]);
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filters.category === 'all' || article.category === filters.category;
    const matchesImpact = filters.impact === 'all' || article.impact === filters.impact;
    const matchesRelevance = article.relevanceScore >= filters.relevanceThreshold;
    
    const now = new Date();
    const articleDate = new Date(article.publishedAt);
    const timeDiff = now.getTime() - articleDate.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    let matchesTime = true;
    switch (filters.timeframe) {
      case '1h':
        matchesTime = hoursDiff <= 1;
        break;
      case '24h':
        matchesTime = hoursDiff <= 24;
        break;
      case '7d':
        matchesTime = hoursDiff <= 168;
        break;
      case '30d':
        matchesTime = hoursDiff <= 720;
        break;
    }
    
    return matchesSearch && matchesCategory && matchesImpact && matchesRelevance && matchesTime;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market-news': return BarChart3;
      case 'company-news': return Building2;
      case 'regulatory': return Scale;
      case 'economic': return TrendingUp;
      case 'technology': return Zap;
      case 'crypto': return Hash;
      case 'real-estate': return Home;
      default: return Newspaper;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market-news': return 'text-blue-400 bg-blue-400/20';
      case 'company-news': return 'text-green-400 bg-green-400/20';
      case 'regulatory': return 'text-purple-400 bg-purple-400/20';
      case 'economic': return 'text-yellow-400 bg-yellow-400/20';
      case 'technology': return 'text-cyan-400 bg-cyan-400/20';
      case 'crypto': return 'text-orange-400 bg-orange-400/20';
      case 'real-estate': return 'text-pink-400 bg-pink-400/20';
      default: return 'text-white bg-white/20';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      case 'neutral': return 'text-white/60';
      default: return 'text-white';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return TrendingUp;
      case 'negative': return TrendingDown;
      case 'neutral': return Activity;
      default: return Info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/20';
      case 'critical': return 'text-red-400 bg-red-400/20';
      default: return 'text-white bg-white/20';
    }
  };

  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  return (
    <div className="w-full h-full p-6 bg-black/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Newspaper size={24} className="text-white/80" />
            <h2 className="text-2xl font-mono text-white/90 protocol-text">News & Intelligence Center</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">Unread Alerts: </span>
              <span className="text-red-400 font-medium">{alerts.filter(a => !a.isRead).length}</span>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
              <Bell size={16} />
              <span>Alerts</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('news')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'news' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Latest News
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'alerts' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Market Alerts
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'analysis' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            AI Analysis
          </button>
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'watchlist' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Watchlist
          </button>
        </div>

        {activeTab === 'news' && (
          <>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40"
                />
              </div>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">All Categories</option>
                <option value="market-news">Market News</option>
                <option value="company-news">Company News</option>
                <option value="regulatory">Regulatory</option>
                <option value="economic">Economic</option>
                <option value="technology">Technology</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="real-estate">Real Estate</option>
              </select>
              <select
                value={filters.impact}
                onChange={(e) => setFilters(prev => ({ ...prev, impact: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">All Impact</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="neutral">Neutral</option>
              </select>
              <select
                value={filters.timeframe}
                onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader size={48} className="text-white/60 animate-spin mb-4" />
                <p className="text-white/60 text-lg">Loading latest news...</p>
              </div>
            )}

            {!loading && error && (
              <div className="glass-effect rounded-lg p-12 text-center">
                <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">News API Not Available</h3>
                <pre className="text-left text-sm text-white/60 mb-4 bg-black/40 p-4 rounded whitespace-pre-wrap max-w-2xl mx-auto">{error}</pre>
                <button
                  onClick={fetchRealNews}
                  className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-white"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && filteredArticles.length === 0 && (
              <div className="glass-effect rounded-lg p-12 text-center">
                <Newspaper size={48} className="mx-auto text-white/40 mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No News Articles Found</h3>
                <p className="text-white/60">Try adjusting your filters or search query</p>
              </div>
            )}

            {!loading && !error && filteredArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => {
                  const CategoryIcon = getCategoryIcon(article.category);
                  const ImpactIcon = getImpactIcon(article.impact);
                  const isBookmarked = bookmarkedArticles.has(article.id);
                  
                  return (
                    <div key={article.id} className="glass-effect rounded-lg p-6 hover:bg-white/5 transition-all cursor-pointer"
                         onClick={() => setSelectedArticle(article)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getCategoryColor(article.category)}`}>
                            <CategoryIcon size={20} />
                          </div>
                          <div>
                            <div className="text-sm text-white/60">{article.source}</div>
                            <div className="text-xs text-white/40">
                              {new Date(article.publishedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {article.isPremium && (
                            <Star size={16} className="text-yellow-400" />
                          )}
                          <div className={`p-1 rounded ${getImpactColor(article.impact)}`}>
                            <ImpactIcon size={16} />
                          </div>
                          {article.blockchain.verified && (
                            <Shield size={16} className="text-green-400" />
                          )}
                        </div>
                      </div>

                      {article.imageUrl && (
                        <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <h3 className="text-lg font-medium text-white mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-white/80 mb-4 line-clamp-3">{article.summary}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60">
                            +{article.tags.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-white/60">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Eye size={14} />
                            <span>{article.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Bookmark size={14} />
                            <span>{article.bookmarks}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target size={14} />
                            <span>{article.relevanceScore}%</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(article.id);
                            }}
                            className={`p-1 hover:bg-white/10 rounded ${isBookmarked ? 'text-yellow-400' : 'text-white/60'}`}
                          >
                            <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:bg-white/10 rounded"
                          >
                            <Share2 size={16} className="text-white/60" />
                          </button>
                        </div>
                      </div>

                      {article.blockchain?.verified && article.blockchain?.hash && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1 text-white/40">
                              <Hash size={12} />
                              <span className="font-mono">
                                {article.blockchain.hash.slice(0, 8)}...
                              </span>
                            </div>
                            <div className="text-white/60">
                              Sentiment: {(article.sentiment * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'alerts' && (
          <div className="glass-effect rounded-lg p-12 text-center">
            <Bell size={48} className="mx-auto text-white/40 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Active Alerts</h3>
            <p className="text-white/60">Market alerts will appear here when triggered</p>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="glass-effect rounded-lg p-12 text-center">
            <Activity size={48} className="mx-auto text-white/40 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">AI Analysis Coming Soon</h3>
            <p className="text-white/60">DeepSeek-powered article summaries and trading signals will be available soon</p>
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="glass-effect rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Bookmarked Articles</h3>
            {bookmarkedArticles.size === 0 ? (
              <div className="text-center py-12">
                <Bookmark size={48} className="mx-auto text-white/40 mb-4" />
                <p className="text-white/60">No bookmarked articles yet</p>
                <p className="text-sm text-white/40">Bookmark articles to read them later</p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.filter(article => bookmarkedArticles.has(article.id)).map((article) => (
                  <div key={article.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                    <img
                      src={article.imageUrl || 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg'}
                      alt={article.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{article.title}</h4>
                      <p className="text-sm text-white/60 mb-2">{article.summary.slice(0, 100)}...</p>
                      <div className="flex items-center space-x-4 text-xs text-white/40">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedArticle(article)}
                        className="p-2 hover:bg-white/10 rounded"
                      >
                        <Eye size={16} className="text-white/60" />
                      </button>
                      <button
                        onClick={() => toggleBookmark(article.id)}
                        className="p-2 hover:bg-white/10 rounded"
                      >
                        <Bookmark size={16} className="text-yellow-400" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-medium text-white mb-2">{selectedArticle.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <span>{selectedArticle.source}</span>
                  <span>•</span>
                  <span>By {selectedArticle.author}</span>
                  <span>•</span>
                  <span>{new Date(selectedArticle.publishedAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleBookmark(selectedArticle.id)}
                  className={`p-2 hover:bg-white/10 rounded ${
                    bookmarkedArticles.has(selectedArticle.id) ? 'text-yellow-400' : 'text-white/60'
                  }`}
                >
                  <Bookmark size={20} fill={bookmarkedArticles.has(selectedArticle.id) ? 'currentColor' : 'none'} />
                </button>
                <button className="p-2 hover:bg-white/10 rounded">
                  <Share2 size={20} className="text-white/60" />
                </button>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 hover:bg-white/10 rounded"
                >
                  <XCircle size={20} className="text-white/60" />
                </button>
              </div>
            </div>

            {selectedArticle.imageUrl && (
              <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="prose prose-invert max-w-none mb-8">
              <div className="whitespace-pre-wrap text-white/80 leading-relaxed">
                {selectedArticle.content}
              </div>
            </div>

            {selectedArticle.relatedAssets.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <h4 className="text-sm font-medium text-white/80 mb-3">Related Assets</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.relatedAssets.map((asset, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {asset}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsCenter;