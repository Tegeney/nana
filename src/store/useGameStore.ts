import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Game States:
 * - showing_ball: Ball is visible under one cup. User can see it and place a bet.
 * - shuffling: Cups are swapping positions. All clicks disabled.
 * - guessing: Shuffle done. User taps a cup to guess where ball went.
 * - revealing: Result is shown for 2 seconds before auto-reset.
 */
export type GamePhase = 'showing_ball' | 'shuffling' | 'guessing' | 'revealing' | 'continue_prompt';
export type GameResult = 'win' | 'loss' | null;

interface GameState {
  // Core persisted state
  balance: number;

  // Session state (not persisted)
  betAmount: number;
  lastResult: GameResult;
  lastWinAmount: number;
  currentMultiplier: number;
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
  cashout: () => void;
  resetBalance: () => void;
  resetStats: () => void;
  // Language
  language: 'en' | 'am';
  toggleLanguage: () => void;
}

import { supabase, isSupabaseConfigured } from '../lib/supabase';

const INITIAL_BALANCE = 100;

const syncLeaderboard = async (balance: number, gamesPlayed: number, wins: number) => {
  if (!isSupabaseConfigured) return;

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
      currentMultiplier: 0,

      language: 'en',
      toggleLanguage: () => set((s) => ({ language: s.language === 'en' ? 'am' : 'en' })),

      setBetAmount: (amount) => set({ betAmount: amount }),

      deductBet: () =>
        set((s) => ({ balance: Math.max(0, s.balance - s.betAmount), currentMultiplier: 0 })),

      addWinnings: (amount) =>
        set((s) => ({ balance: s.balance + amount })),

      setGamePhase: (phase) => set({ gamePhase: phase }),

      setLastResult: (result, winAmount = 0) =>
        set({ lastResult: result, lastWinAmount: winAmount }),

      recordWin: (winAmount) =>
        set((s) => {
          // Increase multiplier: 1.9x, 3.5x, 6.0x, 10.0x, etc.
          const nextMultiplier = s.currentMultiplier === 0 ? 1.9 : s.currentMultiplier * 1.8;
          
          const nextState = {
            // DO NOT add to balance yet! They must cashout.
            lastResult: 'win' as const,
            lastWinAmount: s.betAmount * nextMultiplier,
            currentMultiplier: nextMultiplier,
            gamePhase: 'revealing' as const,
          };
          return nextState;
        }),

      recordLoss: () =>
        set((s) => {
          const nextState = {
            lastResult: 'loss' as const,
            lastWinAmount: 0,
            currentMultiplier: 0,
            totalGames: s.totalGames + 1,
            losses: s.losses + 1,
            gamePhase: 'revealing' as const,
          };
          syncLeaderboard(s.balance, nextState.totalGames, s.wins);
          return nextState;
        }),

      cashout: () =>
        set((s) => {
          if (s.currentMultiplier === 0) return {};
          const winAmount = s.betAmount * s.currentMultiplier;
          const nextState = {
            balance: s.balance + winAmount,
            currentMultiplier: 0,
            lastWinAmount: winAmount,
            totalGames: s.totalGames + 1,
            wins: s.wins + 1,
            gamePhase: 'showing_ball' as const,
            lastResult: 'win' as const,
          };
          syncLeaderboard(nextState.balance, nextState.totalGames, nextState.wins);
          return nextState;
        }),

      resetBalance: () =>
        set({
          balance: INITIAL_BALANCE,
          lastResult: null,
          lastWinAmount: 0,
          currentMultiplier: 0,
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
