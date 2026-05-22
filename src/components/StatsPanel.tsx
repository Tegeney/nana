import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Trophy, HelpCircle, Shield, Award, Hash, TrendingUp } from 'lucide-react';
import { sounds } from '../utils/audio';
import { translations } from '../utils/translations';

export const StatsPanel: React.FC = () => {
  const { totalGames, wins, losses, resetStats, balance, language } = useGameStore();
  const t = translations[language];

  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';
  
  // Balance minus original initial balance (Br 100)
  const netProfit = balance - 100;
  const isProfit = netProfit >= 0;

  const handleResetStats = () => {
    sounds.playSelect();
    if (window.confirm(t.confirmResetStats)) {
      resetStats();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 glass-panel rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2 text-yellow-400">
          <Award className="w-5 h-5 text-yellow-400" />
          {t.performanceStats.toUpperCase()}
        </h2>
        {totalGames > 0 && (
          <button
            onClick={handleResetStats}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-red-950/20 hover:text-red-400 border border-white/10 hover:border-red-900/30 transition-all active:scale-95"
          >
            {t.clearStats}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Games */}
        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider flex items-center gap-1 mb-1">
            <Hash className="w-3.5 h-3.5" /> {t.gamesPlayed}
          </span>
          <span className="text-2xl font-bold text-white leading-none">{totalGames}</span>
        </div>

        {/* Wins */}
        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-semibold text-emerald-400/90 tracking-wider flex items-center gap-1 mb-1">
            <Trophy className="w-3.5 h-3.5" /> {t.gamesWon}
          </span>
          <span className="text-2xl font-bold text-emerald-400 leading-none">{wins}</span>
        </div>

        {/* Losses */}
        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-semibold text-rose-400/90 tracking-wider flex items-center gap-1 mb-1">
            <Shield className="w-3.5 h-3.5" /> {t.gamesLost}
          </span>
          <span className="text-2xl font-bold text-rose-400 leading-none">{losses}</span>
        </div>

        {/* Win Rate */}
        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-semibold text-amber-400/90 tracking-wider flex items-center gap-1 mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> {t.profileWinRate}
          </span>
          <span className="text-2xl font-bold text-amber-400 leading-none">{winRate}%</span>
        </div>

        {/* Net Profit */}
        <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
          <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-1">
            {t.netProfit}
          </span>
          <span className={`text-2xl font-extrabold leading-none ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isProfit ? '+' : ''}Br {netProfit.toFixed(2)}
          </span>
        </div>
      </div>

      {/* House Edge and Rules Banner */}
      <div className="mt-4 bg-yellow-500/5 border border-yellow-500/10 p-3.5 rounded-xl flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
        <div className="text-xs text-yellow-200/80 leading-relaxed">
          <span className="font-bold text-yellow-400">{t.houseEdgeTitle}:</span> {t.houseEdgeDesc}
        </div>
      </div>
    </div>
  );
};
