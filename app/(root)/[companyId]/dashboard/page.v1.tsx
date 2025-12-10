"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import {
  Coffee,
  Heart,
  Rocket,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

const quotes = [
  {
    english:
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    filipino:
      "Ang tagumpay ay hindi panghuli, ang pagkabigo ay hindi nakamamatay: ang lakas ng loob na magpatuloy ang mahalaga.",
    hindi:
      "सफलता अंतिम नहीं है, असफलता घातक नहीं है: निरंतर जारी रखने का साहस ही मायने रखता है।",
    malayalam:
      "വിജയം അവസാനമല്ല, പരാജയം മാരകമല്ല: തുടരുവാനുള്ള ധൈര്യമാണ് പ്രധാനം.",
    tamil:
      "வெற்றி இறுதியல்ல, தோல்வி மரணமல்ல: தொடர்ந்து செல்லும் தைரியம்தான் முக்கியம்.",
    arabic:
      "النجاح ليس نهائياً، والفشل ليس قاتلاً: الشجاعة للمتابعة هي المهمة.",
    author: "Winston Churchill",
    color: "from-purple-500 via-pink-500 to-red-500",
    icon: Target,
  },
  {
    english: "The only way to do great work is to love what you do.",
    filipino:
      "Ang tanging paraan upang gumawa ng mahusay na gawain ay mahalin ang iyong ginagawa.",
    hindi:
      "महान कार्य करने का एकमात्र तरीका यह है कि आप जो करते हैं उससे प्यार करें।",
    malayalam:
      "മഹത്തായ ജോലി ചെയ്യാനുള്ള ഏക വഴി നിങ്ങൾ ചെയ്യുന്നതിൽ സ്നേഹിക്കുകയാണ്.",
    tamil: "சிறந்த வேலை செய்ய ஒரே வழி, நீங்கள் செய்வதை நேசிப்பதுதான்.",
    arabic: "الطريقة الوحيدة للقيام بعمل عظيم هي أن تحب ما تفعله.",
    author: "Steve Jobs",
    color: "from-blue-500 via-cyan-500 to-teal-500",
    icon: Heart,
  },
  {
    english: "Innovation distinguishes between a leader and a follower.",
    filipino:
      "Ang inobasyon ay nagpapakilala sa pagitan ng isang lider at isang tagasunod.",
    hindi: "नवाचार एक नेता और अनुयायी के बीच अंतर करता है।",
    malayalam: "പുതുമയാണ് ഒരു നേതാവിനും അനുയായിക്കും ഇടയിലുള്ള വ്യത്യാസം.",
    tamil:
      "புதுமை ஒரு தலைவர் மற்றும் பின்பற்றுபவருக்கிடையே வேறுபாட்டை ஏற்படுத்துகிறது.",
    arabic: "الابتكار يميز بين القائد والتابع.",
    author: "Steve Jobs",
    color: "from-orange-500 via-yellow-500 to-green-500",
    icon: Zap,
  },
  {
    english:
      "The future belongs to those who believe in the beauty of their dreams.",
    filipino:
      "Ang hinaharap ay sa mga naniniwala sa kagandahan ng kanilang mga pangarap.",
    hindi: "भविष्य उनका है जो अपने सपनों की सुंदरता में विश्वास करते हैं।",
    malayalam:
      "ഭാവിയാണ് അവരുടെ സ്വപ്നങ്ങളുടെ സൗന്ദര്യത്തിൽ വിശ്വസിക്കുന്നവർക്ക്.",
    tamil:
      "எதிர்காலம் தங்கள் கனவுகளின் அழகில் நம்பிக்கை கொண்டவர்களுக்கு சொந்தமானது.",
    arabic: "المستقبل لمن يؤمنون بجمال أحلامهم.",
    author: "Eleanor Roosevelt",
    color: "from-indigo-500 via-purple-500 to-pink-500",
    icon: Star,
  },
  {
    english: "Don't watch the clock; do what it does. Keep going.",
    filipino:
      "Huwag panoorin ang orasan; gawin kung ano ang ginagawa nito. Magpatuloy.",
    hindi: "घड़ी को मत देखो; वही करो जो वह करती है। चलते रहो।",
    malayalam: "ക്ലോക്ക് കാണരുത്; അത് ചെയ്യുന്നത് ചെയ്യുക. തുടരുക.",
    tamil:
      "கடிகாரத்தைப் பார்க்காதீர்கள்; அது செய்வதைச் செய்யுங்கள். தொடருங்கள்.",
    arabic: "لا تشاهد الساعة؛ افعل ما تفعله. استمر.",
    author: "Sam Levenson",
    color: "from-emerald-500 via-green-500 to-lime-500",
    icon: Rocket,
  },
]

