import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, TrendingDown, Star, Shield, Eye, Download, Share2, Clock, Users, DollarSign, FileText, CheckCircle, XCircle, AlertTriangle, Zap, Target, Award, Hash, Calendar, User, Tag, Search, Filter, Plus, ChevronRight, ArrowUp, ArrowDown, BarChart3, PieChart, LineChart } from 'lucide-react';

interface ESOPListing {
  id: string;
  companyName: string;
  companyLogo: string;
  ticker: string;
  sector: string;
  description: string;
  totalShares: number;
  availableShares: number;
  pricePerShare: number;
  marketCap: number;
  lastFunding: {
    round: string;
    amount: number;
    valuation: number;
    date: string;
  };
  noc: {
    issued: boolean;
    issuedDate: string;
    validUntil: string;
    nocNumber: string;
    restrictions: string[];
  };
  seller: {
    name: string;
    employeeId: string;
    department: string;
    tenure: string;
    verified: boolean;
  };
  performance: {
    revenue: number;
    growth: number;
    employees: number;
    founded: string;
  };
  documents: Array<{
    name: string;
    type: 'noc' | 'valuation' | 'financial' | 'legal';
    verified: boolean;
    uploadedAt: string;
  }>;
  tradingHistory: Array<{
    date: string;
    price: number;
    volume: number;
  }>;
  status: 'active' | 'pending' | 'sold' | 'expired';
  listedAt: string;
  expiresAt: string;
}

interface ESOPTransaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  escrowId: string;
}

