import { Gamepad2, Wallet, User, Trophy } from 'lucide-react';
import { sounds } from '../utils/audio';
import { useGameStore } from '../store/useGameStore';
import { translations } from '../utils/translations';

export type TabType = 'game' | 'wallet' | 'profile' | 'leaderboard';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { language } = useGameStore();
  const t = translations[language];

  const tabs = [
    { id: 'game', icon: Gamepad2, label: t.navPlay },
    { id: 'wallet', icon: Wallet, label: t.navWallet },
    { id: 'leaderboard', icon: Trophy, label: t.navLeaders },
    { id: 'profile', icon: User, label: t.navProfile }
  ];

  const handleTabClick = (tabId: TabType) => {
    if (activeTab !== tabId) {
      sounds.playSelect();
      setActiveTab(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full glass-panel-heavy border-t border-white/10 z-50 px-4 py-2 pb-6 sm:pb-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto flex justify-between items-center relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as TabType)}
              className="flex flex-col items-center justify-center w-20 pt-2 pb-1 relative group"
            >
              {/* Active Highlight Glow */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-yellow-400 rounded-b-full shadow-[0_2px_10px_rgba(255,215,0,0.8)]"></div>
              )}
              
              <div className={`p-2 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-yellow-500/20 text-yellow-400 scale-110 -translate-y-1' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}>
                <Icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
              </div>
              
              <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${
                isActive ? 'text-yellow-400 opacity-100' : 'text-gray-500 opacity-70'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
