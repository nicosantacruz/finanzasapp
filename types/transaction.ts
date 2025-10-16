export interface Transaction {
  id: string
  companyId: string
  type: "income" | "expense"
  amount: number
  currency: string
  description: string
  category?: {
    name: string
  }
  date: Date
  createdAt: Date
}
