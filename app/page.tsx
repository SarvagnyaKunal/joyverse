"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { QuizProvider } from "@/context/quiz-context"
import LoginPage from "@/pages/login-page"
import SignupPage from "@/pages/signup-page"
import Home from "@/pages/home"
import Background from "@/components/background"

export default function App() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Background />
      <Router>
        <QuizProvider>
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/home" element={<Home />} />
            </Routes>
          </div>
        </QuizProvider>
      </Router>
    </div>
  )
}
