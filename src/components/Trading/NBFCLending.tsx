import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Shield, CheckCircle, Clock, AlertTriangle, FileText, User, BarChart3, PieChart, Calculator, Target, Award, Hash, Calendar, Building2, CreditCard, Smartphone, Eye, Download, Upload, RefreshCw, Filter, Search, Plus } from 'lucide-react';

interface LoanApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  loanAmount: number;
  loanPurpose: string;
  tenure: number; // in months
  interestRate: number;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'disbursed' | 'rejected';
  creditScore: number;
  monthlyIncome: number;
  employmentType: 'salaried' | 'self-employed' | 'business';
  documents: Array<{
    type: string;
    name: string;
    uploaded: boolean;
    verified: boolean;
  }>;
  aiScore: {
    overall: number;
    creditworthiness: number;
    repaymentCapacity: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
  nbfcPartner: string;
  createdAt: string;
  updatedAt: string;
}

interface LoanProduct {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  interestRateRange: {
    min: number;
    max: number;
  };
  processingFee: number;
  eligibility: string[];
  features: string[];
  nbfcPartner: string;
  category: 'personal' | 'business' | 'education' | 'home' | 'vehicle';
}

interface NBFCPartner {
  id: string;
  name: string;
  logo: string;
  rating: number;
  totalDisbursed: number;
  avgProcessingTime: number; // in days
  successRate: number;
  specialization: string[];
  riskAppetite: 'conservative' | 'moderate' | 'aggressive';
}

interface LoanPortfolio {
  totalApplications: number;
  approvedApplications: number;
  disbursedAmount: number;
  averageTicketSize: number;
  defaultRate: number;
  portfolioYield: number;
  monthlyGrowth: number;
}

