"use client"

import { Button } from "@/components/ui/button"

interface OptionButtonProps {
  option: string
  index: number
  isSelected: boolean
  isCorrect: boolean
  isIncorrect: boolean
  onClick: () => void
  disabled: boolean
}

export default function OptionButton({
  option,
  index,
  isSelected,
  isCorrect,
  isIncorrect,
  onClick,
  disabled,
}: OptionButtonProps) {
  const getButtonStyles = () => {
    if (isCorrect) {
      return "bg-green-500 hover:bg-green-500 text-white border-green-500 shadow-lg shadow-green-200"
    }
    if (isIncorrect) {
      return "bg-red-500 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-200"
    }
    if (isSelected) {
      return "bg-purple-500 hover:bg-purple-500 text-white border-purple-500"
    }
    return "bg-white hover:bg-purple-50 text-gray-800 border-gray-200 hover:border-purple-300"
  }

  const getIcon = () => {
    if (isCorrect) return "✅"
    if (isIncorrect) return "❌"
    return String.fromCharCode(65 + index) // A, B, C, D
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`
        h-20 p-6 text-left justify-start rounded-2xl border-2 transition-all duration-300 
        transform hover:scale-105 active:scale-95 font-semibold text-lg
        ${getButtonStyles()}
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
      `}
      variant="outline"
    >
      <div className="flex items-center space-x-4 w-full">
        <div
          className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
          ${
            isCorrect
              ? "bg-white text-green-500"
              : isIncorrect
                ? "bg-white text-red-500"
                : isSelected
                  ? "bg-white text-purple-500"
                  : "bg-purple-100 text-purple-600"
          }
        `}
        >
          {getIcon()}
        </div>
        <span className="flex-1 leading-relaxed">{option}</span>
      </div>
    </Button>
  )
}
