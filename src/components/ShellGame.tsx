import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/audio';
import canvasConfetti from 'canvas-confetti';
import { Trophy, Frown, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations } from '../utils/translations';

export const ShellGame: React.FC = () => {
  const {
    balance,
    betAmount,
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

  // cupPositions array dictates the order: [leftCupId, centerCupId, rightCupId]
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
    const isMobile = window.innerWidth < 768;
    if (isMobile) return; // Disable on mobile entirely for performance

    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 15; // Reduced from 50
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
    const maxSwaps = 8;
    const swapInterval = 400; // Increased from 250 for smoother animation spacing

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
    <div className="w-full max-w-4xl mx-auto bg-[#1b1510] border-2 border-yellow-900/40 rounded-3xl p-4 sm:p-5 relative overflow-hidden">
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
        <div className="relative z-10 flex items-center justify-center gap-2 text-rose-300 text-xs font-semibold bg-rose-950/40 border border-rose-500/20 rounded-xl p-2 mb-3 max-w-md mx-auto">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Play Area using manual CSS transforms instead of layout */}
      <div className="relative z-10 h-[210px] sm:h-[260px] flex justify-center items-end pb-3 w-full max-w-sm mx-auto">
        {[0, 1, 2].map((cupId) => {
          const isBallCup = cupId === ballCupId;
          const index = cupPositions.indexOf(cupId);
          
          let yOffset = 0;
          let opacity = 1;
          let cursorClass = "cursor-default";

          if (gamePhase === 'showing_ball') {
            yOffset = isBallCup ? -60 : 0;
          } else if (gamePhase === 'guessing') {
            cursorClass = "cursor-pointer md:hover:-translate-y-2 md:hover:shadow-2xl active:scale-95";
          } else if (gamePhase === 'revealing') {
            yOffset = -60;
            if (!isBallCup) opacity = 0.5; 
          }

          // Randomize zIndex during shuffle so they cross over each other naturally
          const zIndex = gamePhase === 'shuffling' ? 10 + index : (isBallCup ? 20 : 10);
          
          // Calculate manual X offset instead of flex layout
          const isMobile = window.innerWidth < 640;
          const gap = isMobile ? 95 : 130;
          const xOffset = (index - 1) * gap;

          return (
            <motion.div 
              key={cupId}
              initial={false}
              animate={{ x: xOffset, y: yOffset, opacity }}
              transition={{
                duration: 0.18,
                ease: "easeInOut"
              }}
              className={`absolute bottom-3 w-[85px] sm:w-[120px] flex flex-col items-center ${cursorClass}`}
              style={{ zIndex }}
              onClick={() => gamePhase === 'guessing' && handleCupClick(cupId)}
            >
              {/* The Gold Ball */}
              {isBallCup && (
                <div 
                  className={`absolute bottom-2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#fcd34d] flex items-center justify-center transition-opacity duration-300 z-0 ${
                    gamePhase === 'showing_ball' || gamePhase === 'revealing' ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="text-xl drop-shadow-sm">⚪</div>
                </div>
              )}

              {/* Simplified Flat SVG Cup for Mobile Performance */}
              <div className="w-full aspect-[4/5] flex justify-center items-end transition-transform duration-300 z-10 relative">
                <svg viewBox="0 0 100 120" className="w-[110%] h-auto max-h-full">
                  <path d="M 30 15 C 30 8, 70 8, 70 15 L 85 105 C 85 115, 15 115, 15 105 Z" fill="#8b4513" />
                  <ellipse cx="50" cy="14" rx="20" ry="6" fill="#5c2d0c" />
                  <ellipse cx="50" cy="107" rx="36" ry="7" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                </svg>
              </div>

              {/* Guess Indicator */}
              {gamePhase === 'revealing' && selectedCupId === cupId && (
                <div className={`absolute -bottom-6 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isBallCup ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
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
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 active:scale-95 transition-transform text-table-dark font-extrabold tracking-wider text-base"
          >
            {t.shuffleAndBet} {betAmount}
          </button>
        </div>
      )}

      <div className={`relative z-10 transition-opacity duration-300 flex justify-center ${
        gamePhase === 'revealing' ? 'opacity-100 mt-2' : 'opacity-0 pointer-events-none h-0'
      }`}>
        <div className="max-w-md mx-auto bg-black/40 rounded-xl p-3 flex flex-col items-center text-center">
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
