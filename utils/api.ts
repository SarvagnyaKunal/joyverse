"use client"

// Stub API functions for backend integration

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

interface EmotionData {
  emotion: string
  confidence: number
  timestamp: string
}

interface ProgressLog {
  questionId: string
  answer: number
  correct: boolean
  timestamp: string
  emotion: string
}

// Authentication stub functions
export async function handleLogin(email: string, password: string): Promise<User> {
  // TODO: Replace with actual API call to backend
  console.log("Login attempt:", { email, password })

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return dummy user data
  return {
    id: "user_123",
    name: "Alex",
    age: 8,
    gender: "other",
    email: email,
    avatar: "/placeholder.svg?height=64&width=64",
    progress: 65,
  }
}

export async function handleSignup(formData: {
  name: string
  age: string
  gender: string
  email: string
  password: string
}): Promise<User> {
  // TODO: Replace with actual API call to backend
  console.log("Signup attempt:", formData)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  // Return dummy user data
  return {
    id: "user_" + Date.now(),
    name: formData.name,
    age: Number.parseInt(formData.age),
    gender: formData.gender,
    email: formData.email,
    avatar: "/placeholder.svg?height=64&width=64",
    progress: 0,
  }
}

// Quiz data functions
export async function loadQuestions(): Promise<Question[]> {
  // TODO: Replace with actual API call to GET /questions
  console.log("Loading questions from backend...")

  try {
    // For now, load from local JSON file
    const response = await fetch("/data/questions.json")
    const data = await response.json()
    return data.questions
  } catch (error) {
    console.error("Failed to load questions:", error)
    // Return fallback questions
    return [
      {
        id: "fallback_1",
        questionText: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctOptionIndex: 1,
        difficultyLevel: "easy",
      },
    ]
  }
}

// Emotion monitoring functions
export async function fetchEmotionData(): Promise<EmotionData> {
  // TODO: Replace with actual API call to POST /emotion
  console.log("Fetching emotion data from face mesh analysis...")

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Return dummy emotion data
  const emotions = ["happy", "neutral", "confused", "frustrated", "excited"]
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]

  return {
    emotion: randomEmotion,
    confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
    timestamp: new Date().toISOString(),
  }
}

export function adjustDifficulty(emotion: string): "easy" | "medium" | "hard" {
  // TODO: Implement more sophisticated difficulty adjustment logic
  console.log("Adjusting difficulty based on emotion:", emotion)

  switch (emotion) {
    case "confused":
    case "frustrated":
      return "easy"
    case "happy":
    case "excited":
      return "hard"
    default:
      return "medium"
  }
}

// Image capture functions
export async function captureImage(): Promise<void> {
  // TODO: Implement actual camera capture and send to backend
  console.log("Capturing image at:", new Date().toISOString())

  // Simulate image capture process
  await new Promise((resolve) => setTimeout(resolve, 100))

  // TODO: Send captured image data to backend for emotion analysis
  // This would typically involve:
  // 1. Accessing user's camera
  // 2. Capturing a frame
  // 3. Sending to FastAPI backend for face mesh analysis
  // 4. Storing the image with metadata (timestamp, question ID, emotion)
}

// Progress logging functions
export async function logProgress(progressData: ProgressLog): Promise<void> {
  // TODO: Replace with actual API call to POST /log-progress
  console.log("Logging progress:", progressData)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  // TODO: Send progress data to backend for storage and analysis
}

// Profile management functions
export async function fetchProfile(userId: string): Promise<User> {
  // TODO: Replace with actual API call to GET /profile
  console.log("Fetching profile for user:", userId)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Return dummy profile data
  return {
    id: userId,
    name: "Alex",
    age: 8,
    gender: "other",
    email: "alex@example.com",
    avatar: "/placeholder.svg?height=64&width=64",
    progress: 65,
  }
}

// Backend API endpoints to implement:
// POST /emotion - Send face mesh data for emotion analysis
// GET /questions - Fetch questions dynamically based on difficulty
// POST /log-progress - Log question answers, timestamps, and emotions
// GET /profile - Fetch user profile data
// POST /auth/login - User authentication
// POST /auth/signup - User registration
