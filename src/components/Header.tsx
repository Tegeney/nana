import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/audio';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Coins, Languages } from 'lucide-react';
import { translations } from '../utils/translations';

interface HeaderProps {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  showInstructions: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isMuted, setIsMuted, showInstructions }) => {
  const { balance, resetBalance, language, toggleLanguage } = useGameStore();
  const t = translations[language];

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
    sounds.playSelect();
  };

  const handleResetBalance = () => {
    sounds.playSelect();
    if (window.confirm(t.confirmResetBalance)) {
      resetBalance();
    }
  };

  return (
    <header className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 sm:px-6 glass-panel rounded-2xl mb-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-md animate-bounce">
          <span className="text-xl font-bold text-table-dark">🥤</span>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 bg-clip-text text-transparent text-glow-gold">
            GOLDEN SHELLS
          </h1>
          <p className="text-xs text-emerald-400/80 font-medium">
            {language === 'en' ? 'Ethiopian Premier Mini Game' : 'የኢትዮጵያ ቀዳሚ ሚኒ ጌም'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Balance Display */}
        <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-yellow-500/30 shadow-inner group">
          <Coins className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 leading-none">
              {language === 'en' ? 'YOUR BALANCE' : 'ቀሪ ሂሳብዎ'}
            </span>
            <span className="text-lg font-bold text-yellow-400 tracking-wide">
              Br {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={() => {
              sounds.playSelect();
              toggleLanguage();
            }}
            title={language === 'en' ? "አማርኛ" : "English"}
            className="px-2.5 py-2.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 active:scale-95 transition-all text-yellow-400 font-extrabold text-xs flex items-center gap-1.5"
          >
            <span>{language === 'en' ? 'አማ' : 'EN'}</span>
            <span className="text-sm">{language === 'en' ? '🇪🇹' : '🇬🇧'}</span>
          </button>

          {/* Instructions */}
          <button
            onClick={showInstructions}
            title={t.howToPlay}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all text-gray-300 hover:text-white"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleMuteToggle}
            title={isMuted ? "Unmute" : "Mute"}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all text-gray-300 hover:text-white"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Reset Balance */}
          <button
            onClick={handleResetBalance}
            title={t.resetBalance}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-red-950/30 border border-white/10 hover:border-red-900/40 active:scale-95 transition-all text-gray-300 hover:text-red-400"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
