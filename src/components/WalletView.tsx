import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine, History } from 'lucide-react';
import { translations } from '../utils/translations';

export const WalletView: React.FC = () => {
  const { balance, language } = useGameStore();
  const t = translations[language];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 mt-4">
      {/* Balance Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-emerald-900/40 to-emerald-950/80 border border-emerald-500/20">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
        
        <h2 className="text-sm font-bold text-emerald-400 tracking-wider flex items-center gap-2 mb-2">
          <WalletIcon className="w-5 h-5" /> {t.totalBalance}
        </h2>
        
        <div className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-center gap-2">
          <span className="text-emerald-500">Br</span>
          {balance.toFixed(2)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-gray-300">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
            <ArrowDownToLine className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="font-bold">{t.deposit}</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-gray-300">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
            <ArrowUpFromLine className="w-6 h-6 text-blue-400" />
          </div>
          <span className="font-bold">{t.withdraw}</span>
        </button>
      </div>

      {/* Transaction History Placeholder */}
      <div className="glass-panel rounded-3xl p-6 border border-white/5 flex-1">
        <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2 mb-4 uppercase tracking-wider">
          <History className="w-4 h-4" /> {t.recentTransactions}
        </h3>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/20">
            <div>
              <p className="text-sm font-bold text-white">{t.gameWinnings}</p>
              <p className="text-xs text-gray-500">Today, 14:30</p>
            </div>
            <span className="text-emerald-400 font-bold">+Br 19.00</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/20">
            <div>
              <p className="text-sm font-bold text-white">{t.gameBet}</p>
              <p className="text-xs text-gray-500">Today, 14:29</p>
            </div>
            <span className="text-red-400 font-bold">-Br 10.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};
