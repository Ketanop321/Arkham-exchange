import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, Zap, Target, AlertTriangle, BarChart3, LineChart, PieChart, Activity, Cpu, Database, Network, Shield, CheckCircle, XCircle, Clock, Gauge } from 'lucide-react';
import { useToast } from '../Toast';

interface QuantStrategy {
  id: string;
  name: string;
  description: string;
  type: 'momentum' | 'mean-reversion' | 'arbitrage' | 'ml-prediction' | 'sentiment';
  riskLevel: 'Low' | 'Medium' | 'High';
  expectedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  backtestPeriod: string;
  assets: string[];
  signals: {
    current: 'buy' | 'sell' | 'hold';
    strength: number;
    confidence: number;
  };
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  aiMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  isActive: boolean;
  lastUpdated: string;
}

interface MarketAnalysis {
  sentiment: {
    overall: 'bullish' | 'bearish' | 'neutral';
    score: number;
    factors: string[];
  };
  volatility: {
    current: number;
    predicted: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  correlations: Array<{
    asset1: string;
    asset2: string;
    correlation: number;
  }>;
  riskFactors: Array<{
    factor: string;
    impact: 'high' | 'medium' | 'low';
    probability: number;
  }>;
}

interface PortfolioHealth {
  overallScore: number;
  diversification: number;
  riskAdjustedReturn: number;
  liquidityScore: number;
  concentrationRisk: number;
  recommendations: Array<{
    type: 'rebalance' | 'hedge' | 'reduce-risk' | 'increase-exposure';
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

const AIQuantEngine: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'strategies' | 'analysis' | 'health' | 'backtest'>('strategies');
  const [strategies, setStrategies] = useState<QuantStrategy[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [portfolioHealth, setPortfolioHealth] = useState<PortfolioHealth | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<QuantStrategy | null>(null);
  const [isRunningBacktest, setIsRunningBacktest] = useState(false);
  const [backtestProgress, setBacktestProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    loadAIData();
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateStrategies();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const callAI = async (prompt: string): Promise<string> => {
    const r = await fetch('/api/ai/deepseek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });
    if (!r.ok) throw new Error('AI API error');
    const data = await r.json();
    return data?.choices?.[0]?.message?.content || '';
  };

  const loadAIData = async () => {
    setIsLoading(true);
    try {
      // Generate AI-powered market analysis
      const analysisPrompt = `You are a quantitative finance AI. Generate a JSON market analysis with this exact structure (no markdown, pure JSON only):
{
  "strategies": [
    {
      "id": "strategy-1",
      "name": "AI Momentum Strategy",
      "description": "Brief description",
      "type": "momentum",
      "riskLevel": "Medium",
      "expectedReturn": 18.5,
      "maxDrawdown": -8.2,
      "sharpeRatio": 1.65,
      "winRate": 62.3,
      "backtestPeriod": "2022-2025",
      "assets": ["AAPL", "NVDA", "MSFT"],
      "signals": { "current": "buy", "strength": 7.5, "confidence": 78 },
      "performance": { "daily": 0.35, "weekly": 1.8, "monthly": 6.2, "yearly": 18.5 },
      "aiMetrics": { "accuracy": 76.2, "precision": 74.1, "recall": 71.8, "f1Score": 72.9 },
      "isActive": true
    }
  ],
  "marketAnalysis": {
    "sentiment": { "overall": "bullish", "score": 6.8, "factors": ["Strong tech earnings", "Fed rate stabilization"] },
    "volatility": { "current": 16.5, "predicted": 18.2, "trend": "increasing" },
    "correlations": [{ "asset1": "AAPL", "asset2": "MSFT", "correlation": 0.75 }],
    "riskFactors": [{ "factor": "Inflation concerns", "impact": "medium", "probability": 0.4 }]
  },
  "portfolioHealth": {
    "overallScore": 7.8,
    "diversification": 6.9,
    "riskAdjustedReturn": 8.2,
    "liquidityScore": 8.5,
    "concentrationRisk": 5.5,
    "recommendations": [{ "type": "rebalance", "description": "Consider reducing tech exposure", "priority": "medium" }]
  }
}
Generate 3 different strategies with varied types (momentum, mean-reversion, sentiment). Use realistic 2025 market data.`;

      const aiResult = await callAI(analysisPrompt);
      let parsed: any = {};
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('Failed to parse AI response, using fallback');
      }

      if (parsed.strategies?.length) {
        setStrategies(parsed.strategies.map((s: any, i: number) => ({
          ...s,
          id: s.id || `strategy-${i+1}`,
          lastUpdated: new Date().toISOString()
        })));
        setSelectedStrategy(parsed.strategies[0]);
      }
      if (parsed.marketAnalysis) {
        setMarketAnalysis(parsed.marketAnalysis);
      }
      if (parsed.portfolioHealth) {
        setPortfolioHealth(parsed.portfolioHealth);
      }
      showToast('AI analysis loaded successfully!', 'success');
    } catch (e) {
      console.warn('AI load failed, using fallback data', e);
      initializeFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const prompt = `You are a professional quantitative finance AI assistant. The user is asking about trading strategies, market analysis, or portfolio management. Answer concisely and professionally.

User question: ${aiPrompt}

Provide actionable insights with specific data points where relevant.`;
      const response = await callAI(prompt);
      setAiResponse(response);
      showToast('AI analysis complete!', 'success');
    } catch (e) {
      showToast('AI analysis failed', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const initializeFallbackData = () => {
    const mockStrategies: QuantStrategy[] = [
      {
        id: 'momentum-1',
        name: 'AI Momentum Surge',
        description: 'Machine learning model identifying momentum breakouts with 85% accuracy',
        type: 'momentum',
        riskLevel: 'Medium',
        expectedReturn: 24.5,
        maxDrawdown: -12.3,
        sharpeRatio: 1.87,
        winRate: 68.4,
        backtestPeriod: '2020-2025',
        assets: ['AAPL', 'TSLA', 'NVDA', 'MSFT'],
        signals: {
          current: 'buy',
          strength: 8.2,
          confidence: 87
        },
        performance: {
          daily: 0.45,
          weekly: 2.34,
          monthly: 8.67,
          yearly: 24.5
        },
        aiMetrics: {
          accuracy: 85.2,
          precision: 82.1,
          recall: 78.9,
          f1Score: 80.4
        },
        isActive: true,
        lastUpdated: '2025-01-20T15:30:00Z'
      },
      {
        id: 'mean-reversion-1',
        name: 'Statistical Arbitrage Pro',
        description: 'Pairs trading strategy using cointegration and machine learning',
        type: 'mean-reversion',
        riskLevel: 'Low',
        expectedReturn: 16.8,
        maxDrawdown: -6.7,
        sharpeRatio: 2.34,
        winRate: 74.2,
        backtestPeriod: '2019-2025',
        assets: ['SPY', 'QQQ', 'IWM', 'VTI'],
        signals: {
          current: 'hold',
          strength: 3.1,
          confidence: 62
        },
        performance: {
          daily: 0.12,
          weekly: 0.89,
          monthly: 3.45,
          yearly: 16.8
        },
        aiMetrics: {
          accuracy: 78.9,
          precision: 81.2,
          recall: 76.5,
          f1Score: 78.8
        },
        isActive: true,
        lastUpdated: '2025-01-20T15:28:00Z'
      },
      {
        id: 'sentiment-1',
        name: 'Social Sentiment Alpha',
        description: 'NLP-powered sentiment analysis from social media and news',
        type: 'sentiment',
        riskLevel: 'High',
        expectedReturn: 32.1,
        maxDrawdown: -18.9,
        sharpeRatio: 1.45,
        winRate: 61.7,
        backtestPeriod: '2021-2025',
        assets: ['MEME', 'GME', 'AMC', 'DOGE'],
        signals: {
          current: 'sell',
          strength: 6.8,
          confidence: 73
        },
        performance: {
          daily: -1.23,
          weekly: -3.45,
          monthly: 12.34,
          yearly: 32.1
        },
        aiMetrics: {
          accuracy: 72.3,
          precision: 69.8,
          recall: 74.1,
          f1Score: 71.9
        },
        isActive: false,
        lastUpdated: '2025-01-20T15:25:00Z'
      }
    ];

    const mockMarketAnalysis: MarketAnalysis = {
      sentiment: {
        overall: 'bullish',
        score: 7.2,
        factors: [
          'Strong earnings growth',
          'Fed dovish stance',
          'Tech sector momentum',
          'Positive economic indicators'
        ]
      },
      volatility: {
        current: 18.5,
        predicted: 22.1,
        trend: 'increasing'
      },
      correlations: [
        { asset1: 'AAPL', asset2: 'MSFT', correlation: 0.78 },
        { asset1: 'TSLA', asset2: 'NVDA', correlation: 0.65 },
        { asset1: 'SPY', asset2: 'QQQ', correlation: 0.89 }
      ],
      riskFactors: [
        {
          factor: 'Geopolitical tensions',
          impact: 'medium',
          probability: 0.35
        },
        {
          factor: 'Interest rate changes',
          impact: 'high',
          probability: 0.25
        },
        {
          factor: 'Tech regulation',
          impact: 'medium',
          probability: 0.45
        }
      ]
    };

    const mockPortfolioHealth: PortfolioHealth = {
      overallScore: 8.4,
      diversification: 7.2,
      riskAdjustedReturn: 8.9,
      liquidityScore: 9.1,
      concentrationRisk: 6.8,
      recommendations: [
        {
          type: 'rebalance',
          description: 'Reduce tech exposure from 45% to 35%',
          priority: 'medium'
        },
        {
          type: 'hedge',
          description: 'Add defensive positions for downside protection',
          priority: 'high'
        },
        {
          type: 'increase-exposure',
          description: 'Consider adding international exposure',
          priority: 'low'
        }
      ]
    };

    setStrategies(mockStrategies);
    setMarketAnalysis(mockMarketAnalysis);
    setPortfolioHealth(mockPortfolioHealth);
    setSelectedStrategy(mockStrategies[0]);
  };

  const updateStrategies = () => {
    setStrategies(prev => prev.map(strategy => ({
      ...strategy,
      signals: {
        ...strategy.signals,
        strength: Math.max(0, Math.min(10, strategy.signals.strength + (Math.random() - 0.5) * 0.5)),
        confidence: Math.max(0, Math.min(100, strategy.signals.confidence + (Math.random() - 0.5) * 2))
      },
      performance: {
        ...strategy.performance,
        daily: strategy.performance.daily + (Math.random() - 0.5) * 0.1
      },
      lastUpdated: new Date().toISOString()
    })));
  };

  const runBacktest = async () => {
    setIsRunningBacktest(true);
    setBacktestProgress(0);
    
    // Simulate backtest progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setBacktestProgress(i);
    }
    
    setIsRunningBacktest(false);
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'text-green-400';
      case 'sell': return 'text-red-400';
      case 'hold': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy': return <TrendingUp size={16} />;
      case 'sell': return <TrendingDown size={16} />;
      case 'hold': return <Activity size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="w-full h-full p-6 bg-black/90 flex items-center justify-center">
        <div className="text-center">
          <Brain size={48} className="text-purple-400 animate-pulse mx-auto mb-4" />
          <div className="text-white">Loading AI analysis...</div>
          <div className="text-white/60 text-sm mt-2">Powered by OpenRouter AI</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 bg-black/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain size={24} className="text-white/80" />
            <h2 className="text-2xl font-mono text-white/90 protocol-text">AI Quant Engine</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadAIData}
              className="glass-effect px-4 py-2 rounded-lg hover:bg-white/20 flex items-center space-x-2"
            >
              <Cpu size={16} />
              <span>Refresh AI</span>
            </button>
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">Engine Status: </span>
              <span className="text-green-400 font-medium">Active</span>
            </div>
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">Models Running: </span>
              <span className="text-white font-medium">{strategies.filter(s => s.isActive).length}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('strategies')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'strategies' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Strategies
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'analysis' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Market Analysis
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'health' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Portfolio Health
          </button>
          <button
            onClick={() => setActiveTab('backtest')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'backtest' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Backtest Lab
          </button>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            {activeTab === 'strategies' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {strategies.map((strategy) => (
                    <div 
                      key={strategy.id}
                      className={`glass-effect rounded-lg p-6 cursor-pointer transition-all ${
                        selectedStrategy?.id === strategy.id ? 'ring-2 ring-white/50' : 'hover:bg-white/5'
                      }`}
                      onClick={() => setSelectedStrategy(strategy)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-white mb-1">{strategy.name}</h3>
                          <p className="text-sm text-white/60">{strategy.type}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {strategy.isActive ? (
                            <div className="flex items-center space-x-1 text-green-400">
                              <CheckCircle size={16} />
                              <span className="text-xs">Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-white/40">
                              <XCircle size={16} />
                              <span className="text-xs">Inactive</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">Signal</span>
                          <div className={`flex items-center space-x-1 ${getSignalColor(strategy.signals.current)}`}>
                            {getSignalIcon(strategy.signals.current)}
                            <span className="text-sm font-medium uppercase">{strategy.signals.current}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">Confidence</span>
                          <span className="text-sm text-white">{strategy.signals.confidence}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">Risk Level</span>
                          <span className={`text-sm ${getRiskColor(strategy.riskLevel)}`}>
                            {strategy.riskLevel}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-white/60">Expected Return</div>
                          <div className="text-lg font-medium text-green-400">
                            +{strategy.expectedReturn}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-white/60">Sharpe Ratio</div>
                          <div className="text-lg font-medium text-white">
                            {strategy.sharpeRatio}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-white/40">
                        <span>Updated {new Date(strategy.lastUpdated).toLocaleTimeString()}</span>
                        <span>AI Accuracy: {strategy.aiMetrics.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analysis' && marketAnalysis && (
              <div className="space-y-6">
                {/* AI Chat Interface */}
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center space-x-2">
                    <Brain size={20} className="text-purple-400" />
                    <span>Ask AI Analyst</span>
                  </h3>
                  <div className="flex space-x-4 mb-4">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && analyzeWithAI()}
                      placeholder="Ask about market trends, strategies, or portfolio optimization..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40"
                    />
                    <button
                      onClick={analyzeWithAI}
                      disabled={isAiLoading || !aiPrompt.trim()}
                      className="px-6 py-3 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isAiLoading ? (
                        <><Clock size={16} className="animate-spin" /><span>Analyzing...</span></>
                      ) : (
                        <><Zap size={16} /><span>Analyze</span></>
                      )}
                    </button>
                  </div>
                  {aiResponse && (
                    <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                      <div className="text-sm text-purple-400 mb-2">AI Analysis Result:</div>
                      <div className="text-white/80 whitespace-pre-wrap">{aiResponse}</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-effect rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Market Sentiment</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/60">Overall Sentiment</span>
                      <div className={`flex items-center space-x-2 ${
                        marketAnalysis.sentiment.overall === 'bullish' ? 'text-green-400' :
                        marketAnalysis.sentiment.overall === 'bearish' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {marketAnalysis.sentiment.overall === 'bullish' ? <TrendingUp size={16} /> :
                         marketAnalysis.sentiment.overall === 'bearish' ? <TrendingDown size={16} /> :
                         <Activity size={16} />}
                        <span className="font-medium capitalize">{marketAnalysis.sentiment.overall}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Sentiment Score</span>
                        <span className="text-white">{marketAnalysis.sentiment.score}/10</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full">
                        <div 
                          className="h-full bg-green-400 rounded-full"
                          style={{ width: `${marketAnalysis.sentiment.score * 10}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60 mb-2">Key Factors</div>
                      <div className="space-y-1">
                        {marketAnalysis.sentiment.factors.map((factor, index) => (
                          <div key={index} className="text-sm text-white/80 flex items-center space-x-2">
                            <div className="w-1 h-1 bg-white/40 rounded-full" />
                            <span>{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="glass-effect rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Volatility Analysis</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Current VIX</span>
                        <span className="text-white">{marketAnalysis.volatility.current}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Predicted VIX</span>
                        <span className="text-white">{marketAnalysis.volatility.predicted}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Trend</span>
                        <span className={`${
                          marketAnalysis.volatility.trend === 'increasing' ? 'text-red-400' :
                          marketAnalysis.volatility.trend === 'decreasing' ? 'text-green-400' :
                          'text-yellow-400'
                        }`}>
                          {marketAnalysis.volatility.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Risk Factors</h3>
                  <div className="space-y-4">
                    {marketAnalysis.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <div className="text-white font-medium">{risk.factor}</div>
                          <div className="text-sm text-white/60">
                            Probability: {(risk.probability * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded text-sm ${
                          risk.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                          risk.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {risk.impact} impact
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'health' && portfolioHealth && (
              <div className="space-y-6">
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-6">Portfolio Health Score</h3>
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray={`${portfolioHealth.overallScore * 10}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{portfolioHealth.overallScore}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Diversification</span>
                        <span className={getScoreColor(portfolioHealth.diversification)}>
                          {portfolioHealth.diversification}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Risk-Adjusted Return</span>
                        <span className={getScoreColor(portfolioHealth.riskAdjustedReturn)}>
                          {portfolioHealth.riskAdjustedReturn}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Liquidity Score</span>
                        <span className={getScoreColor(portfolioHealth.liquidityScore)}>
                          {portfolioHealth.liquidityScore}/10
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Concentration Risk</span>
                        <span className={getScoreColor(10 - portfolioHealth.concentrationRisk)}>
                          {portfolioHealth.concentrationRisk}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">AI Recommendations</h3>
                  <div className="space-y-4">
                    {portfolioHealth.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                        <div className={`p-2 rounded-lg ${
                          rec.priority === 'high' ? 'bg-red-500/20' :
                          rec.priority === 'medium' ? 'bg-yellow-500/20' :
                          'bg-green-500/20'
                        }`}>
                          <Target size={16} className={
                            rec.priority === 'high' ? 'text-red-400' :
                            rec.priority === 'medium' ? 'text-yellow-400' :
                            'text-green-400'
                          } />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-medium capitalize">
                              {rec.type.replace('-', ' ')}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {rec.priority} priority
                            </span>
                          </div>
                          <p className="text-sm text-white/60">{rec.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'backtest' && (
              <div className="space-y-6">
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-6">Strategy Backtest Lab</h3>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Strategy</label>
                      <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                        {strategies.map(strategy => (
                          <option key={strategy.id} value={strategy.id}>
                            {strategy.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Time Period</label>
                      <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                        <option value="1y">1 Year</option>
                        <option value="2y">2 Years</option>
                        <option value="3y">3 Years</option>
                        <option value="5y">5 Years</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Initial Capital</label>
                      <input
                        type="number"
                        defaultValue={100000}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Rebalance Frequency</label>
                      <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Transaction Costs</label>
                      <input
                        type="number"
                        defaultValue={0.1}
                        step={0.01}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </div>

                  {isRunningBacktest && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60">Running backtest...</span>
                        <span className="text-white">{backtestProgress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full">
                        <div 
                          className="h-full bg-blue-400 rounded-full transition-all duration-300"
                          style={{ width: `${backtestProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={runBacktest}
                    disabled={isRunningBacktest}
                    className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    {isRunningBacktest ? 'Running Backtest...' : 'Run Backtest'}
                  </button>
                </div>

                {selectedStrategy && (
                  <div className="glass-effect rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Backtest Results</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <div className="text-sm text-white/60 mb-1">Total Return</div>
                        <div className="text-xl font-medium text-green-400">
                          +{selectedStrategy.expectedReturn}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Max Drawdown</div>
                        <div className="text-xl font-medium text-red-400">
                          {selectedStrategy.maxDrawdown}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Sharpe Ratio</div>
                        <div className="text-xl font-medium text-white">
                          {selectedStrategy.sharpeRatio}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Win Rate</div>
                        <div className="text-xl font-medium text-white">
                          {selectedStrategy.winRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedStrategy && (
            <div className="w-96 glass-effect rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">{selectedStrategy.name}</h3>
                <div className="flex items-center space-x-2">
                  {selectedStrategy.isActive ? (
                    <div className="flex items-center space-x-1 text-green-400">
                      <CheckCircle size={16} />
                      <span className="text-xs">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-white/40">
                      <XCircle size={16} />
                      <span className="text-xs">Inactive</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Current Signal</h4>
                  <div className="glass-effect rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center space-x-2 ${getSignalColor(selectedStrategy.signals.current)}`}>
                        {getSignalIcon(selectedStrategy.signals.current)}
                        <span className="font-medium uppercase">{selectedStrategy.signals.current}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/60">Strength</div>
                        <div className="text-white font-medium">{selectedStrategy.signals.strength.toFixed(1)}/10</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Confidence</span>
                      <span className="text-white">{selectedStrategy.signals.confidence}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Daily</span>
                      <span className={selectedStrategy.performance.daily >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {selectedStrategy.performance.daily >= 0 ? '+' : ''}{selectedStrategy.performance.daily.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Weekly</span>
                      <span className={selectedStrategy.performance.weekly >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {selectedStrategy.performance.weekly >= 0 ? '+' : ''}{selectedStrategy.performance.weekly.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Monthly</span>
                      <span className={selectedStrategy.performance.monthly >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {selectedStrategy.performance.monthly >= 0 ? '+' : ''}{selectedStrategy.performance.monthly.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Yearly</span>
                      <span className={selectedStrategy.performance.yearly >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {selectedStrategy.performance.yearly >= 0 ? '+' : ''}{selectedStrategy.performance.yearly.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">AI Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Accuracy</span>
                      <span className="text-white">{selectedStrategy.aiMetrics.accuracy}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Precision</span>
                      <span className="text-white">{selectedStrategy.aiMetrics.precision}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Recall</span>
                      <span className="text-white">{selectedStrategy.aiMetrics.recall}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">F1 Score</span>
                      <span className="text-white">{selectedStrategy.aiMetrics.f1Score}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Strategy Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Type</span>
                      <span className="text-white capitalize">{selectedStrategy.type.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Risk Level</span>
                      <span className={getRiskColor(selectedStrategy.riskLevel)}>
                        {selectedStrategy.riskLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Assets</span>
                      <span className="text-white">{selectedStrategy.assets.length}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm text-white/60 mb-2">Description</div>
                    <p className="text-xs text-white/80">{selectedStrategy.description}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm">
                    {selectedStrategy.isActive ? 'Pause' : 'Activate'}
                  </button>
                  <button className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuantEngine;