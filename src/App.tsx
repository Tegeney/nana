import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ShellGame } from './components/ShellGame';
import { Controls } from './components/Controls';
import { StatsPanel } from './components/StatsPanel';
import { Navigation, TabType } from './components/Navigation';
import { WalletView } from './components/WalletView';
import { ProfileView } from './components/ProfileView';
import { LeaderboardView } from './components/LeaderboardView';
import { sounds } from './utils/audio';
import { BookOpen, X, AlertTriangle } from 'lucide-react';
import { useGameStore } from './store/useGameStore';
import { translations } from './utils/translations';

export const App: React.FC = () => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('game');
  
  const { language } = useGameStore();
  const t = translations[language];

  useEffect(() => {
    sounds.setMuted(isMuted);
  }, [isMuted]);

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col justify-start items-center px-4 pt-3 sm:pt-6 pb-24 select-none antialiased overflow-x-hidden">
      {/* Dynamic ambient glowing backgrounds */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[45%] aspect-square rounded-full bg-amber-500/5 blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-4xl mx-auto z-10 flex flex-col flex-1">
        <Header 
          isMuted={isMuted} 
          setIsMuted={setIsMuted} 
          showInstructions={() => setShowInstructions(true)} 
        />

        {/* Tab Routing */}
        <div className="flex-1 w-full animate-fade-in mt-2 sm:mt-4">
          {activeTab === 'game' && (
            <div className="flex flex-col gap-3 sm:gap-4 animate-fade-in">
              <ShellGame />
              <Controls />
            </div>
          )}
          
          {activeTab === 'wallet' && (
            <div className="animate-fade-in">
              <WalletView />
            </div>
          )}
          
          {activeTab === 'leaderboard' && (
            <div className="animate-fade-in">
              <LeaderboardView />
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div className="animate-fade-in">
              <ProfileView />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Elegant How-To-Play Instruction Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg glass-panel-heavy rounded-3xl p-6 relative animate-scale-up text-left">
            <button
              onClick={() => {
                sounds.playSelect();
                setShowInstructions(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white text-gray-400 transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-table-dark" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-wide">{t.howToPlayTitle}</h3>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-sm text-gray-300">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-xs font-bold text-yellow-400 shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase mb-0.5">{t.observeTitle}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{t.observeDesc}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-xs font-bold text-yellow-400 shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase mb-0.5">{t.betShuffleTitle}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{t.betShuffleDesc}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-xs font-bold text-yellow-400 shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase mb-0.5">{t.guessTitle}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{t.guessDesc}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-200/80 leading-relaxed">
                {t.playResponsibly}
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playSelect();
                setShowInstructions(false);
              }}
              className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-table-dark font-extrabold text-sm tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 text-center"
            >
              {t.understoodLetPlay}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
