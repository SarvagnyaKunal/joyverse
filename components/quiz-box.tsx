"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuiz } from "@/context/quiz-context"
import OptionButton from "@/components/option-button"
import { loadQuestions, logProgress, captureImage } from "@/utils/api"

export default function QuizBox() {
  const {
    currentQuestion,
    setCurrentQuestion,
    questionIndex,
    setQuestionIndex,
    score,
    setScore,
    difficultyLevel,
    emotion,
  } = useQuiz()

  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const loadedQuestions = await loadQuestions()
        setQuestions(loadedQuestions)
        if (loadedQuestions.length > 0) {
          setCurrentQuestion(loadedQuestions[0])
        }
      } catch (error) {
        console.error("Failed to load questions:", error)
      }
    }

    fetchQuestions()
  }, [setCurrentQuestion])

  const handleOptionClick = async (optionIndex: number) => {
    if (selectedOption !== null || !currentQuestion) return

    setSelectedOption(optionIndex)
    const correct = optionIndex === currentQuestion.correctOptionIndex
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore(score + 1)
    }

    // Capture image when question is answered
    await captureImage()

    // Log progress
    await logProgress({
      questionId: currentQuestion.id,
      answer: optionIndex,
      correct,
      timestamp: new Date().toISOString(),
      emotion,
    })

    // Move to next question after delay
    setTimeout(() => {
      const nextIndex = questionIndex + 1
      if (nextIndex < questions.length) {
        setQuestionIndex(nextIndex)
        setCurrentQuestion(questions[nextIndex])
        setSelectedOption(null)
        setShowResult(false)
      } else {
        // Quiz completed
        console.log("Quiz completed! Final score:", score + (correct ? 1 : 0))
      }
    }, 2000)
  }

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-3xl mx-auto bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl">
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800">Loading your quiz...</h2>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl transition-all duration-500 hover:shadow-3xl">
      <CardHeader className="text-center pb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-purple-600">
            Question {questionIndex + 1} of {questions.length}
          </span>
          <span
            className={`px-4 py-2 rounded-full text-sm font-bold ${
              difficultyLevel === "easy"
                ? "bg-green-100 text-green-800"
                : difficultyLevel === "medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {difficultyLevel.toUpperCase()}
          </span>
        </div>
        <CardTitle className="text-3xl font-bold text-gray-800 leading-relaxed">
          {currentQuestion.questionText}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <OptionButton
              key={index}
              option={option}
              index={index}
              isSelected={selectedOption === index}
              isCorrect={showResult && index === currentQuestion.correctOptionIndex}
              isIncorrect={showResult && selectedOption === index && index !== currentQuestion.correctOptionIndex}
              onClick={() => handleOptionClick(index)}
              disabled={selectedOption !== null}
            />
          ))}
        </div>

        {showResult && (
          <div className="text-center mt-8 animate-in fade-in duration-500">
            <div className={`text-6xl mb-4 ${isCorrect ? "animate-bounce" : "animate-pulse"}`}>
              {isCorrect ? "🎉" : "💪"}
            </div>
            <p className={`text-2xl font-bold ${isCorrect ? "text-green-600" : "text-orange-600"}`}>
              {isCorrect ? "Great job! That's correct!" : "Good try! Keep learning!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
