import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { sounds } from '../utils/audio';
import canvasConfetti from 'canvas-confetti';
import { Trophy, Frown, AlertCircle } from 'lucide-react';
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
    currentMultiplier,
    cashout,
    language
  } = useGameStore();

  const t = translations[language];

  const cupRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const currentPositions = useRef([0, 1, 2]); // Tracks positions without triggering React re-renders
  const shuffleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoShuffleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // If user cashes out from Controls, multiplier drops to 0. Instantly abort any active spins/timeouts.
  useEffect(() => {
    if (currentMultiplier === 0) {
      if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
      if (autoShuffleTimeoutRef.current) clearTimeout(autoShuffleTimeoutRef.current);
    }
  }, [currentMultiplier]);

  const [ballCupId, setBallCupId] = useState<number>(1);  
  const [selectedCupId, setSelectedCupId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (gamePhase === 'showing_ball') {
      const randomCup = Math.floor(Math.random() * 3);
      setBallCupId(randomCup);
      currentPositions.current = [0, 1, 2];
      setSelectedCupId(null);
      
      // Reset DOM positions instantly
      const isMobile = window.innerWidth < 640;
      const gap = isMobile ? 95 : 130;
      [0, 1, 2].forEach(cupId => {
        const idx = currentPositions.current.indexOf(cupId);
        const xOffset = (idx - 1) * gap;
        const el = cupRefs.current[cupId];
        if (el) {
          el.style.transition = 'none'; // Snap instantly
          el.style.transform = `translate3d(${xOffset}px, 0px, 0)`;
          el.style.zIndex = '10';
          // Force reflow
          void el.offsetHeight;
          el.style.transition = 'transform 250ms linear, opacity 300ms ease-in-out';
        }
      });
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
    if (currentMultiplier === 0 && balance < betAmount) {
      setErrorMessage(language === 'en' ? "Insufficient balance! Reduce your bet." : "ለማወራረድ በቂ ሂሳብ የለም! ውርርድዎን ይቀንሱ።");
      sounds.playError();
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setErrorMessage(null);
    if (currentMultiplier === 0) {
      deductBet();
    }
    setGamePhase('shuffling');
    sounds.playSelect();

    let swaps = 0;
    const maxSwaps = 10;
    const swapInterval = 280; // Optimized timing for linear CSS transitions

    shuffleIntervalRef.current = setInterval(() => {
      sounds.playShuffleTick();
      
      // Calculate purely mathematically
      const pos = currentPositions.current;
      const idx1 = Math.floor(Math.random() * 3);
      let idx2 = Math.floor(Math.random() * 3);
      while (idx1 === idx2) {
        idx2 = Math.floor(Math.random() * 3);
      }
      
      const temp = pos[idx1];
      pos[idx1] = pos[idx2];
      pos[idx2] = temp;
      
      // Apply directly to DOM without touching React State!
      const isMobile = window.innerWidth < 640;
      const gap = isMobile ? 95 : 130;

      [0, 1, 2].forEach(cupId => {
        const index = pos.indexOf(cupId);
        const xOffset = (index - 1) * gap;
        const el = cupRefs.current[cupId];
        if (el) {
          el.style.transform = `translate3d(${xOffset}px, 0px, 0)`;
          el.style.zIndex = (10 + index).toString();
        }
      });

      swaps++;
      if (swaps >= maxSwaps) {
        if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
        setTimeout(() => {
          setGamePhase('guessing');
        }, swapInterval + 50);
      }
    }, swapInterval);
  };

  const handleCupClick = (cupId: number) => {
    if (gamePhase !== 'guessing') return;

    sounds.playSelect();
    setSelectedCupId(cupId);
    
    const isWin = cupId === ballCupId;

    if (isWin) {
      recordWin(0);
      sounds.playWin();
      triggerConfetti();
      autoShuffleTimeoutRef.current = setTimeout(() => {
        if (useGameStore.getState().currentMultiplier > 0) {
          handleShuffleStart();
        }
      }, 2000);
    } else {
      recordLoss();
      sounds.playLoss();
      setTimeout(() => {
        setGamePhase('showing_ball');
      }, 3500);
    }
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

      {/* Pure CSS transform play area */}
      <div className="relative z-10 h-[210px] sm:h-[260px] flex justify-center items-end pb-3 w-full max-w-sm mx-auto">
        {[0, 1, 2].map((cupId) => {
          const isBallCup = cupId === ballCupId;
          const index = currentPositions.current.indexOf(cupId);
          
          let yOffset = 0;
          let opacity = 1;
          let cursorClass = "cursor-default";

          if (gamePhase === 'showing_ball') {
            yOffset = isBallCup ? -60 : 0;
          } else if (gamePhase === 'guessing') {
            cursorClass = "cursor-pointer md:hover:-translate-y-2 active:scale-95";
          } else if (gamePhase === 'revealing') {
            yOffset = -60;
            if (!isBallCup) opacity = 0.5; 
          }

          const zIndex = gamePhase === 'shuffling' ? 10 + index : (isBallCup ? 20 : 10);
          
          const isMobile = window.innerWidth < 640;
          const gap = isMobile ? 95 : 130;
          const xOffset = (index - 1) * gap;

          return (
            <div 
              key={cupId}
              ref={el => cupRefs.current[cupId] = el}
              className={`absolute bottom-3 w-[85px] sm:w-[120px] flex flex-col items-center ${cursorClass}`}
              style={{ 
                zIndex,
                opacity,
                transform: `translate3d(${xOffset}px, 0px, 0)`,
                transition: 'transform 250ms linear, opacity 300ms ease-in-out',
                willChange: 'transform'
              }}
              onClick={() => gamePhase === 'guessing' && handleCupClick(cupId)}
            >
              {/* The Gold Ball */}
              {isBallCup && (
                <div 
                  className={`absolute bottom-2 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center transition-opacity duration-300 z-0 ${
                    gamePhase === 'showing_ball' || gamePhase === 'revealing' ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img 
                    src="/gold-ball.png" 
                    alt="Gold Ball"
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-lg mix-blend-screen"
                    style={{ filter: 'contrast(1.2)' }}
                  />
                </div>
              )}

              {/* Ultra-Fast WebP/PNG Cup Image */}
              <div 
                className="w-full aspect-[4/5] flex justify-center items-end relative"
                style={{ 
                  transform: `translate3d(0, ${yOffset}px, 0)`,
                  transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  willChange: 'transform'
                }}
              >
                {/* 
                  Note: The generated images currently have a white background. 
                  For production, run these through remove.bg or Photoshop to make them transparent,
                  and convert them to .webp for the ultimate file size!
                  We use mix-blend-multiply as a temporary hack to hide the white bg.
                */}
                <img 
                  src={gamePhase === 'revealing' || (gamePhase === 'showing_ball' && isBallCup) ? "/cup-lifted.png" : "/cup-closed.png"} 
                  className="w-[120%] h-auto max-h-full pointer-events-none select-none drop-shadow-2xl mix-blend-multiply" 
                  alt="Casino Cup"
                />
              </div>

              {/* Guess Indicator */}
              {gamePhase === 'revealing' && selectedCupId === cupId && (
                <div className={`absolute -bottom-6 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isBallCup ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {isBallCup ? t.correct : t.empty}
                </div>
              )}
            </div>
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
              <Trophy className="w-4.5 h-4.5" /> 
              {`At Risk: Br ${lastWinAmount.toFixed(2)} (${currentMultiplier.toFixed(1)}x)`}
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
