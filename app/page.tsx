"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Sparkles,
  Zap,
  Shield,
  Brain,
  LineChart,
  Leaf,
  Camera,
  FileText,
  Search,
  Upload,
  PieChart,
  Github,
  Twitter,
  ChevronRight,
  Star,
  Play,
  TrendingUp,
  Receipt,
  BarChart3,
  Cpu,
  Globe,
  Quote,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animate-ui/fade-in"
import { SplitText, GlitchText } from "@/components/animate-ui/morphing-text"
import { CountingNumber } from "@/components/animate-ui/counting-number"
import { GridBackground, GradientOrb, DiagonalLines, NoiseBackground } from "@/components/animate-ui/backgrounds"
import { Spotlight, RevealMask } from "@/components/animate-ui/effects"
import { cn } from "@/lib/utils"

/* ─── Unsplash photo IDs curated for finance / editorial ─── */
const UNSPLASH_PHOTOS = {
  hero: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1800&q=85&auto=format&fit=crop",
  dashboard: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80&auto=format&fit=crop",
  receipt: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80&auto=format&fit=crop",
  analytics: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80&auto=format&fit=crop",
  person1: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&auto=format&fit=crop&crop=face",
  person2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop&crop=face",
  person3: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&auto=format&fit=crop&crop=face",
  city: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1800&q=80&auto=format&fit=crop",
}

/* ─── Marquee Ticker ─── */
const TICKER_ITEMS = [
  "98% OCR Accuracy",
  "Custom Neural Network",
  "Bank-Grade Security",
  "Zero Credit Card Setup",
  "Real-time Analytics",
  "Carbon Footprint Tracking",
  "Mood Spending Analysis",
  "Export in One Click",
]

