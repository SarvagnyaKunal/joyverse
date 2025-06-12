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

export function useSnakeGame({ canvasRef, initialWord, onWordComplete }: SnakeGameProps) {
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
    const maxY = Math.floor(canvas.height / CELL_SIZE) - 1

    // Add correct letters
    const wordLetters = word.split("")
    for (let i = 0; i < wordLetters.length; i++) {
      let x, y
      let posKey

      do {
        x = Math.floor(Math.random() * maxX)
        y = Math.floor(Math.random() * maxY)
        posKey = `${x},${y}`
      } while (usedPositions.has(posKey))

      usedPositions.add(posKey)
      letters.push({
        letter: wordLetters[i],
        position: { x, y },
        isCorrect: true,
        isNextInSequence: i === 0,
        color: i === 0 ? LETTER_COLORS.next : LETTER_COLORS.correct,
        wordIndex: i,
      })
    }

    // Add distractor letters
    const distractors = getDistractorLetters(word)
    for (let i = 0; i < distractors.length; i++) {
      let x, y
      let posKey

      do {
        x = Math.floor(Math.random() * maxX)
        y = Math.floor(Math.random() * maxY)
        posKey = `${x},${y}`
      } while (usedPositions.has(posKey))

      usedPositions.add(posKey)
      letters.push({
        letter: distractors[i],
        position: { x, y },
        isCorrect: false,
        isNextInSequence: false,
        color: LETTER_COLORS.distractor,
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
      ctx.strokeRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE)

      // Draw eyes on head
      if (index === 0) {
        ctx.fillStyle = GAME_COLORS.snakeEyes
        const eyeSize = CELL_SIZE / 5
        const eyeOffset = CELL_SIZE / 3

        let leftEyeX, leftEyeY, rightEyeX, rightEyeY

        switch (currentState.direction) {
          case Direction.UP:
            leftEyeX = segment.x * CELL_SIZE + eyeOffset
            leftEyeY = segment.y * CELL_SIZE + eyeOffset
            rightEyeX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize
            rightEyeY = segment.y * CELL_SIZE + eyeOffset
            break
          case Direction.DOWN:
            leftEyeX = segment.x * CELL_SIZE + eyeOffset
            leftEyeY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize
            rightEyeX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize
            rightEyeY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize
            break
          case Direction.LEFT:
            leftEyeX = segment.x * CELL_SIZE + eyeOffset
            leftEyeY = segment.y * CELL_SIZE + eyeOffset
            rightEyeX = segment.x * CELL_SIZE + eyeOffset
            rightEyeY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize
            break
          case Direction.RIGHT:
            leftEyeX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize
            leftEyeY = segment.y * CELL_SIZE + eyeOffset
            rightEyeX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize
            rightEyeY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize
            break
        }

        // Draw simple eyes
        ctx.fillStyle = GAME_COLORS.snakeEyes
        ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize)
        ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize)
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
      }

      // Check wall collision - turn away from walls instead of wrapping
      const canvas = canvasRef.current
      if (!canvas) {
        gameLoopRef.current = requestAnimationFrame(gameLoop)
        return
      }

      const maxX = Math.floor(canvas.width / CELL_SIZE) - 1
      const maxY = Math.floor(canvas.height / CELL_SIZE) - 1

      // If snake is about to hit a wall, automatically turn away
      if (head.x < 0 || head.x > maxX || head.y < 0 || head.y > maxY) {
        const safeDirection = getSafeDirection(currentState.snake[0], direction, maxX, maxY)
        
        // Update direction to safe direction
        const newState = { 
          ...currentState, 
          nextDirection: safeDirection as Direction,
          direction: safeDirection as Direction 
        }
        setGameState(newState)
        gameStateRef.current = newState
        
        // Recalculate head position with new direction
        const newHead = { ...currentState.snake[0] }
        switch (safeDirection) {
          case 'UP':
            newHead.y -= 1
            break
          case 'DOWN':
            newHead.y += 1
            break
          case 'LEFT':
            newHead.x -= 1
            break
          case 'RIGHT':
            newHead.x += 1
            break
        }
        
        // Make sure new position is within bounds
        if (newHead.x < 0 || newHead.x > maxX || newHead.y < 0 || newHead.y > maxY) {
          // If still hitting wall, just move away from nearest wall
          if (newHead.x < 0) newHead.x = 0
          if (newHead.x > maxX) newHead.x = maxX
          if (newHead.y < 0) newHead.y = 0
          if (newHead.y > maxY) newHead.y = maxY
        }
        
        head.x = newHead.x
        head.y = newHead.y
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
        shouldGrow = true

        if (letter.isNextInSequence) {
          // Correct letter in sequence
          newCollectedLetters += letter.letter
          newScore += 10

          // Remove the collected letter
          newLetters = newLetters.filter((_, i) => i !== letterIndex)

          // Update the next letter in sequence - use wordIndex to find the correct next letter
          if (newCollectedLetters.length < currentState.targetWord.length) {
            const nextLetterIndex = newLetters.findIndex(
              (l) => l.isCorrect && l.wordIndex === newCollectedLetters.length
            )

            if (nextLetterIndex !== -1) {
              newLetters[nextLetterIndex] = {
                ...newLetters[nextLetterIndex],
                isNextInSequence: true,
                color: LETTER_COLORS.next,
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
          // Correct letter but not in sequence (early pickup)
          newLives -= 1
          newScore = Math.max(0, newScore - 3) // Smaller penalty for early pickup

          // Respawn the letter in a new position
          let newX, newY, posKey
          const usedPositions = new Set(newLetters.map(l => `${l.position.x},${l.position.y}`))
          usedPositions.add(`${head.x},${head.y}`) // Don't spawn on snake head
          
          do {
            newX = Math.floor(Math.random() * (Math.floor(canvas.width / CELL_SIZE) - 1))
            newY = Math.floor(Math.random() * (Math.floor(canvas.height / CELL_SIZE) - 1))
            posKey = `${newX},${newY}`
          } while (usedPositions.has(posKey))

          // Replace the letter with same properties but new position
          newLetters[letterIndex] = {
            ...letter,
            position: { x: newX, y: newY }
          }

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
        } else {
          // Wrong letter (distractor)
          newLives -= 1
          newScore = Math.max(0, newScore - 5) // Penalty for wrong letter

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
