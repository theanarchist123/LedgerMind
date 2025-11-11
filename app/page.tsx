import Link from "next/link"
import { ArrowRight, Receipt, Zap, Shield, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

/**
 * Landing page - Home page of LedgerMind
 * Features: Hero section, feature cards, and footer
 */
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-12 md:py-24">
        <div className="container mx-auto">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 bg-primary rounded-xl animate-pulse" />
                  <Receipt className="absolute inset-0 m-auto h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                  LedgerMind
                </h1>
                <CardDescription className="text-xl md:text-2xl max-w-[700px] mx-auto">
                  Smart receipt management powered by AI. Automatically extract, categorize, and analyze your receipts with confidence.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/auth/login">
                    Try Demo
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/app/dashboard">
                    View Dashboard
                  </Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-12 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose LedgerMind?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Process receipts in seconds with our advanced AI technology
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Highly Accurate</CardTitle>
                <CardDescription>
                  98% accuracy rate in text extraction and categorization
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Analytics</CardTitle>
                <CardDescription>
                  Get insights into your spending patterns and trends
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Easy Organization</CardTitle>
                <CardDescription>
                  Automatically categorize and store all your receipts
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-8">
          <Separator className="mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="font-bold">LedgerMind</h3>
              <p className="text-sm text-muted-foreground">
                Smart receipt management for modern businesses
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/app/billing" className="hover:text-foreground">Plans</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="/security" className="hover:text-foreground">Security</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <p className="text-center text-sm text-muted-foreground">
            © 2025 LedgerMind. This is a mock UI prototype. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
