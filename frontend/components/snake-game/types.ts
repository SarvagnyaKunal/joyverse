import type { RefObject } from "react"

export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export enum GameStatus {
  READY = "READY",
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  GAME_OVER = "GAME_OVER",
}

export interface Point {
  x: number
  y: number
}

export interface LetterItem {
  letter: string
  position: Point
  isCorrect: boolean
  isNextInSequence: boolean
  color: string
  wordIndex?: number // Index in the target word (for correct letters)
}

export interface SnakeGameState {
  snake: Point[]
  direction: Direction
  nextDirection: Direction
  targetWord: string
  collectedLetters: string
  letters: LetterItem[]
  score: number
  lives: number
  gameStatus: GameStatus
}

export interface SnakeGameProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
  initialWord?: string
  onWordComplete?: () => string
  onLifeLoss?: () => void
}
