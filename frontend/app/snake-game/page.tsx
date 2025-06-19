"use client"

import { SnakeGame } from "@/components/snake-game/snake-game"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SnakeGamePage() {
  const router = useRouter()

  return (    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-30 blur-lg animate-bounce"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-15 blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-25 blur-xl animate-bounce delay-500"></div>
        
        {/* Floating decorative icons */}
        <div className="absolute top-20 left-10 animate-bounce">
          <Star className="w-6 h-6 text-yellow-400 fill-current opacity-60" />
        </div>
        <div className="absolute top-32 right-20 animate-pulse">
          <Sparkles className="w-5 h-5 text-pink-400 opacity-60" />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce delay-1000">
          <Star className="w-5 h-5 text-blue-400 fill-current opacity-60" />
        </div>
        <div className="absolute top-40 right-40 animate-pulse delay-500">
          <Sparkles className="w-6 h-6 text-purple-400 opacity-60" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">        
        {/* Back Button */}        
        <div className="mb-6">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </div>        {/* Game Title */}
       {/* Game Container */}
        <div className="flex justify-center">
          <div className="relative group">            {/* Glass card container */}
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
              {/* Inner glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl"></div>
              
              {/* Static border glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 opacity-20 blur-sm -z-10"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <SnakeGame />
              </div>
            </div>
            
            {/* Static outer glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl -z-20 opacity-30"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
