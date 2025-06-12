"use client"

import { Button } from "@/components/ui/button"
import { Gamepad2, User, UserPlus } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b-4 border-gradient-to-r from-purple-400 to-pink-400">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LearnPlay
              </h1>
              <p className="text-sm text-gray-500 hidden md:block">Fun Learning Games</p>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 font-semibold px-6 py-2 rounded-full transition-all duration-300 hover:scale-105"
            >
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Login</span>
            </Button>

            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg transition-all duration-300 hover:scale-105">
              <UserPlus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sign Up</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
