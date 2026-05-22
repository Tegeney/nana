import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Game States:
 * - showing_ball: Ball is visible under one cup. User can see it and place a bet.
 * - shuffling: Cups are swapping positions. All clicks disabled.
 * - guessing: Shuffle done. User taps a cup to guess where ball went.
 * - revealing: Result is shown for 2 seconds before auto-reset.
 */
export type GamePhase = 'showing_ball' | 'shuffling' | 'guessing' | 'revealing';
export type GameResult = 'win' | 'loss' | null;

interface GameState {
  // Core persisted state
  balance: number;

  // Session state (not persisted)
  betAmount: number;
  lastResult: GameResult;
  lastWinAmount: number;
  gamePhase: GamePhase;

  // Stats
  totalGames: number;
  wins: number;
  losses: number;

  // Actions
  setBetAmount: (amount: number) => void;
  deductBet: () => void;
  addWinnings: (amount: number) => void;
  setGamePhase: (phase: GamePhase) => void;
  setLastResult: (result: GameResult, winAmount?: number) => void;
  recordWin: (winAmount: number) => void;
  recordLoss: () => void;
  resetBalance: () => void;
  resetStats: () => void;
  // Language
  language: 'en' | 'am';
  toggleLanguage: () => void;
}

import { supabase } from '../lib/supabase';

const INITIAL_BALANCE = 100;

const syncLeaderboard = async (balance: number, gamesPlayed: number, wins: number) => {
  try {
    const username = localStorage.getItem('tg_username') || 'Player_' + Math.floor(Math.random() * 9000 + 1000);
    localStorage.setItem('tg_username', username);

    const { error } = await supabase
      .from('leaderboards')
      .upsert({
        username,
        balance,
        games_played: gamesPlayed,
        wins,
        updated_at: new Date().toISOString()
      }, { onConflict: 'username' });

    if (error) {
      console.error("Supabase upsert error:", error.message);
    }
  } catch (err) {
    console.error("Failed to sync leaderboard:", err);
  }
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      balance: INITIAL_BALANCE,
      betAmount: 10,
      lastResult: null,
      lastWinAmount: 0,
      gamePhase: 'showing_ball',
      totalGames: 0,
      wins: 0,
      losses: 0,

      language: 'en',
      toggleLanguage: () => set((s) => ({ language: s.language === 'en' ? 'am' : 'en' })),

      setBetAmount: (amount) => set({ betAmount: amount }),

      deductBet: () =>
        set((s) => ({ balance: Math.max(0, s.balance - s.betAmount) })),

      addWinnings: (amount) =>
        set((s) => ({ balance: s.balance + amount })),

      setGamePhase: (phase) => set({ gamePhase: phase }),

      setLastResult: (result, winAmount = 0) =>
        set({ lastResult: result, lastWinAmount: winAmount }),

      recordWin: (winAmount) =>
        set((s) => {
          const nextState = {
            balance: s.balance + winAmount,
            lastResult: 'win' as const,
            lastWinAmount: winAmount,
            totalGames: s.totalGames + 1,
            wins: s.wins + 1,
            gamePhase: 'revealing' as const,
          };
          syncLeaderboard(nextState.balance, nextState.totalGames, nextState.wins);
          return nextState;
        }),

      recordLoss: () =>
        set((s) => {
          const nextState = {
            lastResult: 'loss' as const,
            lastWinAmount: 0,
            totalGames: s.totalGames + 1,
            losses: s.losses + 1,
            gamePhase: 'revealing' as const,
          };
          syncLeaderboard(s.balance, nextState.totalGames, s.wins);
          return nextState;
        }),

      resetBalance: () =>
        set({
          balance: INITIAL_BALANCE,
          lastResult: null,
          lastWinAmount: 0,
          gamePhase: 'showing_ball',
        }),

      resetStats: () => set({ totalGames: 0, wins: 0, losses: 0 }),
    }),
    {
      name: 'golden-shell-game',
      // Persist balance and language selection
      partialize: (state) => ({ balance: state.balance, language: state.language }),
    }
  )
);
