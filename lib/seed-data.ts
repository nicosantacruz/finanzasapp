import type { Company, CompanyMetrics } from "@/types/company"
import type { Transaction } from "@/types/transaction"

export const demoCompany: Company = {
  id: "demo-company-001",
  name: "Empresa Demo S.A.",
  currency: "CLP",
  timezone: "America/Santiago",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date(),
}

export const demoMetrics: CompanyMetrics = {
  totalIncome: 5000000 * 100, // $5,000,000 CLP in cents
  totalExpenses: 3500000 * 100, // $3,500,000 CLP in cents
  netUtility: 1500000 * 100, // $1,500,000 CLP in cents
  totalAssets: 10000000 * 100, // $10,000,000 CLP in cents
  incomeChange: 12.5,
  expensesChange: 8.2,
  utilityChange: 15.3,
  assetsChange: 5.7,
}

export const demoTransactions: Transaction[] = [
  {
    id: "txn-001",
    companyId: "demo-company-001",
    date: new Date("2025-01-15"),
    description: "Venta de servicios veterinarios",
    amount: 250000 * 100, // in cents
    type: "income",
    category: "Servicios",
  },
  {
    id: "txn-002",
    companyId: "demo-company-001",
    date: new Date("2025-01-14"),
    description: "Compra de medicamentos",
    amount: 150000 * 100, // in cents
    type: "expense",
    category: "Suministros",
  },
  {
    id: "txn-003",
    companyId: "demo-company-001",
    date: new Date("2025-01-13"),
    description: "Pago de arriendo",
    amount: 500000 * 100, // in cents
    type: "expense",
    category: "Gastos fijos",
  },
]
