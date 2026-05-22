import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/audio';
import { Coins, Info } from 'lucide-react';
import { translations } from '../utils/translations';

export const Controls: React.FC = () => {
  const { balance, betAmount, setBetAmount, gamePhase, language } = useGameStore();
  const t = translations[language];

  const handleBetChange = (amount: number) => {
    if (gamePhase !== 'showing_ball') return;
    sounds.playSelect();
    setBetAmount(amount);
  };

  const quickBets = [10, 20, 50, 100];
  const disabled = gamePhase !== 'showing_ball';

  return (
    <div className="w-full max-w-4xl mx-auto mt-2 glass-panel rounded-2xl p-4 shadow-lg">
      <div className="flex flex-col gap-3 items-center">
        <label className="text-xs font-bold tracking-wide text-yellow-400/90 flex items-center gap-2 uppercase">
          <Coins className="w-4 h-4 text-yellow-400" />
          {t.selectBetAmount}
        </label>
        
        {/* Bet presets */}
        <div className="flex gap-2 sm:gap-4">
          {quickBets.map((amt) => {
            const isSelected = betAmount === amt;
            const canAfford = balance >= amt;
            return (
              <button
                key={amt}
                disabled={disabled || !canAfford}
                onClick={() => handleBetChange(amt)}
                className={`py-2 px-4 sm:px-6 rounded-xl text-sm sm:text-base font-extrabold border transition-all duration-150 ${
                  isSelected
                    ? 'bg-yellow-500 border-yellow-400 text-table-dark shadow-lg shadow-yellow-500/30 scale-105'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:pointer-events-none'
                }`}
              >
                Br {amt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
