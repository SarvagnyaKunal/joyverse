"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuiz } from "@/context/quiz-context"
import ProfileHeader from "@/components/profile-header"
import QuizBox from "@/components/quiz-box"
import EmotionMonitor from "@/components/emotion-monitor"
import { loadQuestions } from "@/utils/api"

export default function Home() {
  const { isAuthenticated, user, setCurrentQuestion, questionIndex } = useQuiz()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login")
      return
    }

    // Load initial question
    const initializeQuiz = async () => {
      try {
        const questions = await loadQuestions()
        if (questions.length > 0) {
          setCurrentQuestion(questions[questionIndex])
        }
      } catch (error) {
        console.error("Failed to load questions:", error)
      }
    }

    initializeQuiz()
  }, [isAuthenticated, user, navigate, setCurrentQuestion, questionIndex])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ProfileHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <QuizBox />
        </div>
      </main>
      <EmotionMonitor />
    </div>
  )
}