const activities = [
  {
    label: "Tasks Completed",
    value: "42",
    icon: Target,
    color: "text-blue-500",
  },
  {
    label: "This Week",
    value: "+15%",
    icon: TrendingUp,
    color: "text-green-500",
  },
  {
    label: "Active Projects",
    value: "8",
    icon: Sparkles,
    color: "text-purple-500",
  },
  { label: "Energy Level", value: "High", icon: Zap, color: "text-yellow-500" },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [currentQuote, setCurrentQuote] = useState(0)
  const [selectedLanguage, setSelectedLanguage] = useState<
    "english" | "filipino" | "hindi" | "malayalam" | "tamil" | "arabic"
  >("english")

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const languages = [
    { key: "english" as const, label: "English", flag: "🇬🇧" },
    { key: "filipino" as const, label: "Filipino", flag: "🇵🇭" },
    { key: "hindi" as const, label: "हिंदी", flag: "🇮🇳" },
    { key: "malayalam" as const, label: "മലയാളം", flag: "🇮🇳" },
    { key: "tamil" as const, label: "தமிழ்", flag: "🇮🇳" },
    { key: "arabic" as const, label: "العربية", flag: "🇸🇦" },
  ]

  const currentQuoteData = quotes[currentQuote]
  const QuoteIcon = currentQuoteData.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Welcome Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-6 py-3 shadow-lg backdrop-blur-sm">
            <Coffee className="h-6 w-6 text-orange-500" />
            <h1 className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Welcome back, {user?.userName || "User"}! 👋
            </h1>
          </div>
        </div>

        {/* Activity Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 bg-white/70 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <CardContent className="relative p-4 sm:p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <Icon
                      className={`h-5 w-5 ${activity.color} sm:h-6 sm:w-6`}
                    />
                    <span className="text-xs text-gray-500">
                      {activity.label}
                    </span>
                  </div>
                  <p
                    className={`text-2xl font-bold ${activity.color} sm:text-3xl`}
                  >
                    {activity.value}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quote Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-2xl">
          <div className={`bg-gradient-to-br ${currentQuoteData.color} p-1`}>
            <div className="relative overflow-hidden rounded-lg bg-white/95 p-6 backdrop-blur-sm sm:p-8">
              {/* Language Selector */}
              <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.key}
                    onClick={() => setSelectedLanguage(lang.key)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      selectedLanguage === lang.key
                        ? "scale-110 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* Quote Icon */}
              <div className="mb-6 flex justify-center">
                <div
                  className={`rounded-full bg-gradient-to-br ${currentQuoteData.color} p-4`}
                >
                  <QuoteIcon className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                </div>
              </div>

              {/* Quote Text */}
              <div className="mb-6 text-center">
                <p
                  className="text-xl leading-relaxed font-semibold text-gray-800 sm:text-2xl"
                  dir={selectedLanguage === "arabic" ? "rtl" : "ltr"}
                >
                  &ldquo;{currentQuoteData[selectedLanguage]}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 sm:text-base">
                  — {currentQuoteData.author}
                </p>
              </div>

              {/* Quote Indicators */}
              <div className="mt-6 flex justify-center gap-2">
                {quotes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuote(index)
                      setSelectedLanguage("english")
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
            </div>
          </div>
        </Card>

        {/* Motivational Footer */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">
            Have a productive day! ✨
          </p>
        </div>
      </div>
    </div>
  )
}
