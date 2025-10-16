export interface Company {
  id: string // orgId - used throughout the system for RLS
  name: string
  logo?: string
  currency: "CLP" | "USD" | "AED" | "EUR"
  timezone: string // Store UTC, display in America/Santiago
  createdAt: Date
  updatedAt: Date
}

export interface CompanyMetrics {
  totalIncome: number // in cents
  totalExpenses: number // in cents
  netUtility: number // in cents
  totalAssets: number // in cents
  incomeChange: number // percentage
  expensesChange: number // percentage
  utilityChange: number // percentage
  assetsChange: number // percentage
}

export type UserRole = "owner" | "admin" | "viewer"

export interface CompanyUser {
  userId: string
  companyId: string
  role: UserRole
  createdAt: Date
}

export interface Money {
  amount: number // stored as integer (cents)
  currency: "CLP" | "USD" | "AED" | "EUR"
}
