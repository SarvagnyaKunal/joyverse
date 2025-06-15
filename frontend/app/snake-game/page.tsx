"use client"

import { SnakeGame } from "@/components/snake-game/snake-game"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SnakeGamePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <Navbar />
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-bounce">
          <Star className="w-6 h-6 text-yellow-400 fill-current" />
        </div>
        <div className="absolute top-32 right-20 animate-pulse">
          <Sparkles className="w-5 h-5 text-pink-400" />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce delay-1000">
          <Star className="w-5 h-5 text-blue-400 fill-current" />
        </div>
        <div className="absolute top-40 right-40 animate-pulse delay-500">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">        {/* Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </div>

        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 animate-fade-in">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              🐍 Word Snake Game
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 animate-fade-in-delay">
            Guide the snake to collect letters and spell words!
          </p>
        </div>        {/* Game Container */}
        <div className="flex justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-4 border-purple-200">
            <SnakeGame />
          </div>
        </div>
      </div>
    </div>
  )
}
