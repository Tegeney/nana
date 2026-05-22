import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { User, LogOut, Share2, Copy, Check } from 'lucide-react';
import { translations } from '../utils/translations';

export const ProfileView: React.FC = () => {
  const { totalGames, wins, losses, language } = useGameStore();
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';
  
  const username = localStorage.getItem('tg_username') || 'Player_' + Math.floor(Math.random() * 9000 + 1000);
  const inviteLink = `https://t.me/fanos_bingobot?start=ref_${username}`;
  
  const shareText = encodeURIComponent(`🎮 Play Golden Shells, guess the ball under the cup and win Birr instantly! 💰✨ Join now:`);
  const telegramShareLink = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${shareText}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 mt-4">
      {/* User Header */}
      <div className="glass-panel rounded-3xl p-6 flex items-center gap-4 border border-white/5 bg-gradient-to-r from-amber-900/30 to-black/40">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 p-1 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-table-dark flex items-center justify-center border-2 border-transparent">
            <User className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">{username}</h2>
          <p className="text-sm text-yellow-500/80 font-medium">{t.vipLevel}</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center border border-white/5">
          <span className="text-xs text-gray-400 font-bold mb-1">{t.profileGames}</span>
          <span className="text-xl font-black text-white">{totalGames}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center border border-white/5">
          <span className="text-xs text-gray-400 font-bold mb-1">{t.profileWins}</span>
          <span className="text-xl font-black text-emerald-400">{wins}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center border border-white/5">
          <span className="text-xs text-gray-400 font-bold mb-1">{t.profileWinRate}</span>
          <span className="text-xl font-black text-amber-400">{winRate}%</span>
        </div>
      </div>

      {/* Invite Section */}
      <div className="glass-panel rounded-3xl p-5 relative overflow-hidden bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400 flex-shrink-0">
              <Share2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{t.inviteEarn}</h3>
              <p className="text-xs text-gray-400">{t.inviteSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t.copied : t.copyLink}
            </button>
            <a
              href={telegramShareLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-table-dark text-xs font-extrabold transition-all text-center flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-yellow-500/10"
            >
              <Share2 className="w-3.5 h-3.5" />
              {t.inviteFriends}
            </a>
          </div>
        </div>
      </div>

      {/* Standalone Log Out Button */}
      <button className="glass-panel w-full p-4 rounded-2xl hover:bg-red-500/10 transition-colors text-left flex items-center gap-4 border border-white/5 group">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
          <LogOut className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-red-400 text-sm">{t.logOut}</h4>
          <p className="text-xs text-gray-500">{t.signOutSubtitle}</p>
        </div>
      </button>
    </div>
  );
};
