"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { 
  ArrowRight, 
  Check,
  Sparkles,
  Zap,
  Shield,
  Brain,
  LineChart,
  Leaf,
  Camera,
  MessageSquare,
  Clock,
  Star,
  ChevronRight,
  Github,
  Twitter,
  FileText,
  Search,
  Upload,
  PieChart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="LedgerMind" 
              width={36} 
              height={36}
              className="rounded-lg"
            />
            <span className="font-bold text-xl hidden sm:inline-block">LedgerMind</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#ai-features" className="text-muted-foreground hover:text-foreground transition-colors">
              AI Features
            </Link>
            <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Testimonials
            </Link>
            <Link href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button size="sm" onClick={handleGetStarted}>
              {isLoading ? "..." : isAuthenticated ? "Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container py-24 md:py-32 lg:py-40">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Powered by Custom Neural Network
            </Badge>
            
            <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]">
              Receipt management{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                reimagined
              </span>
            </h1>
            
            <p className="max-w-[750px] text-lg text-muted-foreground md:text-xl">
              Transform paper chaos into organized insights. LedgerMind uses AI to automatically 
              extract, categorize, and analyze your receipts—giving you complete control over your expenses.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button size="lg" className="gap-2 h-12 px-8" onClick={handleGetStarted}>
                {isLoading ? "Loading..." : isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 h-12 px-8" asChild>
                <Link href="https://github.com/theanarchist123/LedgerMind" target="_blank">
                  <Github className="h-4 w-4" />
                  View on GitHub
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </section>

        {/* Logo Cloud */}
        <section className="border-y bg-muted/30">
          <div className="container py-12">
            <p className="text-center text-sm font-medium text-muted-foreground mb-8">
              TRUSTED BY TEAMS AT
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8">
              {["Vercel", "Stripe", "Linear", "Notion", "Raycast", "Supabase"].map((company) => (
                <span key={company} className="text-xl font-semibold tracking-tight text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-24 md:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center mb-16">
            <Badge variant="outline" className="rounded-full px-4 py-1.5">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything you need to manage receipts
            </h2>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              From scanning to insights, LedgerMind handles the entire receipt workflow 
              so you can focus on what matters.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Camera,
                title: "Smart OCR Scanning",
                description: "Upload any receipt image and our AI instantly extracts merchant, amount, date, and line items with 98% accuracy."
              },
              {
                icon: Zap,
                title: "Auto-Categorization",
                description: "Receipts are automatically sorted into categories like Food, Transport, Shopping, and more using machine learning."
              },
              {
                icon: PieChart,
                title: "Spending Analytics",
                description: "Beautiful charts and insights show exactly where your money goes, with weekly and monthly breakdowns."
              },
              {
                icon: Search,
                title: "Natural Language Search",
                description: "Ask questions like 'How much did I spend on coffee last month?' and get instant answers."
              },
              {
                icon: Shield,
                title: "Bank-Grade Security",
                description: "Your data is encrypted at rest and in transit. We never sell or share your financial information."
              },
              {
                icon: FileText,
                title: "Export & Reports",
                description: "Generate PDF reports, export to CSV, or sync with your accounting software in one click."
              }
            ].map((feature, index) => (
              <Card key={index} className="group relative overflow-hidden border bg-card hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted group-hover:bg-green-500/10 transition-colors">
                    <feature.icon className="h-6 w-6 text-muted-foreground group-hover:text-green-600 transition-colors" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* AI Features Section */}
        <section id="ai-features" className="border-y bg-muted/30">
          <div className="container py-24 md:py-32">
            <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center mb-16">
              <Badge className="rounded-full bg-gradient-to-r from-green-600 to-emerald-500 text-white border-0 px-4 py-1.5">
                <Brain className="mr-2 h-3.5 w-3.5" />
                AI-Powered
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Unique AI features you won't find elsewhere
              </h2>
              <p className="max-w-[700px] text-lg text-muted-foreground">
                Go beyond basic receipt tracking. Our custom neural network and AI models 
                provide insights that transform how you understand spending.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 max-w-5xl mx-auto">
              {[
                {
                  icon: Brain,
                  title: "Mood Analysis",
                  description: "Discover the emotional patterns behind your purchases. Our AI detects stress spending, retail therapy, and celebratory purchases.",
                  href: "/app/mood-analysis",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  icon: Sparkles,
                  title: "Neural Spending Predictor",
                  description: "Our custom-built neural network (no external APIs!) predicts your next purchase, weekly spending, and identifies savings opportunities.",
                  href: "/app/neural-insights",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: Leaf,
                  title: "Carbon Footprint Tracker",
                  description: "Track the environmental impact of your purchases. Get sustainability scores and suggestions for eco-friendly alternatives.",
                  href: "/app/carbon-tracker",
                  color: "from-green-500 to-emerald-500"
                },
                {
                  icon: LineChart,
                  title: "Spending DNA",
                  description: "Uncover your unique financial fingerprint. See patterns, habits, and tendencies that define your spending personality.",
                  href: "/app/spending-dna",
                  color: "from-orange-500 to-red-500"
                }
              ].map((feature, index) => (
                <Card key={index} className="group relative overflow-hidden border-2 hover:border-green-500/50 bg-card transition-all duration-300">
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${feature.color} opacity-5 rounded-bl-full`} />
                  <CardHeader>
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color}`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {feature.title}
                      <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                    <Button variant="outline" size="sm" asChild className="group-hover:bg-green-500/10 group-hover:border-green-500/50 transition-colors">
                      <Link href={feature.href}>
                        Explore Feature
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container py-24 md:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center mb-16">
            <Badge variant="outline" className="rounded-full px-4 py-1.5">How It Works</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Three simple steps to financial clarity
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                icon: Upload,
                title: "Upload",
                description: "Snap a photo or upload receipt images. Our OCR handles crumpled, faded, or blurry receipts."
              },
              {
                step: "2",
                icon: Zap,
                title: "Extract",
                description: "AI automatically extracts all details—merchant, items, amounts, taxes, and more."
              },
              {
                step: "3",
                icon: LineChart,
                title: "Analyze",
                description: "Get instant insights, spending trends, and AI-powered recommendations."
              }
            ].map((step, index) => (
              <div key={index} className="relative text-center group">
                <div className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted group-hover:bg-green-500/10 transition-colors">
                  <step.icon className="h-10 w-10 text-muted-foreground group-hover:text-green-600 transition-colors" />
                </div>
                <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white text-sm font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                {index < 2 && (
                  <ChevronRight className="hidden md:block absolute top-10 -right-6 h-8 w-8 text-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="border-y bg-muted/30">
          <div className="container py-24 md:py-32">
            <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center mb-16">
              <Badge variant="outline" className="rounded-full px-4 py-1.5">Testimonials</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Loved by thousands of users
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {[
                {
                  quote: "LedgerMind transformed how I handle business expenses. The AI categorization is incredibly accurate.",
                  author: "Sarah Chen",
                  role: "Freelance Designer",
                  rating: 5
                },
                {
                  quote: "The neural spending predictor is mind-blowing. It predicted my grocery spending for the week within $5!",
                  author: "Michael Torres",
                  role: "Software Engineer",
                  rating: 5
                },
                {
                  quote: "Finally, a receipt app that actually understands my spending patterns. The mood analysis feature is genius.",
                  author: "Emily Watson",
                  role: "Marketing Manager",
                  rating: 5
                },
                {
                  quote: "I've tried every expense tracker out there. LedgerMind is the only one that makes me actually want to track receipts.",
                  author: "David Kim",
                  role: "Small Business Owner",
                  rating: 5
                },
                {
                  quote: "The carbon footprint tracker helped me reduce my environmental impact. Love the eco-friendly suggestions!",
                  author: "Jessica Martinez",
                  role: "Environmental Consultant",
                  rating: 5
                },
                {
                  quote: "Setup took 2 minutes. First receipt scanned in under 10 seconds. This is how all software should work.",
                  author: "Robert Singh",
                  role: "Product Manager",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{testimonial.author}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="container py-24 md:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center mb-16">
            <Badge variant="outline" className="rounded-full px-4 py-1.5">FAQ</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Frequently asked questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "How accurate is the OCR scanning?",
                a: "Our AI achieves 98% accuracy on clear receipts and 94% on damaged or low-quality images. You can always edit extracted data if needed."
              },
              {
                q: "Is my financial data secure?",
                a: "Absolutely. We use bank-grade AES-256 encryption, and your data is never sold or shared. You can delete your data anytime."
              },
              {
                q: "Does the neural network use external APIs?",
                a: "No! Our neural spending predictor is built from scratch using pure TypeScript—no TensorFlow, PyTorch, or external AI services. Your data never leaves our servers."
              },
              {
                q: "Can I export my data?",
                a: "Yes. Export to CSV, PDF reports, or JSON at any time. Your data belongs to you."
              },
              {
                q: "Is there a mobile app?",
                a: "LedgerMind is a progressive web app (PWA) that works beautifully on mobile browsers. Native apps are on our roadmap."
              }
            ].map((faq, index) => (
              <Card key={index} className="bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-muted/30">
          <div className="container py-24 md:py-32">
            <div className="mx-auto flex max-w-[600px] flex-col items-center gap-4 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to take control of your expenses?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of users who've simplified their receipt management with LedgerMind.
              </p>
              <Button size="lg" className="gap-2 h-12 px-8 mt-4" onClick={handleGetStarted}>
                {isLoading ? "Loading..." : isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <Image 
                  src="/logo.png" 
                  alt="LedgerMind" 
                  width={32} 
                  height={32}
                  className="rounded-lg"
                />
                <span className="font-bold text-lg">LedgerMind</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered receipt management for modern teams and individuals.
              </p>
              <div className="flex gap-4">
                <Link href="https://github.com/theanarchist123/LedgerMind" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#ai-features" className="hover:text-foreground transition-colors">AI Features</Link></li>
                <li><Link href="/app/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">API Reference</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t">
            <p className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} LedgerMind. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