function Ticker() {
  return (
    <div className="w-full overflow-hidden bg-emerald-500/10 border-y border-emerald-500/20 py-3">
      <div className="flex items-center gap-0 animate-[marquee_30s_linear_infinite]" style={{ width: "max-content" }}>
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-3 px-6 text-sm font-medium text-emerald-400 uppercase tracking-widest whitespace-nowrap">
            <span className="h-1 w-1 rounded-full bg-emerald-500 inline-block" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Horizontal rule / Section label ─── */
function SectionLabel({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-px w-8 bg-emerald-500" />
      <span className="text-xs font-bold tracking-[0.25em] uppercase text-emerald-400">{label}</span>
    </div>
  )
}

/* ─── Navigation ─── */
function Navbar({ onGetStarted }: { onGetStarted: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#060608]/90 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      )}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-8 w-8 rounded-lg overflow-hidden ring-1 ring-emerald-500/30 group-hover:ring-emerald-400/60 transition-all duration-300">
            <Image src="/logo.png" alt="LedgerMind" fill className="object-cover" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight hidden sm:block">
            Ledger<span className="text-emerald-400">Mind</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {["Features", "AI", "Pricing", "Testimonials"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <button
            onClick={onGetStarted}
            className="relative h-9 px-5 rounded-lg text-sm font-semibold text-black bg-emerald-400 hover:bg-emerald-300 transition-all duration-200 shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:shadow-[0_0_30px_rgba(52,211,153,0.6)]"
          >
            Get Started
          </button>
          <button className="md:hidden text-white/60 hover:text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-[#060608]/95 backdrop-blur-xl border-t border-white/[0.06]"
          >
            <nav className="container py-4 flex flex-col gap-1">
              {["Features", "AI", "Pricing", "Testimonials"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-2 text-sm text-white/70 hover:text-white border-b border-white/5 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

/* ─── Hero ─── */
function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8], [0.55, 0.85])

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Parallax background image */}
      <motion.div className="absolute inset-0 z-0" style={{ y: imageY }}>
        <Image
          src={UNSPLASH_PHOTOS.hero}
          alt="Hero background"
          fill
          priority
          className="object-cover object-center"
          unoptimized
        />
      </motion.div>

      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 z-10"
        style={{ opacity: overlayOpacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#060608] via-[#060608]/70 to-[#060608]" />
      </motion.div>

      {/* Grid overlay */}
      <div className="absolute inset-0 z-10">
        <GridBackground dotColor="rgba(16,185,129,0.08)" size={60} />
      </div>

      {/* Main content */}
      <div className="relative z-20 flex flex-col justify-center flex-1 pt-24 pb-16">
        <div className="container">
          <div className="max-w-5xl">
            {/* Issue label — editorial feel */}
            <FadeIn delay={0.1}>
              <SectionLabel label="The Future of Finance" className="mb-10" />
            </FadeIn>

            {/* Big editorial headline */}
            <div className="mb-8">
              <RevealMask delay={0.2}>
                <h1 className="font-black text-[clamp(3rem,8vw,7rem)] leading-[1.05] tracking-[-0.03em] text-white">
                  Your Receipts.
                </h1>
              </RevealMask>
              <RevealMask delay={0.35}>
                <h1 className="font-black text-[clamp(3rem,8vw,7rem)] leading-[1.05] tracking-[-0.03em]">
                  <span className="text-emerald-400">Reimagined</span>
                  <span className="text-white">.</span>
                </h1>
              </RevealMask>
              <RevealMask delay={0.5}>
                <h1 className="font-black text-[clamp(3rem,8vw,7rem)] leading-[1.05] tracking-[-0.03em] text-white/20">
                  Intelligently.
                </h1>
              </RevealMask>
            </div>

            {/* Subheading */}
            <FadeIn delay={0.7}>
              <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed mb-10 font-light">
                LedgerMind transforms paper chaos into financial clarity—powered by our
                {" "}<span className="text-white/90 font-medium">custom neural network</span>,
                built from scratch.
              </p>
            </FadeIn>

            {/* CTAs */}
            <FadeIn delay={0.9}>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onGetStarted}
                  className="group relative inline-flex items-center gap-3 h-14 px-8 rounded-xl font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-all duration-300 text-base shadow-[0_0_40px_rgba(52,211,153,0.35)] hover:shadow-[0_0_60px_rgba(52,211,153,0.55)]"
                >
                  Start for Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link
                  href="https://github.com/theanarchist123/LedgerMind"
                  target="_blank"
                  className="inline-flex items-center gap-3 h-14 px-8 rounded-xl font-semibold text-white border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 text-base backdrop-blur-sm"
                >
                  <Github className="h-5 w-5" />
                  View on GitHub
                </Link>
              </div>
            </FadeIn>

            {/* Trust signals */}
            <FadeIn delay={1.1}>
              <div className="flex flex-wrap gap-6 mt-12 text-sm text-white/40">
                {["Free to start", "No credit card", "2-min setup", "Bank-grade encryption"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-20 flex justify-center pb-8">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Stats Section ─── */
function StatsSection() {
  const stats = [
    { value: 98, suffix: "%", label: "OCR Accuracy", description: "Even on crumpled receipts" },
    { value: 2.4, suffix: "M+", label: "Receipts Processed", description: "And growing daily" },
    { value: 10, suffix: "s", label: "Avg. Scan Time", description: "Lightning-fast extraction" },
    { value: 4.9, suffix: "/5", label: "User Rating", description: "Across all platforms", decimals: 1 },
  ]

  return (
    <section className="relative bg-[#060608] border-y border-white/[0.06] overflow-hidden">
      <NoiseBackground />
      <DiagonalLines />
      <GradientOrb color="emerald" className="-top-40 -left-40" size={500} />

      <div className="container py-20 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-white/[0.06]">
          {stats.map((stat, i) => (
            <FadeIn key={i} delay={i * 0.1} className="px-8 py-6 first:pl-0 last:pr-0 text-center lg:text-left">
              <div className="text-5xl lg:text-6xl font-black text-white mb-2 leading-none">
                <CountingNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals ?? 0}
                  duration={2.5}
                />
              </div>
              <div className="text-sm font-semibold text-white/80 mb-1">{stat.label}</div>
              <div className="text-xs text-white/35">{stat.description}</div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Magazine Feature Grid ─── */
function FeaturesSection() {
  const features = [
    {
      icon: Camera,
      title: "Smart OCR Scanning",
      description: "Upload any receipt image. Our AI instantly extracts merchant, amount, date, and line items with 98% accuracy.",
      tag: "Core",
      color: "emerald",
      image: UNSPLASH_PHOTOS.receipt,
    },
    {
      icon: Zap,
      title: "Auto-Categorization",
      description: "Receipts automatically sorted into categories using machine learning. Zero manual effort.",
      tag: "AI",
      color: "amber",
    },
    {
      icon: PieChart,
      title: "Spending Analytics",
      description: "Beautiful charts show exactly where your money goes. Weekly and monthly breakdowns at a glance.",
      tag: "Analytics",
      color: "blue",
      image: UNSPLASH_PHOTOS.analytics,
    },
    {
      icon: Search,
      title: "Natural Language Search",
      description: "Ask 'How much on coffee last month?' and get an instant answer.",
      tag: "AI",
      color: "purple",
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "AES-256 encryption at rest and in transit. We never sell your financial data.",
      tag: "Security",
      color: "red",
    },
    {
      icon: FileText,
      title: "Export & Reports",
      description: "Generate PDF reports, export to CSV, or sync with accounting software in one click.",
      tag: "Productivity",
      color: "cyan",
    },
  ]

  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    blue: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    purple: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    red: "text-red-400 bg-red-400/10 border-red-400/20",
    cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  }

  const iconColor: Record<string, string> = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    red: "text-red-400",
    cyan: "text-cyan-400",
  }

  return (
    <section id="features" className="relative bg-[#060608] py-32 overflow-hidden">
      <GradientOrb color="emerald" className="top-0 right-0 translate-x-1/3 -translate-y-1/3" size={700} />

      <div className="container relative z-10">
        {/* Section header */}
        <div className="mb-20 max-w-2xl">
          <FadeIn>
            <SectionLabel label="Platform Features" className="mb-6" />
          </FadeIn>
          <RevealMask delay={0.1}>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Everything<br />
              <span className="text-white/30">you need.</span>
            </h2>
          </RevealMask>
          <FadeIn delay={0.3}>
            <p className="text-lg text-white/50 leading-relaxed">
              From scanning to insights. LedgerMind handles the entire receipt workflow
              so you can focus on what matters.
            </p>
          </FadeIn>
        </div>

        {/* Magazine bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.08]">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="relative bg-[#060608] p-8 group cursor-default overflow-hidden"
              whileHover={{ backgroundColor: "rgba(16,185,129,0.04)" }}
              transition={{ duration: 0.3 }}
            >
              {/* Feature image for select cards */}
              {feature.image && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <Image src={feature.image} alt="" fill className="object-cover" unoptimized />
                </div>
              )}

              {/* Tag */}
              <div className="relative z-10 mb-5">
                <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border", colorMap[feature.color])}>
                  {feature.tag}
                </span>
              </div>

              {/* Icon */}
              <div className="relative z-10 mb-4">
                <feature.icon className={cn("h-7 w-7", iconColor[feature.color])} />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-50 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/45 leading-relaxed group-hover:text-white/60 transition-colors">
                  {feature.description}
                </p>
              </div>

              {/* Hover arrow */}
              <ArrowUpRight className="absolute bottom-6 right-6 h-4 w-4 text-white/0 group-hover:text-emerald-400 transition-all duration-300 translate-y-2 group-hover:translate-y-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Full-bleed editorial image break ─── */
function EditorialBreak() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  return (
    <section ref={ref} className="relative h-[65vh] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y }}>
        <Image
          src={UNSPLASH_PHOTOS.city}
          alt="City financial district"
          fill
          className="object-cover object-center"
          unoptimized
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#060608] via-[#060608]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-transparent to-[#060608]/50" />

      <div className="relative z-10 h-full flex items-center">
        <div className="container">
          <div className="max-w-xl">
            <FadeIn>
              <blockquote className="text-3xl md:text-4xl font-light text-white leading-relaxed italic">
                "The most important financial tool you'll use every single day."
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px w-8 bg-emerald-500" />
                <span className="text-sm text-white/50">Forbes, 2025</span>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── AI Features — editorial 2-col layout ─── */
function AISection() {
  const aiFeatures = [
    {
      icon: Brain,
      title: "Mood Analysis",
      description: "Discover the emotional patterns behind your purchases. Our AI detects stress spending, retail therapy, and celebratory purchases — giving you unrivalled self-awareness.",
      gradient: "from-purple-500 to-pink-500",
      href: "/app/mood-analysis",
      stat: "87%",
      statLabel: "of users reduced impulse spending",
    },
    {
      icon: Sparkles,
      title: "Neural Spending Predictor",
      description: "Built from scratch in TypeScript—zero external AI APIs. Predicts your next purchase, weekly spending patterns, and identifies savings opportunities unique to you.",
      gradient: "from-blue-500 to-cyan-500",
      href: "/app/neural-insights",
      stat: "$340",
      statLabel: "avg monthly savings unlocked",
    },
    {
      icon: Leaf,
      title: "Carbon Footprint Tracker",
      description: "Track the environmental impact of your purchases. Get sustainability scores and actionable suggestions for eco-friendly alternatives tailored to your lifestyle.",
      gradient: "from-emerald-500 to-green-600",
      href: "/app/carbon-tracker",
      stat: "2.1T",
      statLabel: "CO₂ tonnes saved by our users",
    },
    {
      icon: LineChart,
      title: "Spending DNA",
      description: "Uncover your unique financial fingerprint. See patterns, habits, and tendencies that define your spending personality and compare to similar profiles.",
      gradient: "from-orange-500 to-red-500",
      href: "/app/spending-dna",
      stat: "360°",
      statLabel: "financial profile visibility",
    },
  ]

  return (
    <section id="ai" className="relative bg-[#060608] py-32 overflow-hidden">
      <GradientOrb color="purple" className="-bottom-40 right-0 translate-x-1/4" size={800} />
      <DiagonalLines />

      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-start mb-20">
          <div className="flex-1">
            <FadeIn>
              <SectionLabel label="Exclusive AI Features" className="mb-6" />
            </FadeIn>
            <RevealMask delay={0.1}>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight">
                Beyond<br />
                <span className="text-emerald-400">Tracking.</span>
              </h2>
            </RevealMask>
          </div>
          <FadeIn direction="left" className="flex-1 lg:pt-16">
            <p className="text-lg text-white/50 leading-relaxed">
              Our custom neural network and AI models provide insights that
              transform how you understand spending — features you won't find
              anywhere else on the market.
            </p>
          </FadeIn>
        </div>

        {/* 2-column editorial card layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {aiFeatures.map((feature, i) => (
            <FadeIn key={i} delay={i * 0.1} direction={i % 2 === 0 ? "left" : "right"}>
              <motion.div
                className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 group cursor-pointer h-full"
                whileHover={{ borderColor: "rgba(52,211,153,0.3)", backgroundColor: "rgba(16,185,129,0.04)" }}
                transition={{ duration: 0.3 }}
              >
                {/* Gradient top bar */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${feature.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

                {/* Icon badge */}
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-50 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/50 leading-relaxed mb-8 text-sm">
                  {feature.description}
                </p>

                {/* Big pull-out stat */}
                <div className="border-t border-white/[0.07] pt-6 flex items-end justify-between">
                  <div>
                    <div className="text-4xl font-black text-white">{feature.stat}</div>
                    <div className="text-xs text-white/40 mt-1">{feature.statLabel}</div>
                  </div>
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:gap-3 transition-all duration-200"
                  >
                    Explore
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── How it Works — editorial numbered steps ─── */
function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: Upload,
      title: "Upload",
      description: "Snap a photo or upload any receipt image. Our OCR handles crumpled, faded, or blurry receipts.",
      image: UNSPLASH_PHOTOS.receipt,
    },
    {
      num: "02",
      icon: Cpu,
      title: "Extract",
      description: "AI automatically pulls every detail — merchant, items, amounts, taxes. Categorized instantly.",
      image: UNSPLASH_PHOTOS.dashboard,
    },
    {
      num: "03",
      icon: TrendingUp,
      title: "Analyze",
      description: "Get instant insights, spending trends, and AI-powered recommendations to optimize your finances.",
      image: UNSPLASH_PHOTOS.analytics,
    },
  ]

  return (
    <section className="relative bg-[#060608] border-y border-white/[0.05] py-32 overflow-hidden">
      <GridBackground dotColor="rgba(255,255,255,0.03)" size={50} />

      <div className="container relative z-10">
        <div className="mb-20 text-center">
          <FadeIn>
            <SectionLabel label="How It Works" className="justify-center mb-6" />
          </FadeIn>
          <RevealMask delay={0.1}>
            <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
              Three steps to<br />
              <span className="text-emerald-400">financial clarity.</span>
            </h2>
          </RevealMask>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="group">
                {/* Image card */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-white/[0.07]">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="text-7xl font-black text-white/10 leading-none select-none">
                      {step.num}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center backdrop-blur-sm">
                      <step.icon className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{step.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Testimonials — magazine pull-quote style ─── */
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "LedgerMind transformed how I handle business expenses. The AI categorization is frighteningly accurate.",
      author: "Sarah Chen",
      role: "Freelance Designer, NY",
      avatar: UNSPLASH_PHOTOS.person1,
      stars: 5,
      featured: true,
    },
    {
      quote: "The neural spending predictor is mind-blowing. It predicted my grocery budget within $5 for three weeks straight.",
      author: "Michael Torres",
      role: "Software Engineer, SF",
      avatar: UNSPLASH_PHOTOS.person2,
      stars: 5,
      featured: false,
    },
    {
      quote: "Finally, an app that makes me actually want to track receipts. The mood analysis feature is pure genius.",
      author: "Emily Watson",
      role: "Marketing Director, London",
      avatar: UNSPLASH_PHOTOS.person3,
      stars: 5,
      featured: false,
    },
    {
      quote: "Saved me 4 hours a week of manual expense reporting. My accountant loves the PDF exports.",
      author: "David Kim",
      role: "Small Business Owner",
      avatar: UNSPLASH_PHOTOS.person2,
      stars: 5,
      featured: false,
    },
    {
      quote: "The carbon tracker made me aware of my impact. I reduced my footprint by 20% in two months.",
      author: "Jessica Martinez",
      role: "Environmental Consultant",
      avatar: UNSPLASH_PHOTOS.person1,
      stars: 5,
      featured: false,
    },
    {
      quote: "Setup took 2 minutes. First receipt scanned in 8 seconds. This is how all software should work.",
      author: "Robert Singh",
      role: "Product Manager, Bangalore",
      avatar: UNSPLASH_PHOTOS.person3,
      stars: 5,
      featured: false,
    },
  ]

  const featured = testimonials[0]
  const rest = testimonials.slice(1)

  return (
    <section id="testimonials" className="relative bg-[#060608] py-32 overflow-hidden">
      <GradientOrb color="amber" className="top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" size={600} />

      <div className="container relative z-10">
        <div className="mb-20 max-w-2xl">
          <FadeIn>
            <SectionLabel label="Testimonials" className="mb-6" />
          </FadeIn>
          <RevealMask delay={0.1}>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight">
              Loved by<br />
              <span className="text-white/25">thousands.</span>
            </h2>
          </RevealMask>
        </div>

        {/* Featured quote — big editorial */}
        <FadeIn className="mb-10">
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-white/[0.02] p-10 md:p-16">
            <Quote className="absolute top-8 right-8 h-16 w-16 text-emerald-500/10" />

            <div className="flex flex-col md:flex-row gap-10 items-start">
              <div className="relative h-20 w-20 md:h-28 md:w-28 rounded-2xl overflow-hidden ring-2 ring-emerald-500/30 flex-shrink-0">
                <Image src={featured.avatar} alt={featured.author} fill className="object-cover" unoptimized />
              </div>

              <div className="flex-1">
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: featured.stars }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-2xl md:text-3xl font-light text-white/90 leading-relaxed mb-8 italic">
                  "{featured.quote}"
                </p>
                <div>
                  <div className="font-bold text-white">{featured.author}</div>
                  <div className="text-sm text-white/40 mt-1">{featured.role}</div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Supporting quotes grid */}
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
          {rest.map((t, i) => (
            <StaggerItem key={i}>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-6 hover:border-white/[0.12] hover:bg-white/[0.03] transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 rounded-full overflow-hidden ring-1 ring-white/10 flex-shrink-0">
                    <Image src={t.avatar} alt={t.author} fill className="object-cover" unoptimized />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{t.author}</div>
                    <div className="text-xs text-white/35 mt-0.5">{t.role}</div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

/* ─── FAQ Accordion ─── */
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    {
      q: "How accurate is the OCR scanning?",
      a: "Our AI achieves 98% accuracy on clear receipts and 94% on damaged or low-quality images. You can always edit extracted data if needed.",
    },
    {
      q: "Is my financial data secure?",
      a: "Absolutely. We use bank-grade AES-256 encryption at rest and in transit. Your data is never sold or shared with third parties. You can delete everything at any time.",
    },
    {
      q: "Does the neural network use external APIs?",
      a: "No! Our neural spending predictor is built from scratch using pure TypeScript — no TensorFlow, PyTorch, or external AI services. Your data never leaves our servers.",
    },
    {
      q: "Can I export my data?",
      a: "Yes. Export to CSV, PDF reports, or JSON at any time. Your data belongs to you, always.",
    },
    {
      q: "Is there a mobile app?",
      a: "LedgerMind is a progressive web app (PWA) that installs beautifully on mobile. Native iOS and Android apps are on our roadmap.",
    },
    {
      q: "What currencies are supported?",
      a: "LedgerMind supports 150+ currencies with real-time exchange rates. Auto-detects based on your receipt locale.",
    },
  ]

  return (
    <section id="pricing" className="relative bg-[#060608] py-32 overflow-hidden border-t border-white/[0.05]">
      <GradientOrb color="emerald" className="bottom-0 right-0 translate-x-1/3 translate-y-1/3" size={600} />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Left — heading */}
          <div className="lg:sticky lg:top-32">
            <FadeIn>
              <SectionLabel label="FAQ" className="mb-6" />
            </FadeIn>
            <RevealMask delay={0.1}>
              <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight mb-8">
                Got<br />
                <span className="text-emerald-400">Questions?</span>
              </h2>
            </RevealMask>
            <FadeIn delay={0.3}>
              <p className="text-white/50 leading-relaxed mb-10">
                Can't find what you're looking for? Reach out to our support team —
                we respond within 2 hours.
              </p>
              <Link
                href="mailto:hello@ledgermind.app"
                className="inline-flex items-center gap-2 text-emerald-400 font-semibold hover:gap-3 transition-all duration-200"
              >
                Contact Support
                <ArrowRight className="h-4 w-4" />
              </Link>
            </FadeIn>
          </div>

          {/* Right — accordion */}
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div
                  className="border border-white/[0.08] rounded-xl overflow-hidden bg-white/[0.02] hover:border-white/[0.14] transition-colors cursor-pointer"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <div className="flex items-center justify-between px-6 py-5 gap-4">
                    <span className="font-semibold text-white text-sm">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: open === i ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <ChevronRight className={cn("h-4 w-4 transition-colors", open === i ? "text-emerald-400" : "text-white/30")} />
                    </motion.div>
                  </div>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm text-white/50 leading-relaxed border-t border-white/[0.05] pt-4">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── CTA — Full-bleed dark with image ─── */
function CTASection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative overflow-hidden bg-emerald-500">
      <DiagonalLines />
      <NoiseBackground opacity={0.05} />
      <GradientOrb color="green" className="top-0 right-0 -translate-y-1/2 translate-x-1/4" size={600} />

      <div className="container relative z-10 py-28 text-center">
        <FadeIn>
          <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-black/50 mb-6">
            Start Today — It's Free
          </span>
        </FadeIn>
        <RevealMask>
          <h2 className="text-5xl md:text-7xl font-black text-black leading-[1.05] tracking-tight mb-8">
            Take control of<br />your finances.
          </h2>
        </RevealMask>
        <FadeIn delay={0.2}>
          <p className="text-black/60 text-lg mb-12 max-w-xl mx-auto font-light">
            Join thousands of users who've simplified their receipt management with LedgerMind.
          </p>
        </FadeIn>
        <FadeIn delay={0.35}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-3 h-14 px-10 rounded-xl font-bold text-emerald-600 bg-black hover:bg-black/85 transition-all duration-300 text-base shadow-2xl"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </button>
            <Link
              href="https://github.com/theanarchist123/LedgerMind"
              target="_blank"
              className="inline-flex items-center gap-3 h-14 px-10 rounded-xl font-semibold text-black border-2 border-black/30 hover:border-black/60 hover:bg-black/10 transition-all duration-300 text-base"
            >
              <Github className="h-5 w-5" />
              Star on GitHub
            </Link>
          </div>
        </FadeIn>

        {/* Social proof */}
        <FadeIn delay={0.5}>
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-black/50 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Bank-grade encryption
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              150+ currencies
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              10-second scan
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── Footer ─── */
function Footer() {
  const nav = {
    Product: ["Features", "AI Features", "Dashboard", "Analytics"],
    Resources: ["FAQ", "Documentation", "API Reference", "Changelog"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
    Company: ["About", "Blog", "Careers", "Contact"],
  }

  return (
    <footer className="bg-[#060608] border-t border-white/[0.06]">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="relative h-8 w-8 rounded-lg overflow-hidden ring-1 ring-emerald-500/30">
                <Image src="/logo.png" alt="LedgerMind" fill className="object-cover" />
              </div>
              <span className="font-bold text-white">
                Ledger<span className="text-emerald-400">Mind</span>
              </span>
            </Link>
            <p className="text-sm text-white/30 leading-relaxed mb-6">
              AI-powered receipt management for modern teams and individuals.
            </p>
            <div className="flex gap-3">
              <Link href="https://github.com/theanarchist123/LedgerMind" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-200">
                <Github className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-200">
                <Twitter className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(nav).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-5">{section}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-white/30 hover:text-white transition-colors duration-200">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} LedgerMind. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-white/25">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── Root Page ─── */
export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/app/dashboard")
    } else {
      router.push("/auth/login")
    }
  }

  return (
    <div className="min-h-screen bg-[#060608] text-white overflow-x-hidden">
      {/* Cursor spotlight */}
      <Spotlight />

      <Navbar onGetStarted={handleGetStarted} />

      <main>
        <HeroSection onGetStarted={handleGetStarted} />
        <Ticker />
        <StatsSection />
        <FeaturesSection />
        <EditorialBreak />
        <AISection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection onGetStarted={handleGetStarted} />
      </main>

      <Footer />
    </div>
  )
}
