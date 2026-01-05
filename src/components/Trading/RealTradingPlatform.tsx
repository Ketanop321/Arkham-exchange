import React, { useState, useEffect } from 'react';
import { DollarSign, Shield, Users, TrendingUp, Building2, Briefcase, CreditCard, AlertTriangle, CheckCircle, Clock, Eye, Lock, Unlock, Star, Trophy, Crown, Target, BarChart3, PieChart, LineChart, Activity, Zap, Hash, Copy, Share2, Download, Upload, FileText, User, Globe, Calendar, Percent, ArrowUp, ArrowDown, Plus, Minus, Search, Filter, RefreshCw, Brain, TrendingDown } from 'lucide-react';

interface KYCStatus {
  level: 'none' | 'basic' | 'enhanced' | 'accredited';
  status: 'pending' | 'approved' | 'rejected' | 'incomplete';
  documents: Array<{
    type: 'id' | 'address' | 'income' | 'accreditation';
    status: 'pending' | 'approved' | 'rejected';
    uploadedAt: string;
  }>;
  investmentLimits: {
    crowdfunding: number;
    copyTrading: number;
    tokenizedAssets: number;
    riaMinimum: number;
  };
}

interface RealAsset {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'mutual-fund' | 'tokenized-startup' | 'tokenized-realestate' | 'tokenized-business' | 'theme-fund';
  exchange: 'NYSE' | 'NASDAQ' | 'ARKHAM' | 'PRIVATE';
  price: number;
  minInvestment: number;
  fractionalEnabled: boolean;
  change24h: number;
  changePercent: number;
  marketCap?: number;
  volume24h?: number;
  description: string;
  riskScore: number;
  fees: {
    management: number;
    performance?: number;
    withdrawal?: number;
  };
  fundamentals?: {
    pe?: number;
    eps?: number;
    dividend?: number;
    beta?: number;
    revenue?: number;
    profitMargin?: number;
    aum?: number;
    expenseRatio?: number;
  };
  tokenization?: {
    totalTokens: number;
    availableTokens: number;
    tokenPrice: number;
    minimumHolding: number;
    lockupPeriod?: number;
    expectedReturn?: number;
    riskFactors: string[];
  };
  compliance: {
    accreditedOnly: boolean;
    geographicRestrictions: string[];
    regulatoryStatus: string;
  };
}

interface QuantStrategy {
  id: string;
  name: string;
  description: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    reputation: number;
    followers: number;
  };
  performance: {
    totalReturn: number;
    annualizedReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    winRate: number;
    volatility: number;
  };
  fees: {
    management: number;
    performance: number;
    withdrawal: number;
  };
  stats: {
    aum: number;
    followers: number;
    copiers: number;
    minInvestment: number;
  };
  riskMetrics: {
    riskScore: number;
    beta: number;
    var95: number;
    correlation: number;
  };
  strategy: {
    type: string;
    timeframe: string;
    assets: string[];
    methodology: string;
  };
  compliance: {
    registered: boolean;
    audited: boolean;
    insured: boolean;
  };
}

interface CrowdfundingDeal {
  id: string;
  title: string;
  description: string;
  category: 'startup' | 'real-estate' | 'business' | 'infrastructure';
  targetAmount: number;
  raisedAmount: number;
  minInvestment: number;
  maxPublicInvestment: number;
  expectedReturn: number;
  term: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  status: 'upcoming' | 'active' | 'funded' | 'closed';
  deadline: string;
  investors: number;
  documents: Array<{
    name: string;
    type: 'pitch-deck' | 'financials' | 'legal' | 'due-diligence';
    url: string;
  }>;
  fees: {
    platformFee: number;
    managementFee?: number;
  };
  compliance: {
    secFilings: string[];
    accreditedOnly: boolean;
    geographicRestrictions: string[];
  };
  keyMetrics: {
    [key: string]: string | number;
  };
}

interface UserPortfolio {
  totalValue: number;
  cash: number;
  invested: number;
  pnl: number;
  pnlPercent: number;
  positions: Array<{
    assetId: string;
    symbol: string;
    quantity: number;
    value: number;
    pnl: number;
    pnlPercent: number;
    type: 'direct' | 'copy-trade' | 'crowdfund' | 'tokenized';
  }>;
  copyTrades: Array<{
    strategyId: string;
    amount: number;
    startDate: string;
    performance: number;
  }>;
  crowdfunding: Array<{
    dealId: string;
    amount: number;
    investmentDate: string;
    status: string;
  }>;
}

const RealTradingPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'copy-trading' | 'crowdfunding' | 'marketplace' | 'ria' | 'kyc'>('dashboard');
  const [crowdFundingTab, setCrowdFundingTab] = useState<'opportunities' | 'quant-funds'>('opportunities');
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState<'sme-capital' | 'startup-deals' | 'my-investments' | 'analytics'>('sme-capital');
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [userPortfolio, setUserPortfolio] = useState<UserPortfolio | null>(null);
  const [realAssets, setRealAssets] = useState<RealAsset[]>([]);
  const [quantStrategies, setQuantStrategies] = useState<QuantStrategy[]>([]);
  const [crowdfundingDeals, setCrowdfundingDeals] = useState<CrowdfundingDeal[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<RealAsset | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<QuantStrategy | null>(null);
  const [selectedDeal, setCrowdfundingDeal] = useState<CrowdfundingDeal | null>(null);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showInvestModal, setShowInvestModal] = useState(false);

  // Real Marketplace Data
  const [smeCapitalPools, setSmeCapitalPools] = useState([
    {
      id: 'sme-1',
      name: 'Tech SME Capital Pool',
      description: 'Small and medium enterprises pooling capital for tech startup investments',
      totalCapital: 2500000,
      availableCapital: 850000,
      participants: 45,
      averageYield: 18.5,
      riskLevel: 'Medium-High',
      minimumContribution: 25000,
      lockupPeriod: '18 months',
      sectors: ['FinTech', 'HealthTech', 'AI/ML'],
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
    },
    {
      id: 'sme-2',
      name: 'Healthcare SME Syndicate',
      description: 'Healthcare businesses investing in medical innovation startups',
      totalCapital: 1800000,
      availableCapital: 320000,
      participants: 28,
      averageYield: 22.3,
      riskLevel: 'High',
      minimumContribution: 50000,
      lockupPeriod: '24 months',
      sectors: ['MedTech', 'Biotech', 'Digital Health'],
      image: 'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg'
    }
  ]);

  const [startupDeals, setStartupDeals] = useState([
    {
      id: 'startup-1',
      name: 'NeuralPay',
      description: 'AI-powered payment processing for emerging markets',
      sector: 'FinTech',
      stage: 'Series A',
      fundingGoal: 5000000,
      currentFunding: 3200000,
      valuation: 25000000,
      dealType: 'equity',
      equityOffered: 20,
      expectedReturn: '8-12x',
      timeHorizon: '3-5 years',
      riskScore: 7,
      traction: {
        revenue: 2400000,
        growth: 340,
        customers: 15000,
        team: 45
      },
      fundingStructure: {
        smeCapital: 60,
        institutionalVC: 30,
        platformFee: 10
      },
      image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
      dueDate: '2025-03-15T00:00:00Z'
    },
    {
      id: 'startup-2',
      name: 'GreenLogistics',
      description: 'Sustainable last-mile delivery using electric vehicles and AI routing',
      sector: 'Logistics',
      stage: 'Seed',
      fundingGoal: 2000000,
      currentFunding: 750000,
      valuation: 8000000,
      dealType: 'revenue-share',
      revenueShare: 15,
      expectedReturn: '12-18% IRR',
      timeHorizon: '5-7 years',
      riskScore: 6,
      traction: {
        revenue: 450000,
        growth: 180,
        customers: 2500,
        team: 18
      },
      fundingStructure: {
        smeCapital: 70,
        institutionalVC: 20,
        platformFee: 10
      },
      image: 'https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg',
      dueDate: '2025-02-28T00:00:00Z'
    },
    {
      id: 'startup-3',
      name: 'AgriTech Solutions',
      description: 'IoT sensors and AI analytics for precision agriculture',
      sector: 'AgTech',
      stage: 'Pre-Series A',
      fundingGoal: 3500000,
      currentFunding: 1200000,
      valuation: 15000000,
      dealType: 'convertible-note',
      interestRate: 8,
      discount: 20,
      expectedReturn: '5-10x',
      timeHorizon: '4-6 years',
      riskScore: 5,
      traction: {
        revenue: 800000,
        growth: 220,
        customers: 850,
        team: 32
      },
      fundingStructure: {
        smeCapital: 65,
        institutionalVC: 25,
        platformFee: 10
      },
      image: 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg',
      dueDate: '2025-04-30T00:00:00Z'
    }
  ]);

  const [myMarketplaceInvestments, setMyMarketplaceInvestments] = useState([
    {
      id: 'inv-1',
      type: 'sme-pool',
      name: 'Tech SME Capital Pool',
      amount: 75000,
      currentValue: 89250,
      return: 19.0,
      status: 'active',
      investedDate: '2024-08-15T00:00:00Z'
    },
    {
      id: 'inv-2',
      type: 'startup',
      name: 'NeuralPay Series A',
      amount: 25000,
      currentValue: 31200,
      return: 24.8,
      status: 'active',
      investedDate: '2024-11-20T00:00:00Z'
    }
  ]);

  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    const mockKYC: KYCStatus = {
      level: 'enhanced',
      status: 'approved',
      documents: [
        { type: 'id', status: 'approved', uploadedAt: '2025-01-15T10:00:00Z' },
        { type: 'address', status: 'approved', uploadedAt: '2025-01-15T10:05:00Z' },
        { type: 'income', status: 'approved', uploadedAt: '2025-01-15T10:10:00Z' },
        { type: 'accreditation', status: 'pending', uploadedAt: '2025-01-20T09:00:00Z' }
      ],
      investmentLimits: {
        crowdfunding: 250000,
        copyTrading: 1000000,
        tokenizedAssets: 500000,
        riaMinimum: 250000
      }
    };

    const mockPortfolio: UserPortfolio = {
      totalValue: 125430.50,
      cash: 15430.50,
      invested: 110000.00,
      pnl: 15430.50,
      pnlPercent: 14.03,
      positions: [
        {
          assetId: 'aapl',
          symbol: 'AAPL',
          quantity: 50.5,
          value: 8871.65,
          pnl: 871.65,
          pnlPercent: 10.89,
          type: 'direct'
        },
        {
          assetId: 'vti',
          symbol: 'VTI',
          quantity: 100,
          value: 24500.00,
          pnl: 2500.00,
          pnlPercent: 11.36,
          type: 'direct'
        }
      ],
      copyTrades: [
        {
          strategyId: 'ai-momentum',
          amount: 25000,
          startDate: '2024-12-01T00:00:00Z',
          performance: 18.5
        }
      ],
      crowdfunding: [
        {
          dealId: 'tech-startup-1',
          amount: 5000,
          investmentDate: '2024-11-15T00:00:00Z',
          status: 'active'
        }
      ]
    };

    const mockAssets: RealAsset[] = [
      {
        id: 'aapl',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        exchange: 'NASDAQ',
        price: 175.43,
        minInvestment: 1,
        fractionalEnabled: true,
        change24h: 2.34,
        changePercent: 1.35,
        marketCap: 2800000000000,
        volume24h: 45000000,
        description: 'Technology company designing and manufacturing consumer electronics',
        riskScore: 4,
        fees: {
          management: 0,
          withdrawal: 0
        },
        fundamentals: {
          pe: 28.5,
          eps: 6.15,
          dividend: 0.96,
          beta: 1.2,
          revenue: 394328000000,
          profitMargin: 25.31
        },
        compliance: {
          accreditedOnly: false,
          geographicRestrictions: [],
          regulatoryStatus: 'SEC Registered'
        }
      },
      {
        id: 'vti',
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        type: 'etf',
        exchange: 'NYSE',
        price: 245.00,
        minInvestment: 1,
        fractionalEnabled: true,
        change24h: 1.85,
        changePercent: 0.76,
        marketCap: 350000000000,
        volume24h: 2500000,
        description: 'Tracks the performance of the CRSP US Total Market Index',
        riskScore: 3,
        fees: {
          management: 0.03,
          withdrawal: 0
        },
        fundamentals: {
          expenseRatio: 0.03,
          aum: 350000000000,
          dividend: 1.85
        },
        compliance: {
          accreditedOnly: false,
          geographicRestrictions: [],
          regulatoryStatus: 'SEC Registered'
        }
      },
      {
        id: 'startup-token-1',
        symbol: 'TECH-01',
        name: 'TechCorp Tokenized Equity',
        type: 'tokenized-startup',
        exchange: 'ARKHAM',
        price: 50.00,
        minInvestment: 150,
        fractionalEnabled: false,
        change24h: 2.50,
        changePercent: 5.26,
        description: 'Tokenized equity in AI-powered enterprise software startup',
        riskScore: 9,
        fees: {
          management: 2.0,
          performance: 20,
          withdrawal: 5.0
        },
        tokenization: {
          totalTokens: 1000000,
          availableTokens: 250000,
          tokenPrice: 50.00,
          minimumHolding: 3,
          lockupPeriod: 12,
          expectedReturn: 25.0,
          riskFactors: [
            'Early stage company risk',
            'Technology obsolescence risk',
            'Market competition risk',
            'Liquidity risk'
          ]
        },
        compliance: {
          accreditedOnly: true,
          geographicRestrictions: ['US', 'CA', 'UK'],
          regulatoryStatus: 'Regulation D 506(c)'
        }
      },
      {
        id: 'realestate-token-1',
        symbol: 'RE-NYC-01',
        name: 'Manhattan Commercial Real Estate',
        type: 'tokenized-realestate',
        exchange: 'ARKHAM',
        price: 1000.00,
        minInvestment: 1000,
        fractionalEnabled: false,
        change24h: 5.00,
        changePercent: 0.50,
        description: 'Tokenized ownership in prime Manhattan commercial real estate',
        riskScore: 5,
        fees: {
          management: 1.5,
          withdrawal: 2.0
        },
        tokenization: {
          totalTokens: 50000,
          availableTokens: 12500,
          tokenPrice: 1000.00,
          minimumHolding: 1,
          expectedReturn: 8.5,
          riskFactors: [
            'Real estate market risk',
            'Interest rate risk',
            'Tenant default risk',
            'Liquidity risk'
          ]
        },
        compliance: {
          accreditedOnly: false,
          geographicRestrictions: ['US'],
          regulatoryStatus: 'Regulation A+'
        }
      }
    ];

    const mockStrategies: QuantStrategy[] = [
      {
        id: 'ai-momentum',
        name: 'AI Momentum Alpha',
        description: 'Machine learning-powered momentum strategy with risk management',
        creator: {
          id: 'quant-1',
          name: 'Dr. Sarah Chen',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
          verified: true,
          reputation: 9.2,
          followers: 1250
        },
        performance: {
          totalReturn: 156.7,
          annualizedReturn: 24.5,
          maxDrawdown: -12.3,
          sharpeRatio: 1.87,
          winRate: 68.4,
          volatility: 18.2
        },
        fees: {
          management: 2.0,
          performance: 20.0,
          withdrawal: 5.0
        },
        stats: {
          aum: 25000000,
          followers: 1250,
          copiers: 234,
          minInvestment: 1000
        },
        riskMetrics: {
          riskScore: 6.5,
          beta: 1.2,
          var95: -8.5,
          correlation: 0.75
        },
        strategy: {
          type: 'Momentum',
          timeframe: 'Medium-term (1-6 months)',
          assets: ['Equities', 'ETFs', 'Crypto'],
          methodology: 'AI/ML pattern recognition with risk overlay'
        },
        compliance: {
          registered: true,
          audited: true,
          insured: true
        }
      },
      {
        id: 'value-contrarian',
        name: 'Deep Value Contrarian',
        description: 'Fundamental analysis-based value investing with contrarian timing',
        creator: {
          id: 'quant-2',
          name: 'Alex Thompson',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          verified: true,
          reputation: 8.8,
          followers: 890
        },
        performance: {
          totalReturn: 89.3,
          annualizedReturn: 16.8,
          maxDrawdown: -6.7,
          sharpeRatio: 2.34,
          winRate: 74.2,
          volatility: 12.5
        },
        fees: {
          management: 1.5,
          performance: 15.0,
          withdrawal: 5.0
        },
        stats: {
          aum: 18500000,
          followers: 890,
          copiers: 167,
          minInvestment: 2500
        },
        riskMetrics: {
          riskScore: 4.2,
          beta: 0.8,
          var95: -5.2,
          correlation: 0.65
        },
        strategy: {
          type: 'Value',
          timeframe: 'Long-term (1-3 years)',
          assets: ['Stocks', 'REITs', 'Bonds'],
          methodology: 'Fundamental analysis with contrarian entry points'
        },
        compliance: {
          registered: true,
          audited: true,
          insured: true
        }
      }
    ];

    const mockDeals: CrowdfundingDeal[] = [
      {
        id: 'tech-startup-1',
        title: 'AI-Powered Healthcare Diagnostics',
        description: 'Revolutionary AI platform for early disease detection using medical imaging',
        category: 'startup',
        targetAmount: 2000000,
        raisedAmount: 1450000,
        minInvestment: 150,
        maxPublicInvestment: 250000,
        expectedReturn: 25.0,
        term: '5-7 years',
        riskLevel: 'Very High',
        status: 'active',
        deadline: '2025-02-28T23:59:59Z',
        investors: 234,
        documents: [
          { name: 'Pitch Deck', type: 'pitch-deck', url: '/docs/pitch-deck.pdf' },
          { name: 'Financial Projections', type: 'financials', url: '/docs/financials.pdf' },
          { name: 'Legal Documents', type: 'legal', url: '/docs/legal.pdf' },
          { name: 'Due Diligence Report', type: 'due-diligence', url: '/docs/dd-report.pdf' }
        ],
        fees: {
          platformFee: 5.0
        },
        compliance: {
          secFilings: ['Form D', 'Form C'],
          accreditedOnly: false,
          geographicRestrictions: ['US', 'CA']
        },
        keyMetrics: {
          'Revenue (TTM)': '$2.5M',
          'Growth Rate': '300%',
          'Market Size': '$50B',
          'Patents': 12,
          'Team Size': 45
        }
      },
      {
        id: 'realestate-1',
        title: 'Luxury Apartment Complex - Austin',
        description: 'Class A luxury apartment development in prime Austin location',
        category: 'real-estate',
        targetAmount: 5000000,
        raisedAmount: 3200000,
        minInvestment: 1000,
        maxPublicInvestment: 250000,
        expectedReturn: 12.0,
        term: '3-5 years',
        riskLevel: 'Medium',
        status: 'active',
        deadline: '2025-03-15T23:59:59Z',
        investors: 156,
        documents: [
          { name: 'Property Analysis', type: 'due-diligence', url: '/docs/property-analysis.pdf' },
          { name: 'Financial Model', type: 'financials', url: '/docs/financial-model.pdf' },
          { name: 'Legal Structure', type: 'legal', url: '/docs/legal-structure.pdf' }
        ],
        fees: {
          platformFee: 3.0,
          managementFee: 1.5
        },
        compliance: {
          secFilings: ['Regulation A+'],
          accreditedOnly: false,
          geographicRestrictions: ['US']
        },
        keyMetrics: {
          'Property Value': '$15M',
          'Cap Rate': '6.5%',
          'Occupancy Rate': '95%',
          'Location Score': '9.2/10',
          'Construction Status': '60% Complete'
        }
      }
    ];

    setKycStatus(mockKYC);
    setUserPortfolio(mockPortfolio);
    setRealAssets(mockAssets);
    setQuantStrategies(mockStrategies);
    setCrowdfundingDeals(mockDeals);
    setSelectedAsset(mockAssets[0]);
    setSelectedStrategy(mockStrategies[0]);
    setCrowdfundingDeal(mockDeals[0]);
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

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getKYCLevelColor = (level: string) => {
    switch (level) {
      case 'none': return 'text-red-400';
      case 'basic': return 'text-yellow-400';
      case 'enhanced': return 'text-green-400';
      case 'accredited': return 'text-blue-400';
      default: return 'text-white';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-orange-400';
      case 'Very High': return 'text-red-400';
      default: return 'text-white';
    }
  };

  if (!kycStatus || !userPortfolio) return null;

  return (
    <div className="w-full h-full p-6 bg-black/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <DollarSign size={24} className="text-green-400" />
            <h2 className="text-2xl font-mono text-white/90 protocol-text">Real Trading Platform</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">Portfolio Value: </span>
              <span className="text-white font-medium">{formatCurrency(userPortfolio.totalValue)}</span>
            </div>
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">KYC Level: </span>
              <span className={`font-medium ${getKYCLevelColor(kycStatus.level)}`}>
                {kycStatus.level.charAt(0).toUpperCase() + kycStatus.level.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'dashboard' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'assets' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Assets & Trading
          </button>
          <button
            onClick={() => setActiveTab('copy-trading')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'copy-trading' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Copy Trading
          </button>
          <button
            onClick={() => setActiveTab('crowdfunding')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'crowdfunding' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Crowdfunding
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'marketplace' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Real Marketplace
          </button>
          <button
            onClick={() => setActiveTab('ria')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'ria' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            RIA Services
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'kyc' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            KYC & Compliance
          </button>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Portfolio Overview */}
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Portfolio Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <div className="text-sm text-white/60 mb-1">Total Value</div>
                      <div className="text-2xl font-medium text-white">
                        {formatCurrency(userPortfolio.totalValue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60 mb-1">Cash Available</div>
                      <div className="text-2xl font-medium text-white">
                        {formatCurrency(userPortfolio.cash)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60 mb-1">Total P&L</div>
                      <div className={`text-2xl font-medium ${userPortfolio.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {userPortfolio.pnl >= 0 ? '+' : ''}{formatCurrency(userPortfolio.pnl)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-white/60 mb-1">Return</div>
                      <div className={`text-2xl font-medium flex items-center ${userPortfolio.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {userPortfolio.pnlPercent >= 0 ? <TrendingUp size={20} className="mr-1" /> : <TrendingDown size={20} className="mr-1" />}
                        {formatPercent(userPortfolio.pnlPercent)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Holdings */}
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Current Holdings</h3>
                  <div className="space-y-4">
                    {userPortfolio.positions.map((position, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="text-white font-medium">{position.symbol}</div>
                            <div className="text-sm text-white/60">
                              {position.quantity} shares • {position.type}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{formatCurrency(position.value)}</div>
                          <div className={`text-sm ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)} ({formatPercent(position.pnlPercent)})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Copy Trading Performance */}
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Copy Trading Performance</h3>
                  <div className="space-y-4">
                    {userPortfolio.copyTrades.map((trade, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <div className="text-white font-medium">Strategy: {trade.strategyId}</div>
                          <div className="text-sm text-white/60">
                            Invested: {formatCurrency(trade.amount)} • Since: {new Date(trade.startDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-medium ${trade.performance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatPercent(trade.performance)}
                          </div>
                          <div className="text-sm text-white/60">
                            Withdrawal Fee: 5%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crowdfunding Investments */}
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Crowdfunding Investments</h3>
                  <div className="space-y-4">
                    {userPortfolio.crowdfunding.map((investment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <div className="text-white font-medium">Deal: {investment.dealId}</div>
                          <div className="text-sm text-white/60">
                            Invested: {formatCurrency(investment.amount)} • Date: {new Date(investment.investmentDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded text-sm ${
                            investment.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            investment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-white/20 text-white'
                          }`}>
                            {investment.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search stocks, ETFs, tokenized assets..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40"
                    />
                  </div>
                  <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                    <option value="all">All Asset Types</option>
                    <option value="stock">Stocks</option>
                    <option value="etf">ETFs</option>
                    <option value="mutual-fund">Mutual Funds</option>
                    <option value="tokenized-startup">Tokenized Startups</option>
                    <option value="tokenized-realestate">Tokenized Real Estate</option>
                    <option value="theme-fund">Theme Funds</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {realAssets.map((asset) => (
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
                          <p className="text-xs text-white/40">{asset.exchange}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <div className={`px-2 py-1 rounded text-xs ${
                            asset.type === 'stock' ? 'bg-blue-500/20 text-blue-400' :
                            asset.type === 'etf' ? 'bg-green-500/20 text-green-400' :
                            asset.type === 'tokenized-startup' ? 'bg-purple-500/20 text-purple-400' :
                            asset.type === 'tokenized-realestate' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-white/20 text-white'
                          }`}>
                            {asset.type.replace('-', ' ').toUpperCase()}
                          </div>
                          {asset.fractionalEnabled && (
                            <div className="text-xs text-green-400">Fractional</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-white">
                            ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <div className={`flex items-center space-x-1 ${asset.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {asset.changePercent >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                            <span className="font-medium">{formatPercent(asset.changePercent)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-white/60">Min Investment</div>
                            <div className="text-white">${asset.minInvestment}</div>
                          </div>
                          <div>
                            <div className="text-white/60">Risk Score</div>
                            <div className={`${asset.riskScore <= 3 ? 'text-green-400' : asset.riskScore <= 6 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {asset.riskScore}/10
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-white/60">Management Fee</div>
                            <div className="text-white">{asset.fees.management}%</div>
                          </div>
                          {asset.fees.performance && (
                            <div>
                              <div className="text-white/60">Performance Fee</div>
                              <div className="text-white">{asset.fees.performance}%</div>
                            </div>
                          )}
                        </div>

                        {asset.tokenization && (
                          <div className="pt-3 border-t border-white/10">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-white/60">Available Tokens</div>
                                <div className="text-white">{asset.tokenization.availableTokens.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-white/60">Expected Return</div>
                                <div className="text-green-400">{asset.tokenization.expectedReturn}%</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {asset.compliance.accreditedOnly && (
                          <div className="flex items-center space-x-2 text-xs text-yellow-400">
                            <Lock size={12} />
                            <span>Accredited Investors Only</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'copy-trading' && (
              <div className="space-y-6">
                <div className="glass-effect rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Quantitative Strategies</h3>
                    <div className="text-sm text-white/60">
                      5% withdrawal fee applies to all copy trading
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quantStrategies.map((strategy) => (
                      <div 
                        key={strategy.id}
                        className={`glass-effect rounded-lg p-6 cursor-pointer transition-all ${
                          selectedStrategy?.id === strategy.id ? 'ring-2 ring-white/50' : 'hover:bg-white/5'
                        }`}
                        onClick={() => setSelectedStrategy(strategy)}
                      >
                        <div className="flex items-start space-x-4 mb-4">
                          <img
                            src={strategy.creator.avatar}
                            alt={strategy.creator.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-lg font-medium text-white">{strategy.name}</h4>
                              {strategy.creator.verified && (
                                <Shield size={16} className="text-blue-400" />
                              )}
                            </div>
                            <p className="text-sm text-white/60">by {strategy.creator.name}</p>
                            <div className="flex items-center space-x-4 text-xs text-white/40 mt-1">
                              <span>{strategy.creator.followers} followers</span>
                              <span>Rep: {strategy.creator.reputation}/10</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-white/80 mb-4">{strategy.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-white/60">Total Return</div>
                            <div className="text-lg font-medium text-green-400">
                              +{strategy.performance.totalReturn}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-white/60">Annualized</div>
                            <div className="text-lg font-medium text-green-400">
                              +{strategy.performance.annualizedReturn}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-white/60">Max Drawdown</div>
                            <div className="text-lg font-medium text-red-400">
                              {strategy.performance.maxDrawdown}%
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-white/60">Sharpe Ratio</div>
                            <div className="text-lg font-medium text-white">
                              {strategy.performance.sharpeRatio}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <div className="text-white/60">AUM</div>
                            <div className="text-white">{formatCurrency(strategy.stats.aum)}</div>
                          </div>
                          <div>
                            <div className="text-white/60">Copiers</div>
                            <div className="text-white">{strategy.stats.copiers}</div>
                          </div>
                          <div>
                            <div className="text-white/60">Min Investment</div>
                            <div className="text-white">${strategy.stats.minInvestment}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <div className="text-white/60">Management</div>
                            <div className="text-white">{strategy.fees.management}%</div>
                          </div>
                          <div>
                            <div className="text-white/60">Performance</div>
                            <div className="text-white">{strategy.fees.performance}%</div>
                          </div>
                          <div>
                            <div className="text-white/60">Withdrawal</div>
                            <div className="text-yellow-400">{strategy.fees.withdrawal}%</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm">
                            {strategy.compliance.registered && (
                              <div className="flex items-center space-x-1 text-green-400">
                                <CheckCircle size={12} />
                                <span>Registered</span>
                              </div>
                            )}
                            {strategy.compliance.audited && (
                              <div className="flex items-center space-x-1 text-blue-400">
                                <Shield size={12} />
                                <span>Audited</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowInvestModal(true);
                            }}
                            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm"
                          >
                            Copy Strategy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'crowdfunding' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <button
                    onClick={() => setCrowdFundingTab('opportunities')}
                    className={`px-4 py-2 rounded-lg ${
                      crowdFundingTab === 'opportunities' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Investment Opportunities
                  </button>
                  <button
                    onClick={() => setCrowdFundingTab('quant-funds')}
                    className={`px-4 py-2 rounded-lg ${
                      crowdFundingTab === 'quant-funds' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Crowd Quant Funds
                  </button>
                </div>

                {crowdFundingTab === 'opportunities' && (
                  <>
                    <div className="glass-effect rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-medium text-white mb-4">Investment Opportunities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">47</div>
                          <div className="text-sm text-white/60">Active Deals</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">$127M</div>
                          <div className="text-sm text-white/60">Total Raised</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">18.3%</div>
                          <div className="text-sm text-white/60">Avg Return</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">2,847</div>
                          <div className="text-sm text-white/60">Total Investors</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-white/60">
                        <div className="flex justify-between">
                          <span>Minimum Investment:</span>
                          <span className="text-white">$150 - $2,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Maximum Public Investment:</span>
                          <span className="text-white">$250,000 (Above requires RIA)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fee:</span>
                          <span className="text-white/60">Platform Fee: 3-5% of successful raises</span>
                        </div>
                      </div>
                      <div className="text-sm text-white/60 mb-4">
                        <strong>Asset Types:</strong> Startups (Technology, Healthcare, FinTech) • Real Estate (Residential, Commercial) • 
                        Business Expansion (Retail, Hospitality, Manufacturing) • Infrastructure (Energy, Transportation, Utilities)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['startup', 'real-estate', 'business', 'infrastructure'].map(type => (
                          <button
                            key={type}
                            className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80 hover:bg-white/20"
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {crowdfundingDeals.map((opportunity) => (
                        <div key={opportunity.id} className="glass-effect rounded-lg p-6 hover:bg-white/5 transition-all">
                          <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                            <img
                              src={opportunity.imageUrl}
                              alt={opportunity.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 right-3">
                              <div className={`px-2 py-1 rounded text-xs ${
                                opportunity.category === 'startup' ? 'bg-purple-500/80 text-white' :
                                opportunity.category === 'real-estate' ? 'bg-blue-500/80 text-white' :
                                opportunity.category === 'business' ? 'bg-green-500/80 text-white' :
                                'bg-orange-500/80 text-white'
                              }`}>
                                {opportunity.category.replace('-', ' ').toUpperCase()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-white mb-2">{opportunity.title}</h3>
                              <p className="text-sm text-white/60">{opportunity.description}</p>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${getRiskColor(opportunity.riskLevel)}`}>
                              {opportunity.riskLevel} Risk
                            </div>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Target</span>
                              <span className="text-white">{formatCurrency(opportunity.targetAmount)}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${(opportunity.raisedAmount / opportunity.targetAmount) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-white/60">
                              <span>{((opportunity.raisedAmount / opportunity.targetAmount) * 100).toFixed(1)}% funded</span>
                              <span>{opportunity.investors} investors</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <div className="text-white/60">Expected Return</div>
                              <div className="text-green-400">{opportunity.expectedReturn}%</div>
                            </div>
                            <div>
                              <div className="text-white/60">Min Investment</div>
                              <div className="text-white">${opportunity.minInvestment}</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-white/40">
                              {opportunity.daysLeft} days left
                            </div>
                            <button className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm">
                              Invest Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {crowdFundingTab === 'quant-funds' && (
                  <>
                    <div className="glass-effect rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-medium text-white mb-4">Crowd Quant Funds</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">12</div>
                          <div className="text-sm text-white/60">Active Funds</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">$127M</div>
                          <div className="text-sm text-white/60">Total AUM</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">18.3%</div>
                          <div className="text-sm text-white/60">Avg Return</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">2,847</div>
                          <div className="text-sm text-white/60">Total Investors</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-white/60">
                        <div className="flex justify-between">
                          <span>Management Fee:</span>
                          <span className="text-white">1.5-2.5% annually</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Performance Fee:</span>
                          <span className="text-white">15-25% above high water mark</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Withdrawal Fee:</span>
                          <span className="text-white">5% flat fee</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Minimum Investment:</span>
                          <span className="text-white">$10,000 - $25,000</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <button className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                          Create Your Quant Fund
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {realAssets.filter(asset => asset.type === 'quant-fund').map((fund) => (
                        <div key={fund.id} className="glass-effect rounded-lg p-6 hover:bg-white/5 transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                                <Brain size={24} className="text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-white">{fund.name}</h3>
                                <p className="text-sm text-white/60">{fund.symbol}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-medium text-white">
                                ${fund.price.toFixed(2)}
                              </div>
                              <div className={`text-sm flex items-center ${fund.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {fund.changePercent >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                                {fund.changePercent >= 0 ? '+' : ''}{fund.changePercent.toFixed(2)}%
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-white/80 mb-4">{fund.description}</p>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-xs text-white/60">Fund Manager</div>
                              <div className="text-sm text-white font-medium">{fund.manager}</div>
                            </div>
                            <div>
                              <div className="text-xs text-white/60">Strategy</div>
                              <div className="text-sm text-white">{fund.strategy}</div>
                            </div>
                            <div>
                              <div className="text-xs text-white/60">AUM</div>
                              <div className="text-sm text-white">${(fund.aum / 1000000).toFixed(1)}M</div>
                            </div>
                            <div>
                              <div className="text-xs text-white/60">Inception</div>
                              <div className="text-sm text-white">{new Date(fund.inception).toLocaleDateString()}</div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">YTD Return</span>
                              <span className={fund.performance.ytd >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {fund.performance.ytd >= 0 ? '+' : ''}{fund.performance.ytd.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Sharpe Ratio</span>
                              <span className="text-white">{fund.performance.sharpe.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Max Drawdown</span>
                              <span className="text-red-400">{fund.performance.maxDrawdown.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Management Fee</span>
                              <span className="text-white">{fund.expenseRatio.toFixed(2)}%</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-white/60">
                              Min Investment: ${fund.minInvestment.toLocaleString()}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1 text-sm text-white/60">
                                <Users size={14} />
                                <span>234 investors</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm text-white/60">
                                <Star size={14} className="text-yellow-400" />
                                <span>4.8</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-3">
                            <button className="flex-1 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm">
                              View Details
                            </button>
                            <button className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm">
                              Invest Now
                            </button>
                          </div>

                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between text-xs text-white/40">
                              <span>SEC Registered • SIPC Insured</span>
                              <div className="flex items-center space-x-1">
                                <Shield size={12} className="text-green-400" />
                                <span>Verified</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'marketplace' && (
              <div className="space-y-6">
                <div className="glass-effect rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-medium text-white mb-2">Real Marketplace</h3>
                      <p className="text-white/60">Decentralized VC meets community-driven neobank</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="glass-effect px-4 py-2 rounded-lg">
                        <span className="text-sm text-white/60">Total SME Capital: </span>
                        <span className="text-white font-medium">$4.3M</span>
                      </div>
                      <div className="glass-effect px-4 py-2 rounded-lg">
                        <span className="text-sm text-white/60">Active Deals: </span>
                        <span className="text-white font-medium">12</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-6">
                    <button
                      onClick={() => setActiveMarketplaceTab('sme-capital')}
                      className={`px-4 py-2 rounded-lg ${
                        activeMarketplaceTab === 'sme-capital' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
                      }`}
                    >
                      SME Capital Pools
                    </button>
                    <button
                      onClick={() => setActiveMarketplaceTab('startup-deals')}
                      className={`px-4 py-2 rounded-lg ${
                        activeMarketplaceTab === 'startup-deals' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
                      }`}
                    >
                      Startup Deals
                    </button>
                    <button
                      onClick={() => setActiveMarketplaceTab('my-investments')}
                      className={`px-4 py-2 rounded-lg ${
                        activeMarketplaceTab === 'my-investments' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
                      }`}
                    >
                      My Investments
                    </button>
                    <button
                      onClick={() => setActiveMarketplaceTab('analytics')}
                      className={`px-4 py-2 rounded-lg ${
                        activeMarketplaceTab === 'analytics' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
                      }`}
                    >
                      Analytics
                    </button>
                  </div>

                  {activeMarketplaceTab === 'sme-capital' && (
                    <div className="space-y-6">
                      <div className="glass-effect rounded-lg p-6">
                        <h4 className="text-lg font-medium text-white mb-4">How SME Capital Pools Work</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Building2 size={24} className="text-blue-400" />
                            </div>
                            <h5 className="text-white font-medium mb-2">SMEs Pool Capital</h5>
                            <p className="text-sm text-white/60">Small and medium enterprises contribute idle capital for higher yields</p>
                          </div>
                          <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <TrendingUp size={24} className="text-green-400" />
                            </div>
                            <h5 className="text-white font-medium mb-2">Vetted Startups</h5>
                            <p className="text-sm text-white/60">Capital flows to thoroughly vetted startup opportunities</p>
                          </div>
                          <div className="text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Shield size={24} className="text-purple-400" />
                            </div>
                            <h5 className="text-white font-medium mb-2">Platform Management</h5>
                            <p className="text-sm text-white/60">We handle trust, compliance, and return mechanisms</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {smeCapitalPools.map((pool) => (
                          <div key={pool.id} className="glass-effect rounded-lg p-6">
                            <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                              <img
                                src={pool.image}
                                alt={pool.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-4 right-4">
                                <div className={`px-3 py-1 rounded-full text-xs ${
                                  pool.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400' :
                                  pool.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  pool.riskLevel === 'Medium-High' ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {pool.riskLevel} Risk
                                </div>
                              </div>
                            </div>

                            <h4 className="text-lg font-medium text-white mb-2">{pool.name}</h4>
                            <p className="text-sm text-white/60 mb-4">{pool.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <div className="text-sm text-white/60">Total Capital</div>
                                <div className="text-lg font-medium text-white">
                                  ${pool.totalCapital.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-white/60">Available</div>
                                <div className="text-lg font-medium text-green-400">
                                  ${pool.availableCapital.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-white/60">Participants</div>
                                <div className="text-lg font-medium text-white">{pool.participants}</div>
                              </div>
                              <div>
                                <div className="text-sm text-white/60">Avg Yield</div>
                                <div className="text-lg font-medium text-green-400">{pool.averageYield}%</div>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Min Contribution</span>
                                <span className="text-white">${pool.minimumContribution.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Lockup Period</span>
                                <span className="text-white">{pool.lockupPeriod}</span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <div className="text-sm text-white/60 mb-2">Target Sectors</div>
                              <div className="flex flex-wrap gap-2">
                                {pool.sectors.map((sector, index) => (
                                  <span key={index} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                                    {sector}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <button className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                              Join Pool
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeMarketplaceTab === 'startup-deals' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {startupDeals.map((deal) => (
                          <div key={deal.id} className="glass-effect rounded-lg p-6">
                            <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                              <img
                                src={deal.image}
                                alt={deal.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-4 left-4">
                                <div className="px-3 py-1 bg-black/60 rounded-full text-xs text-white">
                                  {deal.stage}
                                </div>
                              </div>
                              <div className="absolute top-4 right-4">
                                <div className={`px-3 py-1 rounded-full text-xs ${
                                  deal.riskScore <= 3 ? 'bg-green-500/20 text-green-400' :
                                  deal.riskScore <= 6 ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  Risk {deal.riskScore}/10
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-lg font-medium text-white">{deal.name}</h4>
                                <p className="text-sm text-white/60">{deal.sector}</p>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs ${
                                deal.dealType === 'equity' ? 'bg-blue-500/20 text-blue-400' :
                                deal.dealType === 'revenue-share' ? 'bg-green-500/20 text-green-400' :
                                'bg-purple-500/20 text-purple-400'
                              }`}>
                                {deal.dealType.replace('-', ' ')}
                              </div>
                            </div>

                            <p className="text-sm text-white/80 mb-4">{deal.description}</p>

                            <div className="space-y-3 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Funding Goal</span>
                                <span className="text-white">${deal.fundingGoal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Current Funding</span>
                                <span className="text-green-400">${deal.currentFunding.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Valuation</span>
                                <span className="text-white">${deal.valuation.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Expected Return</span>
                                <span className="text-green-400">{deal.expectedReturn}</span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-white/60">Progress</span>
                                <span className="text-white">
                                  {((deal.currentFunding / deal.fundingGoal) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-2 bg-white/10 rounded-full">
                                <div 
                                  className="h-full bg-green-400 rounded-full"
                                  style={{ width: `${(deal.currentFunding / deal.fundingGoal) * 100}%` }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                              <div>
                                <div className="text-white/60">Revenue</div>
                                <div className="text-white">${deal.traction.revenue.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-white/60">Growth</div>
                                <div className="text-green-400">{deal.traction.growth}%</div>
                              </div>
                              <div>
                                <div className="text-white/60">Customers</div>
                                <div className="text-white">{deal.traction.customers.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-white/60">Team Size</div>
                                <div className="text-white">{deal.traction.team}</div>
                              </div>
                            </div>

                            <div className="mb-4">
                              <div className="text-sm text-white/60 mb-2">Funding Structure</div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-white/60">SME Capital</span>
                                  <span className="text-white">{deal.fundingStructure.smeCapital}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/60">Institutional VC</span>
                                  <span className="text-white">{deal.fundingStructure.institutionalVC}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/60">Platform Fee</span>
                                  <span className="text-white">{deal.fundingStructure.platformFee}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                              <span>Due: {new Date(deal.dueDate).toLocaleDateString()}</span>
                              <span>{deal.timeHorizon}</span>
                            </div>

                            <button className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                              Invest Now
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeMarketplaceTab === 'my-investments' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="glass-effect rounded-lg p-6">
                          <div className="text-sm text-white/60 mb-1">Total Invested</div>
                          <div className="text-2xl font-medium text-white">$100,000</div>
                        </div>
                        <div className="glass-effect rounded-lg p-6">
                          <div className="text-sm text-white/60 mb-1">Current Value</div>
                          <div className="text-2xl font-medium text-green-400">$120,450</div>
                        </div>
                        <div className="glass-effect rounded-lg p-6">
                          <div className="text-sm text-white/60 mb-1">Total Return</div>
                          <div className="text-2xl font-medium text-green-400">+20.45%</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {myMarketplaceInvestments.map((investment) => (
                          <div key={investment.id} className="glass-effect rounded-lg p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-lg ${
                                  investment.type === 'sme-pool' ? 'bg-blue-500/20' : 'bg-green-500/20'
                                }`}>
                                  {investment.type === 'sme-pool' ? (
                                    <Building2 size={20} className="text-blue-400" />
                                  ) : (
                                    <TrendingUp size={20} className="text-green-400" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-white font-medium">{investment.name}</h4>
                                  <p className="text-sm text-white/60 capitalize">{investment.type.replace('-', ' ')}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-medium text-white">
                                  ${investment.currentValue.toLocaleString()}
                                </div>
                                <div className="text-sm text-green-400">
                                  +{investment.return.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/60">Invested Amount</span>
                                <span className="text-white">${investment.amount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-white/60">Investment Date</span>
                                <span className="text-white">
                                  {new Date(investment.investedDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeMarketplaceTab === 'analytics' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-effect rounded-lg p-6">
                          <h4 className="text-lg font-medium text-white mb-4">SME Capital Flow</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-white/60">Total SME Capital</span>
                              <span className="text-white">$4.3M</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Deployed Capital</span>
                              <span className="text-green-400">$3.13M</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Available Capital</span>
                              <span className="text-white">$1.17M</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Average Deployment</span>
                              <span className="text-white">72.8%</span>
                            </div>
                          </div>
                        </div>

                        <div className="glass-effect rounded-lg p-6">
                          <h4 className="text-lg font-medium text-white mb-4">Platform Performance</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="text-white/60">Active SME Pools</span>
                              <span className="text-white">8</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Funded Startups</span>
                              <span className="text-green-400">24</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Average ROI</span>
                              <span className="text-green-400">18.7%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Success Rate</span>
                              <span className="text-white">67%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="glass-effect rounded-lg p-6">
                        <h4 className="text-lg font-medium text-white mb-4">Sector Distribution</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-medium text-white">35%</div>
                            <div className="text-sm text-white/60">FinTech</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-medium text-white">28%</div>
                            <div className="text-sm text-white/60">HealthTech</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-medium text-white">22%</div>
                            <div className="text-sm text-white/60">AI/ML</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-medium text-white">15%</div>
                            <div className="text-sm text-white/60">Other</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'ria' && (
              <div className="space-y-6">
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Registered Investment Advisor Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-effect rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Building2 size={24} className="text-blue-400" />
                        <h4 className="text-lg font-medium text-white">Wealth Management</h4>
                      </div>
                      <p className="text-white/80 mb-4">
                        Professional portfolio management for high-net-worth individuals and institutions.
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Minimum Investment</span>
                          <span className="text-white">$250,000</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Management Fee</span>
                          <span className="text-white">0.75% - 1.25%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Services</span>
                          <span className="text-white">Full Service</span>
                        </div>
                      </div>
                      <button className="w-full py-2 bg-white/10 rounded-lg hover:bg-white/20">
                        Learn More
                      </button>
                    </div>

                    <div className="glass-effect rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Target size={24} className="text-green-400" />
                        <h4 className="text-lg font-medium text-white">Private Placements</h4>
                      </div>
                      <p className="text-white/80 mb-4">
                        Access to exclusive private investment opportunities above $250K.
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Minimum Investment</span>
                          <span className="text-white">$250,000</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Accreditation</span>
                          <span className="text-yellow-400">Required</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Due Diligence</span>
                          <span className="text-white">Professional</span>
                        </div>
                      </div>
                      <button className="w-full py-2 bg-white/10 rounded-lg hover:bg-white/20">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Why Choose Our RIA?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Shield size={32} className="mx-auto mb-3 text-blue-400" />
                      <h4 className="text-white font-medium mb-2">SEC Registered</h4>
                      <p className="text-sm text-white/60">
                        Fully registered and regulated investment advisor
                      </p>
                    </div>
                    <div className="text-center">
                      <Trophy size={32} className="mx-auto mb-3 text-yellow-400" />
                      <h4 className="text-white font-medium mb-2">Proven Track Record</h4>
                      <p className="text-sm text-white/60">
                        Consistent outperformance across market cycles
                      </p>
                    </div>
                    <div className="text-center">
                      <Users size={32} className="mx-auto mb-3 text-green-400" />
                      <h4 className="text-white font-medium mb-2">Personalized Service</h4>
                      <p className="text-sm text-white/60">
                        Dedicated relationship managers and custom strategies
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kyc' && (
              <div className="space-y-6">
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">KYC Status & Investment Limits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-white/60">Current Level</span>
                          <span className={`font-medium ${getKYCLevelColor(kycStatus.level)}`}>
                            {kycStatus.level.charAt(0).toUpperCase() + kycStatus.level.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Status</span>
                          <span className={`font-medium ${
                            kycStatus.status === 'approved' ? 'text-green-400' :
                            kycStatus.status === 'pending' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {kycStatus.status.charAt(0).toUpperCase() + kycStatus.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-2">
                        <div className="text-sm text-white/60 mb-2">Investment Limits</div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Crowdfunding</span>
                          <span className="text-white">{formatCurrency(kycStatus.investmentLimits.crowdfunding)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Copy Trading</span>
                          <span className="text-white">{formatCurrency(kycStatus.investmentLimits.copyTrading)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Tokenized Assets</span>
                          <span className="text-white">{formatCurrency(kycStatus.investmentLimits.tokenizedAssets)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">RIA Minimum</span>
                          <span className="text-white">{formatCurrency(kycStatus.investmentLimits.riaMinimum)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Document Status</h3>
                  <div className="space-y-4">
                    {kycStatus.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            doc.status === 'approved' ? 'bg-green-500/20' :
                            doc.status === 'pending' ? 'bg-yellow-500/20' :
                            'bg-red-500/20'
                          }`}>
                            <FileText size={16} className={
                              doc.status === 'approved' ? 'text-green-400' :
                              doc.status === 'pending' ? 'text-yellow-400' :
                              'text-red-400'
                            } />
                          </div>
                          <div>
                            <div className="text-white font-medium capitalize">
                              {doc.type.replace('-', ' ')} Document
                            </div>
                            <div className="text-sm text-white/60">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded text-sm ${
                          doc.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          doc.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {doc.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Upgrade Your KYC Level</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-effect rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Basic KYC</h4>
                      <p className="text-sm text-white/60 mb-3">
                        Basic identity verification for standard trading
                      </p>
                      <div className="text-sm text-white/60">
                        • ID verification
                        • Address verification
                        • Basic trading access
                      </div>
                    </div>
                    <div className="glass-effect rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Enhanced KYC</h4>
                      <p className="text-sm text-white/60 mb-3">
                        Enhanced verification for higher limits
                      </p>
                      <div className="text-sm text-white/60">
                        • Income verification
                        • Source of funds
                        • Higher investment limits
                      </div>
                    </div>
                    <div className="glass-effect rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Accredited Investor</h4>
                      <p className="text-sm text-white/60 mb-3">
                        Accredited status for private placements
                      </p>
                      <div className="text-sm text-white/60">
                        • Wealth verification
                        • Professional certification
                        • Private investment access
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {selectedAsset && activeTab === 'assets' && (
            <div className="w-96 glass-effect rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-white">{selectedAsset.symbol}</h3>
                  <p className="text-sm text-white/60">{selectedAsset.name}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  selectedAsset.type === 'stock' ? 'bg-blue-500/20 text-blue-400' :
                  selectedAsset.type === 'etf' ? 'bg-green-500/20 text-green-400' :
                  selectedAsset.type === 'tokenized-startup' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-white/20 text-white'
                }`}>
                  {selectedAsset.type.replace('-', ' ').toUpperCase()}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-3xl font-bold text-white mb-2">
                    ${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center space-x-2 ${selectedAsset.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedAsset.changePercent >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    <span>{formatPercent(selectedAsset.changePercent)}</span>
                    <span>({selectedAsset.change24h >= 0 ? '+' : ''}${selectedAsset.change24h.toFixed(2)})</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Investment Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Minimum Investment</span>
                      <span className="text-white">${selectedAsset.minInvestment}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Fractional Shares</span>
                      <span className={selectedAsset.fractionalEnabled ? 'text-green-400' : 'text-red-400'}>
                        {selectedAsset.fractionalEnabled ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Risk Score</span>
                      <span className={`${selectedAsset.riskScore <= 3 ? 'text-green-400' : selectedAsset.riskScore <= 6 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {selectedAsset.riskScore}/10
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Fees</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Management Fee</span>
                      <span className="text-white">{selectedAsset.fees.management}%</span>
                    </div>
                    {selectedAsset.fees.performance && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Performance Fee</span>
                        <span className="text-white">{selectedAsset.fees.performance}%</span>
                      </div>
                    )}
                    {selectedAsset.fees.withdrawal && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Withdrawal Fee</span>
                        <span className="text-yellow-400">{selectedAsset.fees.withdrawal}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedAsset.fundamentals && (
                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-3">Fundamentals</h4>
                    <div className="space-y-2">
                      {selectedAsset.fundamentals.pe && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">P/E Ratio</span>
                          <span className="text-white">{selectedAsset.fundamentals.pe.toFixed(1)}</span>
                        </div>
                      )}
                      {selectedAsset.fundamentals.eps && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">EPS</span>
                          <span className="text-white">${selectedAsset.fundamentals.eps.toFixed(2)}</span>
                        </div>
                      )}
                      {selectedAsset.fundamentals.dividend && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Dividend Yield</span>
                          <span className="text-white">{selectedAsset.fundamentals.dividend.toFixed(2)}%</span>
                        </div>
                      )}
                      {selectedAsset.fundamentals.expenseRatio && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Expense Ratio</span>
                          <span className="text-white">{selectedAsset.fundamentals.expenseRatio.toFixed(2)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedAsset.tokenization && (
                  <div>
                    <h4 className="text-sm font-medium text-white/80 mb-3">Tokenization Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Available Tokens</span>
                        <span className="text-white">{selectedAsset.tokenization.availableTokens.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Token Price</span>
                        <span className="text-white">${selectedAsset.tokenization.tokenPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Expected Return</span>
                        <span className="text-green-400">{selectedAsset.tokenization.expectedReturn}%</span>
                      </div>
                      {selectedAsset.tokenization.lockupPeriod && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Lockup Period</span>
                          <span className="text-white">{selectedAsset.tokenization.lockupPeriod} months</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Compliance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Regulatory Status</span>
                      <span className="text-white">{selectedAsset.compliance.regulatoryStatus}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Accredited Only</span>
                      <span className={selectedAsset.compliance.accreditedOnly ? 'text-yellow-400' : 'text-green-400'}>
                        {selectedAsset.compliance.accreditedOnly ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowInvestModal(true)}
                    className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Invest Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedStrategy && activeTab === 'copy-trading' && (
            <div className="w-96 glass-effect rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">{selectedStrategy.name}</h3>
                <div className="flex items-center space-x-2">
                  {selectedStrategy.creator.verified && (
                    <Shield size={16} className="text-blue-400" />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedStrategy.creator.avatar}
                    alt={selectedStrategy.creator.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="text-white font-medium">{selectedStrategy.creator.name}</div>
                    <div className="text-sm text-white/60">
                      {selectedStrategy.creator.followers} followers • Rep: {selectedStrategy.creator.reputation}/10
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Total Return</span>
                      <span className="text-green-400">+{selectedStrategy.performance.totalReturn}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Annualized Return</span>
                      <span className="text-green-400">+{selectedStrategy.performance.annualizedReturn}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Max Drawdown</span>
                      <span className="text-red-400">{selectedStrategy.performance.maxDrawdown}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Sharpe Ratio</span>
                      <span className="text-white">{selectedStrategy.performance.sharpeRatio}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Win Rate</span>
                      <span className="text-white">{selectedStrategy.performance.winRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Volatility</span>
                      <span className="text-white">{selectedStrategy.performance.volatility}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Strategy Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Type</span>
                      <span className="text-white">{selectedStrategy.strategy.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Timeframe</span>
                      <span className="text-white">{selectedStrategy.strategy.timeframe}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Assets</span>
                      <span className="text-white">{selectedStrategy.strategy.assets.join(', ')}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm text-white/60 mb-2">Methodology</div>
                    <p className="text-xs text-white/80">{selectedStrategy.strategy.methodology}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Fees & Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">AUM</span>
                      <span className="text-white">{formatCurrency(selectedStrategy.stats.aum)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Copiers</span>
                      <span className="text-white">{selectedStrategy.stats.copiers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Min Investment</span>
                      <span className="text-white">${selectedStrategy.stats.minInvestment}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Management Fee</span>
                      <span className="text-white">{selectedStrategy.fees.management}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Performance Fee</span>
                      <span className="text-white">{selectedStrategy.fees.performance}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Withdrawal Fee</span>
                      <span className="text-yellow-400">{selectedStrategy.fees.withdrawal}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Risk Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Risk Score</span>
                      <span className={`${selectedStrategy.riskMetrics.riskScore <= 3 ? 'text-green-400' : selectedStrategy.riskMetrics.riskScore <= 6 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {selectedStrategy.riskMetrics.riskScore}/10
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Beta</span>
                      <span className="text-white">{selectedStrategy.riskMetrics.beta}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">VaR (95%)</span>
                      <span className="text-white">{selectedStrategy.riskMetrics.var95}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Market Correlation</span>
                      <span className="text-white">{selectedStrategy.riskMetrics.correlation}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Compliance</h4>
                  <div className="space-y-2">
                    {selectedStrategy.compliance.registered && (
                      <div className="flex items-center space-x-2 text-sm text-green-400">
                        <CheckCircle size={12} />
                        <span>SEC Registered</span>
                      </div>
                    )}
                    {selectedStrategy.compliance.audited && (
                      <div className="flex items-center space-x-2 text-sm text-blue-400">
                        <Shield size={12} />
                        <span>Third-Party Audited</span>
                      </div>
                    )}
                    {selectedStrategy.compliance.insured && (
                      <div className="flex items-center space-x-2 text-sm text-purple-400">
                        <Lock size={12} />
                        <span>SIPC Insured</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowInvestModal(true)}
                    className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Copy Strategy
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedDeal && activeTab === 'crowdfunding' && (
            <div className="w-96 glass-effect rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">{selectedDeal.title}</h3>
                <div className={`px-2 py-1 rounded text-xs ${
                  selectedDeal.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  selectedDeal.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-white/20 text-white'
                }`}>
                  {selectedDeal.status.toUpperCase()}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-sm text-white/60 mb-2">Funding Progress</div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">{formatCurrency(selectedDeal.raisedAmount)}</span>
                    <span className="text-white/60">{formatCurrency(selectedDeal.targetAmount)}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(selectedDeal.raisedAmount / selectedDeal.targetAmount) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/60 mt-2">
                    <span>{((selectedDeal.raisedAmount / selectedDeal.targetAmount) * 100).toFixed(1)}% funded</span>
                    <span>{selectedDeal.investors} investors</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Investment Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Expected Return</span>
                      <span className="text-green-400">{selectedDeal.expectedReturn}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Investment Term</span>
                      <span className="text-white">{selectedDeal.term}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Risk Level</span>
                      <span className={getRiskColor(selectedDeal.riskLevel)}>
                        {selectedDeal.riskLevel}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Min Investment</span>
                      <span className="text-white">${selectedDeal.minInvestment}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Max Public Investment</span>
                      <span className="text-white">{formatCurrency(selectedDeal.maxPublicInvestment)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Key Metrics</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedDeal.keyMetrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-white/60">{key}</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Fees</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Platform Fee</span>
                      <span className="text-white">{selectedDeal.fees.platformFee}%</span>
                    </div>
                    {selectedDeal.fees.managementFee && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Management Fee</span>
                        <span className="text-white">{selectedDeal.fees.managementFee}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Documents</h4>
                  <div className="space-y-2">
                    {selectedDeal.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-white/80">{doc.name}</span>
                        <button className="text-blue-400 hover:text-blue-300">
                          <Download size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Compliance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">SEC Filings</span>
                      <span className="text-white">{selectedDeal.compliance.secFilings.join(', ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Accredited Only</span>
                      <span className={selectedDeal.compliance.accreditedOnly ? 'text-yellow-400' : 'text-green-400'}>
                        {selectedDeal.compliance.accreditedOnly ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="text-xs text-white/40 mb-3">
                    Deadline: {new Date(selectedDeal.deadline).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => setShowInvestModal(true)}
                    className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Invest Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Investment Modal */}
      {showInvestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Make Investment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Investment Amount</label>
                <input
                  type="number"
                  placeholder="Enter amount..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="glass-effect rounded-lg p-4">
                <div className="text-sm text-white/60 mb-2">Investment Summary</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Investment Amount</span>
                    <span className="text-white">$5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Platform Fee</span>
                    <span className="text-white">$150 (3%)</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-white">Total</span>
                    <span className="text-white">$5,150</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-white/40">
                By investing, you agree to our terms and conditions. Investments are subject to risk and may lose value.
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setShowInvestModal(false)}
                className="px-4 py-2 text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowInvestModal(false)}
                className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
              >
                Confirm Investment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTradingPlatform;