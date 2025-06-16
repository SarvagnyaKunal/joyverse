"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Direction,
  GameStatus,
  type Point,
  type SnakeGameProps,
  type SnakeGameState,
  type LetterItem,
} from "@/components/snake-game/types"
import {
  CELL_SIZE,
  GAME_SPEED,
  INITIAL_SNAKE_LENGTH,
  LETTER_COLORS,
  GAME_COLORS,
  getDistractorLetters,
  getSnakeSegmentColor,
  getSafeDirection,
} from "@/components/snake-game/constants"

export function useSnakeGame({ canvasRef, initialWord, onWordComplete, onLifeLoss }: SnakeGameProps) {
  const [gameState, setGameState] = useState<SnakeGameState>({
    snake: [],
    direction: Direction.RIGHT,
    nextDirection: Direction.RIGHT,
    targetWord: initialWord || "apple",
    collectedLetters: "",
    letters: [],
    score: 0,
    lives: 3,
    gameStatus: GameStatus.READY,
  })

  const gameLoopRef = useRef<number | null>(null)
  const lastRenderTimeRef = useRef<number>(0)
  const gameStateRef = useRef<SnakeGameState>(gameState)

  // Keep gameStateRef in sync with gameState
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // Generate letters for the game
  const generateLetters = useCallback((word: string, canvas: HTMLCanvasElement | null): LetterItem[] => {
    if (!canvas) return []

    const letters: LetterItem[] = []
    const usedPositions: Set<string> = new Set()
    const maxX = Math.floor(canvas.width / CELL_SIZE) - 1
    const maxY = Math.floor(canvas.height / CELL_SIZE) - 1    // Helper function to get a truly random position with better distribution
    const getRandomPosition = (minDistance = 2): { x: number, y: number } => {
      let attempts = 0
      let x, y, posKey, tooClose
      
      do {
        // Use better random distribution to avoid clustering
        x = Math.floor(Math.random() * (maxX - 2)) + 1 // Avoid edges
        y = Math.floor(Math.random() * (maxY - 2)) + 1 // Avoid edges
        posKey = `${x},${y}`
        
        // Check minimum distance from existing letters
        tooClose = false
        if (minDistance > 0) {
          for (const pos of usedPositions) {
            const [existingX, existingY] = pos.split(',').map(Number)
            const distance = Math.abs(x - existingX) + Math.abs(y - existingY) // Manhattan distance
            if (distance < minDistance) {
              tooClose = true
              break
            }
          }
        }
        
        attempts++
        if (attempts > 100) { // Prevent infinite loop
          minDistance = Math.max(0, minDistance - 1)
          attempts = 0
        }
      } while ((usedPositions.has(posKey) || tooClose) && attempts < 100)
      
      return { x, y }
    }    // Add correct letters with better spacing
    const wordLetters = word.split("")
    const firstLetter = wordLetters[0]
    
    for (let i = 0; i < wordLetters.length; i++) {
      const position = getRandomPosition(3) // Minimum distance of 3 cells between letters
      const posKey = `${position.x},${position.y}`
      
      usedPositions.add(posKey)
      letters.push({
        letter: wordLetters[i],
        position,
        isCorrect: true,
        isNextInSequence: wordLetters[i] === firstLetter, // Mark any letter that matches the first letter
        color: LETTER_COLORS.correct, // Keep all correct letters the same color
        wordIndex: i,
      })
    }

    // Add distractor letters with even more spacing
    const distractors = getDistractorLetters(word)
    for (let i = 0; i < distractors.length; i++) {
      const position = getRandomPosition(2) // Minimum distance of 2 cells for distractors
      const posKey = `${position.x},${position.y}`

      usedPositions.add(posKey)
      letters.push({
        letter: distractors[i],
        position,
        isCorrect: false,
        isNextInSequence: false,
        color: LETTER_COLORS.correct, // Same color as correct letters
        wordIndex: undefined,
      })
    }

    return letters
  }, [])

  // Initialize the game
  const initGame = useCallback(
    (word: string) => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Create initial snake
      const centerX = Math.floor(canvas.width / CELL_SIZE / 2)
      const centerY = Math.floor(canvas.height / CELL_SIZE / 2)

      const snake: Point[] = []
      for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        snake.push({ x: centerX - i, y: centerY })
      }

      // Generate letters for the word
      const letters = generateLetters(word, canvas)

      const newState = {
        snake,
        direction: Direction.RIGHT,
        nextDirection: Direction.RIGHT,
        targetWord: word,
        collectedLetters: "",
        letters,
        score: gameStateRef.current.score, // Keep existing score
        lives: 3,
        gameStatus: GameStatus.PLAYING,
      }

      setGameState(newState)
      gameStateRef.current = newState
    },
    [canvasRef, generateLetters],
  )

  // Draw game
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const currentState = gameStateRef.current

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid background with alternating colors
    const gridCols = Math.floor(canvas.width / CELL_SIZE)
    const gridRows = Math.floor(canvas.height / CELL_SIZE)
    
    for (let col = 0; col < gridCols; col++) {
      for (let row = 0; row < gridRows; row++) {
        // Alternating pattern: use different colors for even/odd positions
        const isEvenTile = (col + row) % 2 === 0
        ctx.fillStyle = isEvenTile ? GAME_COLORS.gridTile1 : GAME_COLORS.gridTile2
        
        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        
        // Add subtle grid lines for texture
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
        ctx.lineWidth = 0.5
        ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      }
    }

    // Draw wall borders
    ctx.strokeStyle = GAME_COLORS.wallBorder
    ctx.fillStyle = GAME_COLORS.wallFill
    ctx.lineWidth = 4
    
    // Draw border around the entire game area
    ctx.fillRect(0, 0, canvas.width, 4) // Top wall
    ctx.fillRect(0, canvas.height - 4, canvas.width, 4) // Bottom wall
    ctx.fillRect(0, 0, 4, canvas.height) // Left wall
    ctx.fillRect(canvas.width - 4, 0, 4, canvas.height) // Right wall
    
    // Draw border outline
    ctx.strokeRect(0, 0, canvas.width, canvas.height)

    // Draw snake with gradient colors
    currentState.snake.forEach((segment, index) => {
      const segmentColor = getSnakeSegmentColor(index, currentState.snake.length)
      
      // Draw main segment
      ctx.fillStyle = segmentColor
      ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)

      // Add simple border
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
      ctx.lineWidth = 1
      ctx.strokeRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)      // Draw eyes on head
      if (index === 0) {
        const eyeRadius = CELL_SIZE / 8 // Made eyes circular
        const eyeOffset = CELL_SIZE / 4

        let leftEyeCenterX, leftEyeCenterY, rightEyeCenterX, rightEyeCenterY

        switch (currentState.direction) {
          case Direction.UP:
            leftEyeCenterX = segment.x * CELL_SIZE + eyeOffset
            leftEyeCenterY = segment.y * CELL_SIZE + eyeOffset
            rightEyeCenterX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset
            rightEyeCenterY = segment.y * CELL_SIZE + eyeOffset
            break
          case Direction.DOWN:
            leftEyeCenterX = segment.x * CELL_SIZE + eyeOffset
            leftEyeCenterY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset
            rightEyeCenterX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset
            rightEyeCenterY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset
            break
          case Direction.LEFT:
            leftEyeCenterX = segment.x * CELL_SIZE + eyeOffset
            leftEyeCenterY = segment.y * CELL_SIZE + eyeOffset
            rightEyeCenterX = segment.x * CELL_SIZE + eyeOffset
            rightEyeCenterY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset
            break
          case Direction.RIGHT:
            leftEyeCenterX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset
            leftEyeCenterY = segment.y * CELL_SIZE + eyeOffset
            rightEyeCenterX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset
            rightEyeCenterY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset
            break
        }

        // Draw circular eyes with black border
        ctx.fillStyle = GAME_COLORS.snakeEyes
        
        // Left eye
        ctx.beginPath()
        ctx.arc(leftEyeCenterX, leftEyeCenterY, eyeRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 1
        ctx.stroke()
        
        // Right eye
        ctx.beginPath()
        ctx.arc(rightEyeCenterX, rightEyeCenterY, eyeRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })

    // Draw letters
    currentState.letters.forEach((letter) => {
      const centerX = letter.position.x * CELL_SIZE + CELL_SIZE / 2
      const centerY = letter.position.y * CELL_SIZE + CELL_SIZE / 2
      const radius = CELL_SIZE / 2 - 2
      
      // Draw main circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.fillStyle = letter.color
      ctx.fill()

      // Add simple border
      ctx.strokeStyle = "rgba(0, 0, 0, 0.4)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw letter text
      ctx.fillStyle = "white"
      ctx.font = `bold ${CELL_SIZE * 0.7}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      
      // Add simple text shadow for readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      
      ctx.fillText(letter.letter.toUpperCase(), centerX, centerY)
      
      // Reset shadow
      ctx.shadowColor = "transparent"
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    })
  }, [canvasRef])

  // Game loop
  const gameLoop = useCallback(
    (currentTime: number) => {
      const currentState = gameStateRef.current

      if (currentState.gameStatus !== GameStatus.PLAYING) {
        if (currentState.gameStatus !== GameStatus.GAME_OVER) {
          gameLoopRef.current = requestAnimationFrame(gameLoop)
        }
        return
      }

      const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current) / 1000
      if (secondsSinceLastRender < 1 / GAME_SPEED) {
        gameLoopRef.current = requestAnimationFrame(gameLoop)
        return
      }

      lastRenderTimeRef.current = currentTime

      // Update game state
      const newSnake = [...currentState.snake]
      const head = { ...newSnake[0] }

      // Update direction
      const direction = currentState.nextDirection

      // Move snake head
      switch (direction) {
        case Direction.UP:
          head.y -= 1
          break
        case Direction.DOWN:
          head.y += 1
          break
        case Direction.LEFT:
          head.x -= 1
          break
        case Direction.RIGHT:
          head.x += 1
          break
      }      // Check wall collision - wrap around to opposite side
      const canvas = canvasRef.current
      if (!canvas) {
        gameLoopRef.current = requestAnimationFrame(gameLoop)
        return
      }

      const maxX = Math.floor(canvas.width / CELL_SIZE) - 1
      const maxY = Math.floor(canvas.height / CELL_SIZE) - 1

      // Wrap around walls
      if (head.x < 0) {
        head.x = maxX
      } else if (head.x > maxX) {
        head.x = 0
      }
      
      if (head.y < 0) {
        head.y = maxY
      } else if (head.y > maxY) {
        head.y = 0
      }

      // Check self collision
      for (let i = 0; i < newSnake.length; i++) {
        if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
          const newState = {
            ...currentState,
            gameStatus: GameStatus.GAME_OVER,
          }
          setGameState(newState)
          gameStateRef.current = newState
          return
        }
      }

      // Add new head
      newSnake.unshift(head)

      // Check letter collision
      let newLetters = [...currentState.letters]
      let newCollectedLetters = currentState.collectedLetters
      let newLives = currentState.lives
      let newScore = currentState.score
      let shouldGrow = false

      const letterIndex = newLetters.findIndex((letter) => letter.position.x === head.x && letter.position.y === head.y)

      if (letterIndex !== -1) {
        const letter = newLetters[letterIndex]
        
        // Check if this letter matches what we need next in the sequence
        const nextNeededLetter = currentState.targetWord[newCollectedLetters.length]
        const isCorrectNextLetter = letter.letter === nextNeededLetter && letter.isCorrect
        
        if (isCorrectNextLetter) {
          // This is the correct letter we need next (handles repeated letters)
          newCollectedLetters += letter.letter
          newScore += 10
          shouldGrow = true // Snake grows when eating correct letter

          // Remove the collected letter
          newLetters = newLetters.filter((_, i) => i !== letterIndex)

          // Update the next letter in sequence - find any correct letter that matches the next needed letter
          if (newCollectedLetters.length < currentState.targetWord.length) {
            const nextNeededLetterAfterThis = currentState.targetWord[newCollectedLetters.length]
            
            // Find any correct letter that matches the next needed letter and update it to be next in sequence
            const nextLetterIndex = newLetters.findIndex(
              (l) => l.isCorrect && l.letter === nextNeededLetterAfterThis
            )

            if (nextLetterIndex !== -1) {
              // Update all letters to not be next in sequence first
              newLetters = newLetters.map(l => ({ ...l, isNextInSequence: false }))
              
              // Then mark the found letter as next in sequence
              newLetters[nextLetterIndex] = {
                ...newLetters[nextLetterIndex],
                isNextInSequence: true,
                color: LETTER_COLORS.correct,
              }
            }
          }

          // Check if word is complete
          if (newCollectedLetters === currentState.targetWord) {
            // Word completed, load next word
            if (onWordComplete) {
              const nextWord = onWordComplete()
              if (nextWord) {
                const nextWordLetters = generateLetters(nextWord, canvas)
                const completedState = {
                  ...currentState,
                  snake: newSnake,
                  direction,
                  targetWord: nextWord,
                  collectedLetters: "",
                  letters: nextWordLetters,
                  score: newScore + 50, // Bonus for completing word
                  lives: 3, // Reset lives
                }
                setGameState(completedState)
                gameStateRef.current = completedState
                drawGame()
                gameLoopRef.current = requestAnimationFrame(gameLoop)
                return
              }
            }
          }
        } else if (letter.isCorrect) {
          // Correct letter but not the one we need next - just ignore it, don't lose a life
          // For repeated letters, we only want the one that matches the sequence
          shouldGrow = false
        } else {
          // Wrong letter (distractor)
          newLives -= 1
          newScore = Math.max(0, newScore - 5) // Penalty for wrong letter

          // Call life loss callback
          if (onLifeLoss) {
            onLifeLoss()
          }

          // Remove the wrong letter permanently
          newLetters = newLetters.filter((_, i) => i !== letterIndex)

          // Check if game over
          if (newLives <= 0) {
            const gameOverState = {
              ...currentState,
              snake: newSnake,
              direction,
              collectedLetters: newCollectedLetters,
              letters: newLetters,
              score: newScore,
              lives: newLives,
              gameStatus: GameStatus.GAME_OVER,
            }
            setGameState(gameOverState)
            gameStateRef.current = gameOverState
            return
          }
        }
      }

      // Remove tail if not growing
      if (!shouldGrow) {
        newSnake.pop()
      }

      // Update state
      const newState = {
        ...currentState,
        snake: newSnake,
        direction,
        collectedLetters: newCollectedLetters,
        letters: newLetters,
        score: newScore,
        lives: newLives,
      }

      setGameState(newState)
      gameStateRef.current = newState

      // Draw game
      drawGame()

      // Continue game loop
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    },
    [canvasRef, drawGame, generateLetters, onWordComplete],
  )

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentState = gameStateRef.current
      
      // Always prevent default for arrow keys and space when game is mounted
      const gameKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "]
      if (gameKeys.includes(e.key)) {
        e.preventDefault()
        e.stopPropagation()
      }

      // Only process game logic when playing
      if (currentState.gameStatus !== GameStatus.PLAYING) return

      let newDirection = currentState.nextDirection

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (currentState.direction !== Direction.DOWN) {
            newDirection = Direction.UP
          }
          break
        case "ArrowDown":
        case "s":
        case "S":
          if (currentState.direction !== Direction.UP) {
            newDirection = Direction.DOWN
          }
          break
        case "ArrowLeft":
        case "a":
        case "A":
          if (currentState.direction !== Direction.RIGHT) {
            newDirection = Direction.LEFT
          }
          break
        case "ArrowRight":
        case "d":
        case "D":
          if (currentState.direction !== Direction.LEFT) {
            newDirection = Direction.RIGHT
          }
          break
        case " ":
          // Toggle pause
          const newStatus = currentState.gameStatus === GameStatus.PLAYING ? GameStatus.PAUSED : GameStatus.PLAYING
          const pausedState = { ...currentState, gameStatus: newStatus }
          setGameState(pausedState)
          gameStateRef.current = pausedState
          if (newStatus === GameStatus.PLAYING) {
            lastRenderTimeRef.current = performance.now()
            gameLoopRef.current = requestAnimationFrame(gameLoop)
          }
          return
      }

      if (newDirection !== currentState.nextDirection) {
        const newState = { ...currentState, nextDirection: newDirection }
        setGameState(newState)
        gameStateRef.current = newState
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [gameLoop])

  // Start game
  const startGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }

    initGame(gameState.targetWord)
    lastRenderTimeRef.current = performance.now()
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameLoop, gameState.targetWord, initGame])

  // Restart game
  const restartGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }

    initGame(gameState.targetWord)
    lastRenderTimeRef.current = performance.now()
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameLoop, gameState.targetWord, initGame])

  // Pause game
  const pauseGame = useCallback(() => {
    const newState = { ...gameStateRef.current, gameStatus: GameStatus.PAUSED }
    setGameState(newState)
    gameStateRef.current = newState
  }, [])

  // Resume game
  const resumeGame = useCallback(() => {
    const newState = { ...gameStateRef.current, gameStatus: GameStatus.PLAYING }
    setGameState(newState)
    gameStateRef.current = newState

    lastRenderTimeRef.current = performance.now()
    if (!gameLoopRef.current) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
  }, [gameLoop])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [])

  // Adjust difficulty (placeholder for future AI integration)
  const adjustDifficulty = useCallback(
    (settings: {
      speed?: number
      distractorCount?: number
      backgroundColor?: string
    }) => {
      console.log("Adjusting difficulty with settings:", settings)
      // This function will be implemented later when integrating with the Transformer model
    },
    [],
  )

  return {
    ...gameState,
    startGame,
    restartGame,
    pauseGame,
    resumeGame,
    adjustDifficulty,
  }
}