const ESOPExchange: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-listings' | 'transactions' | 'analytics'>('marketplace');
  const [listings, setListings] = useState<ESOPListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<ESOPListing | null>(null);
  const [transactions, setTransactions] = useState<ESOPTransaction[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBuyModal, setBuyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    const mockListings: ESOPListing[] = [
      {
        id: 'esop-1',
        companyName: 'TechFlow AI',
        companyLogo: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
        ticker: 'TFAI',
        sector: 'Artificial Intelligence',
        description: 'Leading AI platform for enterprise automation and machine learning solutions',
        totalShares: 10000,
        availableShares: 2500,
        pricePerShare: 450,
        marketCap: 45000000,
        lastFunding: {
          round: 'Series B',
          amount: 25000000,
          valuation: 150000000,
          date: '2024-11-15T00:00:00Z'
        },
        noc: {
          issued: true,
          issuedDate: '2025-01-10T00:00:00Z',
          validUntil: '2025-07-10T00:00:00Z',
          nocNumber: 'NOC-TFAI-2025-001',
          restrictions: ['Lock-in period: 6 months', 'Maximum 25% of holdings per transaction']
        },
        seller: {
          name: 'Rajesh Kumar',
          employeeId: 'EMP-001',
          department: 'Engineering',
          tenure: '4 years',
          verified: true
        },
        performance: {
          revenue: 12000000,
          growth: 180,
          employees: 150,
          founded: '2020'
        },
        documents: [
          { name: 'NOC_Certificate.pdf', type: 'noc', verified: true, uploadedAt: '2025-01-10T00:00:00Z' },
          { name: 'Valuation_Report.pdf', type: 'valuation', verified: true, uploadedAt: '2024-11-20T00:00:00Z' },
          { name: 'Financial_Statements.pdf', type: 'financial', verified: true, uploadedAt: '2024-12-31T00:00:00Z' }
        ],
        tradingHistory: [
          { date: '2025-01-15', price: 420, volume: 500 },
          { date: '2025-01-10', price: 400, volume: 750 },
          { date: '2025-01-05', price: 380, volume: 300 }
        ],
        status: 'active',
        listedAt: '2025-01-10T00:00:00Z',
        expiresAt: '2025-07-10T00:00:00Z'
      },
      {
        id: 'esop-2',
        companyName: 'GreenEnergy Solutions',
        companyLogo: 'https://images.pexels.com/photos/9875414/pexels-photo-9875414.jpeg',
        ticker: 'GREN',
        sector: 'Clean Energy',
        description: 'Renewable energy solutions and smart grid technology for sustainable future',
        totalShares: 8000,
        availableShares: 1200,
        pricePerShare: 680,
        marketCap: 54400000,
        lastFunding: {
          round: 'Series A',
          amount: 15000000,
          valuation: 80000000,
          date: '2024-09-20T00:00:00Z'
        },
        noc: {
          issued: true,
          issuedDate: '2025-01-05T00:00:00Z',
          validUntil: '2025-06-05T00:00:00Z',
          nocNumber: 'NOC-GREN-2025-002',
          restrictions: ['Lock-in period: 12 months', 'Board approval required for >10% stake']
        },
        seller: {
          name: 'Priya Sharma',
          employeeId: 'EMP-045',
          department: 'Product',
          tenure: '3 years',
          verified: true
        },
        performance: {
          revenue: 8500000,
          growth: 220,
          employees: 85,
          founded: '2021'
        },
        documents: [
          { name: 'NOC_Certificate.pdf', type: 'noc', verified: true, uploadedAt: '2025-01-05T00:00:00Z' },
          { name: 'Series_A_Valuation.pdf', type: 'valuation', verified: true, uploadedAt: '2024-09-25T00:00:00Z' }
        ],
        tradingHistory: [
          { date: '2025-01-12', price: 650, volume: 200 },
          { date: '2025-01-08', price: 620, volume: 400 }
        ],
        status: 'active',
        listedAt: '2025-01-05T00:00:00Z',
        expiresAt: '2025-06-05T00:00:00Z'
      },
      {
        id: 'esop-3',
        companyName: 'HealthTech Innovations',
        companyLogo: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg',
        ticker: 'HLTH',
        sector: 'Healthcare Technology',
        description: 'Digital health platform connecting patients with healthcare providers',
        totalShares: 15000,
        availableShares: 3000,
        pricePerShare: 320,
        marketCap: 48000000,
        lastFunding: {
          round: 'Seed',
          amount: 8000000,
          valuation: 40000000,
          date: '2024-06-10T00:00:00Z'
        },
        noc: {
          issued: true,
          issuedDate: '2024-12-20T00:00:00Z',
          validUntil: '2025-05-20T00:00:00Z',
          nocNumber: 'NOC-HLTH-2024-003',
          restrictions: ['Lock-in period: 3 months', 'Right of first refusal to company']
        },
        seller: {
          name: 'Amit Patel',
          employeeId: 'EMP-023',
          department: 'Sales',
          tenure: '2 years',
          verified: true
        },
        performance: {
          revenue: 3200000,
          growth: 340,
          employees: 45,
          founded: '2022'
        },
        documents: [
          { name: 'NOC_Certificate.pdf', type: 'noc', verified: true, uploadedAt: '2024-12-20T00:00:00Z' },
          { name: 'Seed_Round_Docs.pdf', type: 'valuation', verified: true, uploadedAt: '2024-06-15T00:00:00Z' }
        ],
        tradingHistory: [
          { date: '2025-01-18', price: 310, volume: 800 },
          { date: '2025-01-14', price: 295, volume: 600 }
        ],
        status: 'active',
        listedAt: '2024-12-20T00:00:00Z',
        expiresAt: '2025-05-20T00:00:00Z'
      }
    ];

    const mockTransactions: ESOPTransaction[] = [
      {
        id: 'txn-1',
        listingId: 'esop-1',
        buyerId: 'user-123',
        sellerId: 'user-456',
        shares: 500,
        pricePerShare: 450,
        totalAmount: 225000,
        status: 'completed',
        createdAt: '2025-01-15T10:30:00Z',
        completedAt: '2025-01-15T11:45:00Z',
        escrowId: 'escrow-001'
      }
    ];

    setListings(mockListings);
    setTransactions(mockTransactions);
    setSelectedListing(mockListings[0]);
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === 'all' || listing.sector === selectedSector;
    const matchesPrice = listing.pricePerShare >= priceRange.min && listing.pricePerShare <= priceRange.max;
    return matchesSearch && matchesSector && matchesPrice;
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'sold': return 'text-blue-400 bg-blue-400/20';
      case 'expired': return 'text-red-400 bg-red-400/20';
      default: return 'text-white bg-white/20';
    }
  };

  return (
    <div className="w-full h-full p-6 bg-black/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Building2 size={24} className="text-white/80" />
            <h2 className="text-2xl font-mono text-white/90 protocol-text">ESOP Secondary Market</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">Active Listings: </span>
              <span className="text-white font-medium">{listings.filter(l => l.status === 'active').length}</span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
            >
              <Plus size={16} />
              <span>List ESOPs</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'marketplace' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('my-listings')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'my-listings' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'transactions' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'analytics' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Market Analytics
          </button>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            {activeTab === 'marketplace' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search companies, sectors..."
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
                    <option value="all">All Sectors</option>
                    <option value="Artificial Intelligence">AI</option>
                    <option value="Clean Energy">Clean Energy</option>
                    <option value="Healthcare Technology">HealthTech</option>
                    <option value="Fintech">Fintech</option>
                  </select>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white/60">Price:</span>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      className="w-20"
                    />
                    <span className="text-sm text-white">₹{priceRange.max}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <div 
                      key={listing.id}
                      className={`glass-effect rounded-lg p-6 cursor-pointer transition-all ${
                        selectedListing?.id === listing.id ? 'ring-2 ring-white/50' : 'hover:bg-white/5'
                      }`}
                      onClick={() => setSelectedListing(listing)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={listing.companyLogo}
                            alt={listing.companyName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="text-lg font-medium text-white">{listing.companyName}</h3>
                            <p className="text-sm text-white/60">{listing.ticker} • {listing.sector}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded text-xs ${getStatusColor(listing.status)}`}>
                            {listing.status}
                          </div>
                          {listing.noc.issued && (
                            <Shield size={16} className="text-green-400" />
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-white/80 mb-4 line-clamp-2">{listing.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-white/60">Price per Share</div>
                          <div className="text-lg font-medium text-white">₹{listing.pricePerShare}</div>
                        </div>
                        <div>
                          <div className="text-sm text-white/60">Available</div>
                          <div className="text-lg font-medium text-white">{listing.availableShares.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Market Cap</span>
                          <span className="text-white">{formatCurrency(listing.marketCap)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Last Funding</span>
                          <span className="text-white">{listing.lastFunding.round}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Revenue Growth</span>
                          <span className="text-green-400">+{listing.performance.growth}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-white/60">
                          NOC Valid: {new Date(listing.noc.validUntil).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-1">
                          <User size={14} className="text-white/40" />
                          <span className="text-white/60">{listing.seller.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'my-listings' && (
              <div className="glass-effect rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">My ESOP Listings</h3>
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-white/40 mb-4" />
                  <p className="text-white/60">You haven't listed any ESOPs yet</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                  >
                    Create Your First Listing
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Recent Transactions</h3>
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <CheckCircle size={16} className="text-green-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {transaction.shares} shares @ ₹{transaction.pricePerShare}
                            </div>
                            <div className="text-sm text-white/60">
                              Total: ₹{transaction.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white/60">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded ${
                            transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {transaction.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-effect rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <BarChart3 size={24} className="text-blue-400" />
                      <div>
                        <div className="text-sm text-white/60">Total Volume</div>
                        <div className="text-2xl font-medium text-white">₹2.4Cr</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/40">Last 30 days</div>
                  </div>

                  <div className="glass-effect rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <TrendingUp size={24} className="text-green-400" />
                      <div>
                        <div className="text-sm text-white/60">Avg. Price Growth</div>
                        <div className="text-2xl font-medium text-green-400">+18.5%</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/40">Quarterly average</div>
                  </div>

                  <div className="glass-effect rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users size={24} className="text-purple-400" />
                      <div>
                        <div className="text-sm text-white/60">Active Traders</div>
                        <div className="text-2xl font-medium text-white">1,247</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/40">This month</div>
                  </div>
                </div>

                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Sector Performance</h3>
                  <div className="space-y-4">
                    {['Artificial Intelligence', 'Clean Energy', 'Healthcare Technology', 'Fintech'].map((sector, index) => (
                      <div key={sector} className="flex items-center justify-between">
                        <span className="text-white">{sector}</span>
                        <div className="flex items-center space-x-4">
                          <div className="w-32 h-2 bg-white/10 rounded-full">
                            <div 
                              className="h-full bg-green-400 rounded-full"
                              style={{ width: `${[85, 72, 68, 91][index]}%` }}
                            />
                          </div>
                          <span className="text-green-400 text-sm">+{[23, 18, 15, 28][index]}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {selectedListing && activeTab === 'marketplace' && (
            <div className="w-96 glass-effect rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedListing.companyLogo}
                    alt={selectedListing.companyName}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-white">{selectedListing.companyName}</h3>
                    <p className="text-sm text-white/60">{selectedListing.ticker}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-white/10 rounded">
                    <Share2 size={16} className="text-white/60" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded">
                    <Star size={16} className="text-white/60" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Pricing</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-effect rounded-lg p-4">
                      <div className="text-sm text-white/60 mb-1">Price per Share</div>
                      <div className="text-xl font-medium text-white">₹{selectedListing.pricePerShare}</div>
                    </div>
                    <div className="glass-effect rounded-lg p-4">
                      <div className="text-sm text-white/60 mb-1">Available Shares</div>
                      <div className="text-xl font-medium text-white">{selectedListing.availableShares.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">NOC Details</h4>
                  <div className="glass-effect rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Shield size={16} className="text-green-400" />
                      <span className="text-green-400">NOC Verified</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">NOC Number</span>
                        <span className="text-white font-mono text-xs">{selectedListing.noc.nocNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Valid Until</span>
                        <span className="text-white">{new Date(selectedListing.noc.validUntil).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs text-white/60 mb-2">Restrictions</div>
                      <div className="space-y-1">
                        {selectedListing.noc.restrictions.map((restriction, index) => (
                          <div key={index} className="text-xs text-white/80 flex items-start space-x-2">
                            <span className="text-white/40">•</span>
                            <span>{restriction}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Company Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Revenue</span>
                      <span className="text-white">{formatCurrency(selectedListing.performance.revenue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Growth Rate</span>
                      <span className="text-green-400">+{selectedListing.performance.growth}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Employees</span>
                      <span className="text-white">{selectedListing.performance.employees}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Founded</span>
                      <span className="text-white">{selectedListing.performance.founded}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Seller Information</h4>
                  <div className="glass-effect rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User size={16} className="text-white/60" />
                      <span className="text-white font-medium">{selectedListing.seller.name}</span>
                      {selectedListing.seller.verified && (
                        <CheckCircle size={14} className="text-green-400" />
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Department</span>
                        <span className="text-white">{selectedListing.seller.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Tenure</span>
                        <span className="text-white">{selectedListing.seller.tenure}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Documents</h4>
                  <div className="space-y-2">
                    {selectedListing.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText size={14} className="text-white/60" />
                          <span className="text-sm text-white">{doc.name}</span>
                          {doc.verified && (
                            <CheckCircle size={12} className="text-green-400" />
                          )}
                        </div>
                        <button className="p-1 hover:bg-white/10 rounded">
                          <Download size={12} className="text-white/60" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => setBuyModal(true)}
                    className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Place Buy Order
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

export default ESOPExchange;