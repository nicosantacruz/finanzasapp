import type { Company, CompanyMetrics } from "@/types/company"
import type { Transaction } from "@/types/transaction"

// Mock data - In production, this would come from your database
export const companies: Company[] = [
  {
    id: "1",
    name: "Vet Stac Spa.",
    logo: "/veterinary-clinic-logo.jpg",
    currency: "CLP",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2025-10-15"),
  },
  {
    id: "2",
    name: "Tech Solutions Ltd.",
    logo: "/tech-company-logo.jpg",
    currency: "USD",
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2025-10-15"),
  },
]

export function getCompanyById(id: string): Company | undefined {
  return companies.find((company) => company.id === id)
}

export function getCompanyMetrics(companyId: string): CompanyMetrics {
  // Mock data - In production, calculate from actual transactions
  return {
    totalIncome: 0,
    totalExpenses: 0,
    netUtility: 0,
    totalAssets: 0,
    incomeChange: 12.5,
    expensesChange: 8.2,
    utilityChange: 15.3,
    assetsChange: 5.7,
  }
}

export function getRecentTransactions(companyId: string): Transaction[] {
  // Mock data - In production, fetch from database
  return []
}

export function getMonthlyData(companyId: string) {
  // Mock data for the chart
  return [
    { month: "Ene", income: 4000, expenses: 3200 },
    { month: "Feb", income: 5000, expenses: 3500 },
    { month: "Mar", income: 4500, expenses: 3300 },
    { month: "Abr", income: 6000, expenses: 4000 },
    { month: "May", income: 5500, expenses: 3800 },
    { month: "Jun", income: 7000, expenses: 4500 },
  ]
}
