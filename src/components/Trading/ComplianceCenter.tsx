import React, { useState, useEffect } from 'react';
import { Shield, FileText, AlertTriangle, CheckCircle, Clock, XCircle, Upload, Download, Eye, Calendar, User, Building2, Scale, Gavel, BookOpen, Target, Award, Hash, Zap, Activity, BarChart3, PieChart, TrendingUp } from 'lucide-react';

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  type: 'filing' | 'audit' | 'license' | 'policy' | 'training' | 'review';
  status: 'compliant' | 'pending' | 'overdue' | 'warning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate: string;
  completedDate?: string;
  assignedTo: string;
  entity: string;
  regulatoryBody: string;
  documents: Array<{
    name: string;
    type: string;
    uploadedAt: string;
    size: string;
  }>;
  blockchain: {
    hash: string;
    verified: boolean;
    immutable: boolean;
  };
}

interface ComplianceMetrics {
  overallScore: number;
  totalItems: number;
  compliant: number;
  pending: number;
  overdue: number;
  upcomingDeadlines: number;
  riskLevel: 'low' | 'medium' | 'high';
  lastAuditDate: string;
  nextAuditDate: string;
}

interface RegulatoryUpdate {
  id: string;
  title: string;
  summary: string;
  effectiveDate: string;
  impact: 'low' | 'medium' | 'high';
  category: string;
  source: string;
  actionRequired: boolean;
  relatedEntities: string[];
}

interface ComplianceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
  requirements: string[];
  estimatedTime: string;
}

const ComplianceCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'updates' | 'templates' | 'audit'>('dashboard');
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [regulatoryUpdates, setRegulatoryUpdates] = useState<RegulatoryUpdate[]>([]);
  const [templates, setTemplates] = useState<ComplianceTemplate[]>([]);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');

  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    const mockMetrics: ComplianceMetrics = {
      overallScore: 8.7,
      totalItems: 45,
      compliant: 38,
      pending: 5,
      overdue: 2,
      upcomingDeadlines: 8,
      riskLevel: 'low',
      lastAuditDate: '2024-12-15T00:00:00Z',
      nextAuditDate: '2025-06-15T00:00:00Z'
    };

    const mockComplianceItems: ComplianceItem[] = [
      {
        id: 'comp-1',
        title: 'Form ADV Annual Update',
        description: 'Annual update to Form ADV for registered investment advisor',
        type: 'filing',
        status: 'pending',
        priority: 'high',
        dueDate: '2025-03-31T00:00:00Z',
        assignedTo: 'Sarah Chen',
        entity: 'Arkham Investment Partners LP',
        regulatoryBody: 'SEC',
        documents: [
          { name: 'Form_ADV_Draft.pdf', type: 'pdf', uploadedAt: '2025-01-15T10:00:00Z', size: '2.3 MB' }
        ],
        blockchain: {
          hash: '0x1a2b3c4d5e6f7890abcdef1234567890',
          verified: true,
          immutable: true
        }
      },
      {
        id: 'comp-2',
        title: 'Quarterly Compliance Review',
        description: 'Internal quarterly compliance review and assessment',
        type: 'review',
        status: 'compliant',
        priority: 'medium',
        dueDate: '2025-01-31T00:00:00Z',
        completedDate: '2025-01-28T00:00:00Z',
        assignedTo: 'Alex Thompson',
        entity: 'Arkham Quantum Fund',
        regulatoryBody: 'Internal',
        documents: [
          { name: 'Q4_Compliance_Report.pdf', type: 'pdf', uploadedAt: '2025-01-28T14:30:00Z', size: '1.8 MB' },
          { name: 'Risk_Assessment.xlsx', type: 'excel', uploadedAt: '2025-01-28T14:35:00Z', size: '945 KB' }
        ],
        blockchain: {
          hash: '0x2b3c4d5e6f7890abcdef1234567890ab',
          verified: true,
          immutable: true
        }
      },
      {
        id: 'comp-3',
        title: 'Anti-Money Laundering Training',
        description: 'Annual AML training for all employees',
        type: 'training',
        status: 'overdue',
        priority: 'critical',
        dueDate: '2025-01-15T00:00:00Z',
        assignedTo: 'All Staff',
        entity: 'All Entities',
        regulatoryBody: 'FinCEN',
        documents: [],
        blockchain: {
          hash: '0x3c4d5e6f7890abcdef1234567890abcd',
          verified: false,
          immutable: false
        }
      },
      {
        id: 'comp-4',
        title: 'Investment Advisor License Renewal',
        description: 'State investment advisor license renewal',
        type: 'license',
        status: 'warning',
        priority: 'high',
        dueDate: '2025-02-28T00:00:00Z',
        assignedTo: 'Maria Rodriguez',
        entity: 'Arkham Investment Partners LP',
        regulatoryBody: 'State Securities Commission',
        documents: [
          { name: 'License_Application.pdf', type: 'pdf', uploadedAt: '2025-01-10T09:00:00Z', size: '1.2 MB' }
        ],
        blockchain: {
          hash: '0x4d5e6f7890abcdef1234567890abcdef',
          verified: true,
          immutable: true
        }
      },
      {
        id: 'comp-5',
        title: 'Cybersecurity Policy Update',
        description: 'Annual review and update of cybersecurity policies',
        type: 'policy',
        status: 'pending',
        priority: 'medium',
        dueDate: '2025-02-15T00:00:00Z',
        assignedTo: 'IT Security Team',
        entity: 'All Entities',
        regulatoryBody: 'SEC',
        documents: [
          { name: 'Cybersecurity_Policy_v2.pdf', type: 'pdf', uploadedAt: '2025-01-20T11:00:00Z', size: '3.1 MB' }
        ],
        blockchain: {
          hash: '0x5e6f7890abcdef1234567890abcdef12',
          verified: true,
          immutable: true
        }
      }
    ];

    const mockRegulatoryUpdates: RegulatoryUpdate[] = [
      {
        id: 'update-1',
        title: 'SEC Adopts New Cybersecurity Rules for Investment Advisers',
        summary: 'New rules require enhanced cybersecurity risk management, incident reporting, and annual reviews.',
        effectiveDate: '2025-05-15T00:00:00Z',
        impact: 'high',
        category: 'Cybersecurity',
        source: 'SEC',
        actionRequired: true,
        relatedEntities: ['Arkham Investment Partners LP', 'Arkham Quantum Fund']
      },
      {
        id: 'update-2',
        title: 'FINRA Updates Anti-Money Laundering Requirements',
        summary: 'Enhanced customer due diligence requirements and suspicious activity reporting thresholds.',
        effectiveDate: '2025-03-01T00:00:00Z',
        impact: 'medium',
        category: 'AML/KYC',
        source: 'FINRA',
        actionRequired: true,
        relatedEntities: ['All Entities']
      },
      {
        id: 'update-3',
        title: 'CFTC Proposes New Derivatives Reporting Rules',
        summary: 'Proposed changes to swap data reporting requirements for investment funds.',
        effectiveDate: '2025-07-01T00:00:00Z',
        impact: 'low',
        category: 'Derivatives',
        source: 'CFTC',
        actionRequired: false,
        relatedEntities: ['Arkham Quantum Fund']
      }
    ];

    const mockTemplates: ComplianceTemplate[] = [
      {
        id: 'template-1',
        name: 'Quarterly Compliance Review',
        description: 'Standard template for quarterly compliance assessments',
        category: 'Review',
        frequency: 'Quarterly',
        requirements: [
          'Review all trading activities',
          'Assess risk management procedures',
          'Verify regulatory filings',
          'Update compliance policies',
          'Document findings and recommendations'
        ],
        estimatedTime: '8-12 hours'
      },
      {
        id: 'template-2',
        name: 'Annual AML Training Program',
        description: 'Comprehensive anti-money laundering training curriculum',
        category: 'Training',
        frequency: 'Annual',
        requirements: [
          'AML regulations overview',
          'Customer due diligence procedures',
          'Suspicious activity identification',
          'Reporting requirements',
          'Case studies and scenarios'
        ],
        estimatedTime: '4-6 hours'
      },
      {
        id: 'template-3',
        name: 'Investment Advisor Audit Preparation',
        description: 'Checklist for preparing for regulatory audits',
        category: 'Audit',
        frequency: 'As needed',
        requirements: [
          'Organize client files',
          'Prepare trading records',
          'Review compliance documentation',
          'Update policies and procedures',
          'Conduct mock audit'
        ],
        estimatedTime: '20-30 hours'
      }
    ];

    setMetrics(mockMetrics);
    setComplianceItems(mockComplianceItems);
    setRegulatoryUpdates(mockRegulatoryUpdates);
    setTemplates(mockTemplates);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-400 bg-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'overdue': return 'text-red-400 bg-red-400/20';
      case 'warning': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-white bg-white/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-green-400 bg-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'high': return 'text-red-400 bg-red-400/20';
      default: return 'text-white bg-white/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'filing': return FileText;
      case 'audit': return Eye;
      case 'license': return Award;
      case 'policy': return BookOpen;
      case 'training': return User;
      case 'review': return CheckCircle;
      default: return FileText;
    }
  };

  const filteredItems = complianceItems.filter(item => {
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesEntity = filterEntity === 'all' || item.entity === filterEntity;
    return matchesStatus && matchesEntity;
  });

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!metrics) return null;

  return (
    <div className="w-full h-full p-6 bg-black/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield size={24} className="text-green-400" />
            <h2 className="text-2xl font-mono text-white/90 protocol-text">Compliance Center</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">Compliance Score: </span>
              <span className="text-green-400 font-medium">{metrics.overallScore}/10</span>
            </div>
            <div className="glass-effect px-4 py-2 rounded-lg">
              <span className="text-sm text-white/60">Risk Level: </span>
              <span className={`font-medium ${
                metrics.riskLevel === 'low' ? 'text-green-400' :
                metrics.riskLevel === 'medium' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {metrics.riskLevel.toUpperCase()}
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
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'items' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Compliance Items
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'updates' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Regulatory Updates
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'templates' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'audit' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Audit Trail
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Compliance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-effect rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle size={24} className="text-green-400" />
                  <div>
                    <div className="text-sm text-white/60">Compliant</div>
                    <div className="text-2xl font-medium text-white">{metrics.compliant}</div>
                  </div>
                </div>
                <div className="text-xs text-white/40">
                  {((metrics.compliant / metrics.totalItems) * 100).toFixed(1)}% of total
                </div>
              </div>

              <div className="glass-effect rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Clock size={24} className="text-yellow-400" />
                  <div>
                    <div className="text-sm text-white/60">Pending</div>
                    <div className="text-2xl font-medium text-white">{metrics.pending}</div>
                  </div>
                </div>
                <div className="text-xs text-white/40">
                  {((metrics.pending / metrics.totalItems) * 100).toFixed(1)}% of total
                </div>
              </div>

              <div className="glass-effect rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <XCircle size={24} className="text-red-400" />
                  <div>
                    <div className="text-sm text-white/60">Overdue</div>
                    <div className="text-2xl font-medium text-white">{metrics.overdue}</div>
                  </div>
                </div>
                <div className="text-xs text-white/40">
                  {((metrics.overdue / metrics.totalItems) * 100).toFixed(1)}% of total
                </div>
              </div>

              <div className="glass-effect rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar size={24} className="text-blue-400" />
                  <div>
                    <div className="text-sm text-white/60">Upcoming</div>
                    <div className="text-2xl font-medium text-white">{metrics.upcomingDeadlines}</div>
                  </div>
                </div>
                <div className="text-xs text-white/40">
                  Next 30 days
                </div>
              </div>
            </div>

            {/* Compliance Score */}
            <div className="glass-effect rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Overall Compliance Score</h3>
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
                      strokeDasharray={`${metrics.overallScore * 10}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{metrics.overallScore}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Last Audit</span>
                    <span className="text-white">
                      {new Date(metrics.lastAuditDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Next Audit</span>
                    <span className="text-white">
                      {new Date(metrics.nextAuditDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Total Items</span>
                    <span className="text-white">{metrics.totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Completion Rate</span>
                    <span className="text-green-400">
                      {((metrics.compliant / metrics.totalItems) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Items */}
            <div className="glass-effect rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Recent Compliance Items</h3>
              <div className="space-y-3">
                {complianceItems.slice(0, 5).map((item) => {
                  const TypeIcon = getTypeIcon(item.type);
                  const daysUntilDue = getDaysUntilDue(item.dueDate);
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <TypeIcon size={16} className="text-white/60" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{item.title}</div>
                          <div className="text-sm text-white/60">{item.entity}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </div>
                        <div className="text-xs text-white/60 mt-1">
                          {daysUntilDue > 0 ? `${daysUntilDue} days` : 'Overdue'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">All Status</option>
                <option value="compliant">Compliant</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="warning">Warning</option>
              </select>
              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
              >
                <option value="all">All Entities</option>
                <option value="Arkham Investment Partners LP">Arkham Investment Partners LP</option>
                <option value="Arkham Quantum Fund">Arkham Quantum Fund</option>
                <option value="All Entities">All Entities</option>
              </select>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
              >
                <FileText size={16} />
                <span>New Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                const daysUntilDue = getDaysUntilDue(item.dueDate);
                
                return (
                  <div key={item.id} className="glass-effect rounded-lg p-6 hover:bg-white/5 transition-all cursor-pointer"
                       onClick={() => setSelectedItem(item)}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <TypeIcon size={20} className="text-white/60" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white">{item.title}</h3>
                          <p className="text-sm text-white/60">{item.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </div>
                        {item.blockchain.verified && (
                          <Shield size={16} className="text-green-400" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-white/80 mb-4">{item.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Entity</span>
                        <span className="text-white">{item.entity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Regulator</span>
                        <span className="text-white">{item.regulatoryBody}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Assigned To</span>
                        <span className="text-white">{item.assignedTo}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Priority</span>
                        <span className={getPriorityColor(item.priority)}>
                          {item.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-white/60">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </div>
                      <div className={`${
                        daysUntilDue < 0 ? 'text-red-400' :
                        daysUntilDue < 7 ? 'text-yellow-400' :
                        'text-white/60'
                      }`}>
                        {daysUntilDue > 0 ? `${daysUntilDue} days` : 'Overdue'}
                      </div>
                    </div>

                    {item.documents.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-xs text-white/60">
                          {item.documents.length} document(s) attached
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regulatoryUpdates.map((update) => (
                <div key={update.id} className="glass-effect rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">{update.title}</h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm text-white/60">{update.source}</span>
                        <span className="text-white/40">•</span>
                        <span className="text-sm text-white/60">{update.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded text-xs ${getImpactColor(update.impact)}`}>
                        {update.impact} impact
                      </div>
                      {update.actionRequired && (
                        <AlertTriangle size={16} className="text-yellow-400" />
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-white/80 mb-4">{update.summary}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Effective Date</span>
                      <span className="text-white">
                        {new Date(update.effectiveDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Action Required</span>
                      <span className={update.actionRequired ? 'text-yellow-400' : 'text-green-400'}>
                        {update.actionRequired ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-white/60 mb-2">Affected Entities</div>
                    <div className="flex flex-wrap gap-2">
                      {update.relatedEntities.map((entity, index) => (
                        <span key={index} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                          {entity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="glass-effect rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">{template.name}</h3>
                    <p className="text-sm text-white/60 mb-3">{template.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{template.frequency}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{template.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm text-white/60 mb-2">Requirements ({template.requirements.length})</div>
                  {template.requirements.slice(0, 3).map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle size={14} className="text-green-400" />
                      <span className="text-white/80">{requirement}</span>
                    </div>
                  ))}
                  {template.requirements.length > 3 && (
                    <div className="text-xs text-white/60">
                      +{template.requirements.length - 3} more requirements
                    </div>
                  )}
                </div>

                <button className="w-full py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="glass-effect rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-6">Blockchain Audit Trail</h3>
            <div className="space-y-4">
              {complianceItems.filter(item => item.blockchain.verified).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Shield size={16} className="text-green-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{item.title}</div>
                      <div className="text-sm text-white/60">{item.entity}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/60 mb-1">Blockchain Hash</div>
                    <div className="text-xs text-white/40 font-mono">
                      {item.blockchain.hash}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <CheckCircle size={12} className="text-green-400" />
                      <span className="text-xs text-green-400">Verified & Immutable</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-effect rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-medium text-white mb-2">{selectedItem.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <span>{selectedItem.entity}</span>
                  <span>•</span>
                  <span>{selectedItem.regulatoryBody}</span>
                  <span>•</span>
                  <span>Assigned to {selectedItem.assignedTo}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-white/10 rounded"
              >
                <XCircle size={20} className="text-white/60" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-2">Description</h4>
                <p className="text-white/80">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Status & Priority</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/60">Status</span>
                      <div className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Priority</span>
                      <span className={getPriorityColor(selectedItem.priority)}>
                        {selectedItem.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Due Date</span>
                      <span className="text-white">
                        {new Date(selectedItem.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedItem.completedDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Completed</span>
                        <span className="text-green-400">
                          {new Date(selectedItem.completedDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedItem.documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-white/80 mb-3">Documents</h4>
                  <div className="space-y-2">
                    {selectedItem.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText size={16} className="text-white/60" />
                          <div>
                            <div className="text-white font-medium">{doc.name}</div>
                            <div className="text-sm text-white/60">
                              {doc.size} • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-white/10 rounded">
                            <Eye size={16} className="text-white/60" />
                          </button>
                          <button className="p-1 hover:bg-white/10 rounded">
                            <Download size={16} className="text-white/60" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-white/80 mb-3">Blockchain Verification</h4>
                <div className="glass-effect rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield size={16} className="text-green-400" />
                    <span className="text-green-400">Verified on blockchain</span>
                  </div>
                  <div className="text-xs text-white/60 mb-1">Hash:</div>
                  <div className="text-xs text-white/40 font-mono break-all">
                    {selectedItem.blockchain.hash}
                  </div>
                  <div className="flex items-center space-x-4 mt-3 text-xs text-white/60">
                    <div className="flex items-center space-x-1">
                      <CheckCircle size={12} className="text-green-400" />
                      <span>Immutable Record</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Hash size={12} />
                      <span>Cryptographically Secured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceCenter;