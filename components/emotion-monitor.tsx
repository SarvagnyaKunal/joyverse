"use client"

import { useEffect } from "react"
import { useQuiz } from "@/context/quiz-context"
import { fetchEmotionData, adjustDifficulty, captureImage } from "@/utils/api"

export default function EmotionMonitor() {
  const { emotion, setEmotion, difficultyLevel, setDifficultyLevel } = useQuiz()

  useEffect(() => {
    // Monitor emotions every 5 seconds
    const emotionInterval = setInterval(async () => {
      try {
        const emotionData = await fetchEmotionData()
        setEmotion(emotionData.emotion)

        // Adjust difficulty based on emotion
        const newDifficulty = adjustDifficulty(emotionData.emotion)
        if (newDifficulty !== difficultyLevel) {
          setDifficultyLevel(newDifficulty)
          console.log(`Difficulty adjusted to ${newDifficulty} based on emotion: ${emotionData.emotion}`)
        }
      } catch (error) {
        console.error("Failed to fetch emotion data:", error)
      }
    }, 5000)

    // Capture images every 5 seconds
    const captureInterval = setInterval(async () => {
      try {
        await captureImage()
      } catch (error) {
        console.error("Failed to capture image:", error)
      }
    }, 5000)

    return () => {
      clearInterval(emotionInterval)
      clearInterval(captureInterval)
    }
  }, [emotion, setEmotion, difficultyLevel, setDifficultyLevel])

  // This component doesn't render anything visible
  // It runs in the background to monitor emotions
  return null
}
