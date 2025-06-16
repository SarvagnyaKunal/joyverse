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

  const { gameStatus, lives, score, targetWord, collectedLetters, startGame, restartGame, pauseGame, resumeGame } =
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
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <h2 className="text-xl font-semibold mb-2">
          Target Word: <span className="text-green-600">{targetWord}</span>
        </h2>        <div className="flex justify-center gap-1 mb-2">
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
          <div>Score: {score}</div>
        </div>
      </div>

      <div className="relative">
        <canvas ref={canvasRef} width={900} height={550} className="border-4 border-amber-800 bg-gray-100 rounded-lg shadow-lg" />

        {gameStatus === GameStatus.READY && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <div className="text-white text-2xl font-bold mb-4">Ready to Play!</div>
            <div className="text-white text-lg mb-6">Collect letters to spell: {targetWord}</div>
            <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
              Start Game
            </Button>
          </div>
        )}

        {gameStatus === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <div className="text-white text-2xl font-bold mb-4">Game Over!</div>
            <div className="text-white text-lg mb-6">Final Score: {score}</div>
            <Button onClick={restartGame} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Restart Game
            </Button>
          </div>
        )}        {gameStatus === GameStatus.PAUSED && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <div className="text-white text-2xl font-bold mb-4">Paused</div>
            <Button onClick={resumeGame} size="lg" className="bg-green-600 hover:bg-green-700">
              Resume Game
            </Button>
          </div>
        )}

        {showLifeLossPopup && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/80 pointer-events-none">
            <div className="text-white text-3xl font-bold animate-pulse">
              💔 You Lost a Life!
            </div>
            <div className="text-white text-lg mt-2">
              Lives remaining: {lives}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button 
          onClick={gameStatus === GameStatus.READY ? startGame : pauseGame} 
          disabled={gameStatus === GameStatus.GAME_OVER}
          variant={gameStatus === GameStatus.READY ? "default" : "outline"}
        >
          {gameStatus === GameStatus.READY ? "Start Game" : "Pause"}
        </Button>
        <Button onClick={restartGame} variant="outline">Restart</Button>
      </div>

    </div>
  )
}
