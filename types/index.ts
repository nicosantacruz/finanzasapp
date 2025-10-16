export interface Check {
  id: string
  companyId: string
  userId: string
  number: string
  amount: number // in cents
  currency: string
  bank: string
  issueDate: Date
  dueDate: Date
  status: 'pending' | 'paid' | 'rejected' | 'cancelled'
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Credit {
  id: string
  companyId: string
  userId: string
  name: string
  amount: number // in cents
  currency: string
  interestRate: number
  term: number // months
  monthlyPayment: number // in cents
  startDate: Date
  endDate: Date
  status: 'active' | 'paid' | 'defaulted'
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Supplier {
  id: string
  companyId: string
  userId: string
  name: string
  email?: string
  phone?: string
  address?: string
  rut?: string // Chilean tax ID
  contactName?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  companyId: string
  name: string
  type: 'income' | 'expense'
  color?: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  createdAt: Date
  updatedAt: Date
}
