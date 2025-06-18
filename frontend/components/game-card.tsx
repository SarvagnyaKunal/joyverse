"use client"

import { Button } from "@/components/ui/button"
import { Play, Star } from "lucide-react"
import { useRouter } from "next/navigation"

interface Game {
  id: string
  name: string
  description: string
  difficulty: string
  category: string
  icon: string
  color: string
  route: string
}

interface GameCardProps {
  game: Game
}

export default function GameCard({ game }: GameCardProps) {
  const router = useRouter()

  const handlePlayNow = () => {
    // Use Next.js router for navigation
    router.push(game.route)
  }

  return (
    <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-4 border-transparent hover:border-purple-200 transform hover:scale-105">
      {/* Gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
      />

      <div className="relative p-8">
        {/* Game Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce-gentle">{game.icon}</div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
              {game.category}
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
              {game.difficulty}
            </span>
          </div>
        </div>

        {/* Game Info */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors duration-300">
            {game.name}
          </h3>
          <p className="text-gray-600 leading-relaxed">{game.description}</p>
        </div>

        {/* Rating Stars (decorative) */}
        <div className="flex justify-center mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
          ))}
        </div>

        {/* Play Button */}
        <div className="text-center">
          <Button
            onClick={handlePlayNow}
            className={`bg-gradient-to-r ${game.color} hover:shadow-lg text-white font-bold px-8 py-4 rounded-full text-lg transition-all duration-300 transform hover:scale-110 group-hover:animate-pulse`}
          >
            <Play className="w-6 h-6 mr-3 fill-current" />
            Play Now!
          </Button>
        </div>
      </div>

      {/* Decorative corner element */}
      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
        <div className={`w-12 h-12 bg-gradient-to-br ${game.color} rounded-full`} />
      </div>
    </div>
  )
}
