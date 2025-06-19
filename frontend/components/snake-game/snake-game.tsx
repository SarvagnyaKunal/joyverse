"use client"

import { useEffect, useRef, useState } from "react"
import { useSnakeGame } from "@/components/snake-game/use-snake-game"
import { GameStatus } from "@/components/snake-game/types"
import { Button } from "@/components/ui/button"
import "@/app/fonts.css"

// Simple dialog component for popups
const GameDialog = ({ children, show }: { children: React.ReactNode; show: boolean }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 relative shadow-xl">
        {children}
      </div>
    </div>
  );
};

// Add a retro font dialog for popups
const RetroDialog = ({ children, show, vibrant = false }: { children: React.ReactNode; show: boolean; vibrant?: boolean }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className={`rounded-2xl p-8 max-w-md mx-4 relative shadow-2xl font-retro border-4 ${vibrant ? 'bg-gradient-to-br from-yellow-200 via-pink-200 to-green-200 border-pink-500 animate-pulse' : 'bg-white border-green-600'}`}>
        {children}
      </div>
    </div>
  );
};

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLifeLossPopup, setShowLifeLossPopup] = useState(false);
  const [lifeLossResume, setLifeLossResume] = useState(false);
  const [gamePausedForLifeLoss, setGamePausedForLifeLoss] = useState(false);
  const lifeLossRef = useRef(false);

  const { gameStatus, lives, targetWord, collectedLetters, startGame, restartGame, pauseGame, resumeGame } =
    useSnakeGame({
      canvasRef,
      onLifeLoss: () => {
        setShowLifeLossPopup(true);
        setLifeLossResume(false);
        setGamePausedForLifeLoss(true);
        lifeLossRef.current = true;
      },
      paused: gamePausedForLifeLoss,
    });

  // Listen for Enter on intro to show tutorial
  useEffect(() => {
    if (gameStatus === GameStatus.INTRO && !showTutorial) {
      const handleEnter = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          setShowTutorial(true);
        }
      };
      window.addEventListener("keydown", handleEnter);
      return () => window.removeEventListener("keydown", handleEnter);
    }
  }, [gameStatus, showTutorial]);

  // Listen for Enter on tutorial to start game
  useEffect(() => {
    if (showTutorial) {
      const handleEnter = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          setShowTutorial(false);
          startGame();
        }
      };
      window.addEventListener("keydown", handleEnter);
      return () => window.removeEventListener("keydown", handleEnter);
    }
  }, [showTutorial, startGame]);

  // Listen for Enter on life loss popup to resume game
  useEffect(() => {
    if (showLifeLossPopup) {
      const handleEnter = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          setShowLifeLossPopup(false);
          setLifeLossResume(true);
        }
      };
      window.addEventListener("keydown", handleEnter);
      return () => window.removeEventListener("keydown", handleEnter);
    }
  }, [showLifeLossPopup]);

  // Resume game after life loss popup
  useEffect(() => {
    if (lifeLossResume) {
      setGamePausedForLifeLoss(false);
      lifeLossRef.current = false;
      setLifeLossResume(false);
    }
  }, [lifeLossResume]);

  return (    <div className="flex flex-col items-center">
      {/* Two-row layout for game info */}
      <div className="mb-6 w-full max-w-4xl">        {/* Top row - Target Word (left) and Lives (right) */}
        <div className="flex items-center justify-between mb-4">
          {/* Target Word Section - Top Left */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-800">Target:</span>
            <span className="text-xl font-bold text-blue-600 bg-blue-100/30 backdrop-blur-sm px-2 py-1 rounded-md border border-blue-300/50">{targetWord}</span>
          </div>
          
          {/* Lives Section - Top Right */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-red-600">Lives:</span>
            <div className="flex gap-1">
              {Array(lives).fill("❤️").map((heart, index) => (
                <span key={index} className="text-2xl animate-pulse">{heart}</span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom row - Letter Progress centered */}
        <div className="flex justify-center">
          <div className="flex gap-1">
            {targetWord.split("").map((letter, index) => (
              <div
                key={index}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-bold transition-all duration-300
                  ${index < collectedLetters.length 
                    ? "bg-green-400/40 backdrop-blur-sm text-green-800 shadow-md transform scale-110 border border-green-500/50" 
                    : "bg-gray-200/30 backdrop-blur-sm text-gray-600 border border-dashed border-gray-400/50"}`}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas container */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-300 rounded-lg"
          width={800}
          height={550}
        />

        {/* Intro Popup with retro font */}
        <RetroDialog show={gameStatus === GameStatus.INTRO && !showTutorial}>
          <div className="text-center">
            <h2 className="text-3xl mb-4 text-green-600">Word Snake!</h2>
            <p className="text-xl mb-6 text-gray-700">Hi! Let's learn some words together!</p>
            <p className="text-lg text-green-600 animate-pulse mt-4">Press ENTER to continue</p>
          </div>
        </RetroDialog>

        {/* Instructions Popup with retro font */}
        <RetroDialog show={showTutorial}>
          <div className="text-center">
            <h3 className="text-2xl mb-4 text-green-700">How to Play</h3>
            <ul className="text-lg mb-6 text-gray-800 space-y-2">
              <li>🎮 Use <b>WASD</b> or <b>Arrow Keys</b> to move</li>
              <li>📝 Collect letters in order to spell the word</li>
              <li>❤️ You have 3 lives</li>
              <li>🎯 Complete words to win!</li>
            </ul>
            <p className="text-lg text-green-600 animate-pulse">Press ENTER to start!</p>
          </div>
        </RetroDialog>

        {/* Life Loss Popup with vibrant retro style */}
        <RetroDialog show={showLifeLossPopup} vibrant>
          <div className="text-center">
            <h3 className="text-3xl mb-4 text-pink-600 font-bold drop-shadow-lg">Ouchh!</h3>
            <p className="text-lg mb-4 text-gray-900 font-semibold">Seems like you made a mistake.<br/>No problem kiddo, you still have your lives left.</p>
            <p className="text-lg text-green-700 font-bold animate-pulse">Press ENTER to continue</p>
          </div>
        </RetroDialog>

        {/* Game Over State */}
        {gameStatus === GameStatus.GAME_OVER && (
          <RetroDialog show={true}>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-red-600">Game Over!</h2>
              <p className="text-lg mb-6 text-gray-800">
                ohh seems like you lost all your hearts!!!<br/>
                don't worry you can always try once again
              </p>
              <Button
                onClick={restartGame}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Play Again
              </Button>
            </div>
          </RetroDialog>
        )}
      </div>      {/* Game Controls */}
      <div className="mt-4 space-x-4">
        {gameStatus === GameStatus.PLAYING && (
          <>
            <Button onClick={pauseGame}>
              Pause
            </Button>
            <Button 
              onClick={restartGame}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Restart
            </Button>
          </>
        )}
        {gameStatus === GameStatus.PAUSED && (
          <>
            <Button onClick={resumeGame}>
              Resume
            </Button>
            <Button 
              onClick={restartGame}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Restart
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
