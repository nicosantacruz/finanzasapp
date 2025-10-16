"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface IncomeExpensesChartProps {
  data?: Array<{
    month: string
    income: number
    expenses: number
  }>
}

export function IncomeExpensesChart({ data = [] }: IncomeExpensesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-income-light))" />
            <stop offset="100%" stopColor="hsl(var(--chart-income))" />
          </linearGradient>
          <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-expenses-light))" />
            <stop offset="100%" stopColor="hsl(var(--chart-expenses))" />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.75rem",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
        />
        <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
        <Bar dataKey="income" fill="url(#incomeGradient)" radius={[8, 8, 0, 0]} name="Ingresos" />
        <Bar dataKey="expenses" fill="url(#expensesGradient)" radius={[8, 8, 0, 0]} name="Gastos" />
      </BarChart>
    </ResponsiveContainer>
  )
}
