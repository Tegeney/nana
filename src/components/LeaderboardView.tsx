import React, { useState, useEffect } from 'react';
import { Trophy, Medal, AlertCircle } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { translations } from '../utils/translations';

interface LeaderboardEntry {
  username: string;
  balance: string | number;
  games_played: number;
  wins: number;
}

import { supabase } from '../lib/supabase';

export const LeaderboardView: React.FC = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { language } = useGameStore();
  const t = translations[language];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('leaderboards')
          .select('username, balance, games_played, wins')
          .order('balance', { ascending: false })
          .limit(20);

        if (error) throw error;
        setLeaders(data || []);
      } catch (err: any) {
        setError(err.message || "Could not connect to leaderboard server.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 mt-4 pb-8">
      {/* Header Card */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-yellow-900/40 to-amber-950/80 border border-yellow-500/20">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl"></div>
        <h2 className="text-sm font-bold text-yellow-400 tracking-wider flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5" /> {t.globalLeaders}
        </h2>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t.leaderboardSubtitle}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          </div>
        ) : error ? (
          <div className="p-6 flex items-center justify-center gap-2 text-rose-400 font-semibold bg-rose-500/5">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        ) : leaders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-medium">
            {t.emptyLeaderboard}
          </div>
        ) : (
          leaders.map((player, index) => {
            const isTop3 = index < 3;
            return (
              <div 
                key={index} 
                className={`flex items-center gap-4 p-4 transition-colors border-b border-white/5 ${
                  isTop3 ? 'bg-yellow-500/5' : 'hover:bg-white/5'
                }`}
              >
                <div className={`w-8 font-black text-center ${
                  index === 0 ? 'text-yellow-400 text-2xl' : 
                  index === 1 ? 'text-gray-300 text-xl' : 
                  index === 2 ? 'text-amber-600 text-lg' : 'text-gray-500'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                
                <div className="flex-1 flex flex-col">
                  <h4 className={`font-bold ${isTop3 ? 'text-yellow-100' : 'text-gray-200'}`}>
                    {player.username}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    {player.games_played} {t.games} • {player.wins} {t.wins}
                  </p>
                </div>
                
                <div className="text-right">
                  <span className={`font-black tracking-wide ${isTop3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    Br {Number(player.balance).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
