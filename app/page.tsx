import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
            <span className="text-xl font-bold">TradingAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              How It Works
            </Link>
            <Link href="#security" className="text-sm font-medium hover:underline underline-offset-4">
              Security
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 md:py-28">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Automated Trading with <span className="text-emerald-500">AI Confidence</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg md:text-xl text-muted-foreground">
              Trade automatically on Bitget with our AI-powered system. Only executes trades when confidence exceeds
              0.7, with built-in risk management and 24/7 operation.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Trading</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Our system uses advanced AI to analyze market conditions and only executes trades when confidence
                    exceeds your threshold (default 0.7).
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Risk Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Built-in risk controls including max trade size, stop-loss, take-profit, and global market downturn
                    protection.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Always-On Trading</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Backend runs as a service, ensuring your trading strategy executes 24/7 even when your browser is
                    closed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 mb-4">
                  <span className="font-bold text-lg">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Connect API</h3>
                <p className="text-muted-foreground">Securely connect your Bitget API keys with trading permissions.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 mb-4">
                  <span className="font-bold text-lg">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Configure Settings</h3>
                <p className="text-muted-foreground">
                  Set your confidence threshold, max trade size, and risk parameters.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 mb-4">
                  <span className="font-bold text-lg">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Activate Trading</h3>
                <p className="text-muted-foreground">Turn on auto-trading and let the AI analyze market conditions.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 mb-4">
                  <span className="font-bold text-lg">4</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Monitor Performance</h3>
                <p className="text-muted-foreground">
                  Track your trades, balance, and system performance from anywhere.
                </p>
              </div>
            </div>
            <div className="mt-12 text-center">
              <Link href="/dashboard">
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="security" className="py-20 bg-muted/50">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Security First</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Encrypted API Storage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Your API keys are encrypted at rest and in transit. We recommend using API keys with trading-only
                    permissions and IP restrictions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Kill Switch</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Instantly stop all trading activity with a single click. Protect your assets during unexpected
                    market events.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Paper Trading Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Test your strategy with simulated trades before risking real funds. Validate your settings and
                    confidence thresholds.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Automatic Risk Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Every trade includes stop-loss and take-profit orders. System automatically pauses during extreme
                    market conditions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <span className="font-bold">TradingAI</span>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact Us
            </Link>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-muted-foreground">© 2025 TradingAI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
