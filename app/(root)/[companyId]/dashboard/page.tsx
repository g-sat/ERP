"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import {
  Flame,
  Heart,
  Loader2,
  Rocket,
  Sparkles,
  Star,
  Sun,
  Target,
  Zap,
} from "lucide-react"

interface Quote {
  _id: string
  content: string
  author: string
  tags: string[]
  authorSlug: string
  length: number
  dateAdded?: string
  dateModified?: string
}

interface QuoteData {
  quote: string
  author: string
  color: string
  icon: typeof Target
}

const colors = [
  "from-purple-500 via-pink-500 to-red-500",
  "from-blue-500 via-cyan-500 to-teal-500",
  "from-orange-500 via-yellow-500 to-green-500",
  "from-indigo-500 via-purple-500 to-pink-500",
  "from-emerald-500 via-green-500 to-lime-500",
]

const icons = [Target, Heart, Zap, Star, Rocket]

// Fallback quotes in case API fails
const fallbackQuotes: QuoteData[] = [
  {
    quote:
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    color: colors[0],
    icon: icons[0],
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    color: colors[1],
    icon: icons[1],
  },
  {
    quote: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    color: colors[2],
    icon: icons[2],
  },
  {
    quote:
      "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    color: colors[3],
    icon: icons[3],
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    color: colors[4],
    icon: icons[4],
  },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [quotes, setQuotes] = useState<QuoteData[]>(fallbackQuotes)
  const [currentQuote, setCurrentQuote] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch quotes from API
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch 5 random quotes
        const response = await fetch(`/api/quotes`)

        if (!response.ok) {
          throw new Error("Failed to fetch quotes")
        }

        const data: Quote[] = await response.json()

        // If API returns empty array or no data, use fallback quotes
        if (!data || data.length === 0) {
          setQuotes(fallbackQuotes)
          return
        }

        // Transform API quotes to our format
        const transformedQuotes: QuoteData[] = data.map((quote, index) => ({
          quote: quote.content || "",
          author: quote.author || "Unknown",
          color: colors[index % colors.length],
          icon: icons[index % icons.length],
        }))

        setQuotes(transformedQuotes)
      } catch (err) {
        console.error("Error fetching quotes:", err)
        // Use fallback quotes if API fails
        setQuotes(fallbackQuotes)
        setError(null) // Don't show error, just use fallback
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuotes()
  }, [])

  // Auto-rotate quotes
  useEffect(() => {
    if (quotes.length === 0) return

    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [quotes.length])

  const currentQuoteData = quotes[currentQuote] || {
    quote: "Loading...",
    author: "",
    color: colors[0],
    icon: Target,
  }
  const QuoteIcon = currentQuoteData.icon

  const [greeting, setGreeting] = useState({
    text: "",
    icon: "🌅",
    message: "",
    energy: "high",
  })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      // Morning - High Energy
      setGreeting({
        text: "Good Morning",
        icon: "🌅",
        message:
          "Rise and shine! It's time to make amazing things happen! 💪✨",
        energy: "high",
      })
    } else if (hour < 18) {
      // Afternoon - Focused Energy
      setGreeting({
        text: "Good Afternoon",
        icon: "☀️",
        message: "Keep pushing forward! Your momentum is building! 🚀🔥",
        energy: "medium",
      })
    } else {
      // Evening - Reflective & Calm
      setGreeting({
        text: "Good Evening",
        icon: "🌙",
        message:
          "You've accomplished so much today! Time to reflect and recharge. ✨💫",
        energy: "low",
      })
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="animate-float absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <Star
              className={`h-4 w-4 text-yellow-400 opacity-30 ${
                i % 2 === 0 ? "animate-pulse" : "animate-spin"
              }`}
              style={{
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute -top-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 blur-3xl" />
      <div
        className="absolute -right-40 -bottom-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 blur-3xl"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 opacity-10 blur-3xl"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative container mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Welcome Header with Animation */}
        <div className="animate-fade-in-up mb-8 text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-white/90 via-white/80 to-white/90 px-8 py-4 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50">
            <div className="relative">
              <Sun
                className="h-8 w-8 animate-spin text-yellow-500"
                style={{ animationDuration: "3s" }}
              />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 animate-pulse text-pink-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-purple-600">
                {greeting.icon} {greeting.text}
              </p>
              <h1 className="animate-gradient bg-300% bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
                Welcome back, {user?.userName || "Champion"}!
                {greeting.energy === "high" && " 🚀"}
                {greeting.energy === "medium" && " 🔥"}
                {greeting.energy === "low" && " ✨"}
              </h1>
            </div>
            {greeting.energy === "high" && (
              <Flame
                className="h-8 w-8 animate-bounce text-orange-500"
                style={{ animationDelay: "0.5s" }}
              />
            )}
            {greeting.energy === "medium" && (
              <Zap
                className="h-8 w-8 animate-pulse text-yellow-500"
                style={{ animationDelay: "0.5s" }}
              />
            )}
            {greeting.energy === "low" && (
              <Star
                className="h-8 w-8 animate-spin text-purple-500"
                style={{ animationDuration: "3s", animationDelay: "0.5s" }}
              />
            )}
          </div>
          <p
            className="animate-fade-in-up mt-4 text-lg font-medium text-gray-600"
            style={{ animationDelay: "0.2s" }}
          >
            {greeting.message}
          </p>
        </div>

        {/* Quote Section without Card */}
        <div
          className="animate-fade-in-up mb-8 text-center"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="relative mx-auto max-w-4xl">
            {/* Quote Icon with Animation */}
            <div className="mb-6 flex justify-center">
              <div
                className={`relative rounded-full bg-gradient-to-br ${currentQuoteData.color} p-4 shadow-2xl transition-all duration-500 hover:scale-125 hover:rotate-12`}
              >
                {/* Pulsing ring */}
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentQuoteData.color} animate-ping opacity-30`}
                />
                <QuoteIcon
                  className="relative h-10 w-10 animate-bounce text-white sm:h-12 sm:w-12"
                  style={{ animationDuration: "2s" }}
                />
                {/* Sparkles around icon */}
                <Sparkles className="absolute -top-2 -right-2 h-4 w-4 animate-pulse text-yellow-400" />
                <Star
                  className="absolute -bottom-1 -left-1 h-3 w-3 animate-spin text-pink-400"
                  style={{ animationDuration: "3s" }}
                />
              </div>
            </div>

            {/* Quote Text */}
            <div className="mb-6">
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  <p className="text-xl leading-relaxed font-semibold text-gray-600 sm:text-2xl">
                    Loading inspiring quotes...
                  </p>
                </div>
              ) : error ? (
                <p className="text-lg text-red-500">{error}</p>
              ) : (
                <p className="animate-fade-in text-xl leading-relaxed font-bold text-gray-800 transition-all duration-500 sm:text-2xl">
                  <span className="animate-wiggle inline-block">💫</span>
                  <span className="mx-2">
                    &ldquo;{currentQuoteData.quote}&rdquo;
                  </span>
                  <span
                    className="animate-wiggle inline-block"
                    style={{ animationDelay: "0.5s" }}
                  >
                    ✨
                  </span>
                </p>
              )}
            </div>

            {/* Author */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 sm:text-base">
                — {currentQuoteData.author}
              </p>
            </div>

            {/* Quote Indicators */}
            {!isLoading && quotes.length > 0 && (
              <div className="mb-6 flex justify-center gap-2">
                {quotes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuote(index)
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentQuote
                        ? `w-8 bg-gradient-to-r ${currentQuoteData.color}`
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Quote ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Refresh Button */}
            {!isLoading && quotes.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={async () => {
                    setIsLoading(true)
                    try {
                      const response = await fetch(`/api/quotes`)
                      if (response.ok) {
                        const data: Quote[] = await response.json()

                        // If API returns empty array or no data, use fallback quotes
                        if (!data || data.length === 0) {
                          setQuotes(fallbackQuotes)
                          setCurrentQuote(0)
                          return
                        }

                        const transformedQuotes: QuoteData[] = data.map(
                          (quote, index) => ({
                            quote: quote.content || "",
                            author: quote.author || "Unknown",
                            color: colors[index % colors.length],
                            icon: icons[index % icons.length],
                          })
                        )
                        setQuotes(transformedQuotes)
                        setCurrentQuote(0)
                      }
                    } catch (err) {
                      console.error("Error refreshing quotes:", err)
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  className="group relative overflow-hidden rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 hover:shadow-purple-500/50"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="animate-spin group-hover:animate-bounce">
                      🔄
                    </span>
                    Get New Quotes
                    <Rocket className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-[-100%]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Motivational Footer with Energy */}
        <div
          className="animate-fade-in-up text-center"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 px-6 py-3 backdrop-blur-sm">
            <Zap className="h-5 w-5 animate-pulse text-yellow-500" />
            <p className="text-base font-bold text-gray-700">
              You&apos;ve got this! Keep that energy flowing! 🔥
            </p>
            <Star
              className="h-5 w-5 animate-spin text-purple-500"
              style={{ animationDuration: "3s" }}
            />
          </div>
        </div>
      </div>

      {/* Add CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-10deg) scale(1.2);
          }
          75% {
            transform: rotate(10deg) scale(1.2);
          }
        }
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out both;
        }
        .animate-wiggle {
          animation: wiggle 2s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .bg-300% {
          background-size: 300% 300%;
        }
      `}</style>
    </div>
  )
}
