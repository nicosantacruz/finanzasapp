import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ReactNode
  iconColor: string
}

export function MetricCard({ title, value, change, changeLabel, icon, iconColor }: MetricCardProps) {
  const isPositive = change >= 0

  return (
    <Card className="border-border/50 shadow-sm card-luxury overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-blue-100/20 dark:from-blue-950/10 dark:to-blue-900/5 pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("rounded-xl p-2.5 shadow-md", iconColor)}>{icon}</div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-1.5 text-xs mt-2">
          {isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" />
          )}
          <span className={cn("font-semibold", isPositive ? "text-emerald-600" : "text-rose-600")}>
            {isPositive ? "+" : ""}
            {change}%
          </span>
          <span className="text-muted-foreground">{changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  )
}
