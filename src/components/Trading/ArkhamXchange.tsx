import React, { useState } from 'react';
import { Building2, Users, BookOpen, Shield, BarChart3, GraduationCap, Lock, DollarSign, Globe, Brain, Settings, Bell, Search, ChevronRight, Gift } from 'lucide-react';
import GameProgress from './GameProgress';
import VirtualPortfolio from './VirtualPortfolio';
import SocialGraph from './SocialGraph';
import NewsCenter from './NewsCenter';
import StoreExchange from './Store/Exchange';

const ComingSoon: React.FC<{ name?: string }> = ({ name }) => (
  <div className="w-full h-full p-10 flex items-center justify-center">
    <div className="text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
        <Lock size={28} className="text-white/60" />
      </div>
      <h3 className="text-2xl font-medium text-white mb-2">{name || 'This feature'} is coming soon</h3>
      <p className="text-white/60">We are working hard to bring this to you. Stay tuned!</p>
    </div>
  </div>
);

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType;
  description: string;
  locked?: boolean;
}

const ArkhamXchange: React.FC = () => {
  const [activeSection, setActiveSection] = useState('virtual-trading');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      id: 'real-trading',
      name: 'Real Trading',
      icon: DollarSign,
      component: ComingSoon,
      description: 'Coming soon: Live trading (requires licenses & compliance)',
      locked: true,
    },
    {
      id: 'career-progress',
      name: 'Career Progress',
      icon: GraduationCap,
      component: GameProgress,
      description: 'Track your professional development and achievements'
    },
    {
      id: 'virtual-trading',
      name: 'Trading Sandbox',
      icon: BarChart3,
      component: VirtualPortfolio,
      description: 'Practice trading with virtual portfolios and real market data'
    },
    {
      id: 'store',
      name: 'Store',
      icon: Gift,
      component: StoreExchange,
      description: 'Exchange PT for GC packs secured by PlayFab'
    },
    {
      id: 'ai-quant',
      name: 'AI Quant Engine',
      icon: Brain,
      component: ComingSoon,
      description: 'Coming soon: Advanced quantitative analysis and AI-powered strategies',
      locked: true,
    },
    {
      id: 'social-network',
      name: 'Professional Network',
      icon: Users,
      component: SocialGraph,
      description: 'Connect with finance professionals and share insights'
    },
    {
      id: 'market-intelligence',
      name: 'Market Intelligence',
      icon: Globe,
      component: NewsCenter,
      description: 'Real-time market news and AI-powered analysis'
    },
    {
      id: 'research-center',
      name: 'Research Center',
      icon: BookOpen,
      component: ComingSoon,
      description: 'Coming soon: Create and publish professional research reports',
      locked: true,
    },
    {
      id: 'compliance-center',
      name: 'Compliance Center',
      icon: Shield,
      component: ComingSoon,
      description: 'Coming soon: Regulatory compliance and risk management tools',
      locked: true,
    },
    {
      id: 'esop-exchange',
      name: 'ESOP Exchange',
      icon: Building2,
      component: ComingSoon,
      description: 'Coming soon: Employee stock options secondary market',
      locked: true,
    },
    {
      id: 'wallet-system',
      name: 'Digital Wallet',
      icon: DollarSign,
      component: ComingSoon,
      description: 'Coming soon: UPI, bank transfers, and wallet management',
      locked: true,
    },
    {
      id: 'nbfc-lending',
      name: 'NBFC Lending',
      icon: Building2,
      component: ComingSoon,
      description: 'Coming soon: Lending-as-a-Service with NBFC partnerships',
      locked: true,
    }
  ];

  const activeItem = navigationItems.find(item => item.id === activeSection);
  const ActiveComponent = activeItem?.component || ComingSoon;

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 bg-black/95 border-r border-white/10 flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-2xl font-mono font-bold protocol-text">ARKHAM XCHANGE</h1>
                <p className="text-sm text-white/60 mt-1">Professional Finance Platform</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Settings size={20} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <div key={item.id} className="relative group">
              {item.locked && (
                <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full bg-black/90 border border-white/10 text-white/80 text-xs px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100">
                  Coming soon
                </div>
              )}
              <button
                onClick={() => { if (!item.locked) setActiveSection(item.id); }}
                disabled={!!item.locked}
                aria-disabled={item.locked ? 'true' : 'false'}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  item.locked
                    ? 'opacity-50 cursor-not-allowed text-white/50'
                    : activeSection === item.id
                      ? 'bg-white/20 border border-white/30 text-white'
                      : 'hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {!sidebarCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-white/50">{item.description}</div>
                  </div>
                )}
                {!sidebarCollapsed && (
                  item.locked ? (
                    <Lock size={14} className="text-white/40" />
                  ) : (
                    activeSection === item.id ? <ChevronRight size={16} className="text-white/60" /> : null
                  )
                )}
              </button>
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <Users size={20} className="text-white/60" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Professional</div>
                <div className="text-xs text-white/60">Level 1 • Bronze Tier</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-black/90 border-b border-white/10 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-medium text-white">{activeItem?.name}</h2>
            <div className="text-sm text-white/60">{activeItem?.description}</div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Search size={20} className="text-white/60" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors relative">
              <Bell size={20} className="text-white/60" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <Users size={16} className="text-white/60" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default ArkhamXchange;