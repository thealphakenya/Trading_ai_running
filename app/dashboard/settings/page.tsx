"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Home, Settings, Shield, History, LineChart, TrendingUp, Bell, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [paperTrading, setPaperTrading] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [maxDailyLoss, setMaxDailyLoss] = useState(5)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r">
        <div className="flex items-center gap-2 p-6 border-b">
          <TrendingUp className="h-6 w-6 text-emerald-500" />
          <span className="text-xl font-bold">TradingAI</span>
        </div>
        <div className="flex flex-col p-4 gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground">
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/trades"
            className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground"
          >
            <History className="h-4 w-4" />
            <span>Trade History</span>
          </Link>
          <Link
            href="/dashboard/market"
            className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground"
          >
            <LineChart className="h-4 w-4" />
            <span>Market View</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          <Link
            href="/dashboard/security"
            className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground"
          >
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-xl font-bold">Settings</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">JD</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Tabs defaultValue="trading">
            <TabsList className="mb-6">
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="risk">Risk Management</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            <TabsContent value="trading">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Trading Settings</CardTitle>
                    <CardDescription>Configure how the automated trading system operates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="paper-trading">Paper Trading Mode</Label>
                        <p className="text-sm text-muted-foreground">Simulate trades without using real funds</p>
                      </div>
                      <Switch id="paper-trading" checked={paperTrading} onCheckedChange={setPaperTrading} />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label>Trading Assets</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch id="btc-trading" defaultChecked />
                          <Label htmlFor="btc-trading">BTC/USDT</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="eth-trading" defaultChecked />
                          <Label htmlFor="eth-trading">ETH/USDT</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="sol-trading" defaultChecked />
                          <Label htmlFor="sol-trading">SOL/USDT</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="bnb-trading" />
                          <Label htmlFor="bnb-trading">BNB/USDT</Label>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label>Trading Strategy</Label>
                      <Select defaultValue="momentum">
                        <SelectTrigger>
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="momentum">Momentum</SelectItem>
                          <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                          <SelectItem value="breakout">Breakout</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="trade-frequency">Maximum Trades Per Day</Label>
                        <span className="text-sm font-medium">10</span>
                      </div>
                      <Slider id="trade-frequency" min={1} max={20} step={1} defaultValue={[10]} />
                      <p className="text-sm text-muted-foreground">
                        Limit the number of trades the system can execute in a 24-hour period
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>API Configuration</CardTitle>
                    <CardDescription>Configure your Bitget API connection</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <Input id="api-key" type="password" value="••••••••••••••••••••••••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api-secret">API Secret</Label>
                      <Input id="api-secret" type="password" value="••••••••••••••••••••••••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passphrase">Passphrase</Label>
                      <Input id="passphrase" type="password" value="••••••••••••••" />
                    </div>
                    <p className="text-sm flex items-center gap-1 text-amber-500">
                      <AlertTriangle className="h-4 w-4" />
                      Only use API keys with trading permissions. We recommend setting IP restrictions.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Test Connection</Button>
                    <Button>Update API Keys</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="risk">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Management</CardTitle>
                  <CardDescription>Configure risk parameters to protect your capital</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="max-trade-size">Maximum Trade Size</Label>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                    <Slider id="max-trade-size" min={1} max={20} step={1} defaultValue={[5]} />
                    <p className="text-sm text-muted-foreground">
                      Maximum percentage of your portfolio that can be allocated to a single trade
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="max-daily-loss">Maximum Daily Loss</Label>
                      <span className="text-sm font-medium">{maxDailyLoss}%</span>
                    </div>
                    <Slider
                      id="max-daily-loss"
                      min={1}
                      max={10}
                      step={0.5}
                      value={[maxDailyLoss]}
                      onValueChange={(value) => setMaxDailyLoss(value[0])}
                    />
                    <p className="text-sm text-muted-foreground">
                      If your portfolio loses this percentage in a day, trading will be automatically paused
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="default-stop-loss">Default Stop Loss</Label>
                      <div className="flex items-center">
                        <Input id="default-stop-loss" type="number" defaultValue={2.5} className="rounded-r-none" />
                        <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md">%</div>
                      </div>
                      <p className="text-xs text-muted-foreground">Default stop loss percentage for all trades</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default-take-profit">Default Take Profit</Label>
                      <div className="flex items-center">
                        <Input id="default-take-profit" type="number" defaultValue={5} className="rounded-r-none" />
                        <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md">%</div>
                      </div>
                      <p className="text-xs text-muted-foreground">Default take profit percentage for all trades</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="market-volatility-protection">Market Volatility Protection</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically reduce position sizes during high market volatility
                      </p>
                    </div>
                    <Switch id="market-volatility-protection" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Risk Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure how and when you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enable-notifications">Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about trades and system status
                      </p>
                    </div>
                    <Switch id="enable-notifications" checked={notifications} onCheckedChange={setNotifications} />
                  </div>

                  {notifications && (
                    <>
                      <Separator />

                      <div className="space-y-4">
                        <Label>Notification Channels</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Switch id="email-notifications" defaultChecked />
                              <Label htmlFor="email-notifications">Email</Label>
                            </div>
                            <Input type="email" placeholder="your@email.com" defaultValue="john.doe@example.com" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Switch id="telegram-notifications" />
                              <Label htmlFor="telegram-notifications">Telegram</Label>
                            </div>
                            <Input placeholder="Telegram Chat ID" />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <Label>Notification Types</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch id="trade-executed" defaultChecked />
                            <Label htmlFor="trade-executed">Trade Executed</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="trade-completed" defaultChecked />
                            <Label htmlFor="trade-completed">Trade Completed (TP/SL)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="high-confidence" defaultChecked />
                            <Label htmlFor="high-confidence">High Confidence Signal</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="system-warning" defaultChecked />
                            <Label htmlFor="system-warning">System Warnings</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="daily-summary" defaultChecked />
                            <Label htmlFor="daily-summary">Daily Summary</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="profit-threshold" />
                            <Label htmlFor="profit-threshold">Profit Threshold Reached</Label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button>Save Notification Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize how the dashboard looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border rounded-md p-4 cursor-pointer bg-background flex items-center justify-center h-20 relative ring-2 ring-emerald-500">
                        <span className="font-medium">Light</span>
                      </div>
                      <div className="border rounded-md p-4 cursor-pointer bg-zinc-950 text-white flex items-center justify-center h-20">
                        <span className="font-medium">Dark</span>
                      </div>
                      <div className="border rounded-md p-4 cursor-pointer bg-gradient-to-r from-background to-zinc-950 flex items-center justify-center h-20">
                        <span className="font-medium">System</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Dashboard Layout</Label>
                    <Select defaultValue="default">
                      <SelectTrigger>
                        <SelectValue placeholder="Select layout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="expanded">Expanded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>Chart Type</Label>
                    <Select defaultValue="candles">
                      <SelectTrigger>
                        <SelectValue placeholder="Select chart type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candles">Candlestick</SelectItem>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="area">Area</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Appearance Settings</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
