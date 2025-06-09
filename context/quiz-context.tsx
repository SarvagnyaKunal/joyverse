"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  id: string
  name: string
  age: number
  gender: string
  email: string
  avatar: string
  progress: number
}

interface Question {
  id: string
  questionText: string
  options: string[]
  correctOptionIndex: number
  difficultyLevel: "easy" | "medium" | "hard"
}

interface QuizContextType {
  user: User | null
  setUser: (user: User | null) => void
  currentQuestion: Question | null
  setCurrentQuestion: (question: Question | null) => void
  questionIndex: number
  setQuestionIndex: (index: number) => void
  score: number
  setScore: (score: number) => void
  difficultyLevel: "easy" | "medium" | "hard"
  setDifficultyLevel: (level: "easy" | "medium" | "hard") => void
  emotion: string
  setEmotion: (emotion: string) => void
  isAuthenticated: boolean
  setIsAuthenticated: (auth: boolean) => void
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [difficultyLevel, setDifficultyLevel] = useState<"easy" | "medium" | "hard">("easy")
  const [emotion, setEmotion] = useState("neutral")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <QuizContext.Provider
      value={{
        user,
        setUser,
        currentQuestion,
        setCurrentQuestion,
        questionIndex,
        setQuestionIndex,
        score,
        setScore,
        difficultyLevel,
        setDifficultyLevel,
        emotion,
        setEmotion,
        isAuthenticated,
        setIsAuthenticated,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider")
  }
  return context
}
