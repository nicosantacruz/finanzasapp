'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardNav } from '@/components/dashboard-nav'
import { MetricCard } from '@/components/metric-card'
import { IncomeExpensesChart } from '@/components/income-expenses-chart'
import { CompanySummary } from '@/components/company-summary'
import { RecentTransactions } from '@/components/recent-transactions'
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { useCompany } from '@/contexts/company-context'
import { formatMoney } from '@/lib/money'
import { Skeleton } from '@/components/ui/skeleton'

export default function Dashboard() {
  const { selectedCompany } = useCompany()
  const { metrics, recentTransactions, monthlyData, loading, error } =
    useDashboardData()

  if (!selectedCompany) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardNav />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Selecciona una empresa para ver el dashboard
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardNav />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 space-y-8 p-8 bg-gradient-to-br from-background via-background to-secondary/20">
            {/* Loading Metric Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading Chart */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos vs Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Empresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>

            {/* Loading Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Transacciones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="ml-auto">
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardNav />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <p className="text-center text-destructive">
                  Error al cargar los datos: {error}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNav />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <div className="flex-1 space-y-8 p-8 bg-gradient-to-br from-background via-background to-secondary/20">
          {/* Metric Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Ingresos Totales"
              value={formatMoney(metrics.totalIncome, selectedCompany.currency)}
              change={metrics.incomeChange}
              changeType="positive"
              icon={TrendingUp}
            />
            <MetricCard
              title="Gastos Totales"
              value={formatMoney(
                metrics.totalExpenses,
                selectedCompany.currency
              )}
              change={metrics.expenseChange}
              changeType="negative"
              icon={TrendingDown}
            />
            <MetricCard
              title="Balance Neto"
              value={formatMoney(metrics.netBalance, selectedCompany.currency)}
              change={metrics.balanceChange}
              changeType={metrics.netBalance >= 0 ? 'positive' : 'negative'}
              icon={DollarSign}
            />
            <MetricCard
              title="Transacciones"
              value={metrics.totalTransactions.toString()}
              change={metrics.transactionChange}
              changeType="neutral"
              icon={Wallet}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <IncomeExpensesChart data={monthlyData} />
            <CompanySummary />
          </div>

          {/* Recent Transactions */}
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>
    </div>
  )
}
