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

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-semibold mb-2">
          Target Word: <span className="text-green-600">{targetWord}</span>
        </h2>
        <div className="flex justify-center gap-1 mb-2">
          {targetWord.split("").map((letter, index) => (
            <div
              key={index}
              className={`w-8 h-8 flex items-center justify-center border-2 
                ${index < collectedLetters.length ? "border-blue-500 bg-blue-100" : "border-gray-300"}`}
            >
              {letter}
            </div>
          ))}
        </div>
        <div className="flex justify-between w-full max-w-md mb-2">
          <div>Lives: {Array(lives).fill("❤️").join(" ")}</div>
        </div>
      </div>

      {/* Canvas container */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-300 rounded-lg"
          width={800}
          height={600}
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
      </div>

      {/* Game Controls */}
      <div className="mt-4 space-x-4">
        {gameStatus === GameStatus.PLAYING && (
          <Button onClick={pauseGame}>
            Pause
          </Button>
        )}
        {gameStatus === GameStatus.PAUSED && (
          <Button onClick={resumeGame}>
            Resume
          </Button>
        )}
      </div>
    </div>
  );
}
