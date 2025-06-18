"use client"

import { useEffect, useRef, useState } from "react"
import { useSnakeGame } from "@/components/snake-game/use-snake-game"
import { GameStatus } from "@/components/snake-game/types"
import { Button } from "@/components/ui/button"

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [wordList] = useState<string[]>(["apple", "train", "happy", "coding", "snake"])
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0)
  const [showLifeLossPopup, setShowLifeLossPopup] = useState<boolean>(false)
  const { gameStatus, lives, wordsCompleted, targetWord, collectedLetters, startGame, restartGame, pauseGame, resumeGame } =
    useSnakeGame({
      canvasRef,
      initialWord: wordList[currentWordIndex],
      onWordComplete: () => {
        // Move to next word when current word is completed
        const nextIndex = (currentWordIndex + 1) % wordList.length
        setCurrentWordIndex(nextIndex)
        return wordList[nextIndex]
      },
      onLifeLoss: () => {
        setShowLifeLossPopup(true)
        setTimeout(() => setShowLifeLossPopup(false), 2000) // Hide popup after 2 seconds
      },
    })

  // Remove auto-start effect - let user click start button instead

  return (
    <div className="relative">
      {/* Top horizontal info bar */}
      <div className="flex justify-between items-center mb-4 px-2">
        {/* Target Word */}
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold">Target:</span>
          <span className="text-cyan-400 font-bold text-lg">{targetWord.toUpperCase()}</span>
        </div>
        
        {/* Game Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">Lives:</span>
            <span className="text-lg">{Array(lives).fill("❤️").join(" ")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">Score:</span>
            <span className="text-xl font-bold text-yellow-400">{wordsCompleted}</span>
          </div>
        </div>
      </div>

      {/* Letter progress - horizontal above canvas */}
      <div className="flex justify-center gap-2 mb-4">
        {targetWord.split("").map((letter, index) => (
          <div
            key={index}
            className={`w-10 h-10 flex items-center justify-center border-2 rounded-lg font-bold text-lg transition-all duration-300
              ${index < collectedLetters.length 
                ? "border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-lg shadow-cyan-400/50" 
                : "border-white/30 bg-white/10 text-white/60"}`}
          >
            {letter.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Game canvas container */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={750}
          height={450}
          className="rounded-2xl border-2 border-white/20 shadow-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm"
        />{gameStatus === GameStatus.READY && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
            <div className="text-white text-3xl font-bold mb-4 animate-pulse">Ready to Play!</div>
            <div className="text-white/80 text-lg mb-6 text-center">Collect letters to spell: <span className="text-cyan-400 font-bold">{targetWord}</span></div>
            <Button onClick={startGame} size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              🎮 Start Game
            </Button>
          </div>
        )}

        {gameStatus === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
            <div className="text-white text-3xl font-bold mb-4 animate-bounce">Game Over!</div>
            <div className="text-white/80 text-lg mb-6">Final Score: <span className="text-yellow-400 font-bold">{wordsCompleted}</span></div>
            <Button onClick={restartGame} size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              🔄 Restart Game
            </Button>
          </div>
        )}

        {gameStatus === GameStatus.PAUSED && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
            <div className="text-white text-3xl font-bold mb-4">⏸️ Paused</div>
            <Button onClick={resumeGame} size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              ▶️ Resume Game
            </Button>
          </div>
        )}

        {showLifeLossPopup && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/90 backdrop-blur-sm pointer-events-none rounded-2xl">
            <div className="text-white text-4xl font-bold animate-pulse">
              💔 You Lost a Life!
            </div>
            <div className="text-white text-xl mt-2">
              Lives remaining: <span className="text-yellow-300 font-bold">{lives}</span>
            </div>
          </div>
        )}
      </div>      {/* Control buttons - compact horizontal layout */}
      <div className="mt-4 flex justify-center gap-3">
        <Button 
          onClick={gameStatus === GameStatus.READY ? startGame : pauseGame} 
          disabled={gameStatus === GameStatus.GAME_OVER}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
            gameStatus === GameStatus.READY 
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg" 
              : "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
          }`}
        >
          {gameStatus === GameStatus.READY ? "🎮 Start" : "⏸️ Pause"}
        </Button>
        <Button 
          onClick={restartGame} 
          className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-all duration-300"
        >
          🔄 Restart
        </Button>
      </div>
    </div>
  )
}
