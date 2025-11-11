"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"

/**
 * Billing page with plan cards, upgrade dialog, and usage metrics
 */
export default function BillingPage() {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")

  const handleUpgrade = (plan: string) => {
    setSelectedPlan(plan)
    setShowUpgradeDialog(true)
  }

  const confirmUpgrade = () => {
    // Mock upgrade confirmation
    console.log("Upgrading to:", selectedPlan)
    setShowUpgradeDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage your subscription and usage
        </p>
      </div>

      {/* Current Plan & Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
          <CardDescription>
            Your plan limits and current usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Receipts Processed</span>
              <span className="text-sm text-muted-foreground">24 / 50</span>
            </div>
            <Progress value={48} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-muted-foreground">1.2 GB / 5 GB</span>
            </div>
            <Progress value={24} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">AI Processing Time</span>
              <span className="text-sm text-muted-foreground">45 min / 100 min</span>
            </div>
            <Progress value={45} />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className="relative">
          <CardHeader>
            <Badge className="w-fit mb-2" variant="outline">
              Current Plan
            </Badge>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">50 receipts per month</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">5 GB storage</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Basic AI processing</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Email support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="relative border-primary shadow-lg">
          <CardHeader>
            <Badge className="w-fit mb-2">Popular</Badge>
            <CardTitle className="text-2xl">Pro</CardTitle>
            <CardDescription>For professionals and teams</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">500 receipts per month</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">50 GB storage</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Advanced AI processing</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Priority support</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Custom categories</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Export to CSV/PDF</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleUpgrade("Pro")}
            >
              Upgrade to Pro
            </Button>
          </CardFooter>
        </Card>

        {/* Business Plan */}
        <Card className="relative">
          <CardHeader>
            <Badge className="w-fit mb-2" variant="secondary">
              Enterprise
            </Badge>
            <CardTitle className="text-2xl">Business</CardTitle>
            <CardDescription>For large organizations</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Unlimited receipts</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">500 GB storage</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Premium AI processing</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">24/7 phone support</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Team collaboration</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">API access</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Custom integrations</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleUpgrade("Business")}
            >
              Upgrade to Business
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Upgrade</DialogTitle>
            <DialogDescription>
              Are you sure you want to upgrade to the {selectedPlan} plan?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              You will be charged immediately and your plan will be updated.
              You can cancel at any time.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmUpgrade}>Confirm Upgrade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
