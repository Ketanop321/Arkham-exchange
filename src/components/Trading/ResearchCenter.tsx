import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, TrendingUp, BarChart3, PieChart, LineChart, Search, Filter, Plus, Eye, Download, Share2, Star, Clock, User, Tag, CheckCircle, XCircle, AlertTriangle, Zap, Target, Award, Hash, Shield } from 'lucide-react';

interface ResearchReport {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  authorAvatar: string;
  category: 'market-analysis' | 'company-research' | 'sector-report' | 'economic-outlook' | 'technical-analysis';
  tags: string[];
  publishedAt: string;
  lastUpdated: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  downloads: number;
  rating: number;
  ratingCount: number;
  isPremium: boolean;
  blockchain: {
    hash: string;
    verified: boolean;
    immutable: boolean;
  };
  citations: Array<{
    source: string;
    url: string;
    type: 'academic' | 'news' | 'financial' | 'government';
  }>;
  attachments: Array<{
    name: string;
    type: 'pdf' | 'excel' | 'chart' | 'data';
    size: string;
  }>;
}

interface ResearchTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: Array<{
    title: string;
    description: string;
    required: boolean;
  }>;
  estimatedTime: string;
}

interface Citation {
  id: string;
  source: string;
  url: string;
  type: 'academic' | 'news' | 'financial' | 'government';
  addedAt: string;
}

const ResearchCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'published' | 'drafts' | 'create' | 'templates'>('published');
  const [reports, setReports] = useState<ResearchReport[]>([]);
  const [templates, setTemplates] = useState<ResearchTemplate[]>([]);
  const [selectedReport, setSelectedReport] = useState<ResearchReport | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newReport, setNewReport] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'market-analysis' as const,
    tags: [] as string[],
    isPremium: false
  });
  const [citations, setCitations] = useState<Citation[]>([]);

  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    const mockReports: ResearchReport[] = [
      {
        id: 'report-1',
        title: 'AI Revolution in Financial Services: A Comprehensive Analysis',
        summary: 'Deep dive into how artificial intelligence is transforming traditional financial services, with focus on algorithmic trading, risk management, and customer experience.',
        content: `# Executive Summary

The financial services industry is undergoing a fundamental transformation driven by artificial intelligence technologies. This report examines the current state of AI adoption, key use cases, and future implications for traditional financial institutions.

## Key Findings

1. **Algorithmic Trading**: AI-powered trading systems now account for over 60% of equity trading volume
2. **Risk Management**: Machine learning models have improved credit risk assessment accuracy by 23%
3. **Customer Experience**: AI chatbots handle 80% of routine customer inquiries

## Market Impact

The global AI in fintech market is projected to reach $26.67 billion by 2026, growing at a CAGR of 23.37%.

## Investment Recommendations

- **BUY**: Companies with strong AI capabilities (NVDA, GOOGL, MSFT)
- **HOLD**: Traditional banks investing in AI transformation (JPM, BAC)
- **SELL**: Legacy financial services companies slow to adopt AI

## Conclusion

Financial institutions that fail to embrace AI risk becoming obsolete within the next decade.`,
        author: 'Dr. Sarah Chen',
        authorAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        category: 'sector-report',
        tags: ['AI', 'Fintech', 'Technology', 'Investment'],
        publishedAt: '2025-01-20T10:00:00Z',
        lastUpdated: '2025-01-20T10:00:00Z',
        status: 'published',
        views: 2847,
        downloads: 156,
        rating: 4.8,
        ratingCount: 23,
        isPremium: true,
        blockchain: {
          hash: '0x1a2b3c4d5e6f7890abcdef1234567890',
          verified: true,
          immutable: true
        },
        citations: [
          {
            source: 'McKinsey Global Institute',
            url: 'https://mckinsey.com/ai-fintech-report',
            type: 'academic'
          },
          {
            source: 'Federal Reserve Economic Data',
            url: 'https://fred.stlouisfed.org',
            type: 'government'
          }
        ],
        attachments: [
          { name: 'AI_Fintech_Data.xlsx', type: 'excel', size: '2.3 MB' },
          { name: 'Market_Charts.pdf', type: 'chart', size: '1.8 MB' }
        ]
      },
      {
        id: 'report-2',
        title: 'Cryptocurrency Market Outlook Q1 2025',
        summary: 'Quarterly analysis of cryptocurrency markets, regulatory developments, and institutional adoption trends.',
        content: `# Cryptocurrency Market Outlook Q1 2025

## Market Overview

The cryptocurrency market has shown remarkable resilience in Q1 2025, with total market capitalization reaching $2.1 trillion.

## Key Developments

### Regulatory Clarity
- SEC approval of additional Bitcoin ETFs
- European Union's MiCA regulation implementation
- Increased institutional adoption

### Technical Analysis
- Bitcoin trading range: $40,000 - $50,000
- Ethereum 2.0 staking rewards averaging 4.2%
- DeFi total value locked: $85 billion

## Investment Thesis

We maintain a cautiously optimistic outlook on digital assets, with particular strength in:
1. Bitcoin as digital gold
2. Ethereum ecosystem growth
3. Layer 2 scaling solutions

## Risk Factors

- Regulatory uncertainty in key markets
- Macroeconomic headwinds
- Technology risks and security concerns`,
        author: 'Alex Thompson',
        authorAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        category: 'market-analysis',
        tags: ['Cryptocurrency', 'Bitcoin', 'Ethereum', 'DeFi'],
        publishedAt: '2025-01-18T14:30:00Z',
        lastUpdated: '2025-01-19T09:15:00Z',
        status: 'published',
        views: 1923,
        downloads: 89,
        rating: 4.6,
        ratingCount: 18,
        isPremium: false,
        blockchain: {
          hash: '0x2b3c4d5e6f7890abcdef1234567890ab',
          verified: true,
          immutable: true
        },
        citations: [
          {
            source: 'CoinGecko Market Data',
            url: 'https://coingecko.com',
            type: 'financial'
          },
          {
            source: 'DeFi Pulse',
            url: 'https://defipulse.com',
            type: 'financial'
          }
        ],
        attachments: [
          { name: 'Crypto_Market_Data.xlsx', type: 'excel', size: '1.5 MB' },
          { name: 'Price_Charts.pdf', type: 'chart', size: '3.2 MB' }
        ]
      },
      {
        id: 'report-3',
        title: 'Real Estate Investment Trusts: 2025 Performance Review',
        summary: 'Comprehensive analysis of REIT performance, dividend yields, and sector rotation trends in the current interest rate environment.',
        content: `# Real Estate Investment Trusts: 2025 Performance Review

## Executive Summary

REITs have demonstrated mixed performance in 2025, with significant sector rotation driven by changing interest rate expectations and post-pandemic recovery patterns.

## Sector Performance

### Outperformers
- **Data Centers**: +18.3% YTD
- **Industrial**: +12.7% YTD
- **Cell Towers**: +9.4% YTD

### Underperformers
- **Office**: -8.2% YTD
- **Retail**: -3.1% YTD
- **Hospitality**: +2.1% YTD

## Dividend Analysis

Average REIT dividend yield: 3.8%
Dividend growth rate: 2.1%

## Investment Strategy

We recommend a barbell approach:
1. High-quality growth REITs in data centers and industrial
2. Value opportunities in select office and retail properties

## Outlook

Interest rate sensitivity remains the primary risk factor, but improving fundamentals in key sectors provide attractive opportunities.`,
        author: 'Maria Rodriguez',
        authorAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        category: 'sector-report',
        tags: ['REITs', 'Real Estate', 'Dividends', 'Interest Rates'],
        publishedAt: '2025-01-15T11:20:00Z',
        lastUpdated: '2025-01-15T11:20:00Z',
        status: 'published',
        views: 1456,
        downloads: 67,
        rating: 4.4,
        ratingCount: 12,
        isPremium: true,
        blockchain: {
          hash: '0x3c4d5e6f7890abcdef1234567890abcd',
          verified: true,
          immutable: true
        },
        citations: [
          {
            source: 'NAREIT',
            url: 'https://reit.com',
            type: 'financial'
          },
          {
            source: 'Federal Reserve',
            url: 'https://federalreserve.gov',
            type: 'government'
          }
        ],
        attachments: [
          { name: 'REIT_Performance_Data.xlsx', type: 'excel', size: '2.1 MB' }
        ]
      }
    ];

    const mockTemplates: ResearchTemplate[] = [
      {
        id: 'template-1',
        name: 'Company Analysis Report',
        description: 'Comprehensive template for analyzing individual companies',
        category: 'Company Research',
        sections: [
          { title: 'Executive Summary', description: 'Key findings and investment thesis', required: true },
          { title: 'Business Overview', description: 'Company description and business model', required: true },
          { title: 'Financial Analysis', description: 'Revenue, profitability, and cash flow analysis', required: true },
          { title: 'Competitive Position', description: 'Market position and competitive advantages', required: true },
          { title: 'Valuation', description: 'Valuation metrics and price targets', required: true },
          { title: 'Risk Factors', description: 'Key risks and mitigation strategies', required: true },
          { title: 'Investment Recommendation', description: 'Buy/Hold/Sell recommendation with rationale', required: true }
        ],
        estimatedTime: '4-6 hours'
      },
      {
        id: 'template-2',
        name: 'Market Analysis Report',
        description: 'Template for analyzing market trends and opportunities',
        category: 'Market Analysis',
        sections: [
          { title: 'Market Overview', description: 'Current market conditions and trends', required: true },
          { title: 'Key Drivers', description: 'Factors driving market performance', required: true },
          { title: 'Sector Analysis', description: 'Performance by sector or segment', required: true },
          { title: 'Technical Analysis', description: 'Chart patterns and technical indicators', required: false },
          { title: 'Outlook', description: 'Future market expectations', required: true },
          { title: 'Investment Implications', description: 'How to position portfolios', required: true }
        ],
        estimatedTime: '3-4 hours'
      },
      {
        id: 'template-3',
        name: 'Economic Outlook Report',
        description: 'Template for macroeconomic analysis and forecasting',
        category: 'Economic Analysis',
        sections: [
          { title: 'Economic Summary', description: 'Current economic conditions', required: true },
          { title: 'GDP Analysis', description: 'Growth trends and forecasts', required: true },
          { title: 'Inflation & Interest Rates', description: 'Monetary policy implications', required: true },
          { title: 'Employment Data', description: 'Labor market conditions', required: true },
          { title: 'Global Factors', description: 'International economic influences', required: false },
          { title: 'Market Implications', description: 'Impact on financial markets', required: true }
        ],
        estimatedTime: '5-7 hours'
      }
    ];

    setReports(mockReports);
    setTemplates(mockTemplates);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesTab = activeTab === 'published' ? report.status === 'published' : 
                      activeTab === 'drafts' ? report.status === 'draft' : true;
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market-analysis': return BarChart3;
      case 'company-research': return FileText;
      case 'sector-report': return PieChart;
      case 'economic-outlook': return TrendingUp;
      case 'technical-analysis': return LineChart;
      default: return BookOpen;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market-analysis': return 'text-blue-400 bg-blue-400/20';
      case 'company-research': return 'text-green-400 bg-green-400/20';
      case 'sector-report': return 'text-purple-400 bg-purple-400/20';
      case 'economic-outlook': return 'text-yellow-400 bg-yellow-400/20';
      case 'technical-analysis': return 'text-red-400 bg-red-400/20';
      default: return 'text-white bg-white/20';
    }
  };

  const handleCreateReport = () => {
    const report: ResearchReport = {
      id: `report-${Date.now()}`,
      ...newReport,
      author: 'You',
      authorAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
      publishedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'draft',
      views: 0,
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      blockchain: {
        hash: `0x${Math.random().toString(16).substr(2, 32)}`,
        verified: false,
        immutable: false
      },
      citations: citations,
      attachments: []
    };

    setReports(prev => [report, ...prev]);
    setNewReport({
      title: '',
      summary: '',
      content: '',
      category: 'market-analysis',
      tags: [],
      isPremium: false
    });
    setCitations([]);
    setShowCreateModal(false);
  };

  const addCitation = () => {
    const citation: Citation = {
      id: `citation-${Date.now()}`,
      source: '',
      url: '',
      type: 'academic',
      addedAt: new Date().toISOString()
    };
    setCitations(prev => [...prev, citation]);
  };

  const updateCitation = (id: string, field: keyof Citation, value: string) => {
    setCitations(prev => prev.map(citation => 
      citation.id === id ? { ...citation, [field]: value } : citation
    ));
  };

  const removeCitation = (id: string) => {
    setCitations(prev => prev.filter(citation => citation.id !== id));
  };

  return (
    <div className="w-full h-full p-6 bg-black/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BookOpen size={24} className="text-white/80" />
            <h2 className="text-2xl font-mono text-white/90 protocol-text">Research Center</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">Reports Published: </span>
              <span className="text-white font-medium">{reports.filter(r => r.status === 'published').length}</span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
            >
              <Plus size={16} />
              <span>New Report</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'published' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Published Reports
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'drafts' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Drafts
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'templates' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Templates
          </button>
        </div>

        {(activeTab === 'published' || activeTab === 'drafts') && (
          <>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">All Categories</option>
                <option value="market-analysis">Market Analysis</option>
                <option value="company-research">Company Research</option>
                <option value="sector-report">Sector Report</option>
                <option value="economic-outlook">Economic Outlook</option>
                <option value="technical-analysis">Technical Analysis</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => {
                const CategoryIcon = getCategoryIcon(report.category);
                return (
                  <div key={report.id} className="glass-effect rounded-lg p-6 hover:bg-white/5 transition-all cursor-pointer"
                       onClick={() => setSelectedReport(report)}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(report.category)}`}>
                          <CategoryIcon size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white line-clamp-2">{report.title}</h3>
                          <p className="text-sm text-white/60">{report.category.replace('-', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {report.isPremium && (
                          <Star size={16} className="text-yellow-400" />
                        )}
                        {report.blockchain.verified && (
                          <Shield size={16} className="text-green-400" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-white/80 mb-4 line-clamp-3">{report.summary}</p>

                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={report.authorAvatar}
                        alt={report.author}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-sm text-white font-medium">{report.author}</div>
                        <div className="text-xs text-white/60">
                          {new Date(report.publishedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {report.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                          {tag}
                        </span>
                      ))}
                      {report.tags.length > 3 && (
                        <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60">
                          +{report.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-white/60">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye size={14} />
                          <span>{report.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Download size={14} />
                          <span>{report.downloads}</span>
                        </div>
                        {report.rating > 0 && (
                          <div className="flex items-center space-x-1">
                            <Star size={14} className="text-yellow-400" />
                            <span>{report.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Hash size={12} />
                        <span className="font-mono text-xs">
                          {report.blockchain.hash.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="glass-effect rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">{template.name}</h3>
                    <p className="text-sm text-white/60 mb-3">{template.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-white/60">
                      <Clock size={14} />
                      <span>{template.estimatedTime}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm text-white/60 mb-2">Sections ({template.sections.length})</div>
                  {template.sections.slice(0, 4).map((section, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      {section.required ? (
                        <CheckCircle size={14} className="text-green-400" />
                      ) : (
                        <XCircle size={14} className="text-white/40" />
                      )}
                      <span className="text-white/80">{section.title}</span>
                    </div>
                  ))}
                  {template.sections.length > 4 && (
                    <div className="text-xs text-white/60">
                      +{template.sections.length - 4} more sections
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setNewReport(prev => ({ ...prev, category: template.category.toLowerCase().replace(' ', '-') as any }));
                    setShowCreateModal(true);
                  }}
                  className="w-full py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-medium text-white mb-6">Create New Research Report</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Title</label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                    placeholder="Enter report title..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Category</label>
                  <select
                    value={newReport.category}
                    onChange={(e) => setNewReport(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="market-analysis">Market Analysis</option>
                    <option value="company-research">Company Research</option>
                    <option value="sector-report">Sector Report</option>
                    <option value="economic-outlook">Economic Outlook</option>
                    <option value="technical-analysis">Technical Analysis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Summary</label>
                <textarea
                  value={newReport.summary}
                  onChange={(e) => setNewReport(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                  rows={3}
                  placeholder="Brief summary of the report..."
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Content</label>
                <textarea
                  value={newReport.content}
                  onChange={(e) => setNewReport(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white font-mono text-sm"
                  rows={12}
                  placeholder="Write your report content in Markdown format..."
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Tags</label>
                <input
                  type="text"
                  value={newReport.tags.join(', ')}
                  onChange={(e) => setNewReport(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                  }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                  placeholder="Enter tags separated by commas..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-white/60">Citations</label>
                  <button
                    onClick={addCitation}
                    className="flex items-center space-x-1 px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 text-sm"
                  >
                    <Plus size={14} />
                    <span>Add Citation</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {citations.map((citation) => (
                    <div key={citation.id} className="glass-effect rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={citation.source}
                          onChange={(e) => updateCitation(citation.id, 'source', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                          placeholder="Source name..."
                        />
                        <input
                          type="url"
                          value={citation.url}
                          onChange={(e) => updateCitation(citation.id, 'url', e.target.value)}
                          className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                          placeholder="URL..."
                        />
                        <div className="flex items-center space-x-2">
                          <select
                            value={citation.type}
                            onChange={(e) => updateCitation(citation.id, 'type', e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                          >
                            <option value="academic">Academic</option>
                            <option value="news">News</option>
                            <option value="financial">Financial</option>
                            <option value="government">Government</option>
                          </select>
                          <button
                            onClick={() => removeCitation(citation.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="premium"
                  checked={newReport.isPremium}
                  onChange={(e) => setNewReport(prev => ({ ...prev, isPremium: e.target.checked }))}
                  className="form-checkbox"
                />
                <label htmlFor="premium" className="text-sm text-white/80">
                  Premium content (requires subscription to view)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    // Save as draft logic
                    handleCreateReport();
                  }}
                  className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => {
                    // Publish logic
                    handleCreateReport();
                  }}
                  className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30"
                >
                  Publish Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-medium text-white mb-2">{selectedReport.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <div className="flex items-center space-x-2">
                    <img
                      src={selectedReport.authorAvatar}
                      alt={selectedReport.author}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{selectedReport.author}</span>
                  </div>
                  <span>•</span>
                  <span>{new Date(selectedReport.publishedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Eye size={14} />
                    <span>{selectedReport.views} views</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-white/10 rounded">
                  <Download size={20} className="text-white/60" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded">
                  <Share2 size={20} className="text-white/60" />
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-white/10 rounded"
                >
                  <XCircle size={20} className="text-white/60" />
                </button>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-white/80 leading-relaxed">
                {selectedReport.content}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Blockchain Verification</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Shield size={14} className="text-green-400" />
                      <span className="text-green-400">Verified on blockchain</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white/60">
                      <Hash size={14} />
                      <span className="font-mono">{selectedReport.blockchain.hash}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedReport.citations.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-white/80 mb-3">Citations</h4>
                  <div className="space-y-2">
                    {selectedReport.citations.map((citation, index) => (
                      <div key={index} className="flex items-center space-x-3 text-sm">
                        <span className="text-white/60">{index + 1}.</span>
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {citation.source}
                        </a>
                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
                          {citation.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchCenter;