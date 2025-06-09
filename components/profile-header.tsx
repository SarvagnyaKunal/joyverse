"use client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, User, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useQuiz } from "@/context/quiz-context"
import { useNavigate } from "react-router-dom"

export default function ProfileHeader() {
  const { user, setUser, setIsAuthenticated, score } = useQuiz()
  const navigate = useNavigate()

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    navigate("/login")
  }

  const handleSwitchProfile = () => {
    // TODO: Implement profile switching functionality
    console.log("Switch profile clicked - to be implemented")
  }

  if (!user) return null

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-800">Hi, {user.name}! 👋</h1>
                <span className="text-lg text-gray-600">Age {user.age}</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Progress:</span>
                  <Progress value={user.progress} className="w-32 h-3" />
                  <span className="text-sm font-bold text-purple-600">{user.progress}%</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Score:</span>
                  <span className="text-lg font-bold text-green-600">{score}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 px-4 rounded-xl border-2 hover:border-purple-400 transition-colors"
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem onClick={handleSwitchProfile} className="text-base py-3">
                  <User className="h-4 w-4 mr-2" />
                  Switch Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-base py-3 text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
