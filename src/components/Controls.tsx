import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/audio';
import { Coins, Info } from 'lucide-react';
import { translations } from '../utils/translations';

export const Controls: React.FC = () => {
  const { balance, betAmount, setBetAmount, gamePhase, language, currentMultiplier, lastWinAmount, cashout } = useGameStore();
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
        {/* Persistent Cashout Button Area */}
        <div className="w-full max-w-sm flex justify-center mb-1">
          <button
            disabled={currentMultiplier === 0 || gamePhase === 'shuffling'}
            onClick={() => { sounds.playWin(); cashout(); }}
            className={`w-full py-3 rounded-2xl font-black tracking-wider shadow-lg flex flex-col items-center border-2 transition-all duration-300 ${
              currentMultiplier > 0 && gamePhase !== 'shuffling'
                ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-emerald-300/50 text-white shadow-emerald-500/50 hover:from-emerald-300 hover:to-emerald-500 active:scale-95'
                : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <span className="text-xs sm:text-sm uppercase opacity-90 leading-tight">Cashout</span>
            <span className="text-lg sm:text-xl leading-tight">
              Br {currentMultiplier > 0 ? lastWinAmount.toFixed(2) : '0.00'}
            </span>
          </button>
        </div>

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
