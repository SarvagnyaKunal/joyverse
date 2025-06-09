"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuiz } from "@/context/quiz-context"
import { handleSignup } from "@/utils/api"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setIsAuthenticated } = useQuiz()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.age.trim()) newErrors.age = "Age is required"
    else if (isNaN(Number(formData.age)) || Number(formData.age) < 5 || Number(formData.age) > 18) {
      newErrors.age = "Age must be between 5 and 18"
    }
    if (!formData.gender) newErrors.gender = "Gender is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email"
    if (!formData.password.trim()) newErrors.password = "Password is required"
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const userData = await handleSignup(formData)
      setUser(userData)
      setIsAuthenticated(true)
      navigate("/home")
    } catch (error) {
      console.error("Signup failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center">
            <span className="text-2xl">🌟</span>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">Join the Fun!</CardTitle>
          <CardDescription className="text-lg text-gray-600">Create your account to start learning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-semibold text-gray-700">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                className="h-14 text-lg rounded-xl border-2 focus:border-blue-400 transition-colors"
                placeholder="Enter your name"
              />
              {errors.name && <p className="text-red-500 text-sm font-medium">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-lg font-semibold text-gray-700">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateFormData("age", e.target.value)}
                  className="h-14 text-lg rounded-xl border-2 focus:border-blue-400 transition-colors"
                  placeholder="Age"
                />
                {errors.age && <p className="text-red-500 text-sm font-medium">{errors.age}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-lg font-semibold text-gray-700">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                  <SelectTrigger className="h-14 text-lg rounded-xl border-2 focus:border-blue-400">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Boy</SelectItem>
                    <SelectItem value="female">Girl</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-red-500 text-sm font-medium">{errors.gender}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="h-14 text-lg rounded-xl border-2 focus:border-blue-400 transition-colors"
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-500 text-sm font-medium">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg font-semibold text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                className="h-14 text-lg rounded-xl border-2 focus:border-blue-400 transition-colors"
                placeholder="Create a password"
              />
              {errors.password && <p className="text-red-500 text-sm font-medium">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                Login here!
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
