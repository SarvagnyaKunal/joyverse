"use client"

import { useEffect, useState } from "react"

export default function Background() {
  const [colorIndex, setColorIndex] = useState(0)

  const gradients = [
    "from-pink-200 via-purple-200 to-blue-200",
    "from-blue-200 via-green-200 to-teal-200",
    "from-yellow-200 via-orange-200 to-pink-200",
    "from-green-200 via-blue-200 to-purple-200",
    "from-purple-200 via-pink-200 to-rose-200",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % gradients.length)
    }, 8000) // Change every 8 seconds for slow, calm transitions

    return () => clearInterval(interval)
  }, [gradients.length])

  return (
    <div className="fixed inset-0 -z-10">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradients[colorIndex]} transition-all duration-[4000ms] ease-in-out`}
      />
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px]" />
      </div>
    </div>
  )
}
