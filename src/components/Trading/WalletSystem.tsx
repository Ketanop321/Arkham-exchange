import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Plus, Minus, RefreshCw, Shield, CheckCircle, Clock, AlertTriangle, QrCode, Copy, Eye, EyeOff, History, TrendingUp, DollarSign, Smartphone, Building2, User, Hash, Calendar, Filter, Search, XCircle, Share2 } from 'lucide-react';

interface WalletBalance {
  currency: 'INR' | 'USD';
  available: number;
  locked: number;
  total: number;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: 'INR' | 'USD';
  description: string;
  category: 'upi' | 'bank-transfer' | 'trading' | 'esop' | 'lending' | 'investment';
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  reference: string;
  fee?: number;
  roundUp?: {
    originalAmount: number;
    roundUpAmount: number;
    investmentFundContribution: number;
  };
  metadata?: {
    upiId?: string;
    bankAccount?: string;
    orderId?: string;
    counterparty?: string;
  };
}

interface RoundUpFund {
  totalContributions: number;
  pendingAmount: number;
  investmentThreshold: number;
  totalInvested: number;
  currentHoldings: Array<{
    symbol: string;
    shares: number;
    avgPrice: number;
    currentValue: number;
  }>;
  monthlyContributions: number;
  isEnabled: boolean;
}

interface UPIContact {
  id: string;
  name: string;
  upiId: string;
  avatar?: string;
  lastUsed: string;
  frequency: number;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  accountType: 'savings' | 'current';
  verified: boolean;
  primary: boolean;
}

const WalletSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'upi' | 'bank' | 'cards'>('overview');
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [upiContacts, setUpiContacts] = useState<UPIContact[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [roundUpFund, setRoundUpFund] = useState<RoundUpFund | null>(null);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [showRoundUpModal, setShowRoundUpModal] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'USD'>('INR');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    const mockBalances: WalletBalance[] = [
      {
        currency: 'INR',
        available: 125430.50,
        locked: 25000.00,
        total: 150430.50
      },
      {
        currency: 'USD',
        available: 1250.75,
        locked: 500.00,
        total: 1750.75
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: 'txn-1',
        type: 'credit',
        amount: 50000,
        currency: 'INR',
        description: 'UPI Transfer from SBI Bank',
        category: 'upi',
        status: 'completed',
        timestamp: '2025-01-20T14:30:00Z',
        reference: 'UPI-502847291847',
        metadata: {
          upiId: 'user@paytm',
          bankAccount: 'SBI-****1234'
        }
      },
      {
        id: 'txn-2',
        type: 'debit',
        amount: 15000,
        currency: 'INR',
        description: 'ESOP Purchase - TechFlow AI',
        category: 'esop',
        status: 'completed',
        timestamp: '2025-01-20T12:15:00Z',
        reference: 'ESOP-TF-001',
        fee: 150,
        metadata: {
          orderId: 'esop-1',
          counterparty: 'TechFlow AI'
        }
      },
      {
        id: 'txn-3',
        type: 'credit',
        amount: 2500,
        currency: 'INR',
        description: 'Lending Interest Payment',
        category: 'lending',
        status: 'completed',
        timestamp: '2025-01-19T16:45:00Z',
        reference: 'LEND-INT-789',
        metadata: {
          counterparty: 'NBFC Partner'
        }
      },
      {
        id: 'txn-4',
        type: 'debit',
        amount: 25000,
        currency: 'INR',
        description: 'Investment in Mutual Fund',
        category: 'investment',
        status: 'pending',
        timestamp: '2025-01-19T10:20:00Z',
        reference: 'INV-MF-456',
        fee: 0
      }
    ];

    const mockUPIContacts: UPIContact[] = [
      {
        id: 'contact-1',
        name: 'Rajesh Kumar',
        upiId: 'rajesh@paytm',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        lastUsed: '2025-01-18T00:00:00Z',
        frequency: 5
      },
      {
        id: 'contact-2',
        name: 'Priya Sharma',
        upiId: 'priya@gpay',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        lastUsed: '2025-01-15T00:00:00Z',
        frequency: 3
      }
    ];

    const mockBankAccounts: BankAccount[] = [
      {
        id: 'bank-1',
        bankName: 'State Bank of India',
        accountNumber: '****1234',
        ifsc: 'SBIN0001234',
        accountType: 'savings',
        verified: true,
        primary: true
      },
      {
        id: 'bank-2',
        bankName: 'HDFC Bank',
        accountNumber: '****5678',
        ifsc: 'HDFC0001234',
        accountType: 'current',
        verified: true,
        primary: false
      }
    ];

    const mockRoundUpFund: RoundUpFund = {
      totalContributions: 2847.50,
      pendingAmount: 847.50,
      investmentThreshold: 1000,
      totalInvested: 2000,
      currentHoldings: [
        { symbol: 'AAPL', shares: 0.25, avgPrice: 175.00, currentValue: 43.75 },
        { symbol: 'MSFT', shares: 0.15, avgPrice: 415.00, currentValue: 62.25 },
        { symbol: 'GOOGL', shares: 0.08, avgPrice: 142.50, currentValue: 11.40 }
      ],
      monthlyContributions: 456.30,
      isEnabled: true
    };

    setBalances(mockBalances);
    setTransactions(mockTransactions);
    setUpiContacts(mockUPIContacts);
    setBankAccounts(mockBankAccounts);
    setRoundUpFund(mockRoundUpFund);
  };

  const currentBalance = balances.find(b => b.currency === selectedCurrency);

  const filteredTransactions = transactions.filter(txn => {
    const matchesCategory = filterCategory === 'all' || txn.category === filterCategory;
    const matchesSearch = txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         txn.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCurrency = txn.currency === selectedCurrency;
    return matchesCategory && matchesSearch && matchesCurrency;
  });

  const formatCurrency = (amount: number, currency: 'INR' | 'USD') => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTransactionIcon = (category: string) => {
    switch (category) {
      case 'upi': return Smartphone;
      case 'bank-transfer': return Building2;
      case 'trading': return TrendingUp;
      case 'esop': return Building2;
      case 'lending': return DollarSign;
      case 'investment': return TrendingUp;
      default: return CreditCard;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="w-full h-full p-6 bg-black/90">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Wallet size={24} className="text-white/80" />
            <h2 className="text-2xl font-mono text-white/90 protocol-text">Digital Wallet</h2>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as 'INR' | 'USD')}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
            <button
              onClick={() => setShowAddMoney(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
            >
              <Plus size={16} />
              <span>Add Money</span>
            </button>
            <button
              onClick={() => setShowSendMoney(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
            >
              <ArrowUpRight size={16} />
              <span>Send Money</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'overview' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Overview
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
            onClick={() => setActiveTab('upi')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'upi' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            UPI & Payments
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'bank' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Bank Accounts
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'cards' ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'
            }`}
          >
            Cards
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'overview' && currentBalance && (
            <>
              {/* Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-effect rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Available Balance</h3>
                    <button
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="p-2 hover:bg-white/10 rounded"
                    >
                      {balanceVisible ? <Eye size={16} className="text-white/60" /> : <EyeOff size={16} className="text-white/60" />}
                    </button>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    {balanceVisible ? formatCurrency(currentBalance.available, selectedCurrency) : '••••••'}
                  </div>
                  <div className="text-sm text-white/60">Ready to use</div>
                </div>

                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Locked Balance</h3>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {balanceVisible ? formatCurrency(currentBalance.locked, selectedCurrency) : '••••••'}
                  </div>
                  <div className="text-sm text-white/60">In pending orders</div>
                </div>

                <div className="glass-effect rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Total Balance</h3>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {balanceVisible ? formatCurrency(currentBalance.total, selectedCurrency) : '••••••'}
                  </div>
                  <div className="text-sm text-white/60">Available + Locked</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-effect rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setShowAddMoney(true)}
                    className="flex flex-col items-center space-y-2 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Plus size={24} className="text-green-400" />
                    <span className="text-sm text-white">Add Money</span>
                  </button>
                  <button
                    onClick={() => setShowSendMoney(true)}
                    className="flex flex-col items-center space-y-2 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ArrowUpRight size={24} className="text-blue-400" />
                    <span className="text-sm text-white">Send Money</span>
                  </button>
                  <button
                    onClick={() => setShowUPIModal(true)}
                    className="flex flex-col items-center space-y-2 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <QrCode size={24} className="text-purple-400" />
                    <span className="text-sm text-white">UPI QR</span>
                  </button>
                  <button
                    onClick={() => setShowRoundUpModal(true)}
                    className="flex flex-col items-center space-y-2 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <TrendingUp size={24} className="text-green-400" />
                    <span className="text-sm text-white">Round-up Fund</span>
                  </button>
                  <button className="flex flex-col items-center space-y-2 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <History size={24} className="text-orange-400" />
                    <span className="text-sm text-white">History</span>
                  </button>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="glass-effect rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Recent Transactions</h3>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-sm text-white/60 hover:text-white"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {filteredTransactions.slice(0, 5).map((transaction) => {
                    const TransactionIcon = getTransactionIcon(transaction.category);
                    const StatusIcon = getStatusIcon(transaction.status);
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/10 rounded-lg">
                            <TransactionIcon size={16} className="text-white/60" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{transaction.description}</div>
                            <div className="text-sm text-white/60">{transaction.reference}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                          </div>
                          <div className="flex items-center space-x-1">
                            <StatusIcon size={12} className={getStatusColor(transaction.status)} />
                            <span className={`text-xs ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="upi">UPI</option>
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="trading">Trading</option>
                  <option value="esop">ESOP</option>
                  <option value="lending">Lending</option>
                  <option value="investment">Investment</option>
                </select>
              </div>

              <div className="glass-effect rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Transaction History</h3>
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => {
                    const TransactionIcon = getTransactionIcon(transaction.category);
                    const StatusIcon = getStatusIcon(transaction.status);
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-white/10 rounded-lg">
                            <TransactionIcon size={20} className="text-white/60" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{transaction.description}</div>
                            <div className="text-sm text-white/60 mb-1">{transaction.reference}</div>
                            <div className="text-xs text-white/40">
                              {new Date(transaction.timestamp).toLocaleString()}
                            </div>
                            {transaction.metadata?.counterparty && (
                              <div className="text-xs text-white/60 mt-1">
                                To/From: {transaction.metadata.counterparty}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-medium ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                          </div>
                          {transaction.fee && (
                            <div className="text-sm text-white/60">
                              Fee: {formatCurrency(transaction.fee, transaction.currency)}
                            </div>
                          )}
                          <div className="flex items-center justify-end space-x-1 mt-1">
                            <StatusIcon size={14} className={getStatusColor(transaction.status)} />
                            <span className={`text-sm ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upi' && (
            <div className="space-y-6">
              <div className="glass-effect rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">UPI ID</h3>
                  <button
                    onClick={() => setShowUPIModal(true)}
                    className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20"
                  >
                    <QrCode size={16} />
                    <span>Show QR</span>
                  </button>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Smartphone size={24} className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">user@arkhamxchange</div>
                    <div className="text-sm text-white/60">Your UPI ID for receiving payments</div>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded">
                    <Copy size={16} className="text-white/60" />
                  </button>
                </div>
              </div>

              <div className="glass-effect rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Frequent Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upiContacts.map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
                      <img
                        src={contact.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'}
                        alt={contact.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">{contact.name}</div>
                        <div className="text-sm text-white/60">{contact.upiId}</div>
                        <div className="text-xs text-white/40">
                          Used {contact.frequency} times
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-white/10 rounded hover:bg-white/20 text-sm">
                        Pay
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="space-y-6">
              <div className="glass-effect rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Linked Bank Accounts</h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                    <Plus size={16} />
                    <span>Add Account</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                          <Building2 size={20} className="text-blue-400" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{account.bankName}</div>
                          <div className="text-sm text-white/60">
                            {account.accountNumber} • {account.accountType}
                          </div>
                          <div className="text-xs text-white/40">IFSC: {account.ifsc}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {account.verified && (
                          <div className="flex items-center space-x-1 text-green-400">
                            <CheckCircle size={16} />
                            <span className="text-sm">Verified</span>
                          </div>
                        )}
                        {account.primary && (
                          <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                            Primary
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <div className="glass-effect rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Payment Cards</h3>
              <div className="text-center py-12">
                <CreditCard size={48} className="mx-auto text-white/40 mb-4" />
                <p className="text-white/60">No payment cards added yet</p>
                <button className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
                  Add Card
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Add Money to Wallet</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Amount</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Payment Method</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                  <option>UPI</option>
                  <option>Net Banking</option>
                  <option>Debit Card</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setShowAddMoney(false)}
                className="px-4 py-2 text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddMoney(false)}
                className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
              >
                Add Money
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Money Modal */}
      {showSendMoney && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Send Money</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">UPI ID or Phone Number</label>
                <input
                  type="text"
                  placeholder="Enter UPI ID or phone number"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Amount</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="Add a note"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setShowSendMoney(false)}
                className="px-4 py-2 text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSendMoney(false)}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
              >
                Send Money
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Modal */}
      {showUPIModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect rounded-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-medium text-white mb-4">UPI QR Code</h3>
            <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
              <QrCode size={120} className="text-black" />
            </div>
            <div className="text-white font-medium mb-2">user@arkhamxchange</div>
            <div className="text-sm text-white/60 mb-4">Scan to pay</div>
            <div className="flex items-center justify-center space-x-4">
              <button className="p-2 hover:bg-white/10 rounded">
                <Copy size={16} className="text-white/60" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded">
                <Share2 size={16} className="text-white/60" />
              </button>
            </div>
            <button
              onClick={() => setShowUPIModal(false)}
              className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Round-up Fund Modal */}
      {showRoundUpModal && roundUpFund && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-effect rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-white">UPI Round-up Investment Fund</h3>
              <button
                onClick={() => setShowRoundUpModal(false)}
                className="p-2 hover:bg-white/10 rounded"
              >
                <XCircle size={20} className="text-white/60" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="glass-effect rounded-lg p-4">
                <h4 className="text-lg font-medium text-white mb-3">How it Works</h4>
                <div className="space-y-2 text-sm text-white/80">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span>Every UPI transaction is rounded up to the nearest ₹10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span>Round-up amount is added to your investment fund</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full" />
                    <span>When fund reaches ₹{roundUpFund.investmentThreshold}, we automatically invest in fractional U.S. shares</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                    <span>Diversified portfolio of top U.S. stocks (AAPL, MSFT, GOOGL, etc.)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-effect rounded-lg p-4">
                  <div className="text-sm text-white/60 mb-2">Investment Threshold</div>
                  <div className="text-xl font-medium text-white mb-2">
                    ₹{roundUpFund.investmentThreshold}
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="500"
                    value={roundUpFund.investmentThreshold}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>₹500</span>
                    <span>₹5000</span>
                  </div>
                </div>
                <div className="glass-effect rounded-lg p-4">
                  <div className="text-sm text-white/60 mb-2">Fund Status</div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${roundUpFund.isEnabled ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-white">{roundUpFund.isEnabled ? 'Active' : 'Inactive'}</span>
                  </div>
                  <button className="w-full py-2 bg-white/10 rounded-lg hover:bg-white/20 text-sm">
                    {roundUpFund.isEnabled ? 'Disable' : 'Enable'} Round-up
                  </button>
                </div>
              </div>

              <div className="glass-effect rounded-lg p-4">
                <h4 className="text-sm font-medium text-white/80 mb-3">Performance Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-medium text-green-400">
                      {formatCurrency(roundUpFund.totalContributions, 'INR')}
                    </div>
                    <div className="text-xs text-white/60">Total Contributions</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium text-blue-400">
                      {formatCurrency(roundUpFund.currentHoldings.reduce((sum, holding) => sum + holding.currentValue, 0), 'INR')}
                    </div>
                    <div className="text-xs text-white/60">Current Value</div>
                  </div>
                  <div>
                    <div className="text-lg font-medium text-purple-400">
                      +{(((roundUpFund.currentHoldings.reduce((sum, holding) => sum + holding.currentValue, 0) / roundUpFund.totalInvested) - 1) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-white/60">Returns</div>
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

export default WalletSystem;