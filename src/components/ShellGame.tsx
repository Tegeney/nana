import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/audio';
import canvasConfetti from 'canvas-confetti';
import { Sparkles, Trophy, Frown, AlertCircle, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations } from '../utils/translations';

export const ShellGame: React.FC = () => {
  const {
    balance,
    betAmount,
    setBetAmount,
    gamePhase,
    setGamePhase,
    deductBet,
    recordWin,
    recordLoss,
    lastResult,
    lastWinAmount,
    language
  } = useGameStore();

  const t = translations[language];

  // cupPositions array dictates the order they are rendered in the flex container
  const [cupPositions, setCupPositions] = useState([0, 1, 2]);
  const [ballCupId, setBallCupId] = useState<number>(1); 
  const [selectedCupId, setSelectedCupId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (gamePhase === 'showing_ball') {
      const randomCup = Math.floor(Math.random() * 3);
      setBallCupId(randomCup);
      setCupPositions([0, 1, 2]);
      setSelectedCupId(null);
    }
  }, [gamePhase]);

  const triggerConfetti = useCallback(() => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      canvasConfetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      canvasConfetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  }, []);

  const handleShuffleStart = () => {
    if (balance < betAmount) {
      setErrorMessage(language === 'en' ? "Insufficient balance! Reduce your bet." : "ለማወራረድ በቂ ሂሳብ የለም! ውርርድዎን ይቀንሱ።");
      sounds.playError();
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setErrorMessage(null);
    deductBet();
    setGamePhase('shuffling');
    sounds.playSelect();

    let swaps = 0;
    const maxSwaps = 8; // More swaps for a better effect
    const swapInterval = 250; 

    const shuffleInterval = setInterval(() => {
      sounds.playShuffleTick();
      setCupPositions(prev => {
        const next = [...prev];
        const idx1 = Math.floor(Math.random() * 3);
        let idx2 = Math.floor(Math.random() * 3);
        while (idx1 === idx2) {
          idx2 = Math.floor(Math.random() * 3);
        }
        const temp = next[idx1];
        next[idx1] = next[idx2];
        next[idx2] = temp;
        return next;
      });

      swaps++;
      if (swaps >= maxSwaps) {
        clearInterval(shuffleInterval);
        setTimeout(() => {
          setGamePhase('guessing');
        }, swapInterval + 100);
      }
    }, swapInterval);
  };

  const handleCupClick = (cupId: number) => {
    if (gamePhase !== 'guessing') return;

    sounds.playSelect();
    setSelectedCupId(cupId);
    
    const isWin = cupId === ballCupId;

    if (isWin) {
      const winAmount = betAmount + (betAmount * 0.9); 
      recordWin(winAmount);
      sounds.playWin();
      triggerConfetti();
    } else {
      recordLoss();
      sounds.playLoss();
    }

    setTimeout(() => {
      setGamePhase('showing_ball');
    }, 3500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden casino-felt">
      <div className="absolute inset-0 radial-vignette rounded-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center mb-2">
        <span className="text-[9px] tracking-[0.2em] font-extrabold text-yellow-500 bg-yellow-500/10 px-2.5 py-0.5 rounded-full border border-yellow-500/20 mb-1">
          {t.casinoFelt}
        </span>
        <h2 className="text-base text-yellow-300 font-bold text-center h-6">
          {gamePhase === 'showing_ball' && t.ballHere}
          {gamePhase === 'shuffling' && t.shuffling}
          {gamePhase === 'guessing' && t.whereIsBall}
          {gamePhase === 'revealing' && (lastResult === 'win' ? t.foundIt : t.wrongCup)}
        </h2>
      </div>

      {errorMessage && (
        <div className="relative z-10 flex items-center justify-center gap-2 text-rose-300 text-xs font-semibold bg-rose-950/40 border border-rose-500/20 rounded-xl p-2 mb-3 max-w-md mx-auto animate-pulse">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Play Area using Flexbox and Framer Motion for automatic layout animations */}
      <div className="relative z-10 h-[210px] sm:h-[260px] flex justify-center items-end pb-3 gap-4 sm:gap-12">
        
        {cupPositions.map((cupId, index) => {
          const isBallCup = cupId === ballCupId;
          
          let liftClass = "";
          let opacityClass = "opacity-100";
          let cursorClass = "cursor-default";

          if (gamePhase === 'showing_ball') {
            liftClass = isBallCup ? "-translate-y-16 sm:-translate-y-20" : "translate-y-0";
          } else if (gamePhase === 'shuffling') {
            liftClass = "translate-y-0";
          } else if (gamePhase === 'guessing') {
            cursorClass = "cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/20 active:scale-95";
          } else if (gamePhase === 'revealing') {
            liftClass = "-translate-y-16 sm:-translate-y-20";
            if (!isBallCup) opacityClass = "opacity-50"; 
          }

          // Randomize zIndex during shuffle so they cross over each other naturally
          const zIndex = gamePhase === 'shuffling' ? 10 + index : (isBallCup ? 20 : 10);

          return (
            <motion.div 
              layout
              key={cupId}
              initial={false}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 20,
                mass: 1
              }}
              className={`relative w-22 sm:w-32 flex flex-col items-center ${cursorClass} ${opacityClass}`}
              style={{ zIndex }}
              onClick={() => gamePhase === 'guessing' && handleCupClick(cupId)}
            >
              {/* The Gold Ball */}
              {isBallCup && (
                <div 
                  className={`absolute bottom-3 w-11 h-11 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 flex items-center justify-center shadow-lg transition-opacity duration-300 z-0 ${
                    gamePhase === 'showing_ball' || gamePhase === 'revealing' ? 'opacity-100 glow-gold' : 'opacity-0'
                  }`}
                >
                  <div className="w-9 h-9 sm:w-13 sm:h-13 rounded-full bg-radial-gradient(circle, transparent 20%, rgba(255,255,255,0.4) 100%) absolute inset-0 opacity-70"></div>
                  <div className="text-xl drop-shadow-md">⚪</div>
                </div>
              )}

              {/* The Realistic 3D Cup Graphic */}
              <div
                className={`w-full aspect-[4/5] flex justify-center items-end transition-transform duration-300 z-10 relative ${liftClass}`}
              >
                <svg viewBox="0 0 100 120" className="w-[120%] h-auto max-h-full drop-shadow-2xl">
                  <defs>
                    <linearGradient id="cupGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4a2511" />
                      <stop offset="15%" stopColor="#8b4513" />
                      <stop offset="50%" stopColor="#d2691e" />
                      <stop offset="85%" stopColor="#8b4513" />
                      <stop offset="100%" stopColor="#301508" />
                    </linearGradient>
                    <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2a1205" />
                      <stop offset="20%" stopColor="#8b4513" />
                      <stop offset="50%" stopColor="#e8924f" />
                      <stop offset="80%" stopColor="#8b4513" />
                      <stop offset="100%" stopColor="#2a1205" />
                    </linearGradient>
                    <radialGradient id="highlight" cx="35%" cy="30%" r="60%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                    <filter id="shadow">
                      <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.6" />
                    </filter>
                  </defs>
                  
                  <g filter="url(#shadow)">
                    <path d="M 30 15 C 30 8, 70 8, 70 15 L 85 105 C 85 115, 15 115, 15 105 Z" fill="url(#cupGrad)" />
                    <ellipse cx="50" cy="14" rx="20" ry="6" fill="#7a3d10" />
                    <ellipse cx="50" cy="14" rx="20" ry="6" fill="rgba(0,0,0,0.15)" />
                    <path d="M 30 15 C 30 8, 70 8, 70 15 L 85 105 C 85 115, 15 115, 15 105 Z" fill="url(#highlight)" />
                    <path d="M 14 105 C 14 115, 86 115, 86 105 L 90 108 C 90 120, 10 120, 10 108 Z" fill="url(#rimGrad)" />
                    <ellipse cx="50" cy="107" rx="36" ry="7" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                  </g>
                </svg>
              </div>

              {/* Guess Indicator */}
              {gamePhase === 'revealing' && selectedCupId === cupId && (
                <div className={`absolute -bottom-7 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isBallCup ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {isBallCup ? t.correct : t.empty}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {gamePhase === 'showing_ball' && (
        <div className="relative z-10 flex justify-center mt-3">
          <button
            onClick={handleShuffleStart}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-table-dark font-extrabold tracking-wider shadow-[0_0_20px_rgba(255,215,0,0.4)] active:scale-95 transition-all text-base"
          >
            {t.shuffleAndBet} {betAmount}
          </button>
        </div>
      )}

      <div className={`relative z-10 transition-all duration-500 flex justify-center ${
        gamePhase === 'revealing' ? 'opacity-100 mt-2' : 'opacity-0 pointer-events-none h-0'
      }`}>
        <div className="max-w-md mx-auto bg-black/60 border border-white/10 rounded-2xl p-3 flex flex-col items-center text-center shadow-inner">
          {lastResult === 'win' ? (
            <div className="text-emerald-400 font-bold text-base flex items-center gap-2">
              <Trophy className="w-4.5 h-4.5" /> +Br {lastWinAmount.toFixed(2)}
            </div>
          ) : (
            <div className="text-rose-400 font-bold text-base flex items-center gap-2">
              <Frown className="w-4.5 h-4.5" /> -Br {betAmount.toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
