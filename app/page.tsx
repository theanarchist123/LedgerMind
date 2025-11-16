"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Receipt, Zap, Shield, TrendingUp, Brain, FileCheck, Sparkles, Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Marquee } from "@/components/ui/marquee"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TextPlugin } from "gsap/TextPlugin"

gsap.registerPlugin(ScrollTrigger, TextPlugin)

/**
 * Landing Page - Stunning animated home page with GSAP
 */
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animations
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } })

      // Logo animation - scale bounce with rotation
      tl.from(logoRef.current, {
        scale: 0,
        rotation: -180,
        duration: 1,
        ease: "back.out(1.7)",
      })

      // Title animation - split text effect
      tl.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 0.8,
        ease: "power4.out",
      }, "-=0.3")

      // Subtitle typewriter effect
      tl.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.6,
      }, "-=0.3")

      // Buttons stagger animation
      tl.from(buttonsRef.current?.children || [], {
        opacity: 0,
        y: 30,
        stagger: 0.2,
        duration: 0.5,
      }, "-=0.3")

      // Floating animation for logo
      gsap.to(logoRef.current, {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })

      // Features scroll animations
      gsap.utils.toArray<HTMLElement>(".feature-card").forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=100",
            toggleActions: "play none none reverse",
          },
          y: 100,
          opacity: 0,
          rotation: index % 2 === 0 ? 5 : -5,
          duration: 0.8,
          ease: "power3.out",
        })

        // Hover effect
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            scale: 1.05,
            y: -10,
            duration: 0.3,
            ease: "power2.out",
          })
        })

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          })
        })
      })

      // Stats counter animation
      gsap.utils.toArray<HTMLElement>(".stat-number").forEach((stat) => {
        const target = stat.getAttribute("data-target")
        if (target) {
          gsap.from(stat, {
            scrollTrigger: {
              trigger: stat,
              start: "top bottom-=50",
            },
            textContent: 0,
            duration: 2,
            snap: { textContent: 1 },
            ease: "power1.inOut",
          })
        }
      })

      // Pricing cards animation
      gsap.utils.toArray<HTMLElement>(".pricing-card").forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top bottom-=100",
          },
          y: 100,
          opacity: 0,
          duration: 0.6,
          delay: index * 0.15,
          ease: "back.out(1.2)",
        })
      })

      // Parallax background effect
      gsap.to(".parallax-bg", {
        scrollTrigger: {
          trigger: ".parallax-bg",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: 200,
        ease: "none",
      })

    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="parallax-bg fixed inset-0 -z-10 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10" />
      </div>

      {/* Hero Section - Unique Split Layout */}
      <section ref={heroRef} className="relative min-h-screen flex items-center px-4 py-20 overflow-hidden">
        {/* Animated mesh background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-green-500/30 rounded-full blur-3xl animate-pulse opacity-20" />
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-emerald-500/30 rounded-full blur-3xl animate-pulse opacity-20" style={{animationDelay: '1s'}} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-green-400/30 rounded-full blur-3xl animate-pulse opacity-20" style={{animationDelay: '2s'}} />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Column - Content */}
            <div className="space-y-10">
              {/* Logo Badge */}
              <div ref={logoRef} className="inline-block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl blur-2xl opacity-40" />
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 shadow-2xl">
                    <Receipt className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>

              {/* Title with proper line height */}
              <div className="space-y-6">
                <h1 
                  ref={titleRef}
                  className="text-6xl md:text-7xl xl:text-8xl font-black tracking-tight leading-none pb-4"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    display: 'inline-block',
                  }}
                >
                  LedgerMind
                </h1>
                
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/50 px-4 py-2 text-sm font-medium">
                    AI-Powered
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/50 px-4 py-2 text-sm font-medium">
                    98% Accurate
                  </Badge>
                </div>
                
                <p 
                  ref={subtitleRef}
                  className="text-2xl md:text-3xl text-muted-foreground leading-relaxed max-w-2xl"
                >
                  Transform your receipt chaos into organized insights.{" "}
                  <span className="text-foreground font-semibold">Automatically extract, categorize, and analyze</span>{" "}
                  every expense with AI precision.
                </p>
              </div>

              {/* CTA Buttons */}
              <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-5">
                <Button asChild size="lg" className="gap-3 text-lg px-10 py-7 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 hover:scale-105 transition-all duration-300 rounded-2xl">
                  <Link href="/auth/login">
                    Start Free Trial
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-3 text-lg px-10 py-7 border-2 border-muted-foreground/20 hover:border-green-500/50 hover:bg-green-500/10 rounded-2xl transition-all duration-300">
                  <Link href="/app/dashboard">
                    <Sparkles className="h-5 w-5" />
                    View Demo
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                {[
                  { icon: Check, text: "No credit card" },
                  { icon: Shield, text: "Bank-grade security" },
                  { icon: Zap, text: "Setup in 2 minutes" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-green-500" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="relative lg:block hidden">
              <div className="relative">
                {/* Floating Cards Stack */}
                <div className="space-y-4">
                  {/* Card 1 - Main Receipt */}
                  <Card className="relative overflow-hidden border-2 border-green-500/50 bg-gradient-to-br from-background to-green-950/20 backdrop-blur p-6 transform rotate-2 hover:rotate-0 transition-all duration-500 shadow-2xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Receipt #R-12345</p>
                        <h3 className="text-2xl font-bold mt-1">Amazon</h3>
                      </div>
                      <Badge className="bg-green-500 text-white">Verified</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">Nov 16, 2025</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium">Shopping</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-3xl font-bold text-green-500">$89.99</span>
                      </div>
                    </div>
                  </Card>

                  {/* Card 2 - Stats */}
                  <Card className="border-2 border-emerald-500/50 bg-gradient-to-br from-background to-emerald-950/20 backdrop-blur p-6 transform -rotate-2 hover:rotate-0 transition-all duration-500 shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-3xl font-bold">$2,847</p>
                        <p className="text-sm text-green-500 flex items-center gap-1 mt-1">
                          <ArrowRight className="w-4 h-4 rotate-[-45deg]" />
                          <span>12% less than last month</span>
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Card 3 - Category Breakdown */}
                  <Card className="border-2 border-green-500/30 bg-gradient-to-br from-background to-green-950/10 backdrop-blur p-6 transform rotate-1 hover:rotate-0 transition-all duration-500 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Brain className="w-10 h-10 text-green-500" />
                        <div>
                          <p className="font-semibold">AI Categorized</p>
                          <p className="text-sm text-muted-foreground">156 receipts analyzed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-500">98%</div>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="px-4 py-16 bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: "98", label: "Accuracy Rate", suffix: "%" },
              { number: "10000", label: "Receipts Processed", suffix: "+" },
              { number: "500", label: "Active Users", suffix: "+" },
              { number: "4.9", label: "User Rating", suffix: "/5" },
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
                  <span className="stat-number" data-target={stat.number}>
                    {stat.number}
                  </span>
                  {stat.suffix}
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee - Trusted Organizations */}
      <section className="py-16 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto mb-12">
          <p className="text-center text-sm text-muted-foreground uppercase tracking-wider font-medium">
            Trusted by leading organizations worldwide
          </p>
        </div>
        <div className="relative">
          {/* Heavy blur gradients on both ends - making edges completely invisible */}
          <div className="absolute left-0 top-0 bottom-0 w-64 md:w-96 bg-gradient-to-r from-[hsl(var(--muted)/0.3)] via-[hsl(var(--muted)/0.3)] via-40% to-transparent z-10 pointer-events-none backdrop-blur-sm" />
          <div className="absolute right-0 top-0 bottom-0 w-64 md:w-96 bg-gradient-to-l from-[hsl(var(--muted)/0.3)] via-[hsl(var(--muted)/0.3)] via-40% to-transparent z-10 pointer-events-none backdrop-blur-sm" />
          
          <Marquee pauseOnHover className="[--duration:40s] py-4">
            {[
              { name: "Amazon", description: "E-commerce Giant" },
              { name: "Flipkart", description: "India's Marketplace" },
              { name: "Walmart", description: "Retail Leader" },
              { name: "Target", description: "Retail Excellence" },
              { name: "Shopify", description: "Commerce Platform" },
              { name: "eBay", description: "Online Marketplace" },
              { name: "Costco", description: "Wholesale Leader" },
              { name: "Best Buy", description: "Tech Retailer" },
            ].map((company, idx) => (
              <div key={idx} className="mx-6 flex items-center justify-center">
                <Card className="min-w-[240px] border-2 border-muted hover:border-green-500/50 bg-background/80 backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold text-white">{company.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{company.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{company.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Verified Partner
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* Features Section - Clean Grid Layout */}
      <section ref={featuresRef} className="px-4 py-20 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-green-500/20 text-green-500 border-green-500/50 px-5 py-2.5 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Powerful Features
            </Badge>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight">
              Everything You Need,
              <br />
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                All in One Place
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful AI technology meets intuitive design for seamless receipt management
            </p>
          </div>

          {/* Clean Features Grid - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered OCR",
                description: "Extract text from receipts instantly with cutting-edge AI technology. Handles multiple formats and languages.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Process receipts in under 3 seconds with our optimized infrastructure and cloud processing.",
                gradient: "from-yellow-500 to-orange-500",
              },
              {
                icon: Shield,
                title: "98% Accurate",
                description: "Industry-leading accuracy in text extraction and automatic categorization with AI.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: TrendingUp,
                title: "Smart Analytics",
                description: "Get actionable insights into your spending patterns with intelligent data visualization.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: FileCheck,
                title: "Auto Categorization",
                description: "Automatically categorize expenses with machine learning. Save hours of manual work.",
                gradient: "from-red-500 to-rose-500",
              },
              {
                icon: Sparkles,
                title: "Natural Language",
                description: "Query your receipts using plain English questions. No complex filters needed.",
                gradient: "from-indigo-500 to-blue-500",
              },
              {
                icon: Receipt,
                title: "Easy Organization",
                description: "Keep all your receipts organized in one secure, searchable place with cloud backup.",
                gradient: "from-teal-500 to-green-500",
              },
              {
                icon: Star,
                title: "Export Reports",
                description: "Generate PDF and CSV reports for accounting. Perfect for tax season and audits.",
                gradient: "from-amber-500 to-yellow-500",
              },
              {
                icon: Check,
                title: "Bank-Grade Security",
                description: "Your data is encrypted and stored with enterprise-level security standards.",
                gradient: "from-green-600 to-emerald-700",
              },
            ].map((feature, index) => (
              <Card 
                key={index}
                className="feature-card border-2 hover:border-green-500/50 transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <CardHeader className="relative space-y-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="px-4 py-20 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Free",
                price: "0",
                description: "Perfect for trying out",
                features: ["10 receipts/month", "Basic OCR", "Email support", "7-day history"],
                highlighted: false,
              },
              {
                name: "Pro",
                price: "29",
                description: "For professionals",
                features: ["Unlimited receipts", "Advanced AI", "Priority support", "Unlimited history", "Custom categories", "Export reports"],
                highlighted: true,
              },
              {
                name: "Business",
                price: "99",
                description: "For teams",
                features: ["Everything in Pro", "Team collaboration", "API access", "Custom integrations", "Dedicated support", "SLA guarantee"],
                highlighted: false,
              },
            ].map((plan, index) => (
              <Card 
                key={index}
                className={`pricing-card relative ${
                  plan.highlighted 
                    ? "border-green-500 border-2 shadow-2xl shadow-green-500/20 scale-105" 
                    : "border-2"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    asChild 
                    size="lg" 
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        : ""
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    <Link href="/auth/login">
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
        <div className="container mx-auto relative z-10">
          <Card className="border-2 border-green-500/50 bg-gradient-to-br from-green-950/50 to-emerald-950/50 backdrop-blur">
            <CardContent className="text-center py-16 px-4 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Ready to Transform Your Receipt Management?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of users who trust LedgerMind for their expense tracking
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  <Link href="/auth/login">
                    Start Free Trial
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 text-lg px-8 py-6">
                  <Link href="/app/dashboard">
                    View Demo
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-auto bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg">LedgerMind</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Smart receipt management for modern businesses
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/app/billing" className="hover:text-foreground transition-colors">Plans</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link href="/security" className="hover:text-foreground transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2025 LedgerMind. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