const NBFCLending: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'products' | 'partners' | 'analytics'>('dashboard');
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [nbfcPartners, setNbfcPartners] = useState<NBFCPartner[]>([]);
  const [portfolio, setPortfolio] = useState<LoanPortfolio | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<LoanApplication | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    const mockPortfolio: LoanPortfolio = {
      totalApplications: 1247,
      approvedApplications: 892,
      disbursedAmount: 45600000,
      averageTicketSize: 185000,
      defaultRate: 2.3,
      portfolioYield: 14.5,
      monthlyGrowth: 18.7
    };

    const mockNBFCPartners: NBFCPartner[] = [
      {
        id: 'nbfc-1',
        name: 'IndiFin Capital',
        logo: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg',
        rating: 4.8,
        totalDisbursed: 25000000,
        avgProcessingTime: 3,
        successRate: 87.5,
        specialization: ['Personal Loans', 'Business Loans'],
        riskAppetite: 'moderate'
      },
      {
        id: 'nbfc-2',
        name: 'QuickCredit Solutions',
        logo: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg',
        rating: 4.6,
        totalDisbursed: 18000000,
        avgProcessingTime: 2,
        successRate: 82.3,
        specialization: ['Personal Loans', 'Education Loans'],
        riskAppetite: 'aggressive'
      },
      {
        id: 'nbfc-3',
        name: 'SecureFinance Ltd',
        logo: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg',
        rating: 4.9,
        totalDisbursed: 32000000,
        avgProcessingTime: 5,
        successRate: 91.2,
        specialization: ['Home Loans', 'Vehicle Loans'],
        riskAppetite: 'conservative'
      }
    ];

    const mockLoanProducts: LoanProduct[] = [
      {
        id: 'product-1',
        name: 'Personal Loan Express',
        description: 'Quick personal loans for salaried professionals with minimal documentation',
        minAmount: 50000,
        maxAmount: 1000000,
        minTenure: 12,
        maxTenure: 60,
        interestRateRange: { min: 12.5, max: 18.0 },
        processingFee: 2.5,
        eligibility: [
          'Age: 21-60 years',
          'Minimum salary: ₹25,000',
          'Work experience: 2+ years',
          'Credit score: 650+'
        ],
        features: [
          'Instant approval',
          'No collateral required',
          'Flexible repayment',
          'Part prepayment allowed'
        ],
        nbfcPartner: 'IndiFin Capital',
        category: 'personal'
      },
      {
        id: 'product-2',
        name: 'Business Growth Loan',
        description: 'Working capital and expansion loans for small and medium businesses',
        minAmount: 200000,
        maxAmount: 5000000,
        minTenure: 12,
        maxTenure: 84,
        interestRateRange: { min: 14.0, max: 22.0 },
        processingFee: 3.0,
        eligibility: [
          'Business vintage: 2+ years',
          'Annual turnover: ₹10L+',
          'ITR filed for 2 years',
          'CIBIL score: 700+'
        ],
        features: [
          'Collateral-free up to ₹50L',
          'Quick disbursement',
          'Flexible EMI options',
          'Business credit line'
        ],
        nbfcPartner: 'QuickCredit Solutions',
        category: 'business'
      },
      {
        id: 'product-3',
        name: 'Education Loan Pro',
        description: 'Comprehensive education loans for higher studies in India and abroad',
        minAmount: 100000,
        maxAmount: 7500000,
        minTenure: 60,
        maxTenure: 180,
        interestRateRange: { min: 10.5, max: 15.0 },
        processingFee: 1.0,
        eligibility: [
          'Admission confirmed',
          'Co-applicant required',
          'Age: 18-35 years',
          'Course from recognized institute'
        ],
        features: [
          'Moratorium period',
          'No margin for loans up to ₹4L',
          'Tax benefits under 80E',
          'Simple interest during study'
        ],
        nbfcPartner: 'SecureFinance Ltd',
        category: 'education'
      }
    ];

    const mockApplications: LoanApplication[] = [
      {
        id: 'app-1',
        applicantName: 'Rajesh Kumar',
        applicantEmail: 'rajesh.kumar@email.com',
        applicantPhone: '+91-9876543210',
        loanAmount: 500000,
        loanPurpose: 'Home renovation',
        tenure: 36,
        interestRate: 15.5,
        status: 'approved',
        creditScore: 750,
        monthlyIncome: 85000,
        employmentType: 'salaried',
        documents: [
          { type: 'Salary Slip', name: 'salary_slip.pdf', uploaded: true, verified: true },
          { type: 'Bank Statement', name: 'bank_statement.pdf', uploaded: true, verified: true },
          { type: 'PAN Card', name: 'pan_card.pdf', uploaded: true, verified: true },
          { type: 'Aadhaar Card', name: 'aadhaar.pdf', uploaded: true, verified: false }
        ],
        aiScore: {
          overall: 8.2,
          creditworthiness: 8.5,
          repaymentCapacity: 7.8,
          riskLevel: 'low',
          recommendations: [
            'Strong credit profile with consistent payment history',
            'Stable employment with good income',
            'Recommended for approval with standard terms'
          ]
        },
        nbfcPartner: 'IndiFin Capital',
        createdAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-01-18T14:22:00Z'
      },
      {
        id: 'app-2',
        applicantName: 'Priya Sharma',
        applicantEmail: 'priya.sharma@email.com',
        applicantPhone: '+91-9876543211',
        loanAmount: 250000,
        loanPurpose: 'Business expansion',
        tenure: 24,
        interestRate: 18.0,
        status: 'under-review',
        creditScore: 680,
        monthlyIncome: 45000,
        employmentType: 'self-employed',
        documents: [
          { type: 'ITR', name: 'itr_2023.pdf', uploaded: true, verified: true },
          { type: 'Bank Statement', name: 'bank_statement.pdf', uploaded: true, verified: false },
          { type: 'Business Registration', name: 'business_reg.pdf', uploaded: false, verified: false }
        ],
        aiScore: {
          overall: 6.8,
          creditworthiness: 7.2,
          repaymentCapacity: 6.5,
          riskLevel: 'medium',
          recommendations: [
            'Moderate credit profile with some payment delays',
            'Self-employed income needs verification',
            'Consider additional collateral or guarantor'
          ]
        },
        nbfcPartner: 'QuickCredit Solutions',
        createdAt: '2025-01-18T09:15:00Z',
        updatedAt: '2025-01-20T11:30:00Z'
      }
    ];

    setPortfolio(mockPortfolio);
    setNbfcPartners(mockNBFCPartners);
    setLoanProducts(mockLoanProducts);
    setApplications(mockApplications);
    setSelectedApplication(mockApplications[0]);
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
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
      case 'approved': return 'text-green-400 bg-green-400/20';
      case 'disbursed': return 'text-blue-400 bg-blue-400/20';
      case 'under-review': return 'text-yellow-400 bg-yellow-400/20';
      case 'submitted': return 'text-purple-400 bg-purple-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/20';
      case 'draft': return 'text-white/60 bg-white/10';
      default: return 'text-white bg-white/20';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-white';
    }
  };

  if (!portfolio) return null;

  return (
    <div className="w-full h-full p-6 bg-black/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <DollarSign size={24} className="text-green-400" />
            <h2 className="text-2xl font-mono text-white/90 protocol-text">NBFC Lending Platform</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">Portfolio Yield: </span>
              <span className="text-green-400 font-medium">{portfolio.portfolioYield}%</span>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
            >
              <Plus size={16} />
              <span>New Application</span>
            </button>
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
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'applications' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Applications
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'products' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Loan Products
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'partners' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            NBFC Partners
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'analytics' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Analytics
          </button>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="glass-effect rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <FileText size={24} className="text-blue-400" />
                      <div>
                        <div className="text-sm text-white/60">Total Applications</div>
                        <div className="text-2xl font-medium text-white">{portfolio.totalApplications}</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/40">All time</div>
                  </div>

                  <div className="glass-effect rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <CheckCircle size={24} className="text-green-400" />
                      <div>
                        <div className="text-sm text-white/60">Approved</div>
                        <div className="text-2xl font-medium text-white">{portfolio.approvedApplications}</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/40">
                      {((portfolio.approvedApplications / portfolio.totalApplications) * 100).toFixed(1)}% approval rate
                    </div>
                  </div>

                  <div className="glass-effect rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <DollarSign size={24} className="text-green-400" />
                      <div>
                        <div className="text-sm text-white/60">Disbursed</div>
                        <div className="text-2xl font-medium text-white">{formatCurrency(portfolio.disbursedAmount)}</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/40">Total amount</div>
                  </div>

                  <div className="glass-effect rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <TrendingUp size={24} className="text-purple-400" />
                      <div>
                        <div className="text-sm text-white/60">Monthly Growth</div>
                        <div className="text-2xl font-medium text-white">+{portfolio.monthlyGrowth}%</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/40">Applications</div>
                  </div>
                </div>

                {/* Lending-as-a-Service Model */}
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Lending-as-a-Service Model</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-effect rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Smartphone size={20} className="text-blue-400" />
                        <span className="text-white font-medium">Your Platform</span>
                      </div>
                      <ul className="space-y-2 text-sm text-white/80">
                        <li>• Own the customer journey</li>
                        <li>• Custom scoring algorithms</li>
                        <li>• Brand control</li>
                        <li>• User experience design</li>
                      </ul>
                    </div>
                    <div className="glass-effect rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Building2 size={20} className="text-green-400" />
                        <span className="text-white font-medium">NBFC Partner</span>
                      </div>
                      <ul className="space-y-2 text-sm text-white/80">
                        <li>• Loan disbursement</li>
                        <li>• Regulatory compliance</li>
                        <li>• Risk underwriting</li>
                        <li>• Collections management</li>
                      </ul>
                    </div>
                    <div className="glass-effect rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Target size={20} className="text-purple-400" />
                        <span className="text-white font-medium">Shared Benefits</span>
                      </div>
                      <ul className="space-y-2 text-sm text-white/80">
                        <li>• Revenue sharing model</li>
                        <li>• Reduced operational costs</li>
                        <li>• Faster time to market</li>
                        <li>• Scalable infrastructure</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Recent Applications */}
                <div className="glass-effect rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Recent Applications</h3>
                    <button
                      onClick={() => setActiveTab('applications')}
                      className="text-sm text-white/60 hover:text-white"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-3">
                    {applications.slice(0, 5).map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/10 rounded-lg">
                            <User size={16} className="text-white/60" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{application.applicantName}</div>
                            <div className="text-sm text-white/60">
                              {formatCurrency(application.loanAmount)} • {application.tenure} months
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded text-xs ${getStatusColor(application.status)}`}>
                            {application.status}
                          </div>
                          <div className="text-xs text-white/60 mt-1">
                            AI Score: {application.aiScore.overall}/10
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="under-review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="disbursed">Disbursed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredApplications.map((application) => (
                    <div 
                      key={application.id}
                      className={`glass-effect rounded-lg p-6 cursor-pointer transition-all ${
                        selectedApplication?.id === application.id ? 'ring-2 ring-white/50' : 'hover:bg-white/5'
                      }`}
                      onClick={() => setSelectedApplication(application)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-white">{application.applicantName}</h3>
                          <p className="text-sm text-white/60">{application.applicantEmail}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${getStatusColor(application.status)}`}>
                          {application.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-white/60">Loan Amount</div>
                          <div className="text-lg font-medium text-white">{formatCurrency(application.loanAmount)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-white/60">Tenure</div>
                          <div className="text-lg font-medium text-white">{application.tenure} months</div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Credit Score</span>
                          <span className="text-white">{application.creditScore}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Monthly Income</span>
                          <span className="text-white">{formatCurrency(application.monthlyIncome)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">AI Score</span>
                          <span className="text-white">{application.aiScore.overall}/10</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Risk Level</span>
                          <span className={getRiskColor(application.aiScore.riskLevel)}>
                            {application.aiScore.riskLevel.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-white/60">
                          NBFC: {application.nbfcPartner}
                        </div>
                        <div className="text-white/60">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loanProducts.map((product) => (
                  <div key={product.id} className="glass-effect rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-white">{product.name}</h3>
                        <p className="text-sm text-white/60">{product.description}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        product.category === 'personal' ? 'bg-blue-500/20 text-blue-400' :
                        product.category === 'business' ? 'bg-green-500/20 text-green-400' :
                        product.category === 'education' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-white/20 text-white'
                      }`}>
                        {product.category}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-white/60">Amount Range</div>
                        <div className="text-white">{formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">Interest Rate</div>
                        <div className="text-white">{product.interestRateRange.min}% - {product.interestRateRange.max}%</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="text-sm text-white/60 mb-2">Key Features</div>
                        <div className="space-y-1">
                          {product.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="text-sm text-white/80 flex items-center space-x-2">
                              <CheckCircle size={12} className="text-green-400" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/60">
                        Partner: {product.nbfcPartner}
                      </div>
                      <button className="px-3 py-1 bg-white/10 rounded hover:bg-white/20 text-sm">
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'partners' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nbfcPartners.map((partner) => (
                  <div key={partner.id} className="glass-effect rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-medium text-white">{partner.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star size={14} className="text-yellow-400" />
                          <span className="text-sm text-white/60">{partner.rating}/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Total Disbursed</span>
                        <span className="text-white">{formatCurrency(partner.totalDisbursed)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Avg. Processing</span>
                        <span className="text-white">{partner.avgProcessingTime} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Success Rate</span>
                        <span className="text-green-400">{partner.successRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Risk Appetite</span>
                        <span className={`${
                          partner.riskAppetite === 'conservative' ? 'text-green-400' :
                          partner.riskAppetite === 'moderate' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {partner.riskAppetite}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-white/60 mb-2">Specialization</div>
                      <div className="flex flex-wrap gap-2">
                        {partner.specialization.map((spec, index) => (
                          <span key={index} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-effect rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Portfolio Performance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Portfolio Yield</span>
                        <span className="text-green-400 font-medium">{portfolio.portfolioYield}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Default Rate</span>
                        <span className="text-red-400 font-medium">{portfolio.defaultRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Avg. Ticket Size</span>
                        <span className="text-white">{formatCurrency(portfolio.averageTicketSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Monthly Growth</span>
                        <span className="text-green-400">+{portfolio.monthlyGrowth}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-effect rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Application Funnel</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Applications</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-white/10 rounded-full">
                            <div className="w-full h-full bg-blue-400 rounded-full" />
                          </div>
                          <span className="text-white text-sm">{portfolio.totalApplications}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Approved</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-white/10 rounded-full">
                            <div 
                              className="h-full bg-green-400 rounded-full"
                              style={{ width: `${(portfolio.approvedApplications / portfolio.totalApplications) * 100}%` }}
                            />
                          </div>
                          <span className="text-white text-sm">{portfolio.approvedApplications}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'karma' && karmaPoints && (
              <div className="space-y-6">
                {/* Karma Overview */}
                <div className="glass-effect rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-medium text-white">Karma Points System</h3>
                    <div className={`px-3 py-1 rounded-lg ${
                      karmaPoints.currentTier === 'Diamond' ? 'bg-purple-500/20 text-purple-400' :
                      karmaPoints.currentTier === 'Platinum' ? 'bg-gray-400/20 text-gray-400' :
                      karmaPoints.currentTier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                      karmaPoints.currentTier === 'Silver' ? 'bg-gray-300/20 text-gray-300' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {karmaPoints.currentTier} Tier
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="glass-effect rounded-lg p-4">
                      <div className="text-sm text-white/60 mb-1">Available Points</div>
                      <div className="text-2xl font-medium text-yellow-400">{karmaPoints.availablePoints}</div>
                    </div>
                    <div className="glass-effect rounded-lg p-4">
                      <div className="text-sm text-white/60 mb-1">Total Earned</div>
                      <div className="text-2xl font-medium text-green-400">{karmaPoints.totalPoints}</div>
                    </div>
                    <div className="glass-effect rounded-lg p-4">
                      <div className="text-sm text-white/60 mb-1">This Month</div>
                      <div className="text-2xl font-medium text-blue-400">+{karmaPoints.monthlyEarned}</div>
                    </div>
                    <div className="glass-effect rounded-lg p-4">
                      <div className="text-sm text-white/60 mb-1">To Next Tier</div>
                      <div className="text-2xl font-medium text-purple-400">{karmaPoints.nextTierPoints}</div>
                    </div>
                  </div>

                  <div className="glass-effect rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-medium text-white mb-3">How to Earn Karma Points</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white/80">On-time EMI Payment</span>
                          <span className="text-green-400 font-medium">+50 points</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white/80">Early EMI Payment</span>
                          <span className="text-green-400 font-medium">+25 points</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white/80">Loan Completion</span>
                          <span className="text-green-400 font-medium">+200 points</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white/80">Referral Success</span>
                          <span className="text-green-400 font-medium">+100 points</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white/80">Profile Completion</span>
                          <span className="text-green-400 font-medium">+30 points</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <span className="text-white/80">Document Upload</span>
                          <span className="text-green-400 font-medium">+10 points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits Marketplace */}
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Redeem Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {karmaPoints.benefits.map((benefit, index) => (
                      <div key={index} className="glass-effect rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-white font-medium mb-1">{benefit.name}</h4>
                            <p className="text-sm text-white/60">{benefit.description}</p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs ${
                            benefit.category === 'interest-discount' ? 'bg-green-500/20 text-green-400' :
                            benefit.category === 'fee-waiver' ? 'bg-blue-500/20 text-blue-400' :
                            benefit.category === 'priority-processing' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {benefit.category.replace('-', ' ')}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-yellow-400 font-medium">
                            {benefit.pointsCost} points
                          </div>
                          <button
                            disabled={!benefit.available || karmaPoints.availablePoints < benefit.pointsCost}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              benefit.available && karmaPoints.availablePoints >= benefit.pointsCost
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-white/5 text-white/40 cursor-not-allowed'
                            }`}
                          >
                            {karmaPoints.availablePoints >= benefit.pointsCost ? 'Redeem' : 'Insufficient Points'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Karma History */}
                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {karmaPoints.history.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <div className="text-white font-medium">{activity.description}</div>
                          <div className="text-sm text-white/60">{new Date(activity.date).toLocaleDateString()}</div>
                        </div>
                        <div className={`font-medium ${
                          activity.type === 'earned' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {activity.type === 'earned' ? '+' : ''}{activity.points} points
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {selectedApplication && activeTab === 'applications' && (
            <div className="w-96 glass-effect rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">Application Details</h3>
                <div className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedApplication.status)}`}>
                  {selectedApplication.status}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Applicant Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Name</span>
                      <span className="text-white">{selectedApplication.applicantName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Email</span>
                      <span className="text-white">{selectedApplication.applicantEmail}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Phone</span>
                      <span className="text-white">{selectedApplication.applicantPhone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Employment</span>
                      <span className="text-white">{selectedApplication.employmentType}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Loan Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Amount</span>
                      <span className="text-white">{formatCurrency(selectedApplication.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Purpose</span>
                      <span className="text-white">{selectedApplication.loanPurpose}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Tenure</span>
                      <span className="text-white">{selectedApplication.tenure} months</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Interest Rate</span>
                      <span className="text-white">{selectedApplication.interestRate}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">AI Assessment</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Overall Score</span>
                      <span className="text-white">{selectedApplication.aiScore.overall}/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Creditworthiness</span>
                      <span className="text-white">{selectedApplication.aiScore.creditworthiness}/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Repayment Capacity</span>
                      <span className="text-white">{selectedApplication.aiScore.repaymentCapacity}/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Risk Level</span>
                      <span className={getRiskColor(selectedApplication.aiScore.riskLevel)}>
                        {selectedApplication.aiScore.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Documents</h4>
                  <div className="space-y-2">
                    {selectedApplication.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText size={14} className="text-white/60" />
                          <span className="text-sm text-white">{doc.type}</span>
                          {doc.verified && (
                            <CheckCircle size={12} className="text-green-400" />
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {doc.uploaded ? (
                            <Eye size={12} className="text-white/60" />
                          ) : (
                            <Upload size={12} className="text-white/40" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">AI Recommendations</h4>
                  <div className="space-y-2">
                    {selectedApplication.aiScore.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm text-white/80 flex items-start space-x-2">
                        <span className="text-white/40">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NBFCLending;